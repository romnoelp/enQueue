import { isAxiosError } from 'axios';

/**
 * Extracts a user-friendly error message from various error types.
 * Handles Axios errors, Error objects, and unknown error types.
 *
 * @param error - The error to extract a message from
 * @returns A string error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    // Try to get message from response data
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Fall back to axios error message
    if (error.message) {
      return error.message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle objects with a message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  // Fall back to string conversion
  return String(error ?? 'An unknown error occurred');
}
