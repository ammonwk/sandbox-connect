// services/cognito.js
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    ResendConfirmationCodeCommand,
    GetUserCommand,
    AdminAddUserToGroupCommand,
    AdminListGroupsForUserCommand 
  } from '@aws-sdk/client-cognito-identity-provider';
  import config from '../config/index.js';
  import logger from '../utils/logger.js';
  
  // Initialize the Cognito client
  const cognitoClient = new CognitoIdentityProviderClient({
    region: config.aws.cognito.region
  });
  
  // Helper to handle Cognito errors
  const handleCognitoError = (error) => {
    if (error.__type === 'UsernameExistsException') {
      return { error: 'User already exists' };
    } else if (error.__type === 'InvalidPasswordException') {
      return { error: 'Password does not meet requirements' };
    } else if (error.__type === 'CodeMismatchException') {
      return { error: 'Invalid verification code' };
    } else if (error.__type === 'ExpiredCodeException') {
      return { error: 'Verification code has expired' };
    } else if (error.__type === 'UserNotFoundException') {
      return { error: 'User not found' };
    } else if (error.__type === 'NotAuthorizedException') {
      return { error: 'Incorrect username or password' };
    } else if (error.__type === 'UserNotConfirmedException') {
      return { error: 'User is not confirmed' };
    }
    console.error(error.__type);
    return { error: 'An error occurred with the authentication service' };
  };
  
  // Register a new user
  export const registerUser = async (email, password, attributes = {}) => {
    try {
      const userAttributes = Object.entries(attributes).map(([key, value]) => ({
        Name: key,
        Value: value
      }));
      
      // Always include email in attributes
      userAttributes.push({ Name: 'email', Value: email });
      
      const command = new SignUpCommand({
        ClientId: config.aws.cognito.clientId,
        Username: email,
        Password: password,
        UserAttributes: userAttributes
      });
      
      const response = await cognitoClient.send(command);
      
      return {
        success: true,
        userSub: response.UserSub,
        userConfirmed: response.UserConfirmed
      };
    } catch (error) {
      return handleCognitoError(error);
    }
  };
  
  // Confirm user registration with verification code
  export const confirmRegistration = async (email, code) => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: config.aws.cognito.clientId,
        Username: email,
        ConfirmationCode: code
      });
      
      await cognitoClient.send(command);
      
      return { success: true };
    } catch (error) {
      return handleCognitoError(error);
    }
  };
  
  // Resend confirmation code
  export const resendConfirmationCode = async (email) => {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: config.aws.cognito.clientId,
        Username: email.email
      });
      
      await cognitoClient.send(command);
      
      return { success: true };
    } catch (error) {
      return handleCognitoError(error);
    }
  };
  
  // Login user
  export const loginUser = async (email, password) => {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: config.aws.cognito.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });
      
      const response = await cognitoClient.send(command);
      
      return {
        success: true,
        tokens: {
          idToken: response.AuthenticationResult.IdToken,
          accessToken: response.AuthenticationResult.AccessToken,
          refreshToken: response.AuthenticationResult.RefreshToken,
          expiresIn: response.AuthenticationResult.ExpiresIn
        }
      };
    } catch (error) {
      return handleCognitoError(error);
    }
  };
  
  // Initiate forgot password
  export const forgotPassword = async (email) => {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: config.aws.cognito.clientId,
        Username: email
      });
      
      await cognitoClient.send(command);
      
      return { success: true };
    } catch (error) {
      return handleCognitoError(error);
    }
  };
  
  // Complete forgot password
  export const confirmForgotPassword = async (email, code, newPassword) => {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: config.aws.cognito.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword
      });
      
      await cognitoClient.send(command);
      
      return { success: true };
    } catch (error) {
      return handleCognitoError(error);
    }
  };
  
  // Get user details from Cognito (using their access token)
  // In your cognito.js file

  // Update getUserInfo to use AWS SDK v3
  export const getUserInfo = async (accessToken) => {
    try {
      // Get user attributes using the access token
      const command = new GetUserCommand({
        AccessToken: accessToken
      });
      
      const userInfo = await cognitoClient.send(command);
      
      // Format user attributes into a more usable object
      const user = {};
      userInfo.UserAttributes.forEach(attr => {
        user[attr.Name] = attr.Value;
      });
      
      // Get the user's groups
      try {
        const listGroupsCommand = new AdminListGroupsForUserCommand({
          UserPoolId: config.aws.cognito.userPoolId,
          Username: user.sub || user.email
        });
        
        const groupData = await cognitoClient.send(listGroupsCommand);
        // Extract group names from the response
        user.groups = groupData.Groups.map(group => group.GroupName);
      } catch (groupError) {
        logger.warn('Error fetching user groups:', { error: groupError.message });
        user.groups = [];  // Default to empty array if we can't fetch groups
      }
      
      return { success: true, user };
    } catch (error) {
      logger.error('Error getting user info:', { error: error.message });
      return { success: false, error: error.message };
    }
  };

  export const addUserToGroup = async (username, groupName) => {
    try {
      const command = new AdminAddUserToGroupCommand({
        GroupName: groupName,
        UserPoolId: config.aws.cognito.userPoolId,
        Username: username
      });
      
      await cognitoClient.send(command);
      return { success: true };
    } catch (error) {
      logger.error('Error adding user to group:', { error: error.message });
      return { success: false, error: error.message };
    }
  };
  