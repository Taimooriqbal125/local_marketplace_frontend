import { getRelativeTime } from '../dateFormatter';

describe('dateFormatter', () => {
  describe('getRelativeTime', () => {
    it('should return empty string for null or undefined', () => {
      expect(getRelativeTime(null)).toBe('');
      expect(getRelativeTime(undefined)).toBe('');
    });

    it('should return "just now" for very recent times', () => {
      const now = new Date().toISOString();
      expect(getRelativeTime(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      expect(getRelativeTime(twoMinutesAgo)).toBe('2m ago');
    });

    it('should return hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(getRelativeTime(threeHoursAgo)).toBe('3h ago');
    });

    it('should return days ago', () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      expect(getRelativeTime(fourDaysAgo)).toBe('4d ago');
    });

    it('should return weeks ago', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      expect(getRelativeTime(twoWeeksAgo)).toBe('2w ago');
    });
  });
});
