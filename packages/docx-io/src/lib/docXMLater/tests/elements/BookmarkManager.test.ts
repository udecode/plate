/**
 * Tests for BookmarkManager class
 * Tests bookmark registration, unique name generation, and the 40-character limit
 */

import { BookmarkManager } from '../../src/elements/BookmarkManager';
import { Bookmark } from '../../src/elements/Bookmark';

describe('BookmarkManager', () => {
  let manager: BookmarkManager;

  beforeEach(() => {
    manager = BookmarkManager.create();
  });

  describe('Basic Operations', () => {
    it('should create empty manager', () => {
      expect(manager.getCount()).toBe(0);
      expect(manager.getAllBookmarks()).toHaveLength(0);
    });

    it('should register bookmarks and assign unique IDs', () => {
      const bookmark1 = Bookmark.create('first');
      const bookmark2 = Bookmark.create('second');

      manager.register(bookmark1);
      manager.register(bookmark2);

      expect(bookmark1.getId()).toBe(0);
      expect(bookmark2.getId()).toBe(1);
      expect(manager.getCount()).toBe(2);
    });

    it('should throw on duplicate bookmark names', () => {
      const bookmark1 = Bookmark.create('duplicate');
      const bookmark2 = Bookmark.create('duplicate');

      manager.register(bookmark1);

      expect(() => manager.register(bookmark2)).toThrow(
        'Bookmark with name "duplicate" already exists'
      );
    });

    it('should clear all bookmarks', () => {
      manager.register(Bookmark.create('first'));
      manager.register(Bookmark.create('second'));

      expect(manager.getCount()).toBe(2);
      manager.clear();
      expect(manager.getCount()).toBe(0);
    });
  });

  describe('getUniqueName', () => {
    it('should return base name if not taken', () => {
      const uniqueName = manager.getUniqueName('myBookmark');
      expect(uniqueName).toBe('myBookmark');
    });

    it('should add suffix if name is taken', () => {
      manager.register(Bookmark.create('myBookmark'));
      const uniqueName = manager.getUniqueName('myBookmark');
      expect(uniqueName).toBe('myBookmark_1');
    });

    it('should increment suffix until unique', () => {
      manager.register(Bookmark.create('test'));
      manager.register(Bookmark.create('test_1'));
      manager.register(Bookmark.create('test_2'));

      const uniqueName = manager.getUniqueName('test');
      expect(uniqueName).toBe('test_3');
    });

    it('should truncate long names to fit 40-char limit with suffix', () => {
      // 40-character name
      const longName = 'a'.repeat(40);
      manager.register(Bookmark.create(longName));

      const uniqueName = manager.getUniqueName(longName);

      // Should be truncated to make room for "_1" suffix
      expect(uniqueName.length).toBeLessThanOrEqual(40);
      expect(uniqueName).toMatch(/_1$/);
      expect(uniqueName).toBe('a'.repeat(38) + '_1');
    });

    it('should handle multiple duplicates with long names', () => {
      const longName = 'Process_for_Basic_Call_Handling_for_Dedi'; // 40 chars
      manager.register(Bookmark.create(longName));

      // First unique should truncate to make room for _1
      const unique1 = manager.getUniqueName(longName);
      expect(unique1.length).toBeLessThanOrEqual(40);
      expect(unique1).toMatch(/_1$/);

      // Register it and get another
      manager.register(
        new Bookmark({ name: unique1, skipNormalization: true })
      );
      const unique2 = manager.getUniqueName(longName);
      expect(unique2.length).toBeLessThanOrEqual(40);
      expect(unique2).toMatch(/_2$/);

      // Ensure they're different
      expect(unique1).not.toBe(unique2);
    });

    it('should handle larger suffix numbers', () => {
      const longName = 'a'.repeat(40);
      manager.register(Bookmark.create(longName));

      // Register names with suffixes _1 through _9
      for (let i = 1; i <= 9; i++) {
        const truncated = 'a'.repeat(38) + `_${i}`;
        manager.register(
          new Bookmark({ name: truncated, skipNormalization: true })
        );
      }

      // Next unique should use _10, requiring more truncation
      const unique = manager.getUniqueName(longName);
      expect(unique.length).toBeLessThanOrEqual(40);
      expect(unique).toMatch(/_10$/);
      expect(unique).toBe('a'.repeat(37) + '_10');
    });
  });

  describe('createHeadingBookmark', () => {
    it('should create bookmark from heading text', () => {
      const bookmark = manager.createHeadingBookmark('Chapter 1: Introduction');
      expect(bookmark.getName()).toBe('Chapter_1_Introduction');
    });

    it('should handle multiple headings with same prefix', () => {
      const heading1 =
        'Process for Basic Call Handling for Dedicated Representatives Overview';
      const heading2 =
        'Process for Basic Call Handling for Dedicated Representatives Customer Service';

      const bookmark1 = manager.createHeadingBookmark(heading1);
      const bookmark2 = manager.createHeadingBookmark(heading2);

      // Both should be registered successfully
      expect(manager.getCount()).toBe(2);

      // Both should have unique names within 40-char limit
      expect(bookmark1.getName().length).toBeLessThanOrEqual(40);
      expect(bookmark2.getName().length).toBeLessThanOrEqual(40);
      expect(bookmark1.getName()).not.toBe(bookmark2.getName());

      // Second should have a suffix
      expect(bookmark2.getName()).toMatch(/_\d+$/);
    });

    it('should handle many similar long headings', () => {
      const baseHeading =
        'Very Long Heading That Exceeds The Maximum Character Limit';

      // Create 10 bookmarks with similar names
      const bookmarks: Bookmark[] = [];
      for (let i = 0; i < 10; i++) {
        const bookmark = manager.createHeadingBookmark(
          `${baseHeading} Version ${i}`
        );
        bookmarks.push(bookmark);
      }

      // All should be registered
      expect(manager.getCount()).toBe(10);

      // All names should be unique and within limit
      const names = bookmarks.map((b) => b.getName());
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(10);

      for (const name of names) {
        expect(name.length).toBeLessThanOrEqual(40);
      }
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      manager.register(Bookmark.create('first'));
      manager.register(Bookmark.create('second'));

      const stats = manager.getStats();

      expect(stats.total).toBe(2);
      expect(stats.nextId).toBe(2);
      expect(stats.names).toContain('first');
      expect(stats.names).toContain('second');
    });
  });
});
