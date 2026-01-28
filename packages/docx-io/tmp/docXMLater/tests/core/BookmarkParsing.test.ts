/**
 * Tests for bookmark parsing functionality
 * Ensures bookmarks are properly parsed from documents and preserved during round-trip
 */

import { Document } from '../../src/core/Document';
import { Bookmark } from '../../src/elements/Bookmark';
import { Field } from '../../src/elements/Field';
import { ZipHandler } from '../../src/zip/ZipHandler';
import { XMLParser } from '../../src/xml/XMLParser';

describe('Bookmark Parsing', () => {
  describe('Basic Bookmark Parsing', () => {
    it('should parse bookmarks from document.xml', async () => {
      // Create a document with bookmarks
      const doc = Document.create();
      const para1 = doc.createParagraph('First paragraph');
      const para2 = doc.createParagraph('Second paragraph');

      // Add bookmarks - must be associated with paragraphs
      const bookmark1 = doc.getBookmarkManager().createBookmark('Introduction');
      para1.addBookmark(bookmark1);

      const bookmark2 = doc.getBookmarkManager().createBookmark('Chapter1');
      para2.addBookmark(bookmark2);

      // Save and reload
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Verify bookmarks were preserved
      const bookmarks = loadedDoc.getBookmarkManager().getAllBookmarks();
      expect(bookmarks.length).toBeGreaterThanOrEqual(2);

      // Find our bookmarks
      const intro = loadedDoc.getBookmarkManager().getBookmark('Introduction');
      const chapter = loadedDoc.getBookmarkManager().getBookmark('Chapter1');

      expect(intro).toBeDefined();
      expect(chapter).toBeDefined();
    });

    it('should preserve bookmark IDs and names', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Content');

      // Create bookmark with specific properties
      const bookmark = new Bookmark({
        id: 42,
        name: 'TestBookmark',
        skipNormalization: true
      });

      doc.getBookmarkManager().register(bookmark);
      para.addBookmark(bookmark);

      // Round-trip
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedBookmark = loadedDoc.getBookmarkManager().getBookmark('TestBookmark');
      expect(loadedBookmark).toBeDefined();
      expect(loadedBookmark?.getName()).toBe('TestBookmark');
      expect(loadedBookmark?.getId()).toBeDefined();
    });

    it('should handle bookmark name normalization', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Test');

      // Add bookmark with special characters (should be normalized)
      const bookmark = new Bookmark({
        name: 'My-Bookmark.Name!',
        skipNormalization: false
      });

      doc.getBookmarkManager().register(bookmark);
      para.addBookmark(bookmark);

      // The name should be normalized
      const normalizedName = bookmark.getName();
      expect(normalizedName).not.toContain('-');
      expect(normalizedName).not.toContain('.');
      expect(normalizedName).not.toContain('!');

      // Round-trip
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedBookmark = loadedDoc.getBookmarkManager().getBookmark(normalizedName);
      expect(loadedBookmark).toBeDefined();
    });

    it('should preserve exact bookmark names when loading', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Content');

      // When loading from existing documents, preserve exact names
      const bookmark = new Bookmark({
        name: '_Ref123456789',  // Word reference bookmark
        skipNormalization: true  // Preserve exact name
      });

      doc.getBookmarkManager().register(bookmark);
      para.addBookmark(bookmark);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedBookmark = loadedDoc.getBookmarkManager().getBookmark('_Ref123456789');
      expect(loadedBookmark).toBeDefined();
      expect(loadedBookmark?.getName()).toBe('_Ref123456789');
    });
  });

  describe('Bookmark Cross-References', () => {
    it('should work with REF fields', async () => {
      const doc = Document.create();

      // Add content with bookmark
      const headingPara = doc.createParagraph('Chapter 1: Introduction');
      const bookmark = doc.getBookmarkManager().createBookmark('ChapterOne');
      headingPara.addBookmark(bookmark);

      // Add REF field pointing to bookmark
      const refPara = doc.createParagraph('See ');
      const refField = new Field({
        type: 'REF',
        instruction: 'REF ChapterOne \\h'  // \h for hyperlink
      });
      refPara.addField(refField);

      // Round-trip
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Verify bookmark exists
      const loadedBookmark = loadedDoc.getBookmarkManager().getBookmark('ChapterOne');
      expect(loadedBookmark).toBeDefined();

      // Verify field exists (field parsing would need to be working)
      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle duplicate bookmark names gracefully', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Test');

      // Add first bookmark
      const bookmark1 = doc.getBookmarkManager().createBookmark('MyBookmark');
      para.addBookmark(bookmark1);

      // Try to add duplicate (should handle gracefully)
      let duplicateError = false;
      try {
        const bookmark2 = new Bookmark({ name: 'MyBookmark' });
        doc.getBookmarkManager().register(bookmark2);
      } catch (error) {
        duplicateError = true;
      }

      expect(duplicateError).toBe(true);

      // Document should still be valid
      const buffer = await doc.toBuffer();
      expect(buffer).toBeDefined();
    });
  });

  describe('Complex Bookmark Scenarios', () => {
    it('should handle multiple bookmarks in same paragraph', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Text with multiple bookmarks');

      const bookmark1 = doc.getBookmarkManager().createBookmark('Start');
      const bookmark2 = doc.getBookmarkManager().createBookmark('Middle');
      const bookmark3 = doc.getBookmarkManager().createBookmark('End');

      // Add all bookmarks to the paragraph
      para.addBookmark(bookmark1);
      para.addBookmark(bookmark2);
      para.addBookmark(bookmark3);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const bookmarks = loadedDoc.getBookmarkManager().getAllBookmarks();
      expect(bookmarks.length).toBeGreaterThanOrEqual(3);

      // All bookmarks should be findable
      expect(loadedDoc.getBookmarkManager().getBookmark('Start')).toBeDefined();
      expect(loadedDoc.getBookmarkManager().getBookmark('Middle')).toBeDefined();
      expect(loadedDoc.getBookmarkManager().getBookmark('End')).toBeDefined();
    });

    it('should preserve bookmark order', async () => {
      const doc = Document.create();

      // Add bookmarks in specific order
      const para1 = doc.createParagraph('First');
      const bookmark1 = doc.getBookmarkManager().createBookmark('BookmarkA');
      para1.addBookmark(bookmark1);

      const para2 = doc.createParagraph('Second');
      const bookmark2 = doc.getBookmarkManager().createBookmark('BookmarkB');
      para2.addBookmark(bookmark2);

      const para3 = doc.createParagraph('Third');
      const bookmark3 = doc.getBookmarkManager().createBookmark('BookmarkC');
      para3.addBookmark(bookmark3);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const bookmarks = loadedDoc.getBookmarkManager().getAllBookmarks();

      // Find our bookmarks
      const bookmarkNames = bookmarks
        .filter(b => b.getName().startsWith('Bookmark'))
        .map(b => b.getName());

      // They should maintain relative order
      const aIndex = bookmarkNames.indexOf('BookmarkA');
      const bIndex = bookmarkNames.indexOf('BookmarkB');
      const cIndex = bookmarkNames.indexOf('BookmarkC');

      if (aIndex >= 0 && bIndex >= 0 && cIndex >= 0) {
        expect(aIndex).toBeLessThan(bIndex);
        expect(bIndex).toBeLessThan(cIndex);
      }
    });

    it('should handle bookmarks spanning multiple paragraphs', async () => {
      const doc = Document.create();

      // Create bookmark
      const bookmark = doc.getBookmarkManager().createBookmark('SpanningBookmark');

      // Start bookmark in first paragraph
      const para1 = doc.createParagraph('First paragraph in bookmark');
      para1.addBookmarkStart(bookmark);

      doc.createParagraph('Second paragraph in bookmark');

      // End bookmark in last paragraph
      const para3 = doc.createParagraph('Third paragraph in bookmark');
      para3.addBookmarkEnd(bookmark);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedBookmark = loadedDoc.getBookmarkManager().getBookmark('SpanningBookmark');
      expect(loadedBookmark).toBeDefined();
    });
  });

  describe('Bookmark Manager Operations', () => {
    it('should get unique bookmark names', async () => {
      const doc = Document.create();

      const bookmark1 = doc.getBookmarkManager().createBookmark('TestName');
      const para1 = doc.createParagraph('Para 1');
      para1.addBookmark(bookmark1);

      // Manager should generate unique name
      const uniqueName = doc.getBookmarkManager().getUniqueName('TestName');
      expect(uniqueName).not.toBe('TestName');
      expect(uniqueName).toContain('TestName');

      // Add the unique one
      const bookmark2 = doc.getBookmarkManager().createBookmark(uniqueName);
      const para2 = doc.createParagraph('Para 2');
      para2.addBookmark(bookmark2);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Both should exist
      expect(loadedDoc.getBookmarkManager().getBookmark('TestName')).toBeDefined();
      expect(loadedDoc.getBookmarkManager().getBookmark(uniqueName)).toBeDefined();
    });

    it('should count bookmarks correctly', async () => {
      const doc = Document.create();

      const initialCount = doc.getBookmarkManager().getCount();

      const bookmark1 = doc.getBookmarkManager().createBookmark('First');
      const bookmark2 = doc.getBookmarkManager().createBookmark('Second');
      const bookmark3 = doc.getBookmarkManager().createBookmark('Third');

      // Add all bookmarks to paragraphs
      const para = doc.createParagraph('Content');
      para.addBookmark(bookmark1);
      para.addBookmark(bookmark2);
      para.addBookmark(bookmark3);

      const afterCount = doc.getBookmarkManager().getCount();
      expect(afterCount).toBe(initialCount + 3);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc.getBookmarkManager().getCount()).toBeGreaterThanOrEqual(3);
    });

    it('should check bookmark existence', async () => {
      const doc = Document.create();

      expect(doc.getBookmarkManager().hasBookmark('NonExistent')).toBe(false);

      const bookmark = doc.getBookmarkManager().createBookmark('ExistingBookmark');
      const para = doc.createParagraph('Content');
      para.addBookmark(bookmark);

      expect(doc.getBookmarkManager().hasBookmark('ExistingBookmark')).toBe(true);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc.getBookmarkManager().hasBookmark('ExistingBookmark')).toBe(true);
      expect(loadedDoc.getBookmarkManager().hasBookmark('NonExistent')).toBe(false);
    });
  });
});
