import { ErrorCode } from './AppError';

export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ErrorCode.NOT_FOUND]: 'The requested item was not found.',
  [ErrorCode.UNAUTHENTICATED]: 'Please sign in to continue.',
  
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided. Please check your data and try again.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Required field is missing.',
  [ErrorCode.INVALID_DATE]: 'Invalid date provided.',
  
  [ErrorCode.DUPLICATE_ACTIVITY]: 'An activity with the same details already exists.',
  [ErrorCode.INVALID_DATE_RANGE]: 'Invalid date range provided.',
  [ErrorCode.FUTURE_DATE_NOT_ALLOWED]: 'Date cannot be in the future.',
  
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

export function getErrorMessage(code: ErrorCode): string {
  return errorMessages[code] || errorMessages[ErrorCode.UNKNOWN_ERROR];
}