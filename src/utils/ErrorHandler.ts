import Toast from 'react-native-toast-message';

/**
 * Centralized Error Handler Utility
 * Handles standardizing error messages from backend and showing UI notifications
 */
class ErrorHandler {
  /**
   * Extracts a user-friendly error message from an error object
   */
  static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;

    // Handle standardized error object from our axios interceptor OR RTK Query
    // RTK Query errors have a .data property
    const data = error?.data || error?.response?.data;

    if (data) {
      if (typeof data.detail === 'string') return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail.map((d: any) => d.msg || d.message).join(', ');
      }
      if (data.message) return data.message;
      if (typeof data === 'string') return data;
    }

    if (error?.message) {
      // Check if it's a validation error with details
      if (Array.isArray(error.errors)) {
        return error.errors.map((e: any) => e.msg || e.message).join(', ') || error.message;
      }
      return error.message;
    }

    return 'An unexpected error occurred';
  }

  /**
   * Shows a toast notification for an error
   */
  static showError(error: any, title: string = 'Error'): void {
    const message = this.getErrorMessage(error);

    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
    });

    // Also log to console for debugging
    console.error(`[ErrorHandler] ${title}:`, error);
  }

  /**
   * Shows a success toast notification
   */
  static showSuccess(message: string, title: string = 'Success'): void {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
    });
  }
}

export default ErrorHandler;
