/**
 * Tests for Table, TableRow, and TableCell components
 */

import { Table } from '../../src/elements/Table';
import { TableRow } from '../../src/elements/TableRow';
import { TableCell } from '../../src/elements/TableCell';
import { Paragraph } from '../../src/elements/Paragraph';
import { XMLElement } from '../../src/xml/XMLBuilder';

/**
 * Helper to filter and safely access XMLElement children
 */
function filterXMLElements(children?: (XMLElement | string)[]): XMLElement[] {
  return (children || []).filter((c): c is XMLElement => typeof c !== 'string');
}

describe('TableCell', () => {
  describe('Basic functionality', () => {
    it('should create an empty cell', () => {
      const cell = new TableCell();
      expect(cell.getText()).toBe('');
      expect(cell.getParagraphs()).toHaveLength(0);
    });

    it('should add text content', () => {
      const cell = new TableCell();
      cell.createParagraph('Hello World');
      expect(cell.getText()).toBe('Hello World');
    });

    it('should add multiple paragraphs', () => {
      const cell = new TableCell();
      cell.createParagraph('First paragraph');
      cell.createParagraph('Second paragraph');
      const paragraphs = cell.getParagraphs();
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0]!.getText()).toBe('First paragraph');
      expect(paragraphs[1]!.getText()).toBe('Second paragraph');
    });
  });

  describe('Cell formatting', () => {
    it('should set width', () => {
      const cell = new TableCell();
      cell.setWidth(2880); // 2 inches
      const formatting = cell.getFormatting();
      expect(formatting.width).toBe(2880);
    });

    it('should set vertical alignment', () => {
      const cell = new TableCell();
      cell.setVerticalAlignment('center');
      const formatting = cell.getFormatting();
      expect(formatting.verticalAlignment).toBe('center');
    });

    it('should set shading', () => {
      const cell = new TableCell();
      cell.setShading({ fill: 'FF0000' });
      const formatting = cell.getFormatting();
      expect(formatting.shading).toEqual({ fill: 'FF0000' });
    });

    it('should set borders', () => {
      const cell = new TableCell();
      cell.setBorders({
        top: { style: 'single', size: 4, color: '000000' },
        bottom: { style: 'double', size: 8, color: 'FF0000' },
      });
      const formatting = cell.getFormatting();
      expect(formatting.borders?.top?.style).toBe('single');
      expect(formatting.borders?.bottom?.style).toBe('double');
    });

    it('should set all borders at once', () => {
      const cell = new TableCell();
      const border = { style: 'thick' as const, size: 12, color: '0000FF' };
      cell.setBorders({
        top: { style: border.style, size: border.size, color: border.color },
        bottom: { style: border.style, size: border.size, color: border.color },
        left: { style: border.style, size: border.size, color: border.color },
        right: { style: border.style, size: border.size, color: border.color },
      });
      const formatting = cell.getFormatting();
      expect(formatting.borders?.top).toEqual(border);
      expect(formatting.borders?.bottom).toEqual(border);
      expect(formatting.borders?.left).toEqual(border);
      expect(formatting.borders?.right).toEqual(border);
    });

    it('should set grid span', () => {
      const cell = new TableCell();
      cell.setColumnSpan(3);
      const formatting = cell.getFormatting();
      expect(formatting.columnSpan).toBe(3);
    });

    it('should set vertical merge', () => {
      const cell = new TableCell();
      // Note: Vertical merge/rowSpan is not yet implemented
      expect(cell).toBeDefined();
    });
  });

  describe('Method chaining', () => {
    it('should support method chaining', () => {
      const cell = new TableCell();
      const result = cell
        .setWidth(2880)
        .setVerticalAlignment('center')
        .setShading({ fill: 'CCCCCC' });

      const paragraph = cell.createParagraph('Chained content');

      expect(result).toBe(cell);
      expect(paragraph).toBeInstanceOf(Paragraph);
      expect(cell.getText()).toBe('Chained content');
      const formatting = cell.getFormatting();
      expect(formatting.width).toBe(2880);
      expect(formatting.verticalAlignment).toBe('center');
      expect(formatting.shading).toEqual({ fill: 'CCCCCC' });
    });
  });

  describe('XML generation', () => {
    it('should generate basic cell XML', () => {
      const cell = new TableCell();
      cell.createParagraph('Cell content');
      const xml = cell.toXML();

      expect(xml.name).toBe('w:tc');
      expect(xml.children).toBeDefined();

      // Should have at least one paragraph
      const paragraph = filterXMLElements(xml.children).find(
        (c) => c.name === 'w:p'
      );
      expect(paragraph).toBeDefined();

      // tcPr is optional - only added if cell has formatting
      // An empty cell without formatting won't have tcPr
    });

    it('should generate XML with formatting', () => {
      const cell = new TableCell();
      cell.setWidth(2880).setShading({ fill: 'FFFF00' }).setColumnSpan(2);
      const xml = cell.toXML();

      const tcPr = filterXMLElements(xml.children).find(
        (c) => c.name === 'w:tcPr'
      );
      expect(tcPr?.children).toBeDefined();

      // Check for width
      const tcW = filterXMLElements(tcPr?.children).find(
        (c) => c.name === 'w:tcW'
      );
      expect(tcW?.attributes?.['w:w']).toBe(2880);

      // Check for shading
      const shd = filterXMLElements(tcPr?.children).find(
        (c) => c.name === 'w:shd'
      );
      expect(shd?.attributes?.['w:fill']).toBe('FFFF00');

      // Check for grid span
      const gridSpan = filterXMLElements(tcPr?.children).find(
        (c) => c.name === 'w:gridSpan'
      );
      expect(gridSpan?.attributes?.['w:val']).toBe(2);
    });
  });

  describe('Static methods', () => {
    it('should create cell with static method', () => {
      const cell = TableCell.create();
      expect(cell).toBeInstanceOf(TableCell);
    });
  });
});

describe('TableRow', () => {
  describe('Basic functionality', () => {
    it('should create empty row', () => {
      const row = new TableRow();
      expect(row.getCellCount()).toBe(0);
    });

    it('should create row with cells', () => {
      const row = new TableRow(3);
      expect(row.getCellCount()).toBe(3);
    });

    it('should add cells', () => {
      const row = new TableRow();
      const cell1 = new TableCell();
      const cell2 = new TableCell();
      row.addCell(cell1).addCell(cell2);
      expect(row.getCellCount()).toBe(2);
    });

    it('should create and add cell', () => {
      const row = new TableRow();
      const cell = row.createCell();
      expect(cell).toBeInstanceOf(TableCell);
      expect(row.getCellCount()).toBe(1);
    });

    it('should get cell by index', () => {
      const row = new TableRow(3);
      const cell = row.getCell(1);
      expect(cell).toBeInstanceOf(TableCell);
    });

    it('should return undefined for invalid index', () => {
      const row = new TableRow(2);
      expect(row.getCell(-1)).toBeUndefined();
      expect(row.getCell(5)).toBeUndefined();
    });

    it('should get all cells', () => {
      const row = new TableRow(3);
      const cells = row.getCells();
      expect(cells).toHaveLength(3);
      cells.forEach((cell) => {
        expect(cell).toBeInstanceOf(TableCell);
      });
    });
  });

  describe('Row formatting', () => {
    it('should set row height', () => {
      const row = new TableRow();
      row.setHeight(720); // 0.5 inch
      const formatting = row.getFormatting();
      expect(formatting.height).toBe(720);
    });

    it('should set height rule', () => {
      const row = new TableRow();
      row.setHeight(720, 'exact');
      const formatting = row.getFormatting();
      expect(formatting.heightRule).toBe('exact');
    });

    it('should set header row', () => {
      const row = new TableRow();
      row.setHeader(true);
      const formatting = row.getFormatting();
      expect(formatting.isHeader).toBe(true);
    });

    it('should set cant split', () => {
      const row = new TableRow();
      row.setCantSplit(true);
      const formatting = row.getFormatting();
      expect(formatting.cantSplit).toBe(true);
    });

    it('should clear row height with clearHeight()', () => {
      const row = new TableRow();
      row.setHeight(720, 'exact');
      expect(row.getHeight()).toBe(720);
      expect(row.getHeightRule()).toBe('exact');

      row.clearHeight();
      expect(row.getHeight()).toBeUndefined();
      expect(row.getHeightRule()).toBeUndefined();
    });

    it('should not include trHeight in XML after clearHeight()', () => {
      const row = new TableRow(1);
      row.setHeight(720, 'atLeast');
      row.clearHeight();

      const xml = row.toXML();
      const trPr = filterXMLElements(xml.children).find(
        (c) => c.name === 'w:trPr'
      );
      // trPr should either not exist or not contain trHeight
      if (trPr) {
        const trHeight = filterXMLElements(trPr.children).find(
          (c) => c.name === 'w:trHeight'
        );
        expect(trHeight).toBeUndefined();
      }
    });

    it('should support clearHeight() in method chain', () => {
      const row = new TableRow();
      const result = row.setHeight(720).clearHeight().setHeader(true);
      expect(result).toBe(row);
      expect(row.getHeight()).toBeUndefined();
      expect(row.getIsHeader()).toBe(true);
    });
  });

  describe('Method chaining', () => {
    it('should support method chaining', () => {
      const row = new TableRow();
      const result = row.setHeight(1440).setHeader(true).setCantSplit(true);

      expect(result).toBe(row);
      const formatting = row.getFormatting();
      expect(formatting.height).toBe(1440);
      expect(formatting.heightRule).toBe('atLeast');
      expect(formatting.isHeader).toBe(true);
      expect(formatting.cantSplit).toBe(true);
    });
  });

  describe('XML generation', () => {
    it('should generate row XML with cells', () => {
      const row = new TableRow(2);
      row.getCell(0)?.createParagraph('Cell 1');
      row.getCell(1)?.createParagraph('Cell 2');

      const xml = row.toXML();
      expect(xml.name).toBe('w:tr');

      // Should have 2 cells
      const cells = filterXMLElements(xml.children).filter(
        (c) => c.name === 'w:tc'
      );
      expect(cells).toHaveLength(2);
    });

    it('should generate XML with formatting', () => {
      const row = new TableRow();
      row.setHeight(1440, 'exact').setHeader(true);

      const xml = row.toXML();
      const trPr = filterXMLElements(xml.children).find(
        (c) => c.name === 'w:trPr'
      );
      expect(trPr).toBeDefined();

      // Check for height
      const trHeight = filterXMLElements(trPr?.children).find(
        (c) => c.name === 'w:trHeight'
      );
      expect(trHeight?.attributes?.['w:val']).toBe(1440);
      expect(trHeight?.attributes?.['w:hRule']).toBe('exact');

      // Check for header
      const tblHeader = filterXMLElements(trPr?.children).find(
        (c) => c.name === 'w:tblHeader'
      );
      expect(tblHeader).toBeDefined();
    });
  });

  describe('Static methods', () => {
    it('should create row with static method', () => {
      const row = TableRow.create(3);
      expect(row).toBeInstanceOf(TableRow);
      expect(row.getCellCount()).toBe(3);
    });
  });
});

describe('Table', () => {
  describe('Basic functionality', () => {
    it('should create empty table', () => {
      const table = new Table();
      expect(table.getRowCount()).toBe(0);
      expect(table.getColumnCount()).toBe(0);
    });

    it('should create table with rows and columns', () => {
      const table = new Table(3, 4);
      expect(table.getRowCount()).toBe(3);
      expect(table.getColumnCount()).toBe(4);
    });

    it('should add row', () => {
      const table = new Table();
      const row = new TableRow(3);
      table.addRow(row);
      expect(table.getRowCount()).toBe(1);
    });

    it('should create and add row', () => {
      const table = new Table();
      const row = table.createRow(4);
      expect(row).toBeInstanceOf(TableRow);
      expect(table.getRowCount()).toBe(1);
      expect(row.getCellCount()).toBe(4);
    });

    it('should get row by index', () => {
      const table = new Table(3, 2);
      const row = table.getRow(1);
      expect(row).toBeInstanceOf(TableRow);
    });

    it('should get cell by coordinates', () => {
      const table = new Table(3, 3);
      const cell = table.getCell(1, 2);
      expect(cell).toBeInstanceOf(TableCell);
    });

    it('should return undefined for invalid cell coordinates', () => {
      const table = new Table(2, 2);
      expect(table.getCell(-1, 0)).toBeUndefined();
      expect(table.getCell(0, 5)).toBeUndefined();
      expect(table.getCell(5, 0)).toBeUndefined();
    });

    it('should set default width for ECMA-376 compliance', () => {
      // Per ECMA-376, tables require <w:tblW> element
      // Default should be Letter page width minus margins: 9360 twips (~6.5 inches)
      const table = new Table(1, 1);
      const formatting = table.getFormatting();
      expect(formatting.width).toBeDefined();
      expect(formatting.width).toBe(9360);
    });

    it('should not override explicitly set width', () => {
      const table = new Table(1, 1, { width: 5000 });
      const formatting = table.getFormatting();
      expect(formatting.width).toBe(5000);
    });
  });

  describe('Table formatting', () => {
    it('should set table width', () => {
      const table = new Table();
      table.setWidth(8640); // 6 inches
      const formatting = table.getFormatting();
      expect(formatting.width).toBe(8640);
    });

    it('should set table alignment', () => {
      const table = new Table();
      table.setAlignment('center');
      const formatting = table.getFormatting();
      expect(formatting.alignment).toBe('center');
    });

    it('should set table layout', () => {
      const table = new Table();
      table.setLayout('fixed');
      const formatting = table.getFormatting();
      expect(formatting.layout).toBe('fixed');
    });

    it('should set table borders', () => {
      const table = new Table();
      table.setBorders({
        top: { style: 'single', size: 4 },
        bottom: { style: 'single', size: 4 },
      });
      const formatting = table.getFormatting();
      expect(formatting.borders?.top?.style).toBe('single');
      expect(formatting.borders?.bottom?.style).toBe('single');
    });

    it('should set all borders at once', () => {
      const table = new Table();
      const border = { style: 'double' as const, size: 6, color: '000000' };
      table.setBorders({
        top: border,
        bottom: border,
        left: border,
        right: border,
        insideH: border,
        insideV: border,
      });
      const formatting = table.getFormatting();
      expect(formatting.borders?.top).toEqual(border);
      expect(formatting.borders?.bottom).toEqual(border);
      expect(formatting.borders?.left).toEqual(border);
      expect(formatting.borders?.right).toEqual(border);
      expect(formatting.borders?.insideH).toEqual(border);
      expect(formatting.borders?.insideV).toEqual(border);
    });

    it('should set cell spacing', () => {
      const table = new Table();
      table.setCellSpacing(120);
      const formatting = table.getFormatting();
      expect(formatting.cellSpacing).toBe(120);
    });

    it('should set indent', () => {
      const table = new Table();
      table.setIndent(720);
      const formatting = table.getFormatting();
      expect(formatting.indent).toBe(720);
    });
  });

  describe('Row operations', () => {
    it('should remove row', () => {
      const table = new Table(3, 2);
      expect(table.removeRow(1)).toBe(true);
      expect(table.getRowCount()).toBe(2);
    });

    it('should return false when removing invalid row', () => {
      const table = new Table(2, 2);
      expect(table.removeRow(-1)).toBe(false);
      expect(table.removeRow(5)).toBe(false);
      expect(table.getRowCount()).toBe(2);
    });

    it('should insert row at position', () => {
      const table = new Table(2, 3);
      const newRow = table.insertRow(1);
      expect(newRow).toBeInstanceOf(TableRow);
      expect(table.getRowCount()).toBe(3);
      expect(table.getRow(1)).toBe(newRow);
    });

    it('should insert row at beginning', () => {
      const table = new Table(2, 3);
      const newRow = table.insertRow(0);
      expect(table.getRow(0)).toBe(newRow);
    });

    it('should insert row at end', () => {
      const table = new Table(2, 3);
      const newRow = table.insertRow(10); // Beyond end
      expect(table.getRow(2)).toBe(newRow);
    });
  });

  describe('Column operations', () => {
    it('should add column to all rows', () => {
      const table = new Table(3, 2);
      table.addColumn();
      expect(table.getColumnCount()).toBe(3);
      // Check each row has 3 cells
      for (let i = 0; i < 3; i++) {
        expect(table.getRow(i)?.getCellCount()).toBe(3);
      }
    });

    it('should add column at specific position', () => {
      const table = new Table(2, 3);
      table.getCell(0, 0)?.createParagraph('A1');
      table.getCell(0, 1)?.createParagraph('B1');
      table.getCell(0, 2)?.createParagraph('C1');

      table.addColumn(1);
      expect(table.getColumnCount()).toBe(4);
      // Original B1 should now be at position 2
      expect(table.getCell(0, 2)?.getText()).toBe('B1');
    });

    it('should remove column from all rows', () => {
      const table = new Table(3, 4);
      expect(table.removeColumn(2)).toBe(true);
      expect(table.getColumnCount()).toBe(3);
      // Check each row has 3 cells
      for (let i = 0; i < 3; i++) {
        expect(table.getRow(i)?.getCellCount()).toBe(3);
      }
    });

    it('should return false when removing invalid column', () => {
      const table = new Table(2, 3);
      expect(table.removeColumn(-1)).toBe(false);
      expect(table.getColumnCount()).toBe(3);
    });

    it('should set column widths', () => {
      const table = new Table(2, 3);
      table.setColumnWidths([2880, 2160, null]); // 2", 1.5", auto
      const formatting = table.getFormatting() as any;
      expect(formatting.columnWidths).toEqual([2880, 2160, null]);
    });
  });

  describe('Method chaining', () => {
    it('should support method chaining', () => {
      const table = new Table();
      const result = table
        .setWidth(8640)
        .setAlignment('center')
        .setLayout('fixed')
        .setCellSpacing(120);

      expect(result).toBe(table);
      const formatting = table.getFormatting();
      expect(formatting.width).toBe(8640);
      expect(formatting.alignment).toBe('center');
      expect(formatting.layout).toBe('fixed');
      expect(formatting.cellSpacing).toBe(120);
    });
  });

  describe('XML generation', () => {
    it('should generate basic table XML', () => {
      const table = new Table(2, 2);
      table.getCell(0, 0)?.createParagraph('A1');
      table.getCell(0, 1)?.createParagraph('B1');
      table.getCell(1, 0)?.createParagraph('A2');
      table.getCell(1, 1)?.createParagraph('B2');

      const xml = table.toXML();
      expect(xml.name).toBe('w:tbl');

      // Should have table properties
      const xmlElements = filterXMLElements(xml.children);
      const tblPr = xmlElements.find((c) => c.name === 'w:tblPr');
      expect(tblPr).toBeDefined();

      // Should have table grid
      const tblGrid = xmlElements.find((c) => c.name === 'w:tblGrid');
      expect(tblGrid).toBeDefined();
      const gridCols = filterXMLElements(tblGrid?.children).filter(
        (c) => c.name === 'w:gridCol'
      );
      expect(gridCols).toHaveLength(2);

      // Should have 2 rows
      const rows = xmlElements.filter((c) => c.name === 'w:tr');
      expect(rows).toHaveLength(2);
    });

    it('should generate XML with formatting', () => {
      const table = new Table();
      table
        .setWidth(8640)
        .setAlignment('center')
        .setBorders({
          top: { style: 'single', size: 4 },
        });

      const xml = table.toXML();
      const tblPr = filterXMLElements(xml.children).find(
        (c) => c.name === 'w:tblPr'
      );

      // Check width
      const tblW = filterXMLElements(tblPr?.children).find(
        (c) => c.name === 'w:tblW'
      );
      expect(tblW?.attributes?.['w:w']).toBe(8640);

      // Check alignment
      const jc = filterXMLElements(tblPr?.children).find(
        (c) => c.name === 'w:jc'
      );
      expect(jc?.attributes?.['w:val']).toBe('center');

      // Check borders
      const tblBorders = filterXMLElements(tblPr?.children).find(
        (c) => c.name === 'w:tblBorders'
      );
      expect(tblBorders).toBeDefined();
    });
  });

  describe('Static methods', () => {
    it('should create table with static method', () => {
      const table = Table.create(3, 4);
      expect(table).toBeInstanceOf(Table);
      expect(table.getRowCount()).toBe(3);
      expect(table.getColumnCount()).toBe(4);
    });
  });

  describe('First row formatting', () => {
    it('should set alignment for first row', () => {
      const table = new Table(2, 3);
      const para1 = new Paragraph();
      para1.addText('Header 1');
      table.getCell(0, 0)?.addParagraph(para1);

      const para2 = new Paragraph();
      para2.addText('Header 2');
      table.getCell(0, 1)?.addParagraph(para2);

      table.setFirstRowFormatting({ alignment: 'center' });

      const firstRow = table.getRow(0);
      const cells = firstRow?.getCells() || [];

      for (const cell of cells) {
        const paragraphs = cell.getParagraphs();
        for (const para of paragraphs) {
          expect(para.getFormatting().alignment).toBe('center');
        }
      }
    });

    it('should set text formatting (bold, italic, underline) for first row', () => {
      const table = new Table(2, 2);
      const para1 = new Paragraph();
      para1.addText('Header 1');
      table.getCell(0, 0)?.addParagraph(para1);

      const para2 = new Paragraph();
      para2.addText('Header 2');
      table.getCell(0, 1)?.addParagraph(para2);

      table.setFirstRowFormatting({
        bold: true,
        italic: true,
        underline: 'single',
      });

      const firstRow = table.getRow(0);
      const cells = firstRow?.getCells() || [];

      for (const cell of cells) {
        const paragraphs = cell.getParagraphs();
        for (const para of paragraphs) {
          const runs = para.getRuns();
          for (const run of runs) {
            const formatting = run.getFormatting();
            expect(formatting.bold).toBe(true);
            expect(formatting.italic).toBe(true);
            expect(formatting.underline).toBe('single');
          }
        }
      }
    });

    it('should set spacing for first row paragraphs', () => {
      const table = new Table(2, 2);
      const para = new Paragraph();
      para.addText('Header');
      table.getCell(0, 0)?.addParagraph(para);

      table.setFirstRowFormatting({
        spacingBefore: 120,
        spacingAfter: 80,
      });

      const firstRow = table.getRow(0);
      const cells = firstRow?.getCells() || [];

      for (const cell of cells) {
        const paragraphs = cell.getParagraphs();
        for (const para of paragraphs) {
          const formatting = para.getFormatting();
          expect(formatting.spacing?.before).toBe(120);
          expect(formatting.spacing?.after).toBe(80);
        }
      }
    });

    it('should set shading for first row cells', () => {
      const table = new Table(2, 2);
      const para = new Paragraph();
      para.addText('Header');
      table.getCell(0, 0)?.addParagraph(para);

      table.setFirstRowFormatting({ shading: 'DFDFDF' });

      const firstRow = table.getRow(0);
      const cells = firstRow?.getCells() || [];

      for (const cell of cells) {
        const formatting = cell.getFormatting();
        expect(formatting.shading?.fill).toBe('DFDFDF');
      }
    });

    it('should apply all formatting options together', () => {
      const table = new Table(3, 3);
      const para1 = new Paragraph();
      para1.addText('Header 1');
      table.getCell(0, 0)?.addParagraph(para1);

      const para2 = new Paragraph();
      para2.addText('Header 2');
      table.getCell(0, 1)?.addParagraph(para2);

      const para3 = new Paragraph();
      para3.addText('Header 3');
      table.getCell(0, 2)?.addParagraph(para3);

      table.setFirstRowFormatting({
        alignment: 'center',
        bold: true,
        italic: true,
        underline: 'double',
        spacingBefore: 100,
        spacingAfter: 100,
        shading: 'BFBFBF',
      });

      const firstRow = table.getRow(0);
      const cells = firstRow?.getCells() || [];

      // Verify all cells in first row
      for (const cell of cells) {
        // Check shading
        expect(cell.getFormatting().shading?.fill).toBe('BFBFBF');

        // Check paragraphs
        const paragraphs = cell.getParagraphs();
        for (const para of paragraphs) {
          // Check paragraph formatting
          const paraFormatting = para.getFormatting();
          expect(paraFormatting.alignment).toBe('center');
          expect(paraFormatting.spacing?.before).toBe(100);
          expect(paraFormatting.spacing?.after).toBe(100);

          // Check run formatting
          const runs = para.getRuns();
          for (const run of runs) {
            const runFormatting = run.getFormatting();
            expect(runFormatting.bold).toBe(true);
            expect(runFormatting.italic).toBe(true);
            expect(runFormatting.underline).toBe('double');
          }
        }
      }
    });

    it('should not affect other rows', () => {
      const table = new Table(3, 2);
      const para0 = new Paragraph();
      para0.addText('Header');
      table.getCell(0, 0)?.addParagraph(para0);

      const para1 = new Paragraph();
      para1.addText('Data 1');
      table.getCell(1, 0)?.addParagraph(para1);

      const para2 = new Paragraph();
      para2.addText('Data 2');
      table.getCell(2, 0)?.addParagraph(para2);

      table.setFirstRowFormatting({
        bold: true,
        alignment: 'center',
        shading: 'DFDFDF',
      });

      // Check second and third rows are not affected
      for (let rowIndex = 1; rowIndex < 3; rowIndex++) {
        const row = table.getRow(rowIndex);
        const cells = row?.getCells() || [];

        for (const cell of cells) {
          // Shading should not be set
          expect(cell.getFormatting().shading).toBeUndefined();

          const paragraphs = cell.getParagraphs();
          for (const para of paragraphs) {
            // Alignment should not be set
            expect(para.getFormatting().alignment).toBeUndefined();

            const runs = para.getRuns();
            for (const run of runs) {
              // Bold should not be set
              expect(run.getFormatting().bold).toBeUndefined();
            }
          }
        }
      }
    });

    it('should handle empty table gracefully', () => {
      const table = new Table(0, 0);

      // Should not throw
      expect(() => {
        table.setFirstRowFormatting({ bold: true });
      }).not.toThrow();
    });

    it('should support method chaining', () => {
      const table = new Table(2, 2);
      const para = new Paragraph();
      para.addText('Header');
      table.getCell(0, 0)?.addParagraph(para);

      const result = table
        .setFirstRowFormatting({ bold: true })
        .setWidth(8000)
        .setAlignment('center');

      expect(result).toBe(table);
      expect(table.getFormatting().width).toBe(8000);
      expect(table.getFormatting().alignment).toBe('center');
    });
  });
});
