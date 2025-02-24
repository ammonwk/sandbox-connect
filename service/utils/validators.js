// utils/validators.js

// Validate registration input
export const validateRegistration = (data) => {
    const { email, password, name } = data;
    
    if (!email) {
      return 'Email is required';
    }
    
    if (!password) {
      return 'Password is required';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please provide a valid email address';
    }
    
    // Password validation (8+ chars, uppercase, lowercase, number, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
    
    return null; // No error
  };
  
  // Validate login input
  export const validateLogin = (data) => {
    const { email, password } = data;
    
    if (!email) {
      return 'Email is required';
    }
    
    if (!password) {
      return 'Password is required';
    }
    
    return null; // No error
  };
  
  // Validate profile update input
  export const validateProfileUpdate = (data) => {
    const { bio, background } = data;
    
    if (bio && bio.length > 250) {
      return 'Bio exceeds 250 characters';
    }
    
    if (background && background.length > 5000) {
      return 'Background exceeds 5000 characters';
    }
    
    return null; // No error
  };