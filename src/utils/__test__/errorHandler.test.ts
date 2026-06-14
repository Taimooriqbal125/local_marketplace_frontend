import ErrorHandler from '../ErrorHandler';

describe('ErrorHandler', () => {
  describe('getErrorMessage', () => {
    it('should return the string if error is a string', () => {
      const error = 'Simple error message';
      expect(ErrorHandler.getErrorMessage(error)).toBe(error);
    });

    it('should return data.detail if it is a string', () => {
      const error = { data: { detail: 'Specific error detail' } };
      expect(ErrorHandler.getErrorMessage(error)).toBe('Specific error detail');
    });

    it('should handle array of details', () => {
      const error = {
        data: {
          detail: [{ msg: 'Field required' }, { msg: 'Invalid format' }],
        },
      };
      expect(ErrorHandler.getErrorMessage(error)).toBe('Field required, Invalid format');
    });

    it('should return data.message if available', () => {
      const error = { data: { message: 'Data level message' } };
      expect(ErrorHandler.getErrorMessage(error)).toBe('Data level message');
    });

    it('should return error.message if available', () => {
      const error = new Error('Generic error message');
      expect(ErrorHandler.getErrorMessage(error)).toBe('Generic error message');
    });

    it('should return default message for unknown error format', () => {
      const error = {};
      expect(ErrorHandler.getErrorMessage(error)).toBe('An unexpected error occurred');
    });
  });
});
