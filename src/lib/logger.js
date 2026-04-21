/**
 * Secure logging utilities
 * Prevents logging sensitive information while maintaining debugging capabilities
 */

/**
 * Sanitizes sensitive data from objects before logging
 */
export function sanitizeForLogging(data) {
  if (!data) return data;

  const sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'secret',
    'creditCard',
    'ssn',
    'authorization',
    'cookie'
  ];

  const sensitivePatterns = [
    /Bearer\s+[A-Za-z0-9\-._~+/]+/gi, // Bearer tokens
    /sk-[A-Za-z0-9]+/gi, // API keys
    /[A-Za-z0-9]{32,}/g, // Long strings (likely tokens/keys)
  ];

  const sanitized = JSON.parse(JSON.stringify(data));

  // Remove sensitive fields
  function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;

    for (const key in obj) {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive field name
      const isSensitiveField = sensitiveFields.some(field =>
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitiveField) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      } else if (typeof obj[key] === 'string') {
        // Check for sensitive patterns in string values
        for (const pattern of sensitivePatterns) {
          obj[key] = obj[key].replace(pattern, '[REDACTED]');
        }
      }
    }
  }

  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * Masks email addresses for logging
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '[INVALID_EMAIL]';

  const parts = email.split('@');
  if (parts.length !== 2) return '[INVALID_EMAIL]';

  const [username, domain] = parts;
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }

  return `${username.substring(0, 2)}***@${domain}`;
}

/**
 * Masks IP addresses for logging
 */
export function maskIP(ip) {
  if (!ip || typeof ip !== 'string') return '[INVALID_IP]';

  const parts = ip.split('.');
  if (parts.length !== 4) return ip; // Not an IPv4 address, return as-is

  return `${parts[0]}.${parts[1]}.***.***`;
}

/**
 * Masks user IDs for logging
 */
export function maskUserId(id) {
  if (!id || typeof id !== 'string') return '[INVALID_ID]';

  if (id.length <= 4) return `${id.substring(0, 1)}***`;

  return `${id.substring(0, 4)}...${id.substring(id.length - 3)}`;
}

/**
 * Creates a secure error message for logging
 */
export function createSecureLogMessage(message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;

  if (data) {
    try {
      const sanitized = sanitizeForLogging(data);
      logMessage += ` | Data: ${JSON.stringify(sanitized)}`;
    } catch (error) {
      logMessage += ` | Data: [UNABLE_TO_SANITIZE]`;
    }
  }

  return logMessage;
}

/**
 * Secure console.log replacement
 */
export function secureLog(message, data = null) {
  const logMessage = createSecureLogMessage(message, data);
  console.log(logMessage);
}

/**
 * Secure console.error replacement
 */
export function secureError(message, error = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ERROR: ${message}`;

  if (error) {
    // Log error message but sanitize any data in the error object
    if (error.message) {
      logMessage += ` | Message: ${error.message}`;
    }

    if (error.stack) {
      // Remove potentially sensitive info from stack trace
      const sanitizedStack = error.stack
        .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+/gi, 'Bearer [REDACTED]')
        .replace(/sk-[A-Za-z0-9]+/gi, '[API_KEY]');
      logMessage += ` | Stack: ${sanitizedStack}`;
    }

    if (error.data) {
      const sanitized = sanitizeForLogging(error.data);
      logMessage += ` | Data: ${JSON.stringify(sanitized)}`;
    }
  }

  console.error(logMessage);
}

/**
 * Secure console.warn replacement
 */
export function secureWarn(message, data = null) {
  const logMessage = createSecureLogMessage(`WARN: ${message}`, data);
  console.warn(logMessage);
}

/**
 * Creates a secure error response for API endpoints
 */
export function createSecureErrorResponse(message, originalError = null, includeDetails = false) {
  const response = {
    error: message,
    timestamp: new Date().toISOString()
  };

  // Only include error details in development or if explicitly requested
  if (includeDetails && originalError) {
    response.details = {
      message: originalError.message,
      code: originalError.code
    };
  }

  // Log the full error for debugging (sanitized)
  secureError(`API Error: ${message}`, originalError);

  return response;
}

/**
 * Audit log for security events
 */
export function auditLog(event, userId = null, details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    userId: userId ? maskUserId(userId) : null,
    details: sanitizeForLogging(details)
  };

  console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);

  // In production, you'd send this to a proper logging service
  // like LogRocket, Sentry, or your own audit log table
  return logEntry;
}

/**
 * Rate limit logging
 */
export function rateLimitLog(identifier, action, limitInfo) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    identifier: maskIP(identifier),
    limitInfo: {
      count: limitInfo.count,
      limit: limitInfo.limit,
      remaining: limitInfo.remaining,
      resetTime: limitInfo.resetTime
    }
  };

  console.log(`[RATE_LIMIT] ${JSON.stringify(logEntry)}`);
}

/**
 * Security event logging
 */
export function securityLog(event, severity = 'INFO', details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    severity,
    event,
    details: sanitizeForLogging(details)
  };

  const logMethod = severity === 'ERROR' ? console.error :
                   severity === 'WARN' ? console.warn : console.log;

  logMethod(`[SECURITY] ${JSON.stringify(logEntry)}`);

  return logEntry;
}

/**
 * Performance logging
 */
export function performanceLog(operation, duration, metadata = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    duration: `${duration}ms`,
    metadata: sanitizeForLogging(metadata)
  };

  console.log(`[PERFORMANCE] ${JSON.stringify(logEntry)}`);
}
