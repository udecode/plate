/**
 * Tests for InMemoryRevisionAcceptor
 *
 * Verifies that the in-memory DOM transformation approach correctly:
 * 1. Accepts insertions (unwraps content)
 * 2. Accepts deletions (removes content)
 * 3. Accepts move operations
 * 4. Accepts property changes
 * 5. Allows subsequent modifications to work correctly
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import { Revision } from '../../src/elements/Revision';
import { ImageRun } from '../../src/elements/ImageRun';
import { Image } from '../../src/elements/Image';
import {
  acceptRevisionsInMemory,
  paragraphHasRevisions,
  getRevisionsFromParagraph,
  countRevisionsByType,
  stripRevisionsFromXml,
} from '../../src/utils/InMemoryRevisionAcceptor';
import {
  isImageRunContent,
  isRunContent,
} from '../../src/elements/RevisionContent';

describe('InMemoryRevisionAcceptor', () => {
  describe('acceptRevisionsInMemory', () => {
    it('should accept insertion revisions by unwrapping content', () => {
      // Create document with insertion revision
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add a regular run
      para.addRun(new Run('Regular text. '));

      // Add an insertion revision with content
      const insertedRun = new Run('Inserted text.');
      const insertionRevision = Revision.createInsertion(
        'Test Author',
        insertedRun
      );
      para.addRevision(insertionRevision);

      // Verify revision exists before acceptance
      expect(paragraphHasRevisions(para)).toBe(true);
      expect(para.getRevisions().length).toBe(1);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify revision was accepted
      expect(result.insertionsAccepted).toBe(1);
      expect(result.totalAccepted).toBe(1);

      // Verify revision was removed and content was kept
      expect(paragraphHasRevisions(para)).toBe(false);
      expect(para.getRuns().length).toBe(2);
      expect(para.getText()).toBe('Regular text. Inserted text.');
    });

    it('should accept deletion revisions by removing content', () => {
      // Create document with deletion revision
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add a regular run
      para.addRun(new Run('Keep this. '));

      // Add a deletion revision (content should be removed)
      const deletedRun = new Run('Delete this.');
      const deletionRevision = Revision.createDeletion(
        'Test Author',
        deletedRun
      );
      para.addRevision(deletionRevision);

      // Add another regular run
      para.addRun(new Run(' And keep this.'));

      // Verify revision exists before acceptance
      expect(paragraphHasRevisions(para)).toBe(true);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify revision was accepted
      expect(result.deletionsAccepted).toBe(1);

      // Verify revision was removed and content was deleted
      expect(paragraphHasRevisions(para)).toBe(false);
      expect(para.getText()).toBe('Keep this.  And keep this.');
    });

    it('should accept moveFrom revisions by removing content', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add moveFrom revision (source location - should be removed)
      const movedRun = new Run('Moved text');
      const moveFromRevision = Revision.createMoveFrom(
        'Test Author',
        movedRun,
        'move-1'
      );
      para.addRevision(moveFromRevision);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify moveFrom was accepted (content removed)
      expect(result.movesAccepted).toBe(1);
      expect(paragraphHasRevisions(para)).toBe(false);
      expect(para.getText()).toBe('');
    });

    it('should accept moveTo revisions by keeping content', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add moveTo revision (destination location - keep content)
      const movedRun = new Run('Moved text');
      const moveToRevision = Revision.createMoveTo(
        'Test Author',
        movedRun,
        'move-1'
      );
      para.addRevision(moveToRevision);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify moveTo was accepted (content kept)
      expect(result.movesAccepted).toBe(1);
      expect(paragraphHasRevisions(para)).toBe(false);
      expect(para.getText()).toBe('Moved text');
    });

    it('should accept property change revisions', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add run with formatting change tracked
      const run = new Run('Formatted text');
      const propertyChangeRevision = Revision.createRunPropertiesChange(
        'Test Author',
        run,
        { b: true } // Previous: was bold
      );
      para.addRevision(propertyChangeRevision);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify property change was accepted
      expect(result.propertyChangesAccepted).toBe(1);
      expect(paragraphHasRevisions(para)).toBe(false);
      // Content should be preserved
      expect(para.getText()).toBe('Formatted text');
    });

    it('should handle multiple revisions in a single paragraph', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add insertion
      para.addRevision(
        Revision.createInsertion('Author1', new Run('Inserted. '))
      );

      // Add regular text
      para.addRun(new Run('Regular. '));

      // Add deletion
      para.addRevision(
        Revision.createDeletion('Author2', new Run('Deleted. '))
      );

      // Add another insertion
      para.addRevision(
        Revision.createInsertion('Author1', new Run('Also inserted.'))
      );

      // Accept all
      const result = acceptRevisionsInMemory(doc);

      expect(result.insertionsAccepted).toBe(2);
      expect(result.deletionsAccepted).toBe(1);
      expect(result.totalAccepted).toBe(3);

      // Final text should be: "Inserted. Regular. Also inserted."
      // (Deleted text is removed)
      expect(para.getText()).toBe('Inserted. Regular. Also inserted.');
    });

    it('should handle revisions across multiple paragraphs', () => {
      const doc = Document.create();

      // First paragraph with insertion
      const para1 = doc.createParagraph();
      para1.addRevision(
        Revision.createInsertion('Author', new Run('Para 1 inserted'))
      );

      // Second paragraph with deletion
      const para2 = doc.createParagraph();
      para2.addRevision(
        Revision.createDeletion('Author', new Run('Para 2 deleted'))
      );

      // Accept all
      const result = acceptRevisionsInMemory(doc);

      expect(result.insertionsAccepted).toBe(1);
      expect(result.deletionsAccepted).toBe(1);
      expect(result.totalAccepted).toBe(2);

      expect(para1.getText()).toBe('Para 1 inserted');
      expect(para2.getText()).toBe('');
    });
  });

  describe('subsequent modifications after acceptance', () => {
    it('should allow text modifications after accepting revisions', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add revision
      para.addRevision(
        Revision.createInsertion('Author', new Run('Initial text'))
      );

      // Accept revisions
      acceptRevisionsInMemory(doc);

      // Now modify the text
      const runs = para.getRuns();
      expect(runs.length).toBe(1);
      expect(runs[0]).toBeDefined();
      runs[0]!.setText('Modified text');

      // Verify modification worked
      expect(para.getText()).toBe('Modified text');
    });

    it('should allow formatting changes after accepting revisions', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add revision
      para.addRevision(
        Revision.createInsertion('Author', new Run('Text to format'))
      );

      // Accept revisions
      acceptRevisionsInMemory(doc);

      // Now apply formatting
      const runs = para.getRuns();
      expect(runs[0]).toBeDefined();
      runs[0]!.setBold(true);
      runs[0]!.setColor('FF0000');

      // Verify formatting was applied
      expect(runs[0]!.getFormatting().bold).toBe(true);
      expect(runs[0]!.getFormatting().color).toBe('FF0000');
    });

    it('should allow adding new content after accepting revisions', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add revision
      para.addRevision(Revision.createInsertion('Author', new Run('Original')));

      // Accept revisions
      acceptRevisionsInMemory(doc);

      // Add new content
      para.addRun(new Run(' plus new content'));

      // Verify new content was added
      expect(para.getText()).toBe('Original plus new content');
      expect(para.getRuns().length).toBe(2);
    });
  });

  describe('selective acceptance options', () => {
    it('should only accept insertions when other options are disabled', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      para.addRevision(Revision.createInsertion('Author', new Run('Insert')));
      para.addRevision(Revision.createDeletion('Author', new Run('Delete')));

      const result = acceptRevisionsInMemory(doc, {
        acceptInsertions: true,
        acceptDeletions: false,
      });

      expect(result.insertionsAccepted).toBe(1);
      expect(result.deletionsAccepted).toBe(0);

      // Insertion content should be present, deletion revision should remain
      const revisions = para.getRevisions();
      expect(revisions.length).toBe(1);
      expect(revisions[0]).toBeDefined();
      expect(revisions[0]!.getType()).toBe('delete');
    });

    it('should only accept deletions when other options are disabled', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      para.addRevision(Revision.createInsertion('Author', new Run('Insert')));
      para.addRevision(Revision.createDeletion('Author', new Run('Delete')));

      const result = acceptRevisionsInMemory(doc, {
        acceptInsertions: false,
        acceptDeletions: true,
      });

      expect(result.insertionsAccepted).toBe(0);
      expect(result.deletionsAccepted).toBe(1);

      // Deletion should be accepted (removed), insertion revision should remain
      const revisions = para.getRevisions();
      expect(revisions.length).toBe(1);
      expect(revisions[0]).toBeDefined();
      expect(revisions[0]!.getType()).toBe('insert');
    });
  });

  describe('helper functions', () => {
    describe('paragraphHasRevisions', () => {
      it('should return true when paragraph has revisions', () => {
        const para = new Paragraph();
        para.addRevision(Revision.createInsertion('Author', new Run('text')));
        expect(paragraphHasRevisions(para)).toBe(true);
      });

      it('should return false when paragraph has no revisions', () => {
        const para = new Paragraph();
        para.addRun(new Run('text'));
        expect(paragraphHasRevisions(para)).toBe(false);
      });
    });

    describe('getRevisionsFromParagraph', () => {
      it('should return all revisions from paragraph', () => {
        const para = new Paragraph();
        para.addRevision(Revision.createInsertion('A', new Run('1')));
        para.addRun(new Run('regular'));
        para.addRevision(Revision.createDeletion('B', new Run('2')));

        const revisions = getRevisionsFromParagraph(para);
        expect(revisions.length).toBe(2);
        expect(revisions[0]).toBeDefined();
        expect(revisions[1]).toBeDefined();
        expect(revisions[0]!.getType()).toBe('insert');
        expect(revisions[1]!.getType()).toBe('delete');
      });
    });

    describe('countRevisionsByType', () => {
      it('should count revisions by type across document', () => {
        const doc = Document.create();

        const para1 = doc.createParagraph();
        para1.addRevision(Revision.createInsertion('A', new Run('1')));
        para1.addRevision(Revision.createInsertion('A', new Run('2')));

        const para2 = doc.createParagraph();
        para2.addRevision(Revision.createDeletion('B', new Run('3')));

        const counts = countRevisionsByType(doc);
        expect(counts.get('insert')).toBe(2);
        expect(counts.get('delete')).toBe(1);
      });
    });
  });

  describe('ImageRun handling in revisions', () => {
    /**
     * Helper to create a test image buffer (1x1 PNG)
     */
    function createTestImageBuffer(): Buffer {
      // 1x1 transparent PNG
      return Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
        0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);
    }

    /**
     * Helper to create a mock Image for testing (async)
     */
    async function createMockImage(): Promise<Image> {
      return await Image.fromBuffer(
        createTestImageBuffer(),
        'png',
        914_400,
        914_400
      );
    }

    describe('type guard isImageRunContent', () => {
      it('should correctly identify ImageRun objects', async () => {
        const image = await createMockImage();
        const imageRun = new ImageRun(image);

        expect(isImageRunContent(imageRun)).toBe(true);
      });

      it('should return false for regular Run objects', () => {
        const run = new Run('text');

        expect(isImageRunContent(run)).toBe(false);
      });

      it('should return false for null/undefined', () => {
        expect(isImageRunContent(null as any)).toBe(false);
        expect(isImageRunContent(undefined as any)).toBe(false);
      });
    });

    describe('isRunContent with ImageRun', () => {
      it('should return true for ImageRun (since ImageRun extends Run)', async () => {
        const image = await createMockImage();
        const imageRun = new ImageRun(image);

        // ImageRun extends Run, so isRunContent should return true
        // This test ensures backward compatibility
        expect(isRunContent(imageRun)).toBe(true);
      });
    });

    describe('accepting insertions with ImageRun', () => {
      it('should preserve ImageRun when accepting insertion revision', async () => {
        const doc = Document.create();
        const para = doc.createParagraph();

        // Add regular text
        para.addRun(new Run('Before image. '));

        // Add insertion revision containing an ImageRun
        const image = await createMockImage();
        const imageRun = new ImageRun(image);
        const insertionRevision = Revision.createInsertion(
          'Test Author',
          imageRun
        );
        para.addRevision(insertionRevision);

        // Add more text
        para.addRun(new Run(' After image.'));

        // Verify revision exists before acceptance
        expect(paragraphHasRevisions(para)).toBe(true);

        // Accept revisions
        const result = acceptRevisionsInMemory(doc);

        // Verify insertion was accepted
        expect(result.insertionsAccepted).toBe(1);

        // Verify ImageRun was preserved (unwrapped from revision)
        expect(paragraphHasRevisions(para)).toBe(false);
        const content = para.getContent();

        // Should have: Run, ImageRun, Run
        expect(content.length).toBe(3);

        // Verify the middle item is the ImageRun
        const middleItem = content[1]!;
        expect(isImageRunContent(middleItem as any)).toBe(true);
        expect((middleItem as ImageRun).getImageElement()).toBeDefined();
      });

      it('should preserve mixed content (text + images) in insertion revision', async () => {
        const doc = Document.create();
        const para = doc.createParagraph();

        // Create mixed content: text run + image run
        const textRun = new Run('Inserted text. ');
        const image = await createMockImage();
        const imageRun = new ImageRun(image);

        // Add insertion revision with both text and image
        const insertionRevision = new Revision({
          type: 'insert',
          author: 'Test Author',
          content: [textRun, imageRun],
        });
        para.addRevision(insertionRevision);

        // Accept revisions
        const result = acceptRevisionsInMemory(doc);

        // Verify both items were preserved
        expect(result.insertionsAccepted).toBe(1);
        const content = para.getContent();
        expect(content.length).toBe(2);

        // First item should be text run
        expect(isRunContent(content[0]! as any)).toBe(true);
        expect((content[0] as Run).getText()).toBe('Inserted text. ');

        // Second item should be ImageRun
        expect(isImageRunContent(content[1]! as any)).toBe(true);
      });
    });

    describe('accepting deletions with ImageRun', () => {
      it('should remove ImageRun when accepting deletion revision', async () => {
        const doc = Document.create();
        const para = doc.createParagraph();

        // Add regular text
        para.addRun(new Run('Keep this. '));

        // Add deletion revision containing an ImageRun
        const image = await createMockImage();
        const imageRun = new ImageRun(image);
        const deletionRevision = Revision.createDeletion(
          'Test Author',
          imageRun
        );
        para.addRevision(deletionRevision);

        // Add more text
        para.addRun(new Run(' And this.'));

        // Accept revisions
        const result = acceptRevisionsInMemory(doc);

        // Verify deletion was accepted
        expect(result.deletionsAccepted).toBe(1);

        // Verify ImageRun was removed
        const content = para.getContent();
        expect(content.length).toBe(2); // Only the two text runs remain
        expect(content.every((item) => !isImageRunContent(item as any))).toBe(
          true
        );
      });
    });

    describe('accepting moveTo with ImageRun', () => {
      it('should preserve ImageRun when accepting moveTo revision', async () => {
        const doc = Document.create();
        const para = doc.createParagraph();

        // Add moveTo revision with ImageRun
        const image = await createMockImage();
        const imageRun = new ImageRun(image);
        const moveToRevision = Revision.createMoveTo(
          'Test Author',
          imageRun,
          'move-1'
        );
        para.addRevision(moveToRevision);

        // Accept revisions
        const result = acceptRevisionsInMemory(doc);

        // Verify move was accepted
        expect(result.movesAccepted).toBe(1);

        // Verify ImageRun was preserved
        const content = para.getContent();
        expect(content.length).toBe(1);
        expect(isImageRunContent(content[0]! as any)).toBe(true);
      });
    });

    describe('accepting moveFrom with ImageRun', () => {
      it('should remove ImageRun when accepting moveFrom revision', async () => {
        const doc = Document.create();
        const para = doc.createParagraph();

        // Add moveFrom revision with ImageRun (source location - should be removed)
        const image = await createMockImage();
        const imageRun = new ImageRun(image);
        const moveFromRevision = Revision.createMoveFrom(
          'Test Author',
          imageRun,
          'move-1'
        );
        para.addRevision(moveFromRevision);

        // Accept revisions
        const result = acceptRevisionsInMemory(doc);

        // Verify move was accepted (content removed)
        expect(result.movesAccepted).toBe(1);
        const content = para.getContent();
        expect(content.length).toBe(0);
      });
    });
  });

  describe('stripRevisionsFromXml', () => {
    it('should unwrap insertion tags keeping content', () => {
      const xml =
        '<w:tbl><w:tr><w:tc><w:p><w:ins w:author="Test"><w:r><w:t>Inserted</w:t></w:r></w:ins></w:p></w:tc></w:tr></w:tbl>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:ins');
      expect(result).not.toContain('</w:ins>');
      expect(result).toContain('<w:r><w:t>Inserted</w:t></w:r>');
    });

    it('should remove deletion tags including content', () => {
      const xml =
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Keep</w:t></w:r><w:del w:author="Test"><w:r><w:t>Delete</w:t></w:r></w:del></w:p></w:tc></w:tr></w:tbl>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:del');
      expect(result).not.toContain('Delete');
      expect(result).toContain('Keep');
    });

    it('should remove moveFrom tags including content', () => {
      const xml =
        '<w:p><w:moveFrom w:author="Test" w:id="0"><w:r><w:t>Moved</w:t></w:r></w:moveFrom></w:p>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:moveFrom');
      expect(result).not.toContain('Moved');
    });

    it('should unwrap moveTo tags keeping content', () => {
      const xml =
        '<w:p><w:moveTo w:author="Test" w:id="0"><w:r><w:t>Moved</w:t></w:r></w:moveTo></w:p>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:moveTo');
      expect(result).not.toContain('</w:moveTo>');
      expect(result).toContain('<w:r><w:t>Moved</w:t></w:r>');
    });

    it('should remove property change elements', () => {
      const xml =
        '<w:p><w:pPr><w:pPrChange w:author="Test"><w:pPr><w:jc w:val="left"/></w:pPr></w:pPrChange></w:pPr></w:p>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:pPrChange');
      expect(result).not.toContain('</w:pPrChange>');
    });

    it('should remove run property change elements', () => {
      const xml =
        '<w:r><w:rPr><w:b/><w:rPrChange w:author="Test"><w:rPr></w:rPr></w:rPrChange></w:rPr><w:t>Text</w:t></w:r>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:rPrChange');
      expect(result).toContain('<w:b/>');
      expect(result).toContain('Text');
    });

    it('should remove range markers', () => {
      const xml =
        '<w:p><w:moveFromRangeStart w:id="0"/><w:r><w:t>Text</w:t></w:r><w:moveFromRangeEnd w:id="0"/></w:p>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('moveFromRangeStart');
      expect(result).not.toContain('moveFromRangeEnd');
      expect(result).toContain('Text');
    });

    it('should handle nested revisions', () => {
      const xml =
        '<w:p><w:ins><w:del><w:r><w:t>Nested</w:t></w:r></w:del></w:ins></w:p>';
      const result = stripRevisionsFromXml(xml);

      // Deletion inside insertion - both should be processed
      // Del removes content, ins unwraps - net result: content removed
      expect(result).not.toContain('<w:ins');
      expect(result).not.toContain('<w:del');
    });

    it('should handle XML with no revisions', () => {
      const xml =
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>No revisions</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';
      const result = stripRevisionsFromXml(xml);

      expect(result).toBe(xml);
    });

    it('should handle table property changes', () => {
      const xml =
        '<w:tbl><w:tblPr><w:tblPrChange w:author="Test"><w:tblPr/></w:tblPrChange></w:tblPr></w:tbl>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:tblPrChange');
    });

    it('should handle cell property changes', () => {
      const xml =
        '<w:tc><w:tcPr><w:tcPrChange w:author="Test"><w:tcPr/></w:tcPrChange></w:tcPr></w:tc>';
      const result = stripRevisionsFromXml(xml);

      expect(result).not.toContain('<w:tcPrChange');
    });
  });

  describe('empty table cleanup', () => {
    it('should remove tables with no text content after revision acceptance', () => {
      const doc = Document.create();

      // Create a paragraph with content
      const para1 = doc.createParagraph();
      para1.addRun(new Run('Regular content before table'));

      // Create a table with only deletion revisions (all content deleted)
      const table = doc.createTable(2, 2);
      const rows = table.getRows();
      const cell = rows[0]?.getCells()[0];
      if (cell) {
        const cellParagraphs = cell.getParagraphs();
        if (cellParagraphs[0]) {
          // Add deletion revision (content will be removed on acceptance)
          cellParagraphs[0].addRevision(
            Revision.createDeletion('Author', new Run('Deleted content'))
          );
        }
      }

      // Create another paragraph after the table
      const para2 = doc.createParagraph();
      para2.addRun(new Run('Regular content after table'));

      // Verify we have 1 table before acceptance
      expect(doc.getTables().length).toBe(1);

      // Accept revisions with cleanup enabled
      const result = acceptRevisionsInMemory(doc, { cleanupEmptyTables: true });

      // Verify table was removed (it's now empty)
      expect(result.emptyTablesRemoved).toBe(1);
      expect(doc.getTables().length).toBe(0);

      // Verify paragraphs still exist
      const paragraphs = doc.getParagraphs();
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0]?.getText()).toBe('Regular content before table');
      expect(paragraphs[1]?.getText()).toBe('Regular content after table');
    });

    it('should preserve tables with text content', () => {
      const doc = Document.create();

      // Create a table with actual content
      const table = doc.createTable(2, 2);
      const rows = table.getRows();
      const cell = rows[0]?.getCells()[0];
      if (cell) {
        // Use createParagraph with text - this is the proper way to add content
        cell.createParagraph('Cell content');
      }

      // Verify content was added
      const cellText = table
        .getRows()[0]
        ?.getCells()[0]
        ?.getParagraphs()[0]
        ?.getText();
      expect(cellText).toBe('Cell content');

      // Accept revisions with cleanup enabled
      const result = acceptRevisionsInMemory(doc, { cleanupEmptyTables: true });

      // Table should NOT be removed (it has content)
      expect(result.emptyTablesRemoved).toBe(0);
      expect(doc.getTables().length).toBe(1);
    });

    it('should not remove empty tables when cleanup is disabled', () => {
      const doc = Document.create();

      // Create an empty table
      const table = doc.createTable(1, 1);

      // Accept revisions with cleanup DISABLED
      const result = acceptRevisionsInMemory(doc, {
        cleanupEmptyTables: false,
      });

      // Table should NOT be removed (cleanup disabled)
      expect(result.emptyTablesRemoved).toBe(0);
      expect(doc.getTables().length).toBe(1);
    });

    it('should handle multiple empty tables', () => {
      const doc = Document.create();

      // Create two empty tables with deletion revisions
      for (let i = 0; i < 2; i++) {
        doc.createParagraph().addRun(new Run(`Before table ${i + 1}`));
        const table = doc.createTable(1, 1);
        const cell = table.getRows()[0]?.getCells()[0];
        if (cell) {
          const cellParagraphs = cell.getParagraphs();
          if (cellParagraphs[0]) {
            cellParagraphs[0].addRevision(
              Revision.createDeletion('Author', new Run('Deleted'))
            );
          }
        }
      }

      // Verify we have 2 tables before acceptance
      expect(doc.getTables().length).toBe(2);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Both empty tables should be removed
      expect(result.emptyTablesRemoved).toBe(2);
      expect(doc.getTables().length).toBe(0);
    });

    it('should handle mix of empty and non-empty tables', () => {
      const doc = Document.create();

      // Create table with content - use createParagraph with text
      const table1 = doc.createTable(1, 1);
      const cell1 = table1.getRows()[0]?.getCells()[0];
      if (cell1) {
        cell1.createParagraph('Has content');
      }

      // Create empty table (only deletion revision in an empty paragraph)
      const table2 = doc.createTable(1, 1);
      const cell2 = table2.getRows()[0]?.getCells()[0];
      if (cell2) {
        const para = cell2.createParagraph();
        para.addRevision(
          Revision.createDeletion('Author', new Run('Will be deleted'))
        );
      }

      // Create another table with content - use createParagraph with text
      const table3 = doc.createTable(1, 1);
      const cell3 = table3.getRows()[0]?.getCells()[0];
      if (cell3) {
        cell3.createParagraph('Also has content');
      }

      // Verify 3 tables before
      expect(doc.getTables().length).toBe(3);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Only one empty table should be removed
      expect(result.emptyTablesRemoved).toBe(1);
      expect(doc.getTables().length).toBe(2);
    });

    it('should include emptyTablesRemoved in result even when zero', () => {
      const doc = Document.create();
      const para = doc.createParagraph();
      para.addRevision(Revision.createInsertion('Author', new Run('Text')));

      const result = acceptRevisionsInMemory(doc);

      // emptyTablesRemoved should be 0, not undefined
      expect(result.emptyTablesRemoved).toBe(0);
    });
  });

  describe('Hyperlink handling in revisions', () => {
    it('should preserve hyperlinks when accepting insertion revisions', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Create a hyperlink with proper properties object
      const { Hyperlink } = require('../../src/elements/Hyperlink');
      const hyperlink = new Hyperlink({
        url: 'https://example.com',
        text: 'Example Link',
      });

      // Add insertion revision containing a hyperlink
      const insertionRevision = Revision.createInsertion(
        'Test Author',
        hyperlink
      );
      para.addRevision(insertionRevision);

      // Verify revision exists before acceptance
      expect(paragraphHasRevisions(para)).toBe(true);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify insertion was accepted
      expect(result.insertionsAccepted).toBe(1);

      // Verify hyperlink was preserved (unwrapped from revision)
      expect(paragraphHasRevisions(para)).toBe(false);
      const content = para.getContent();

      // Should have the hyperlink
      expect(content.length).toBe(1);

      // Verify the item is a hyperlink (has getUrl method)
      const item = content[0]!;
      expect(typeof (item as any).getUrl).toBe('function');
      expect((item as any).getUrl()).toBe('https://example.com');
      expect((item as any).getText()).toBe('Example Link');
    });

    it('should remove hyperlinks when accepting deletion revisions', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add regular text
      para.addRun(new Run('Keep this. '));

      // Create a hyperlink for deletion with proper properties object
      const { Hyperlink } = require('../../src/elements/Hyperlink');
      const hyperlink = new Hyperlink({
        url: 'https://delete-me.com',
        text: 'Delete Link',
      });

      // Add deletion revision containing the hyperlink
      const deletionRevision = Revision.createDeletion(
        'Test Author',
        hyperlink
      );
      para.addRevision(deletionRevision);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify deletion was accepted
      expect(result.deletionsAccepted).toBe(1);

      // Verify hyperlink was removed
      expect(para.getText()).toBe('Keep this. ');
    });

    it('should preserve mixed content (runs and hyperlinks) in insertion revision', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Create mixed content with proper properties object
      const run1 = new Run('Before link. ');
      const { Hyperlink } = require('../../src/elements/Hyperlink');
      const hyperlink = new Hyperlink({
        url: 'https://example.com',
        text: 'Link',
      });
      const run2 = new Run(' After link.');

      // Add insertion revision with mixed content
      const insertionRevision = new Revision({
        type: 'insert',
        author: 'Test Author',
        content: [run1, hyperlink, run2],
      });
      para.addRevision(insertionRevision);

      // Accept revisions
      const result = acceptRevisionsInMemory(doc);

      // Verify all items were preserved
      expect(result.insertionsAccepted).toBe(1);
      const content = para.getContent();
      expect(content.length).toBe(3);

      // First item should be run
      expect((content[0] as Run).getText()).toBe('Before link. ');

      // Second item should be hyperlink
      expect(typeof (content[1] as any).getUrl).toBe('function');

      // Third item should be run
      expect((content[2] as Run).getText()).toBe(' After link.');
    });
  });
});
