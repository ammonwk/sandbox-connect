// Updated LandingPage.jsx with forgot password functionality
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../api/apiClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email entry, 2: Code verification & new password
  
  const navigate = useNavigate();
  const api = useApi();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/onboarding');
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setStatusMessage({
        type: 'success',
        message: 'Your email has been verified! You can now log in.'
      });
      setIsSigningUp(false);
    } else if (urlParams.get('verified') === 'false') {
      setStatusMessage({
        type: 'error',
        message: 'Verification failed: ' + (urlParams.get('error') || 'Unknown error')
      });
    }
    
    setIsLoading(false);
  }, [navigate]);
  
  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await api.auth.resendCode({ email });
      setStatusMessage({
        type: 'success',
        message: 'Verification link has been resent to your email!'
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to resend verification link');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage({ type: '', message: '' });
    
    try {
      if (isSigningUp) {
        setIsLoading(true);
        await api.auth.register({ email, password, preferred_username: displayName });
        
        setStatusMessage({
          type: 'success',
          message: 'Registration successful! Please check your email for a verification link.'
        });
        
        setEmail('');
        setPassword('');
        setDisplayName('');
      } else {
        setIsLoading(true);
        const loginResponse = await api.auth.login({ email, password });
        
        localStorage.setItem('accessToken', loginResponse.tokens.accessToken);
        localStorage.setItem('idToken', loginResponse.tokens.idToken);
        localStorage.setItem('refreshToken', loginResponse.tokens.refreshToken);
        
        const user = loginResponse.user;
        const profileComplete = user && 
                            user.name && 
                            user.skills && 
                            user.skills.length > 0 && 
                            user.role;
        
        // Navigate to dashboard if profile is complete, otherwise to onboarding
        navigate(profileComplete ? '/dashboard' : '/onboarding');
      }
    } catch (error) {
      if (error.message === 'User is not confirmed') {
        setErrorMessage(
          <>
            User is not confirmed.{' '}
            <button
              onClick={handleResendVerification}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Resend verification link to {email}
            </button>
          </>
        );
      } else {
        setErrorMessage(error.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage({ type: '', message: '' });
    
    try {
      setIsLoading(true);
      
      if (resetStep === 1) {
        // Request password reset code
        await api.auth.forgotPassword({ email });
        
        setStatusMessage({
          type: 'success',
          message: 'If your email exists in our system, a password reset code has been sent to your email.'
        });
        
        setResetStep(2);
      } else {
        // Verify code and set new password
        await api.auth.resetPassword({ email, code: resetCode, newPassword });
        
        setStatusMessage({
          type: 'success',
          message: 'Password has been reset successfully! You can now log in with your new password.'
        });
        
        // Reset form and return to login
        setResetCode('');
        setNewPassword('');
        setIsForgotPassword(false);
        setResetStep(1);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to process password reset');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetStep(1);
    setResetCode('');
    setNewPassword('');
    setErrorMessage('');
    setStatusMessage({ type: '', message: '' });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 min-h-screen flex items-center py-8 md:py-0">
      <div className="grid md:grid-cols-2 gap-16 w-full max-w-6xl mx-auto">
        <div className="space-y-12">
          <div>
            <h1 className="text-5xl font-bold text-black dark:text-white mb-4 leading-tight">
              Welcome to
              <div className="block bg-black dark:bg-white text-white dark:text-black px-14 py-3 mt-3 -ml-1 transform -skew-x-12">
                Sandbox Connect
              </div>
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-xl">
              Find your team better, faster.
            </p>
          </div>
          <div className="space-y-8">
            {[
              { num: 1, text: "Introduce yourself" },
              { num: 2, text: "Connect with other founders" },
              { num: 3, text: "Get creating!" }
            ].map((step) => (
              <div key={step.num} className="flex items-center space-x-6 group">
                <span className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-semibold group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-all duration-300">
                  {step.num}
                </span>
                <p className="text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-black dark:bg-white rounded-2xl transform rotate-2"></div>
          <div className="relative bg-white dark:bg-gray-800 p-10 mt-5 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-8 text-black dark:text-white">
              {isForgotPassword 
                ? (resetStep === 1 ? 'Reset Password' : 'Verify Code & Set New Password')
                : (isSigningUp ? 'Create Account' : 'Sign In')}
            </h2>
            
            {statusMessage.type && (
              <div className={`mb-6 p-4 rounded-lg ${
                statusMessage.type === 'success' 
                  ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {statusMessage.message}
              </div>
            )}
            
            <div className="space-y-6">
              {isForgotPassword ? (
                // Forgot Password Form
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                      placeholder="you@example.com"
                      disabled={resetStep === 2}
                      required
                    />
                  </div>
                  
                  {resetStep === 2 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Reset Code
                        </label>
                        <input
                          type="text"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                          placeholder="Enter code from email"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                            placeholder="Create new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={toggleNewPasswordVisibility}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                          >
                            {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {errorMessage && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                      {errorMessage}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-200 text-lg font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white dark:border-black mr-2"></div>
                        {resetStep === 1 ? 'Sending Reset Code...' : 'Resetting Password...'}
                      </>
                    ) : (
                      resetStep === 1 ? 'Send Reset Code' : 'Reset Password'
                    )}
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                // Normal Authentication Form
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  
                  {isSigningUp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 outline-none text-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                      >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {errorMessage && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                      {errorMessage}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors duration-200 text-lg font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white dark:border-black mr-2"></div>
                        {isSigningUp ? 'Creating Account...' : 'Signing In...'}
                      </>
                    ) : (
                      isSigningUp ? 'Sign Up' : 'Sign In'
                    )}
                  </button>
                  
                  <div className="text-center text-sm">
                    {isSigningUp ? (
                      <p className="text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSigningUp(false);
                            setErrorMessage('');
                            setStatusMessage({ type: '', message: '' });
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Sign In
                        </button>
                      </p>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSigningUp(true);
                            setErrorMessage('');
                            setStatusMessage({ type: '', message: '' });
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Sign Up
                        </button>
                      </p>
                    )}
                  </div>
                  
                  {!isSigningUp && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setErrorMessage('');
                          setStatusMessage({ type: '', message: '' });
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </form>
              )}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;