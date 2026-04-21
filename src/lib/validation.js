/**
 * Validation utilities for user input
 * Provides security-focused validation functions
 */

/**
 * Validates email format and domain
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email is required'
    };
  }

  // Trim whitespace
  email = email.trim().toLowerCase();

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format'
    };
  }

  // Length validation
  if (email.length > 254) {
    return {
      valid: false,
      error: 'Email is too long'
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,          // Double dots
    /@.*@/,          // Multiple @ symbols
    /^[^@]+@$/,      // Missing domain
    /@[^.]+$/        // Missing TLD
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return {
        valid: false,
        error: 'Invalid email format'
      };
    }
  }

  // Block common disposable email domains (optional - uncomment if needed)
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return {
      valid: false,
      error: 'Disposable email addresses are not allowed'
    };
  }

  return { valid: true, email };
}

/**
 * Validates password strength
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      error: 'Password is required'
    };
  }

  // Length validation
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      error: 'Password is too long'
    };
  }

  // Common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'welcome', 'letmein', 'monkey', 'dragon'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      valid: false,
      error: 'Please choose a stronger password'
    };
  }

  // Complexity requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const requirements = [
    { condition: hasUpperCase, message: 'one uppercase letter' },
    { condition: hasLowerCase, message: 'one lowercase letter' },
    { condition: hasNumber, message: 'one number' },
    { condition: hasSpecialChar, message: 'one special character' }
  ];

  const missingRequirements = requirements
    .filter(req => !req.condition)
    .map(req => req.message);

  if (missingRequirements.length > 0) {
    return {
      valid: false,
      error: `Password must contain ${missingRequirements.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validates text input for length and content
 */
export function validateTextInput(input, fieldName, minLength = 1, maxLength = 1000) {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  const trimmed = input.trim();

  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} character(s) long`
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} is too long (maximum ${maxLength} characters)`
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validates numeric input
 */
export function validateNumber(input, fieldName, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = Number(input);

  if (isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`
    };
  }

  if (num < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min}`
    };
  }

  if (num > max) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${max}`
    };
  }

  return { valid: true, value: num };
}

/**
 * Validates URL format
 */
export function validateUrl(url, allowLocalhost = false) {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL is required'
    };
  }

  try {
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: 'Only HTTP and HTTPS URLs are allowed'
      };
    }

    // Block localhost if not explicitly allowed
    if (!allowLocalhost && ['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
      return {
        valid: false,
        error: 'Localhost URLs are not allowed'
      };
    }

    return { valid: true, url };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format'
    };
  }
}

/**
 * Sanitizes user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Validates and sanitizes multiple fields
 */
export function validateFields(fields) {
  const errors = {};
  const validated = {};

  for (const [fieldName, validation] of Object.entries(fields)) {
    const result = validation();
    if (result.valid) {
      validated[fieldName] = result.value !== undefined ? result.value : result;
    } else {
      errors[fieldName] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    validated
  };
}
