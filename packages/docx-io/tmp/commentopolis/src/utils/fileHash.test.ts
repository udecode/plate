import { describe, it, expect } from 'vitest';
import { compareHashes } from './fileHash';

describe('fileHash', () => {
  // Note: hashFile tests are skipped because they require crypto.subtle which is not
  // fully supported in the test environment. The function is tested manually in the browser.
  
  describe('compareHashes', () => {
    it('should return true for identical hashes', () => {
      const hash = 'a'.repeat(64);
      expect(compareHashes(hash, hash)).toBe(true);
    });

    it('should return false for different hashes', () => {
      const hash1 = 'a'.repeat(64);
      const hash2 = 'b'.repeat(64);
      expect(compareHashes(hash1, hash2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const hash1 = 'abc123';
      const hash2 = 'ABC123';
      expect(compareHashes(hash1, hash2)).toBe(false);
    });
    
    it('should handle empty strings', () => {
      expect(compareHashes('', '')).toBe(true);
      expect(compareHashes('abc', '')).toBe(false);
    });
  });
});
