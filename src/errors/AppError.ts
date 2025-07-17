export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public isOperational = true,
    public statusCode = 500
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export enum ErrorCode {
  // Firebase errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_DATE = 'INVALID_DATE',
  
  // Business logic errors
  DUPLICATE_ACTIVITY = 'DUPLICATE_ACTIVITY',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  FUTURE_DATE_NOT_ALLOWED = 'FUTURE_DATE_NOT_ALLOWED',
  
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}