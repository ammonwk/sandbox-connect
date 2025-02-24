// config/index.js
const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 7000,
    mongoURI: process.env.MONGO_URI,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // AWS Configuration
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      s3: {
        bucketName: process.env.S3_BUCKET_NAME
      },
      cognito: {
        userPoolId: process.env.COGNITO_USER_POOL_ID,
        clientId: process.env.COGNITO_CLIENT_ID,
        region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1'
      }
    },
    
    // JWT settings for local verification
    jwt: {
      secret: process.env.JWT_SECRET
    }
  };
  
  // Validate required configuration
  const requiredConfig = [
    'mongoURI',
    'aws.cognito.userPoolId',
    'aws.cognito.clientId',
    'aws.s3.bucketName'
  ];
  
  const validateConfig = () => {
    for (const configPath of requiredConfig) {
      const keys = configPath.split('.');
      let currentObj = config;
      
      for (const key of keys) {
        currentObj = currentObj[key];
        if (currentObj === undefined) {
          throw new Error(`Missing required config: ${configPath}`);
        }
      }
    }
  };
  
  // Only validate in production to ease development
  if (config.nodeEnv === 'production') {
    validateConfig();
  }
  
  export default config;