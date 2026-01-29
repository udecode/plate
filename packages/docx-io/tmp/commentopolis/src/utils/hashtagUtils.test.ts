import { describe, it, expect } from 'vitest';
import { extractHashtags, hasHashtag, hasAnyHashtag, getUniqueHashtags } from './hashtagUtils';

describe('hashtagUtils', () => {
  describe('extractHashtags', () => {
    it('should extract single hashtag from text', () => {
      const text = 'This is a comment about #budget';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['budget']);
    });

    it('should extract multiple hashtags from text', () => {
      const text = 'Discussion about #budget and #timeline for the project';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['budget', 'timeline']);
    });

    it('should return empty array when no hashtags present', () => {
      const text = 'This is a comment without any hashtags';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual([]);
    });

    it('should handle hashtags at start of text', () => {
      const text = '#urgent Please review this document';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['urgent']);
    });

    it('should handle hashtags at end of text', () => {
      const text = 'This needs attention #urgent';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['urgent']);
    });

    it('should handle consecutive hashtags', () => {
      const text = 'Important: #urgent #priority #review';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['urgent', 'priority', 'review']);
    });

    it('should only match alphanumeric characters', () => {
      const text = 'Tagged with #budget2024 and #Q4review';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['budget2024', 'q4review']);
    });

    it('should not match hashtags with spaces', () => {
      const text = 'This is not a hashtag: # budget';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual([]);
    });

    it('should handle hashtags with mixed case', () => {
      const text = 'Tagged with #Budget and #TIMELINE';
      const hashtags = extractHashtags(text);
      // Should return lowercase for consistency
      expect(hashtags).toEqual(['budget', 'timeline']);
    });

    it('should not match partial hashtags in words', () => {
      const text = 'email@example.com and #hashtag';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['hashtag']);
    });

    it('should handle hashtags in parentheses', () => {
      const text = 'Important note (#urgent) about the project';
      const hashtags = extractHashtags(text);
      expect(hashtags).toEqual(['urgent']);
    });

    it('should handle duplicate hashtags', () => {
      const text = 'This is #urgent and I mean #urgent';
      const hashtags = extractHashtags(text);
      // Returns all occurrences, not unique
      expect(hashtags).toEqual(['urgent', 'urgent']);
    });
  });

  describe('hasHashtag', () => {
    it('should return true when hashtag is present', () => {
      const text = 'This is about #budget planning';
      expect(hasHashtag(text, 'budget')).toBe(true);
      expect(hasHashtag(text, '#budget')).toBe(true);
    });

    it('should return false when hashtag is not present', () => {
      const text = 'This is about #budget planning';
      expect(hasHashtag(text, 'timeline')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const text = 'This is about #Budget planning';
      expect(hasHashtag(text, 'budget')).toBe(true);
      expect(hasHashtag(text, 'BUDGET')).toBe(true);
      expect(hasHashtag(text, '#BuDgEt')).toBe(true);
    });

    it('should handle text without hashtags', () => {
      const text = 'This is a comment without hashtags';
      expect(hasHashtag(text, 'budget')).toBe(false);
    });
  });

  describe('hasAnyHashtag', () => {
    it('should return true when text has one of the hashtags', () => {
      const text = 'This is about #budget planning';
      expect(hasAnyHashtag(text, ['budget', 'timeline'])).toBe(true);
      expect(hasAnyHashtag(text, ['timeline', 'budget'])).toBe(true);
    });

    it('should return false when text has none of the hashtags', () => {
      const text = 'This is about #budget planning';
      expect(hasAnyHashtag(text, ['timeline', 'urgent'])).toBe(false);
    });

    it('should return true when empty array is provided (no filter)', () => {
      const text = 'This is about #budget planning';
      expect(hasAnyHashtag(text, [])).toBe(true);
    });

    it('should be case-insensitive', () => {
      const text = 'This is about #Budget planning';
      expect(hasAnyHashtag(text, ['BUDGET', 'timeline'])).toBe(true);
      expect(hasAnyHashtag(text, ['#BuDgEt'])).toBe(true);
    });

    it('should work with multiple hashtags in text', () => {
      const text = 'Important: #budget and #timeline';
      expect(hasAnyHashtag(text, ['budget'])).toBe(true);
      expect(hasAnyHashtag(text, ['timeline'])).toBe(true);
      expect(hasAnyHashtag(text, ['budget', 'timeline'])).toBe(true);
      expect(hasAnyHashtag(text, ['urgent'])).toBe(false);
    });

    it('should handle text without hashtags', () => {
      const text = 'This is a comment without hashtags';
      expect(hasAnyHashtag(text, ['budget', 'timeline'])).toBe(false);
    });
  });

  describe('getUniqueHashtags', () => {
    it('should return unique hashtags from multiple texts', () => {
      const texts = [
        'Comment about #budget',
        'Another comment about #timeline',
        'Third comment about #budget and #review',
      ];
      const hashtags = getUniqueHashtags(texts);
      expect(hashtags).toEqual(['budget', 'review', 'timeline']);
    });

    it('should return empty array for texts without hashtags', () => {
      const texts = [
        'Comment without hashtags',
        'Another comment without hashtags',
      ];
      const hashtags = getUniqueHashtags(texts);
      expect(hashtags).toEqual([]);
    });

    it('should handle duplicate hashtags across texts', () => {
      const texts = [
        'Comment with #budget',
        'Another with #budget',
        'Third with #budget',
      ];
      const hashtags = getUniqueHashtags(texts);
      expect(hashtags).toEqual(['budget']);
    });

    it('should be case-insensitive and return sorted', () => {
      const texts = [
        'Comment with #Budget',
        'Another with #TIMELINE',
        'Third with #Review',
        'Fourth with #budget',
      ];
      const hashtags = getUniqueHashtags(texts);
      expect(hashtags).toEqual(['budget', 'review', 'timeline']);
    });

    it('should handle empty array', () => {
      const hashtags = getUniqueHashtags([]);
      expect(hashtags).toEqual([]);
    });

    it('should handle mix of texts with and without hashtags', () => {
      const texts = [
        'Comment with #budget',
        'No hashtags here',
        'Another with #timeline',
        'Plain text',
      ];
      const hashtags = getUniqueHashtags(texts);
      expect(hashtags).toEqual(['budget', 'timeline']);
    });
  });
});
