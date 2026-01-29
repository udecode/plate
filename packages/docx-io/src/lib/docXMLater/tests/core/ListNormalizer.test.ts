/**
 * Tests for ListNormalizer
 * Specifically tests list restart behavior when parent levels appear
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Table } from '../../src/elements/Table';
import {
  normalizeListsInCell,
  normalizeOrphanListLevelsInCell,
  normalizeOrphanListLevelsInTable,
} from '../../src/core/ListNormalizer';
import { detectTypedPrefix } from '../../src/utils/list-detection';

describe('ListNormalizer', () => {
  describe('normalizeListsInCell - list restart behavior', () => {
    it('should restart sub-list numbering when a new parent level item appears', () => {
      // Create a document with NumberingManager
      const doc = Document.create();
      const numberingManager = doc.getNumberingManager();

      // Create a table with a cell containing a mixed-level list
      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs by removing from the end
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add list items with typed prefixes simulating:
      // 1. First item
      //    a. Sub-item 1a
      //    b. Sub-item 1b
      // 2. Second item
      //    a. Sub-item 2a (should restart at 'a', not continue from 'c')
      //    b. Sub-item 2b

      const para1 = Paragraph.create();
      para1.addText('1. First item');
      cell.addParagraph(para1);

      const para1a = Paragraph.create();
      para1a.addText('a. Sub-item 1a');
      cell.addParagraph(para1a);

      const para1b = Paragraph.create();
      para1b.addText('b. Sub-item 1b');
      cell.addParagraph(para1b);

      const para2 = Paragraph.create();
      para2.addText('2. Second item');
      cell.addParagraph(para2);

      const para2a = Paragraph.create();
      para2a.addText('c. Sub-item 2a'); // Intentionally 'c' to test restart
      cell.addParagraph(para2a);

      const para2b = Paragraph.create();
      para2b.addText('d. Sub-item 2b'); // Intentionally 'd' to test restart
      cell.addParagraph(para2b);

      // Run normalization with all required options
      const result = normalizeListsInCell(
        cell,
        {
          numberedStyleNumId: undefined as unknown as number,
          bulletStyleNumId: undefined as unknown as number,
          scope: 'cell',
          forceMajority: true,
          preserveIndentation: false,
        },
        numberingManager
      );

      // After normalization, get the paragraphs and check their numIds
      const normalizedParas = cell.getParagraphs();

      // Level 0 items (1., 2.) should share the same numId
      const para1Numbering = normalizedParas[0]!.getNumbering();
      const para2Numbering = normalizedParas[3]!.getNumbering();

      expect(para1Numbering).not.toBeNull();
      expect(para2Numbering).not.toBeNull();
      expect(para1Numbering!.numId).toBe(para2Numbering!.numId);

      // Level 1 items under "1." (a., b.) should share the same numId
      const para1aNumbering = normalizedParas[1]!.getNumbering();
      const para1bNumbering = normalizedParas[2]!.getNumbering();

      expect(para1aNumbering).not.toBeNull();
      expect(para1bNumbering).not.toBeNull();
      expect(para1aNumbering!.numId).toBe(para1bNumbering!.numId);

      // Level 1 items under "2." (c., d.) should have a DIFFERENT numId
      // from the level 1 items under "1." (to enable restart)
      const para2aNumbering = normalizedParas[4]!.getNumbering();
      const para2bNumbering = normalizedParas[5]!.getNumbering();

      expect(para2aNumbering).not.toBeNull();
      expect(para2bNumbering).not.toBeNull();
      expect(para2aNumbering!.numId).toBe(para2bNumbering!.numId);

      // The key assertion: sub-items under "2." should have different numId
      // than sub-items under "1." (this is what enables restart)
      expect(para2aNumbering!.numId).not.toBe(para1aNumbering!.numId);

      doc.dispose();
    });

    it('should keep same numId for consecutive items at same level', () => {
      const doc = Document.create();
      const numberingManager = doc.getNumberingManager();

      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs by removing from the end
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add consecutive level 0 items
      const para1 = Paragraph.create();
      para1.addText('1. First');
      cell.addParagraph(para1);

      const para2 = Paragraph.create();
      para2.addText('2. Second');
      cell.addParagraph(para2);

      const para3 = Paragraph.create();
      para3.addText('3. Third');
      cell.addParagraph(para3);

      // Run normalization
      normalizeListsInCell(
        cell,
        {
          numberedStyleNumId: undefined as unknown as number,
          bulletStyleNumId: undefined as unknown as number,
          scope: 'cell',
          forceMajority: true,
          preserveIndentation: false,
        },
        numberingManager
      );

      // All level 0 items should share the same numId
      const normalizedParas = cell.getParagraphs();
      const numId1 = normalizedParas[0]!.getNumbering()!.numId;
      const numId2 = normalizedParas[1]!.getNumbering()!.numId;
      const numId3 = normalizedParas[2]!.getNumbering()!.numId;

      expect(numId1).toBe(numId2);
      expect(numId2).toBe(numId3);

      doc.dispose();
    });

    it('should handle multiple level transitions correctly', () => {
      const doc = Document.create();
      const numberingManager = doc.getNumberingManager();

      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs by removing from the end
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Complex structure:
      // 1. Item
      //    a. Sub
      // 2. Item
      //    a. Sub (should restart)
      // 3. Item
      //    a. Sub (should restart again)

      const items = [
        '1. First',
        'a. Sub 1',
        '2. Second',
        'a. Sub 2',
        '3. Third',
        'a. Sub 3',
      ];

      for (const item of items) {
        const para = Paragraph.create();
        para.addText(item);
        cell.addParagraph(para);
      }

      normalizeListsInCell(
        cell,
        {
          numberedStyleNumId: undefined as unknown as number,
          bulletStyleNumId: undefined as unknown as number,
          scope: 'cell',
          forceMajority: true,
          preserveIndentation: false,
        },
        numberingManager
      );

      const normalizedParas = cell.getParagraphs();

      // Level 0 items should all have same numId
      const level0NumIds = [
        normalizedParas[0]!.getNumbering()!.numId,
        normalizedParas[2]!.getNumbering()!.numId,
        normalizedParas[4]!.getNumbering()!.numId,
      ];
      expect(level0NumIds[0]).toBe(level0NumIds[1]);
      expect(level0NumIds[1]).toBe(level0NumIds[2]);

      // Each level 1 item should have different numId (restart behavior)
      const level1NumIds = [
        normalizedParas[1]!.getNumbering()!.numId,
        normalizedParas[3]!.getNumbering()!.numId,
        normalizedParas[5]!.getNumbering()!.numId,
      ];

      // Each sub-list should have a different numId to enable restart
      expect(level1NumIds[0]).not.toBe(level1NumIds[1]);
      expect(level1NumIds[1]).not.toBe(level1NumIds[2]);

      doc.dispose();
    });

    it('should shift level 1 items to level 0 when no level 0 parent exists', () => {
      // This tests the fix for the issue where bullet items without a parent
      // were showing as "a., b." instead of "1., 2."
      const doc = Document.create();
      const numberingManager = doc.getNumberingManager();

      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add items that would normally be level 1 (letter format)
      // but have NO level 0 parent
      const para1 = Paragraph.create();
      para1.addText('a. First item');
      cell.addParagraph(para1);

      const para2 = Paragraph.create();
      para2.addText('b. Second item');
      cell.addParagraph(para2);

      // Run normalization
      normalizeListsInCell(
        cell,
        {
          numberedStyleNumId: undefined as unknown as number,
          bulletStyleNumId: undefined as unknown as number,
          scope: 'cell',
          forceMajority: true,
          preserveIndentation: false,
        },
        numberingManager
      );

      const normalizedParas = cell.getParagraphs();

      // Both items should be shifted to level 0 since there's no level 0 parent
      const para1Numbering = normalizedParas[0]!.getNumbering();
      const para2Numbering = normalizedParas[1]!.getNumbering();

      expect(para1Numbering).not.toBeNull();
      expect(para2Numbering).not.toBeNull();
      expect(para1Numbering!.level).toBe(0);
      expect(para2Numbering!.level).toBe(0);

      // They should also share the same numId
      expect(para1Numbering!.numId).toBe(para2Numbering!.numId);

      doc.dispose();
    });

    it('should shift multi-level lists without level 0 parent', () => {
      // Test case: a., b., ii. (levels 1 and 2) should become 1., 2., a. (levels 0 and 1)
      // Note: "ii." is used instead of "i." because "i" matches as lowerLetter first
      const doc = Document.create();
      const numberingManager = doc.getNumberingManager();

      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add mixed level items with no level 0
      // Level 1 items (lowerLetter)
      const para1 = Paragraph.create();
      para1.addText('a. First letter');
      cell.addParagraph(para1);

      // Level 2 item (lowerRoman - must use "ii." to avoid matching as lowerLetter)
      const para2 = Paragraph.create();
      para2.addText('ii. Roman sub-item');
      cell.addParagraph(para2);

      // Another level 1
      const para3 = Paragraph.create();
      para3.addText('b. Second letter');
      cell.addParagraph(para3);

      // Run normalization
      normalizeListsInCell(
        cell,
        {
          numberedStyleNumId: undefined as unknown as number,
          bulletStyleNumId: undefined as unknown as number,
          scope: 'cell',
          forceMajority: true,
          preserveIndentation: false,
        },
        numberingManager
      );

      const normalizedParas = cell.getParagraphs();

      // Level 1 (lowerLetter) should become level 0 (shifted by 1)
      // Level 2 (lowerRoman) should become level 1 (shifted by 1)
      const para1Numbering = normalizedParas[0]!.getNumbering();
      const para2Numbering = normalizedParas[1]!.getNumbering();
      const para3Numbering = normalizedParas[2]!.getNumbering();

      expect(para1Numbering!.level).toBe(0); // Was level 1, shifted to 0
      expect(para2Numbering!.level).toBe(1); // Was level 2, shifted to 1
      expect(para3Numbering!.level).toBe(0); // Was level 1, shifted to 0

      doc.dispose();
    });

    it('should handle multiple list groups separated by non-list text', () => {
      // This tests the real-world case where a cell has:
      // - "a., b." at the top (no parent -> should become level 0)
      // - Non-list text in the middle
      // - "1., 2., 3." at the bottom (already level 0 -> no change)
      const doc = Document.create();
      const numberingManager = doc.getNumberingManager();

      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // First list group - level 1 items with no level 0 parent
      const para1 = Paragraph.create();
      para1.addText('a. First item in group 1');
      cell.addParagraph(para1);

      const para2 = Paragraph.create();
      para2.addText('b. Second item in group 1');
      cell.addParagraph(para2);

      // Non-list separator
      const separator = Paragraph.create();
      separator.addText(
        'If no active coverage is located, proceed as follows:'
      );
      cell.addParagraph(separator);

      // Second list group - already level 0
      const para3 = Paragraph.create();
      para3.addText('1. First item in group 2');
      cell.addParagraph(para3);

      const para4 = Paragraph.create();
      para4.addText('2. Second item in group 2');
      cell.addParagraph(para4);

      // Run normalization
      normalizeListsInCell(
        cell,
        {
          numberedStyleNumId: undefined as unknown as number,
          bulletStyleNumId: undefined as unknown as number,
          scope: 'cell',
          forceMajority: true,
          preserveIndentation: false,
        },
        numberingManager
      );

      const normalizedParas = cell.getParagraphs();

      // First group: "a., b." should be shifted to level 0
      const group1Para1 = normalizedParas[0]!.getNumbering();
      const group1Para2 = normalizedParas[1]!.getNumbering();

      expect(group1Para1).not.toBeNull();
      expect(group1Para2).not.toBeNull();
      expect(group1Para1!.level).toBe(0); // Was level 1, shifted to 0
      expect(group1Para2!.level).toBe(0); // Was level 1, shifted to 0

      // Separator should have no numbering
      const separatorNumbering = normalizedParas[2]!.getNumbering();
      expect(separatorNumbering?.numId).toBeFalsy();

      // Second group: "1., 2." should stay at level 0 (no shift needed)
      const group2Para1 = normalizedParas[3]!.getNumbering();
      const group2Para2 = normalizedParas[4]!.getNumbering();

      expect(group2Para1).not.toBeNull();
      expect(group2Para2).not.toBeNull();
      expect(group2Para1!.level).toBe(0); // Already level 0, no change
      expect(group2Para2!.level).toBe(0); // Already level 0, no change

      doc.dispose();
    });
  });

  describe('normalizeOrphanListLevelsInCell', () => {
    it('should shift Level 1 bullets to Level 0 when no Level 0 exists', () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add paragraphs with Level 1 numbering (simulating orphan bullets)
      const para1 = Paragraph.create();
      para1.setNumbering(1, 1); // numId=1, level=1
      para1.addText('First bullet');
      cell.addParagraph(para1);

      const para2 = Paragraph.create();
      para2.setNumbering(1, 1); // numId=1, level=1
      para2.addText('Second bullet');
      cell.addParagraph(para2);

      // Verify initial state
      expect(cell.getParagraphs()[0]!.getNumbering()!.level).toBe(1);
      expect(cell.getParagraphs()[1]!.getNumbering()!.level).toBe(1);

      // Run normalization
      const count = normalizeOrphanListLevelsInCell(cell);

      // Should have normalized 2 paragraphs
      expect(count).toBe(2);

      // Both should now be at Level 0
      expect(cell.getParagraphs()[0]!.getNumbering()!.level).toBe(0);
      expect(cell.getParagraphs()[1]!.getNumbering()!.level).toBe(0);

      doc.dispose();
    });

    it('should not change Level 0 bullets', () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add paragraphs with Level 0 numbering
      const para1 = Paragraph.create();
      para1.setNumbering(1, 0); // numId=1, level=0
      para1.addText('First bullet');
      cell.addParagraph(para1);

      const para2 = Paragraph.create();
      para2.setNumbering(1, 0); // numId=1, level=0
      para2.addText('Second bullet');
      cell.addParagraph(para2);

      // Run normalization
      const count = normalizeOrphanListLevelsInCell(cell);

      // Should not have changed anything
      expect(count).toBe(0);

      // Both should still be at Level 0
      expect(cell.getParagraphs()[0]!.getNumbering()!.level).toBe(0);
      expect(cell.getParagraphs()[1]!.getNumbering()!.level).toBe(0);

      doc.dispose();
    });

    it('should shift mixed levels down by minimum level', () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add paragraphs with mixed levels (1 and 2), but no level 0
      const para1 = Paragraph.create();
      para1.setNumbering(1, 1); // Level 1
      para1.addText('Level 1 item');
      cell.addParagraph(para1);

      const para2 = Paragraph.create();
      para2.setNumbering(1, 2); // Level 2
      para2.addText('Level 2 item');
      cell.addParagraph(para2);

      const para3 = Paragraph.create();
      para3.setNumbering(1, 1); // Level 1
      para3.addText('Another Level 1 item');
      cell.addParagraph(para3);

      // Run normalization
      const count = normalizeOrphanListLevelsInCell(cell);

      // Should have normalized 3 paragraphs
      expect(count).toBe(3);

      // Levels should be shifted down by 1 (minimum was 1)
      expect(cell.getParagraphs()[0]!.getNumbering()!.level).toBe(0); // 1 -> 0
      expect(cell.getParagraphs()[1]!.getNumbering()!.level).toBe(1); // 2 -> 1
      expect(cell.getParagraphs()[2]!.getNumbering()!.level).toBe(0); // 1 -> 0

      doc.dispose();
    });

    it('should handle cells with no list items', () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add plain paragraphs (no numbering)
      const para1 = Paragraph.create();
      para1.addText('Plain text');
      cell.addParagraph(para1);

      // Run normalization
      const count = normalizeOrphanListLevelsInCell(cell);

      // Should not have changed anything
      expect(count).toBe(0);

      doc.dispose();
    });

    it('should handle cells with mix of list and non-list paragraphs', () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add a plain paragraph
      const plainPara = Paragraph.create();
      plainPara.addText('Header text');
      cell.addParagraph(plainPara);

      // Add Level 2 list items (orphans)
      const para1 = Paragraph.create();
      para1.setNumbering(1, 2); // Level 2
      para1.addText('Bullet item');
      cell.addParagraph(para1);

      const para2 = Paragraph.create();
      para2.setNumbering(1, 2); // Level 2
      para2.addText('Another bullet');
      cell.addParagraph(para2);

      // Run normalization
      const count = normalizeOrphanListLevelsInCell(cell);

      // Should have normalized 2 paragraphs
      expect(count).toBe(2);

      // Plain paragraph should be unchanged (no numbering)
      expect(cell.getParagraphs()[0]!.getNumbering()).toBeFalsy();

      // List items should be shifted from Level 2 to Level 0
      expect(cell.getParagraphs()[1]!.getNumbering()!.level).toBe(0);
      expect(cell.getParagraphs()[2]!.getNumbering()!.level).toBe(0);

      doc.dispose();
    });

    it('should handle Level 3+ orphan bullets', () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add Level 3 list items (deeply nested orphans)
      const para1 = Paragraph.create();
      para1.setNumbering(1, 3); // Level 3
      para1.addText('Deep item');
      cell.addParagraph(para1);

      // Run normalization
      const count = normalizeOrphanListLevelsInCell(cell);

      // Should have normalized 1 paragraph
      expect(count).toBe(1);

      // Should be shifted from Level 3 to Level 0
      expect(cell.getParagraphs()[0]!.getNumbering()!.level).toBe(0);

      doc.dispose();
    });
  });

  describe('normalizeOrphanListLevelsInTable', () => {
    it('should normalize orphan levels across all cells in a table', () => {
      const doc = Document.create();
      const table = new Table(2, 2); // 2x2 table
      doc.addTable(table);

      // Setup cell (0,0) - Level 1 orphans
      const cell00 = table.getCell(0, 0)!;
      while (cell00.getParagraphs().length > 0) {
        cell00.removeParagraph(0);
      }
      const para00 = Paragraph.create();
      para00.setNumbering(1, 1);
      para00.addText('Cell 0,0 bullet');
      cell00.addParagraph(para00);

      // Setup cell (0,1) - Level 0 (no change needed)
      const cell01 = table.getCell(0, 1)!;
      while (cell01.getParagraphs().length > 0) {
        cell01.removeParagraph(0);
      }
      const para01 = Paragraph.create();
      para01.setNumbering(2, 0);
      para01.addText('Cell 0,1 bullet');
      cell01.addParagraph(para01);

      // Setup cell (1,0) - Level 2 orphans
      const cell10 = table.getCell(1, 0)!;
      while (cell10.getParagraphs().length > 0) {
        cell10.removeParagraph(0);
      }
      const para10a = Paragraph.create();
      para10a.setNumbering(3, 2);
      para10a.addText('Cell 1,0 bullet 1');
      cell10.addParagraph(para10a);
      const para10b = Paragraph.create();
      para10b.setNumbering(3, 2);
      para10b.addText('Cell 1,0 bullet 2');
      cell10.addParagraph(para10b);

      // Setup cell (1,1) - no list items
      const cell11 = table.getCell(1, 1)!;
      while (cell11.getParagraphs().length > 0) {
        cell11.removeParagraph(0);
      }
      const para11 = Paragraph.create();
      para11.addText('Plain text in cell 1,1');
      cell11.addParagraph(para11);

      // Run table normalization
      const totalCount = normalizeOrphanListLevelsInTable(table);

      // Should have normalized: 1 (cell 0,0) + 0 (cell 0,1) + 2 (cell 1,0) + 0 (cell 1,1) = 3
      expect(totalCount).toBe(3);

      // Verify cell 0,0: Level 1 -> Level 0
      expect(cell00.getParagraphs()[0]!.getNumbering()!.level).toBe(0);

      // Verify cell 0,1: Level 0 unchanged
      expect(cell01.getParagraphs()[0]!.getNumbering()!.level).toBe(0);

      // Verify cell 1,0: Level 2 -> Level 0
      expect(cell10.getParagraphs()[0]!.getNumbering()!.level).toBe(0);
      expect(cell10.getParagraphs()[1]!.getNumbering()!.level).toBe(0);

      // Verify cell 1,1: No numbering
      expect(cell11.getParagraphs()[0]!.getNumbering()).toBeFalsy();

      doc.dispose();
    });

    it('should handle empty table', () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      doc.addTable(table);

      // Clear the only cell
      const cell = table.getCell(0, 0)!;
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Run table normalization on effectively empty table
      const totalCount = normalizeOrphanListLevelsInTable(table);

      expect(totalCount).toBe(0);

      doc.dispose();
    });

    it('should handle large table with many cells', () => {
      const doc = Document.create();
      const table = new Table(3, 4); // 3 rows x 4 columns = 12 cells
      doc.addTable(table);

      // Add Level 1 orphan to each cell
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const cell = table.getCell(row, col)!;
          while (cell.getParagraphs().length > 0) {
            cell.removeParagraph(0);
          }
          const para = Paragraph.create();
          para.setNumbering(1, 1); // Level 1 orphan
          para.addText(`Cell ${row},${col}`);
          cell.addParagraph(para);
        }
      }

      // Run table normalization
      const totalCount = normalizeOrphanListLevelsInTable(table);

      // Should have normalized 12 paragraphs (one per cell)
      expect(totalCount).toBe(12);

      // Verify all cells are now Level 0
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const cell = table.getCell(row, col)!;
          expect(cell.getParagraphs()[0]!.getNumbering()!.level).toBe(0);
        }
      }

      doc.dispose();
    });
  });

  describe('detectTypedPrefix - abbreviation handling', () => {
    it('should NOT detect "P. O. Box" as a list marker', () => {
      // "P. O. Box" is an abbreviation (Post Office Box), not a list marker
      const result = detectTypedPrefix('P. O. Box 52195');
      expect(result.prefix).toBeNull();
      expect(result.format).toBeNull();
      expect(result.category).toBe('none');
    });

    it('should NOT detect "U.S. Army" as a list marker', () => {
      // "U.S." is an abbreviation, not a list marker
      const result = detectTypedPrefix('U. S. Army');
      expect(result.prefix).toBeNull();
      expect(result.format).toBeNull();
      expect(result.category).toBe('none');
    });

    it('should detect "A. First item" as a list marker', () => {
      // "A." followed by non-abbreviated text IS a list marker
      const result = detectTypedPrefix('A. First item');
      expect(result.prefix).toBe('A. ');
      expect(result.format).toBe('upperLetter');
      expect(result.category).toBe('numbered');
    });

    it('should detect "a. lowercase item" as a list marker', () => {
      const result = detectTypedPrefix('a. lowercase item');
      expect(result.prefix).toBe('a. ');
      expect(result.format).toBe('lowerLetter');
      expect(result.category).toBe('numbered');
    });

    it('should detect "1. Numbered item" as a list marker', () => {
      // Numbered lists should still work
      const result = detectTypedPrefix('1. Numbered item');
      expect(result.prefix).toBe('1. ');
      expect(result.format).toBe('decimal');
      expect(result.category).toBe('numbered');
    });

    it('should NOT detect "P.O. Box" without spaces as a list marker', () => {
      // Without spaces, this won't match any pattern anyway
      const result = detectTypedPrefix('P.O. Box 123');
      expect(result.prefix).toBeNull();
    });

    it('should preserve P. O. Box text in cell normalization', () => {
      const doc = Document.create();
      const numberingManager = doc.getNumberingManager();

      const table = new Table(1, 1);
      doc.addTable(table);
      const cell = table.getCell(0, 0)!;

      // Clear default paragraphs
      while (cell.getParagraphs().length > 0) {
        cell.removeParagraph(0);
      }

      // Add "P. O. Box" text which should NOT be treated as a list
      const para = Paragraph.create();
      para.addText('P. O. Box 52195');
      cell.addParagraph(para);

      // Run normalization
      normalizeListsInCell(
        cell,
        {
          numberedStyleNumId: undefined as unknown as number,
          bulletStyleNumId: undefined as unknown as number,
          scope: 'cell',
          forceMajority: true,
          preserveIndentation: false,
        },
        numberingManager
      );

      // The paragraph should NOT be modified (no list marker stripped)
      const normalizedPara = cell.getParagraphs()[0]!;
      expect(normalizedPara.getText()).toBe('P. O. Box 52195');
      // Should have no numbering applied
      expect(normalizedPara.getNumbering()?.numId).toBeFalsy();

      doc.dispose();
    });
  });
});
