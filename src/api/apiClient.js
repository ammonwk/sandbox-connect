// src/api/apiClient.js
const API_BASE_URL = "http://localhost:7000/api";

// Create a reusable API client that handles auth tokens
export const createApiClient = () => {
  // Helper function to get the token
  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Helper function to make authenticated requests
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      ...options,
      headers,
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Clear stored tokens if unauthorized
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
      }
       
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };
  
  // File upload helper that handles auth tokens
  const uploadFileWithAuth = async (endpoint, formData, options = {}) => {
    const token = getToken();
    
    const headers = {
      ...options.headers,
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method: 'POST',
      body: formData,
      ...options,
      headers,
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };
  
  // Return an object with methods for different API endpoints
  return {
    // Auth methods
    auth: {
      register: (userData) => fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
      login: (credentials) => fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
      verifyEmail: (data) => fetchWithAuth('/auth/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      resendCode: (email) => fetchWithAuth('/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),   
      forgotPassword: (credentials) => fetchWithAuth('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
      resetPassword: (data) => fetchWithAuth('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),    
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    },
    
    // User profile methods
    user: {
      // Get current user profile
      getProfile: () => fetchWithAuth('/auth/me', { method: 'GET' }),
      
      // Update user profile (with possible file upload)
      updateProfile: async (userData, photoFile) => {
        try {
          let response;
          // Create a copy of userData to avoid modifying the original
          const dataToSend = { ...userData };
          
          // Ensure teamNeeds is properly formatted
          if (dataToSend.teamNeeds && typeof dataToSend.teamNeeds !== 'string') {
            dataToSend.teamNeeds = JSON.stringify(dataToSend.teamNeeds);
          }
          
          // Ensure contact is properly formatted
          if (dataToSend.contact && typeof dataToSend.contact !== 'string') {
            dataToSend.contact = JSON.stringify(dataToSend.contact);
          }
          
          // Ensure skills is properly formatted
          if (dataToSend.skills && Array.isArray(dataToSend.skills)) {
            dataToSend.skills = JSON.stringify(dataToSend.skills);
          }
          
          if (photoFile) {
            const formData = new FormData();
            
            // Add user data fields to form data
            Object.entries(dataToSend).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });
            
            formData.append('photo', photoFile);
            
            response = await uploadFileWithAuth('/users/profile', formData, {
              method: 'POST',
            });
          } else {
            response = await fetchWithAuth('/users/profile', {
              method: 'POST',
              body: JSON.stringify(dataToSend),
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          return response;
        } catch (error) {
          throw error;
        }
      },
      
      // Get a specific user profile by ID
      getUserById: (userId) => fetchWithAuth(`/users/${userId}`, { method: 'GET' }),
      
      // Get dashboard users
      getDashboardUsers: () => fetchWithAuth('/users/dashboard', { method: 'GET' }),
    },
  };
};

// React hook to use the API client
export const useApi = () => {
  return createApiClient();
};