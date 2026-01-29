/**
 * Tests for ZipHandler
 */

import { ZipHandler } from '../../src/zip/ZipHandler';
import { DOCX_PATHS } from '../../src/zip/types';
import { MissingRequiredFileError } from '../../src/zip/errors';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('ZipHandler', () => {
  let handler: ZipHandler;
  const testDir = path.join(__dirname, '..', 'temp');
  const testFile = path.join(testDir, 'test.docx');

  beforeEach(() => {
    handler = new ZipHandler();
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  describe('File Operations', () => {
    test('should add a file to the archive', () => {
      handler.addFile('test.txt', 'Hello World');
      expect(handler.hasFile('test.txt')).toBe(true);
      expect(handler.getFileAsString('test.txt')).toBe('Hello World');
    });

    test('should add binary file to the archive', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG signature
      handler.addFile('image.png', buffer, { binary: true });

      expect(handler.hasFile('image.png')).toBe(true);
      const retrieved = handler.getFileAsBuffer('image.png');
      expect(retrieved).toEqual(buffer);
    });

    test('should update existing file', () => {
      handler.addFile('test.txt', 'Original');
      const updated = handler.updateFile('test.txt', 'Updated');

      expect(updated).toBe(true);
      expect(handler.getFileAsString('test.txt')).toBe('Updated');
    });

    test('should return false when updating non-existent file', () => {
      const updated = handler.updateFile('nonexistent.txt', 'Content');
      expect(updated).toBe(false);
    });

    test('should remove a file', () => {
      handler.addFile('test.txt', 'Content');
      expect(handler.hasFile('test.txt')).toBe(true);

      const removed = handler.removeFile('test.txt');
      expect(removed).toBe(true);
      expect(handler.hasFile('test.txt')).toBe(false);
    });

    test('should return false when removing non-existent file', () => {
      const removed = handler.removeFile('nonexistent.txt');
      expect(removed).toBe(false);
    });

    test('should get all files', () => {
      handler.addFile('file1.txt', 'Content 1');
      handler.addFile('file2.txt', 'Content 2');
      handler.addFile('file3.txt', 'Content 3');

      const allFiles = handler.getAllFiles();
      expect(allFiles.size).toBe(3);
      expect(allFiles.has('file1.txt')).toBe(true);
      expect(allFiles.has('file2.txt')).toBe(true);
      expect(allFiles.has('file3.txt')).toBe(true);
    });

    test('should get file paths', () => {
      handler.addFile('file1.txt', 'Content 1');
      handler.addFile('file2.txt', 'Content 2');

      const paths = handler.getFilePaths();
      expect(paths).toContain('file1.txt');
      expect(paths).toContain('file2.txt');
      expect(paths.length).toBe(2);
    });

    test('should get file count', () => {
      expect(handler.getFileCount()).toBe(0);

      handler.addFile('file1.txt', 'Content 1');
      handler.addFile('file2.txt', 'Content 2');

      expect(handler.getFileCount()).toBe(2);
    });

    test('should normalize file paths', () => {
      handler.addFile('path/to/file.txt', 'Content');
      handler.addFile('path\\to\\file2.txt', 'Content 2');

      expect(handler.hasFile('path/to/file.txt')).toBe(true);
      expect(handler.hasFile('path/to/file2.txt')).toBe(true);
    });
  });

  describe('Validation', () => {
    test('should validate DOCX structure', () => {
      // Add all required files
      handler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.RELS, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.DOCUMENT, '<?xml version="1.0"?>');

      expect(() => handler.validate()).not.toThrow();
    });

    test('should throw error when missing required files', () => {
      handler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      // Missing other required files

      expect(() => handler.validate()).toThrow(MissingRequiredFileError);
    });
  });

  describe('Save and Load', () => {
    beforeEach(async () => {
      // Create test directory
      await fs.mkdir(testDir, { recursive: true });
    });

    test('should save to file', async () => {
      // Add minimum required files for valid DOCX
      handler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.RELS, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.DOCUMENT, '<?xml version="1.0"?>');

      await handler.save(testFile);

      // Check file was created
      const stats = await fs.stat(testFile);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    test('should save to buffer', async () => {
      handler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.RELS, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.DOCUMENT, '<?xml version="1.0"?>');

      const buffer = await handler.toBuffer();

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);

      // Check ZIP signature
      expect(buffer[0]).toBe(0x50); // 'P'
      expect(buffer[1]).toBe(0x4b); // 'K'
    });

    test('should load from file', async () => {
      // Create a test DOCX file
      handler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.RELS, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.DOCUMENT, '<document>Test</document>');
      await handler.save(testFile);

      // Load it back
      const newHandler = new ZipHandler();
      await newHandler.load(testFile);

      expect(newHandler.isLoaded()).toBe(true);
      expect(newHandler.hasFile(DOCX_PATHS.DOCUMENT)).toBe(true);
      expect(newHandler.getFileAsString(DOCX_PATHS.DOCUMENT)).toContain('Test');
    });

    test('should load from buffer', async () => {
      handler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.RELS, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.DOCUMENT, '<document>Test</document>');

      const buffer = await handler.toBuffer();

      const newHandler = new ZipHandler();
      await newHandler.loadFromBuffer(buffer);

      expect(newHandler.isLoaded()).toBe(true);
      expect(newHandler.hasFile(DOCX_PATHS.DOCUMENT)).toBe(true);
    });

    test('should handle save with validation disabled', async () => {
      // Add files without all required files
      handler.addFile('test.txt', 'Test');

      // Should not throw when validation is disabled
      await expect(
        handler.save(testFile, { validate: false })
      ).resolves.not.toThrow();
    });

    test('should throw error when loading invalid ZIP', async () => {
      // Create a non-ZIP file
      const invalidFile = path.join(testDir, 'invalid.docx');
      await fs.writeFile(invalidFile, 'This is not a ZIP file');

      const newHandler = new ZipHandler();
      await expect(newHandler.load(invalidFile)).rejects.toThrow();
    });
  });

  describe('Utility Methods', () => {
    test('should clear all files', () => {
      handler.addFile('file1.txt', 'Content 1');
      handler.addFile('file2.txt', 'Content 2');

      expect(handler.getFileCount()).toBe(2);

      handler.clear();

      expect(handler.getFileCount()).toBe(0);
      expect(handler.isLoaded()).toBe(false);
    });

    test('should clone handler', () => {
      handler.addFile('file1.txt', 'Content 1');
      handler.addFile('file2.txt', 'Content 2');

      const cloned = handler.clone();

      expect(cloned.getFileCount()).toBe(2);
      expect(cloned.hasFile('file1.txt')).toBe(true);
      expect(cloned.getFileAsString('file1.txt')).toBe('Content 1');

      // Ensure it's a true clone
      handler.addFile('file3.txt', 'Content 3');
      expect(handler.getFileCount()).toBe(3);
      expect(cloned.getFileCount()).toBe(2);
    });

    test('should track mode correctly', () => {
      expect(handler.getMode()).toBe('write');

      handler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.RELS, '<?xml version="1.0"?>');
      handler.addFile(DOCX_PATHS.DOCUMENT, '<?xml version="1.0"?>');
      expect(handler.getMode()).toBe('write');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      await fs.mkdir(testDir, { recursive: true });
    });

    test('should create new DOCX with static create method', async () => {
      const files = new Map();
      files.set(DOCX_PATHS.CONTENT_TYPES, {
        path: DOCX_PATHS.CONTENT_TYPES,
        content: '<?xml version="1.0"?>',
        isBinary: false,
        size: 22,
      });
      files.set(DOCX_PATHS.RELS, {
        path: DOCX_PATHS.RELS,
        content: '<?xml version="1.0"?>',
        isBinary: false,
        size: 22,
      });
      files.set(DOCX_PATHS.DOCUMENT, {
        path: DOCX_PATHS.DOCUMENT,
        content: '<?xml version="1.0"?>',
        isBinary: false,
        size: 22,
      });

      await ZipHandler.create(testFile, files);

      const stats = await fs.stat(testFile);
      expect(stats.isFile()).toBe(true);
    });

    test('should modify existing DOCX with static modify method', async () => {
      // Create initial file
      const initialHandler = new ZipHandler();
      initialHandler.addFile(DOCX_PATHS.CONTENT_TYPES, '<?xml version="1.0"?>');
      initialHandler.addFile(DOCX_PATHS.RELS, '<?xml version="1.0"?>');
      initialHandler.addFile(
        DOCX_PATHS.DOCUMENT,
        '<document>Original</document>'
      );
      await initialHandler.save(testFile);

      const outputFile = path.join(testDir, 'modified.docx');

      // Modify it
      await ZipHandler.modify(testFile, outputFile, (handler) => {
        handler.updateFile(
          DOCX_PATHS.DOCUMENT,
          '<document>Modified</document>'
        );
      });

      // Verify modification
      const verifyHandler = new ZipHandler();
      await verifyHandler.load(outputFile);
      expect(verifyHandler.getFileAsString(DOCX_PATHS.DOCUMENT)).toContain(
        'Modified'
      );
    });
  });

  describe('Helper Methods', () => {
    describe('File Operations', () => {
      test('should rename file', () => {
        handler.addFile('old.txt', 'Content');
        const renamed = handler.renameFile('old.txt', 'new.txt');

        expect(renamed).toBe(true);
        expect(handler.hasFile('new.txt')).toBe(true);
        expect(handler.hasFile('old.txt')).toBe(false);
        expect(handler.getFileAsString('new.txt')).toBe('Content');
      });

      test('should return false when renaming non-existent file', () => {
        const renamed = handler.renameFile('nonexistent.txt', 'new.txt');
        expect(renamed).toBe(false);
      });

      test('should copy file', () => {
        handler.addFile('original.txt', 'Content');
        const copied = handler.copyFile('original.txt', 'copy.txt');

        expect(copied).toBe(true);
        expect(handler.hasFile('original.txt')).toBe(true);
        expect(handler.hasFile('copy.txt')).toBe(true);
        expect(handler.getFileAsString('copy.txt')).toBe('Content');
      });

      test('should return false when copying non-existent file', () => {
        const copied = handler.copyFile('nonexistent.txt', 'copy.txt');
        expect(copied).toBe(false);
      });

      test('should move file', () => {
        handler.addFile('source.txt', 'Content');
        const moved = handler.moveFile('source.txt', 'dest.txt');

        expect(moved).toBe(true);
        expect(handler.hasFile('dest.txt')).toBe(true);
        expect(handler.hasFile('source.txt')).toBe(false);
        expect(handler.getFileAsString('dest.txt')).toBe('Content');
      });

      test('should return false when moving non-existent file', () => {
        const moved = handler.moveFile('nonexistent.txt', 'dest.txt');
        expect(moved).toBe(false);
      });

      test('should not throw when file exists', () => {
        handler.addFile('exists.txt', 'Content');
        expect(() => handler.existsOrThrow('exists.txt')).not.toThrow();
      });

      test('should throw when file does not exist', () => {
        expect(() => handler.existsOrThrow('nonexistent.txt')).toThrow(
          'File not found in archive: nonexistent.txt'
        );
      });
    });

    describe('Batch Operations', () => {
      test('should remove multiple files', () => {
        handler.addFile('file1.txt', 'Content 1');
        handler.addFile('file2.txt', 'Content 2');
        handler.addFile('file3.txt', 'Content 3');

        const count = handler.removeFiles(['file1.txt', 'file3.txt']);

        expect(count).toBe(2);
        expect(handler.hasFile('file1.txt')).toBe(false);
        expect(handler.hasFile('file2.txt')).toBe(true);
        expect(handler.hasFile('file3.txt')).toBe(false);
      });

      test('should handle non-existent files in batch remove', () => {
        handler.addFile('file1.txt', 'Content');
        const count = handler.removeFiles(['file1.txt', 'nonexistent.txt']);

        expect(count).toBe(1);
      });

      test('should get files by extension', () => {
        handler.addFile('doc1.xml', '<xml/>');
        handler.addFile('doc2.xml', '<xml/>');
        handler.addFile('image.png', Buffer.from([]), { binary: true });
        handler.addFile('data.json', '{}');

        const xmlFiles = handler.getFilesByExtension('.xml');
        expect(xmlFiles.length).toBe(2);

        const xmlFilesNoDot = handler.getFilesByExtension('xml');
        expect(xmlFilesNoDot.length).toBe(2);
      });

      test('should handle case-insensitive extension search', () => {
        handler.addFile('FILE.XML', '<xml/>');
        handler.addFile('file.xml', '<xml/>');

        const xmlFiles = handler.getFilesByExtension('xml');
        expect(xmlFiles.length).toBe(2);
      });
    });

    describe('Archive Information', () => {
      test('should get total size', () => {
        handler.addFile('file1.txt', 'Hello'); // 5 bytes
        handler.addFile('file2.txt', 'World'); // 5 bytes

        expect(handler.getTotalSize()).toBe(10);
      });

      test('should return zero for empty archive', () => {
        expect(handler.getTotalSize()).toBe(0);
      });

      test('should get comprehensive stats', () => {
        handler.addFile('text1.txt', 'Hello');
        handler.addFile('text2.xml', '<xml/>');
        handler.addFile('image.png', Buffer.from([1, 2, 3, 4]), {
          binary: true,
        });

        const stats = handler.getStats();

        expect(stats.fileCount).toBe(3);
        expect(stats.totalSize).toBe(15); // 5 + 6 + 4
        expect(stats.textFileCount).toBe(2);
        expect(stats.binaryFileCount).toBe(1);
        expect(stats.avgFileSize).toBe(5); // 15 / 3
      });

      test('should handle empty archive stats', () => {
        const stats = handler.getStats();

        expect(stats.fileCount).toBe(0);
        expect(stats.totalSize).toBe(0);
        expect(stats.avgFileSize).toBe(0);
      });

      test('should check if archive is empty', () => {
        expect(handler.isEmpty()).toBe(true);

        handler.addFile('file.txt', 'Content');
        expect(handler.isEmpty()).toBe(false);
      });
    });

    describe('Content Helpers', () => {
      test('should get text files', () => {
        handler.addFile('text1.txt', 'Text');
        handler.addFile('text2.xml', '<xml/>');
        handler.addFile('image.png', Buffer.from([]), { binary: true });

        const textFiles = handler.getTextFiles();
        expect(textFiles.length).toBe(2);
        expect(textFiles.every((f) => !f.isBinary)).toBe(true);
      });

      test('should get binary files', () => {
        handler.addFile('text.txt', 'Text');
        handler.addFile('image1.png', Buffer.from([]), { binary: true });
        handler.addFile('image2.jpg', Buffer.from([]), { binary: true });

        const binaryFiles = handler.getBinaryFiles();
        expect(binaryFiles.length).toBe(2);
        expect(binaryFiles.every((f) => f.isBinary)).toBe(true);
      });

      test('should get media files', () => {
        handler.addFile('word/document.xml', '<xml/>');
        handler.addFile('word/media/image1.png', Buffer.from([]), {
          binary: true,
        });
        handler.addFile('word/media/image2.jpg', Buffer.from([]), {
          binary: true,
        });
        handler.addFile('other/file.txt', 'Text');

        const mediaFiles = handler.getMediaFiles();
        expect(mediaFiles.length).toBe(2);
        expect(mediaFiles.every((f) => f.path.startsWith('word/media/'))).toBe(
          true
        );
      });
    });

    describe('Import/Export', () => {
      beforeEach(async () => {
        await fs.mkdir(testDir, { recursive: true });
      });

      test('should export file', async () => {
        handler.addFile('internal.txt', 'Export me!');
        const outputPath = path.join(testDir, 'exported.txt');

        await handler.exportFile('internal.txt', outputPath);

        const content = await fs.readFile(outputPath, 'utf8');
        expect(content).toBe('Export me!');
      });

      test('should throw when exporting non-existent file', async () => {
        const outputPath = path.join(testDir, 'output.txt');
        await expect(
          handler.exportFile('nonexistent.txt', outputPath)
        ).rejects.toThrow('File not found in archive: nonexistent.txt');
      });

      test('should import file', async () => {
        const sourcePath = path.join(testDir, 'source.txt');
        await fs.writeFile(sourcePath, 'Import me!');

        // Import as text file (not binary) so getFileAsString() works (Issue #12 fix)
        await handler.importFile(sourcePath, 'imported.txt', { binary: false });

        expect(handler.hasFile('imported.txt')).toBe(true);
        expect(handler.getFileAsString('imported.txt')).toBe('Import me!');
      });

      test('should import binary file', async () => {
        const sourcePath = path.join(testDir, 'image.png');
        const imageData = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        await fs.writeFile(sourcePath, imageData);

        await handler.importFile(sourcePath, 'word/media/image1.png', {
          binary: true,
        });

        expect(handler.hasFile('word/media/image1.png')).toBe(true);
        const retrieved = handler.getFileAsBuffer('word/media/image1.png');
        expect(retrieved).toEqual(imageData);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty file content', () => {
      handler.addFile('empty.txt', '');
      expect(handler.hasFile('empty.txt')).toBe(true);
      expect(handler.getFileAsString('empty.txt')).toBe('');
    });

    test('should handle large file content', () => {
      const largeContent = 'x'.repeat(1_000_000); // 1MB of 'x'
      handler.addFile('large.txt', largeContent);

      expect(handler.getFileAsString('large.txt')).toBe(largeContent);
    });

    test('should handle unicode content', () => {
      const unicodeContent = 'Hello 世界 🌍 مرحبا';
      handler.addFile('unicode.txt', unicodeContent);

      expect(handler.getFileAsString('unicode.txt')).toBe(unicodeContent);
    });

    test('should handle files with special characters in path', () => {
      handler.addFile('path/with spaces/file.txt', 'Content');
      expect(handler.hasFile('path/with spaces/file.txt')).toBe(true);
    });
  });

  describe('UTF-8 Encoding', () => {
    test('should preserve UTF-8 characters when adding string content', () => {
      const utf8Content = 'Hello UTF-8! 你好 مرحبا שלום 🎉';
      handler.addFile('utf8.txt', utf8Content);

      const retrieved = handler.getFileAsString('utf8.txt');
      expect(retrieved).toBe(utf8Content);
    });

    test('should convert string to UTF-8 Buffer internally', () => {
      const utf8Content = 'Test 日本語 content';
      handler.addFile('utf8-buffer.txt', utf8Content);

      const buffer = handler.getFileAsBuffer('utf8-buffer.txt');
      expect(buffer).toBeDefined();
      expect(buffer?.toString('utf8')).toBe(utf8Content);
    });

    test('should handle emoji and special characters', () => {
      const emojiContent = '😀😃😄😁😆😅🤣😂 🎉 ❤️ 🚀';
      handler.addFile('emoji.txt', emojiContent);

      expect(handler.getFileAsString('emoji.txt')).toBe(emojiContent);
    });

    test('should handle mixed scripts (Latin, Greek, Cyrillic, Arabic, CJK)', () => {
      const mixed =
        'Latin: Hello\nGreek: Γεια\nCyrillic: Привет\nArabic: مرحبا\nCJK: 你好日本語한글';
      handler.addFile('mixed-scripts.txt', mixed);

      expect(handler.getFileAsString('mixed-scripts.txt')).toBe(mixed);
    });

    test('should handle right-to-left text (Arabic, Hebrew)', () => {
      const rtlContent = 'مرحبا بك في UTF-8 וברוכים הבאים';
      handler.addFile('rtl.txt', rtlContent);

      expect(handler.getFileAsString('rtl.txt')).toBe(rtlContent);
    });

    test('should preserve UTF-8 in XML files', () => {
      const xmlContent =
        '<?xml version="1.0" encoding="UTF-8"?><root>Café ☕ 日本</root>';
      handler.addFile('test.xml', xmlContent);

      const retrieved = handler.getFileAsString('test.xml');
      expect(retrieved).toBe(xmlContent);
    });

    test('should round-trip UTF-8 content (add, retrieve, verify)', () => {
      const testCases = [
        'Simple ASCII text',
        'Accented: café, naïve, résumé',
        'Symbols: © ® ™ € ¥ £',
        'Mathematical: ± × ÷ ∞ ∑ √',
        'Arrows: → ← ↑ ↓ ↔ ⟷',
        'CJK: 漢字 ひらがな カタカナ 한글 中文',
      ];

      testCases.forEach((content, index) => {
        const filename = `round-trip-${index}.txt`;
        handler.addFile(filename, content);

        const retrieved = handler.getFileAsString(filename);
        expect(retrieved).toBe(content);
      });
    });

    test('should handle UTF-8 with line breaks and whitespace', () => {
      const multilineUtf8 = `Line 1: Hola
Line 2: 你好
Line 3: مرحبا
Line 4: שלום
Line 5: 🌍🌎🌏`;
      handler.addFile('multiline-utf8.txt', multilineUtf8);

      expect(handler.getFileAsString('multiline-utf8.txt')).toBe(multilineUtf8);
    });

    test('should handle Buffer containing valid UTF-8', () => {
      const utf8String = 'UTF-8 テキスト 📝';
      const utf8Buffer = Buffer.from(utf8String, 'utf8');
      handler.addFile('buffer-utf8.bin', utf8Buffer, { binary: true });

      const retrieved = handler.getFileAsBuffer('buffer-utf8.bin');
      expect(retrieved).toEqual(utf8Buffer);
      expect(retrieved?.toString('utf8')).toBe(utf8String);
    });

    test('should preserve UTF-8 when saving and loading from file', async () => {
      const utf8Content = 'Testing UTF-8: 🎯 Café ☕ 你好 مرحبا';
      handler.addFile('word/document.xml', utf8Content);
      handler.addFile(
        '[Content_Types].xml',
        '<?xml version="1.0" encoding="UTF-8"?><Types/>'
      );
      handler.addFile(
        '_rels/.rels',
        '<?xml version="1.0" encoding="UTF-8"?><Relationships/>'
      );

      const testFile = path.join(testDir, 'utf8-test.docx');
      await fs.mkdir(testDir, { recursive: true });

      try {
        // Save to file
        await handler.save(testFile);

        // Load from file
        const handler2 = new ZipHandler();
        await handler2.load(testFile, { validate: false });

        // Verify content
        const retrieved = handler2.getFileAsString('word/document.xml');
        expect(retrieved).toBe(utf8Content);
      } finally {
        await fs.rm(testDir, { recursive: true, force: true });
      }
    });

    test('should preserve complex UTF-8 sequences', () => {
      // Test various UTF-8 encoded characters and sequences
      const complexContent =
        'ASCII: abc123\n' +
        'Latin-1: à á â ã ä å\n' +
        'Greek: α β γ δ ε ζ η θ\n' +
        'Cyrillic: а б в г д е ё\n' +
        'Devanagari: अ आ इ ई उ ऊ\n' +
        'Arabic: ا ب ت ث ج ح\n' +
        'Hebrew: א ב ג ד ה ו\n' +
        'Thai: ก ข ค ง จ ฉ\n' +
        'Chinese: 一 二 三 四 五 六\n' +
        'Japanese: あ い う え お か\n' +
        'Korean: 가 나 다 라 마 바\n' +
        'Emoji: 👨‍👩‍👧‍👦 👍 🎓 💼 🏆';

      handler.addFile('complex-utf8.txt', complexContent);

      const retrieved = handler.getFileAsString('complex-utf8.txt');
      expect(retrieved).toBe(complexContent);
    });
  });
});
