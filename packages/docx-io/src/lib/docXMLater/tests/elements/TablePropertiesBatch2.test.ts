/**
 * Tests for Table Properties Batch 2 (Phase 4.3)
 *
 * Tests 8 cell-level properties:
 * 1. textDirection - Text flow direction in cell
 * 2. fitText - Fit text to cell width
 * 3. noWrap - Prevent text wrapping
 * 4. hideMark - Hide cell end mark
 * 5. cnfStyle - Conditional formatting style
 * 6. tcW type - Cell width with type (auto/dxa/pct)
 * 7. vMerge - Vertical cell merge
 * 8. gridSpan - Already exists as columnSpan (verification tests)
 */

import { describe, test, expect } from '@jest/globals';
import { Table } from '../../src/elements/Table';
import { Document } from '../../src/core/Document';
import * as path from 'path';

describe('Table Properties Batch 2 - Cell-Level Properties', () => {
  describe('Text Direction (textDirection)', () => {
    test('should set and serialize tbRl (top-to-bottom, right-to-left)', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setTextDirection('tbRl');
      cell.createParagraph('縦書き');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-textdir-tbrl.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().textDirection).toBe('tbRl');
    });

    test('should set and serialize lrTb (left-to-right, top-to-bottom)', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setTextDirection('lrTb');
      cell.createParagraph('Normal text');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-textdir-lrtb.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().textDirection).toBe('lrTb');
    });

    test('should preserve textDirection through round-trip', async () => {
      const table = new Table(1, 3);
      table
        .getRow(0)!
        .getCell(0)!
        .setTextDirection('tbRl')
        .createParagraph('Col 1');
      table
        .getRow(0)!
        .getCell(1)!
        .setTextDirection('lrTb')
        .createParagraph('Col 2');
      table
        .getRow(0)!
        .getCell(2)!
        .setTextDirection('btLr')
        .createParagraph('Col 3');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-textdir-roundtrip.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().textDirection).toBe(
        'tbRl'
      );
      expect(table2!.getRow(0)!.getCell(1)!.getFormatting().textDirection).toBe(
        'lrTb'
      );
      expect(table2!.getRow(0)!.getCell(2)!.getFormatting().textDirection).toBe(
        'btLr'
      );
    });
  });

  describe('Fit Text (tcFitText)', () => {
    test('should set and serialize fitText property', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setFitText(true);
      cell.setWidth(1440); // 1 inch
      cell.createParagraph('This text should fit to 1 inch width');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-fittext.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().fitText).toBe(true);
    });

    test('should preserve fitText through round-trip', async () => {
      const table = new Table(1, 2);
      table.getRow(0)!.getCell(0)!.setFitText(true).createParagraph('Fitted');
      table.getRow(0)!.getCell(1)!.createParagraph('Normal');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-fittext-roundtrip.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().fitText).toBe(true);
      expect(
        table2!.getRow(0)!.getCell(1)!.getFormatting().fitText
      ).toBeUndefined();
    });
  });

  describe('No Wrap (noWrap)', () => {
    test('should set and serialize noWrap property', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setNoWrap(true);
      cell.createParagraph('This long text should not wrap to multiple lines');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-nowrap.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().noWrap).toBe(true);
    });

    test('should preserve noWrap through round-trip', async () => {
      const table = new Table(1, 2);
      table
        .getRow(0)!
        .getCell(0)!
        .setNoWrap(true)
        .createParagraph('No wrap cell');
      table.getRow(0)!.getCell(1)!.createParagraph('Normal cell');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-nowrap-roundtrip.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().noWrap).toBe(true);
      expect(
        table2!.getRow(0)!.getCell(1)!.getFormatting().noWrap
      ).toBeUndefined();
    });
  });

  describe('Hide Mark (hideMark)', () => {
    test('should set and serialize hideMark property', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setHideMark(true);
      cell.createParagraph('Cell with hidden end mark');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-hidemark.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().hideMark).toBe(true);
    });

    test('should preserve hideMark through round-trip', async () => {
      const table = new Table(1, 2);
      table
        .getRow(0)!
        .getCell(0)!
        .setHideMark(true)
        .createParagraph('Hidden mark');
      table.getRow(0)!.getCell(1)!.createParagraph('Normal mark');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-hidemark-roundtrip.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().hideMark).toBe(
        true
      );
      expect(
        table2!.getRow(0)!.getCell(1)!.getFormatting().hideMark
      ).toBeUndefined();
    });
  });

  describe('Conditional Style (cnfStyle)', () => {
    test('should set and serialize cnfStyle property', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle('100000000000'); // First row formatting
      cell.createParagraph('Header cell');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-cnfstyle.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().cnfStyle).toBe('100000000000');
    });

    test('should preserve cnfStyle through round-trip', async () => {
      const table = new Table(2, 2);
      table
        .getRow(0)!
        .getCell(0)!
        .setConditionalStyle('100000000000')
        .createParagraph('First row');
      table
        .getRow(1)!
        .getCell(0)!
        .setConditionalStyle('010000000000')
        .createParagraph('Last row');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-cnfstyle-roundtrip.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().cnfStyle).toBe(
        '100000000000'
      );
      expect(table2!.getRow(1)!.getCell(0)!.getFormatting().cnfStyle).toBe(
        '010000000000'
      );
    });
  });

  describe('Width Type (tcW type)', () => {
    test('should set and serialize auto width type', async () => {
      const table = new Table(2, 3);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setWidthType(0, 'auto');
      cell.createParagraph('Auto width');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-width-auto.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().widthType).toBe('auto');
    });

    test('should set and serialize percentage width type', async () => {
      const table = new Table(2, 3);
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setWidthType(2500, 'pct'); // 50% (2500/50)
      cell.createParagraph('50% width');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-width-pct.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().width).toBe(2500);
      expect(cell2.getFormatting().widthType).toBe('pct');
    });

    test('should preserve width types through round-trip', async () => {
      const table = new Table(1, 3);
      table
        .getRow(0)!
        .getCell(0)!
        .setWidthType(0, 'auto')
        .createParagraph('Auto');
      table
        .getRow(0)!
        .getCell(1)!
        .setWidthType(2880, 'dxa')
        .createParagraph('2 inches');
      table
        .getRow(0)!
        .getCell(2)!
        .setWidthType(2500, 'pct')
        .createParagraph('50%');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-width-types-roundtrip.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().widthType).toBe(
        'auto'
      );
      expect(table2!.getRow(0)!.getCell(1)!.getFormatting().widthType).toBe(
        'dxa'
      );
      expect(table2!.getRow(0)!.getCell(1)!.getFormatting().width).toBe(2880);
      expect(table2!.getRow(0)!.getCell(2)!.getFormatting().widthType).toBe(
        'pct'
      );
      expect(table2!.getRow(0)!.getCell(2)!.getFormatting().width).toBe(2500);
    });
  });

  describe('Vertical Merge (vMerge)', () => {
    test('should set and serialize restart vMerge', async () => {
      const table = new Table(3, 2);

      // First cell starts the merge
      table
        .getRow(0)!
        .getCell(0)!
        .setVerticalMerge('restart')
        .createParagraph('Merged cell (start)');
      // Second cell continues the merge
      table.getRow(1)!.getCell(0)!.setVerticalMerge('continue');
      // Third cell continues the merge
      table.getRow(2)!.getCell(0)!.setVerticalMerge('continue');

      // Normal cells in column 2
      table.getRow(0)!.getCell(1)!.createParagraph('Row 1');
      table.getRow(1)!.getCell(1)!.createParagraph('Row 2');
      table.getRow(2)!.getCell(1)!.createParagraph('Row 3');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-vmerge-restart.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().vMerge).toBe(
        'restart'
      );
    });

    test('should set and serialize continue vMerge', async () => {
      const table = new Table(2, 2);
      table
        .getRow(0)!
        .getCell(0)!
        .setVerticalMerge('restart')
        .createParagraph('Start');
      table.getRow(1)!.getCell(0)!.setVerticalMerge('continue');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-vmerge-continue.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      expect(table2!.getRow(1)!.getCell(0)!.getFormatting().vMerge).toBe(
        'continue'
      );
    });

    test('should handle multi-row vertical merge scenario', async () => {
      const table = new Table(4, 3);

      // Column 1: Merge rows 0-2
      table
        .getRow(0)!
        .getCell(0)!
        .setVerticalMerge('restart')
        .createParagraph('Rows 1-3');
      table.getRow(1)!.getCell(0)!.setVerticalMerge('continue');
      table.getRow(2)!.getCell(0)!.setVerticalMerge('continue');
      table.getRow(3)!.getCell(0)!.createParagraph('Row 4');

      // Column 2: Merge rows 1-3
      table.getRow(0)!.getCell(1)!.createParagraph('Row 1');
      table
        .getRow(1)!
        .getCell(1)!
        .setVerticalMerge('restart')
        .createParagraph('Rows 2-4');
      table.getRow(2)!.getCell(1)!.setVerticalMerge('continue');
      table.getRow(3)!.getCell(1)!.setVerticalMerge('continue');

      // Column 3: No merges
      table.getRow(0)!.getCell(2)!.createParagraph('Cell 1');
      table.getRow(1)!.getCell(2)!.createParagraph('Cell 2');
      table.getRow(2)!.getCell(2)!.createParagraph('Cell 3');
      table.getRow(3)!.getCell(2)!.createParagraph('Cell 4');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-vmerge-multirow.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];

      // Verify column 1 merges
      expect(table2!.getRow(0)!.getCell(0)!.getFormatting().vMerge).toBe(
        'restart'
      );
      expect(table2!.getRow(1)!.getCell(0)!.getFormatting().vMerge).toBe(
        'continue'
      );
      expect(table2!.getRow(2)!.getCell(0)!.getFormatting().vMerge).toBe(
        'continue'
      );
      expect(
        table2!.getRow(3)!.getCell(0)!.getFormatting().vMerge
      ).toBeUndefined();

      // Verify column 2 merges
      expect(
        table2!.getRow(0)!.getCell(1)!.getFormatting().vMerge
      ).toBeUndefined();
      expect(table2!.getRow(1)!.getCell(1)!.getFormatting().vMerge).toBe(
        'restart'
      );
      expect(table2!.getRow(2)!.getCell(1)!.getFormatting().vMerge).toBe(
        'continue'
      );
      expect(table2!.getRow(3)!.getCell(1)!.getFormatting().vMerge).toBe(
        'continue'
      );
    });
  });

  describe('Combined Properties', () => {
    test('should handle multiple cell properties together', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;

      cell.setTextDirection('tbRl');
      cell.setFitText(true);
      cell.setNoWrap(true);
      cell.setHideMark(true);
      cell.setConditionalStyle('100000000000');
      cell.setWidthType(2880, 'dxa');
      cell.createParagraph('All properties');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-cell-batch2-combined.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const cell2 = table2!.getRow(0)!.getCell(0)!;

      expect(cell2.getFormatting().textDirection).toBe('tbRl');
      expect(cell2.getFormatting().fitText).toBe(true);
      expect(cell2.getFormatting().noWrap).toBe(true);
      expect(cell2.getFormatting().hideMark).toBe(true);
      expect(cell2.getFormatting().cnfStyle).toBe('100000000000');
      expect(cell2.getFormatting().width).toBe(2880);
      expect(cell2.getFormatting().widthType).toBe('dxa');
    });

    test('should preserve all properties through multi-cycle round-trip', async () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;

      cell.setTextDirection('tbRl');
      cell.setFitText(true);
      cell.setNoWrap(true);
      cell.setConditionalStyle('100000000000');
      cell.setVerticalMerge('restart');
      cell.createParagraph('Test');

      const doc = Document.create();
      doc.addTable(table);

      // Cycle 1
      const path1 = path.join(
        __dirname,
        '../output/test-cell-batch2-cycle1.docx'
      );
      await doc.save(path1);
      const doc2 = await Document.load(path1);

      // Cycle 2
      const path2 = path.join(
        __dirname,
        '../output/test-cell-batch2-cycle2.docx'
      );
      await doc2.save(path2);
      const doc3 = await Document.load(path2);

      const finalCell = doc3.getTables()[0]!.getRow(0)!.getCell(0)!;
      expect(finalCell.getFormatting().textDirection).toBe('tbRl');
      expect(finalCell.getFormatting().fitText).toBe(true);
      expect(finalCell.getFormatting().noWrap).toBe(true);
      expect(finalCell.getFormatting().cnfStyle).toBe('100000000000');
      expect(finalCell.getFormatting().vMerge).toBe('restart');
    });
  });
});
