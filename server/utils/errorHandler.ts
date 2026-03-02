/**
 * Detects MongoDB connection errors and returns appropriate HTTP status and message
 */
export function handleMongoError(error: any) {
  const errorMessage = error.message || String(error);
  
  // Timeout errors - service temporarily unavailable
  if (
    error.name === 'MongoNetworkTimeoutError' ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('getaddrinfo')
  ) {
    return {
      statusCode: 503,
      message: 'Database temporarily unavailable. Please try again in a moment.',
      isConnectionError: true,
    };
  }
  
  // Authentication errors
  if (errorMessage.includes('authentication failed') || errorMessage.includes('auth')) {
    return {
      statusCode: 503,
      message: 'Database authentication failed. Please check configuration.',
      isConnectionError: true,
    };
  }
  
  // Network/connectivity errors
  if (
    errorMessage.includes('EHOSTUNREACH') ||
    errorMessage.includes('ENETUNREACH') ||
    errorMessage.includes('socket hang up')
  ) {
    return {
      statusCode: 503,
      message: 'Cannot reach database server. Please check your connection.',
      isConnectionError: true,
    };
  }
  
  // Generic server error
  return {
    statusCode: 500,
    message: errorMessage,
    isConnectionError: false,
  };
}

/**
 * Logs MongoDB errors with diagnostic information
 */
export function logMongoError(endpoint: string, error: any) {
  const { isConnectionError, message } = handleMongoError(error);
  
  if (isConnectionError) {
    console.error(`[API] Database connection error at ${endpoint}:`, error.name, '-', message);
  } else {
    console.error(`[API] Error at ${endpoint}:`, error);
  }
}
