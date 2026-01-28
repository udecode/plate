/**
 * Tests for Table Style support (Phase 5.1)
 */

import { Style } from '../../src/formatting/Style';
import { Document } from '../../src/core/Document';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('TableStyles - Phase 5.1', () => {
  const outputDir = path.join(__dirname, '../output');

  beforeAll(async () => {
    // Ensure output directory exists
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
    }
  });

  describe('Basic Table Properties', () => {
    test('should set table indentation', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableFormatting({
          indent: 720, // 0.5 inch
        });

      const props = style.getProperties();
      expect(props.tableStyle?.table?.indent).toBe(720);
    });

    test('should set cell spacing', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableFormatting({
          cellSpacing: 100,
        });

      const props = style.getProperties();
      expect(props.tableStyle?.table?.cellSpacing).toBe(100);
    });

    test('should set table borders', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableFormatting({
          borders: {
            top: { style: 'single', size: 6, color: '000000' },
            bottom: { style: 'double', size: 8, color: 'FF0000' },
            left: { style: 'dashed', size: 4, color: '0000FF' },
            right: { style: 'dotted', size: 4, color: '00FF00' },
            insideH: { style: 'single', size: 2, color: 'CCCCCC' },
            insideV: { style: 'single', size: 2, color: 'CCCCCC' },
          },
        });

      const props = style.getProperties();
      expect(props.tableStyle?.table?.borders?.top).toEqual({
        style: 'single',
        size: 6,
        color: '000000',
      });
      expect(props.tableStyle?.table?.borders?.bottom?.style).toBe('double');
      expect(props.tableStyle?.table?.borders?.insideH?.size).toBe(2);
    });

    test('should set cell margins', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableFormatting({
          cellMargins: {
            top: 50,
            bottom: 50,
            left: 100,
            right: 100,
          },
        });

      const props = style.getProperties();
      expect(props.tableStyle?.table?.cellMargins).toEqual({
        top: 50,
        bottom: 50,
        left: 100,
        right: 100,
      });
    });

    test('should set table shading', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableFormatting({
          shading: {
            fill: 'F0F0F0',
            val: 'clear',
          },
        });

      const props = style.getProperties();
      expect(props.tableStyle?.table?.shading?.fill).toBe('F0F0F0');
    });

    test('should set table alignment', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableFormatting({
          alignment: 'center',
        });

      const props = style.getProperties();
      expect(props.tableStyle?.table?.alignment).toBe('center');
    });

    test('should set cell vertical alignment', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableCellFormatting({
          verticalAlignment: 'center',
        });

      const props = style.getProperties();
      expect(props.tableStyle?.cell?.verticalAlignment).toBe('center');
    });

    test('should set row height', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setTableRowFormatting({
          height: 500,
          heightRule: 'exact',
        });

      const props = style.getProperties();
      expect(props.tableStyle?.row?.height).toBe(500);
      expect(props.tableStyle?.row?.heightRule).toBe('exact');
    });
  });

  describe('Conditional Formatting', () => {
    test('should add firstRow conditional formatting', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'firstRow',
          cellFormatting: {
            shading: { fill: 'D0CECE' },
          },
          runFormatting: {
            bold: true,
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('firstRow');
      expect(conditional?.cellFormatting?.shading?.fill).toBe('D0CECE');
      expect(conditional?.runFormatting?.bold).toBe(true);
    });

    test('should add lastRow conditional formatting', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'lastRow',
          cellFormatting: {
            borders: {
              top: { style: 'double', size: 6, color: '000000' },
            },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('lastRow');
      expect(conditional?.cellFormatting?.borders?.top?.style).toBe('double');
    });

    test('should add firstCol conditional formatting', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'firstCol',
          runFormatting: {
            bold: true,
            color: '000000',
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('firstCol');
      expect(conditional?.runFormatting?.bold).toBe(true);
    });

    test('should add lastCol conditional formatting', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'lastCol',
          cellFormatting: {
            shading: { fill: 'E0E0E0' },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('lastCol');
    });

    test('should add band1Horz (row banding)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setRowBandSize(1)
        .addConditionalFormatting({
          type: 'band1Horz',
          cellFormatting: {
            shading: { fill: 'F0F0F0' },
          },
        });

      const props = style.getProperties();
      expect(props.tableStyle?.rowBandSize).toBe(1);
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('band1Horz');
    });

    test('should add band2Horz (even row banding)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'band2Horz',
          cellFormatting: {
            shading: { fill: 'FFFFFF' },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('band2Horz');
    });

    test('should add band1Vert (column banding)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .setColBandSize(1)
        .addConditionalFormatting({
          type: 'band1Vert',
          cellFormatting: {
            shading: { fill: 'E8F4F8' },
          },
        });

      const props = style.getProperties();
      expect(props.tableStyle?.colBandSize).toBe(1);
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('band1Vert');
    });

    test('should add band2Vert (even column banding)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'band2Vert',
          cellFormatting: {
            shading: { fill: 'FFFFFF' },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('band2Vert');
    });

    test('should add nwCell (northwest corner)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'nwCell',
          cellFormatting: {
            shading: { fill: 'A0A0A0' },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('nwCell');
    });

    test('should add neCell (northeast corner)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'neCell',
          cellFormatting: {
            shading: { fill: 'B0B0B0' },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('neCell');
    });

    test('should add swCell (southwest corner)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'swCell',
          cellFormatting: {
            shading: { fill: 'C0C0C0' },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('swCell');
    });

    test('should add seCell (southeast corner)', () => {
      const style = Style.create({
        styleId: 'TestTable',
        name: 'Test Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'seCell',
          cellFormatting: {
            shading: { fill: 'D0D0D0' },
          },
        });

      const props = style.getProperties();
      const conditional = props.tableStyle?.conditionalFormatting?.[0];
      expect(conditional?.type).toBe('seCell');
    });
  });

  describe('XML Generation', () => {
    test('should generate complete table style XML', () => {
      const style = Style.create({
        styleId: 'CompleteTable',
        name: 'Complete Table',
        type: 'table',
      })
        .setTableFormatting({
          indent: 100,
          alignment: 'center',
          borders: {
            top: { style: 'single', size: 4, color: '000000' },
            bottom: { style: 'single', size: 4, color: '000000' },
          },
          cellMargins: {
            left: 108,
            right: 108,
          },
        })
        .setRowBandSize(1);

      const xml = style.toXML();
      expect(xml.name).toBe('w:style');
      expect(xml.attributes?.['w:type']).toBe('table');
      expect(xml.attributes?.['w:styleId']).toBe('CompleteTable');

      // Check for tblPr element
      const tblPr = xml.children?.find(c => typeof c !== 'string' && c.name === 'w:tblPr');
      expect(tblPr).toBeDefined();
    });

    test('should generate borders XML', () => {
      const style = Style.create({
        styleId: 'BorderedTable',
        name: 'Bordered Table',
        type: 'table',
      })
        .setTableFormatting({
          borders: {
            top: { style: 'single', size: 6, color: 'FF0000' },
            bottom: { style: 'double', size: 8, color: '0000FF' },
            insideH: { style: 'dashed', size: 4, color: '00FF00' },
          },
        });

      const xml = style.toXML();
      const tblPr = xml.children?.filter(c => typeof c !== 'string').find((c: any) => c.name === 'w:tblPr');
      const borders = (tblPr as any)?.children?.filter((c: any) => typeof c !== 'string').find((c: any) => c.name === 'w:tblBorders');
      expect(borders).toBeDefined();

      const topBorder = (borders as any)?.children?.filter((c: any) => typeof c !== 'string').find((c: any) => c.name === 'w:top');
      expect(topBorder?.attributes?.['w:val']).toBe('single');
      expect(topBorder?.attributes?.['w:sz']).toBe(6);
      expect(topBorder?.attributes?.['w:color']).toBe('FF0000');
    });

    test('should generate shading XML', () => {
      const style = Style.create({
        styleId: 'ShadedTable',
        name: 'Shaded Table',
        type: 'table',
      })
        .setTableCellFormatting({
          shading: {
            fill: 'F0F0F0',
            val: 'clear',
            color: 'auto',
          },
        });

      const xml = style.toXML();
      const tcPr = xml.children?.filter(c => typeof c !== 'string').find((c: any) => c.name === 'w:tcPr');
      const shading = (tcPr as any)?.children?.filter((c: any) => typeof c !== 'string').find((c: any) => c.name === 'w:shd');
      expect(shading).toBeDefined();
      expect(shading?.attributes?.['w:fill']).toBe('F0F0F0');
    });

    test('should generate margins XML', () => {
      const style = Style.create({
        styleId: 'MarginTable',
        name: 'Margin Table',
        type: 'table',
      })
        .setTableFormatting({
          cellMargins: {
            top: 50,
            bottom: 50,
            left: 100,
            right: 100,
          },
        });

      const xml = style.toXML();
      const tblPr = xml.children?.filter(c => typeof c !== 'string').find((c: any) => c.name === 'w:tblPr');
      const margins = (tblPr as any)?.children?.filter((c: any) => typeof c !== 'string').find((c: any) => c.name === 'w:tblCellMar');
      expect(margins).toBeDefined();

      const leftMargin = (margins as any)?.children?.filter((c: any) => typeof c !== 'string').find((c: any) => c.name === 'w:left');
      expect(leftMargin?.attributes?.['w:w']).toBe(100);
    });

    test('should generate conditional formatting XML', () => {
      const style = Style.create({
        styleId: 'ConditionalTable',
        name: 'Conditional Table',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'firstRow',
          cellFormatting: {
            shading: { fill: 'D0CECE' },
          },
          runFormatting: {
            bold: true,
          },
        });

      const xml = style.toXML();
      const tblStylePr = xml.children?.filter(c => typeof c !== 'string').find((c: any) => c.name === 'w:tblStylePr');
      expect(tblStylePr).toBeDefined();
      expect((tblStylePr as any)?.attributes?.['w:type']).toBe('firstRow');

      const tcPr = (tblStylePr as any)?.children?.filter((c: any) => typeof c !== 'string').find((c: any) => c.name === 'w:tcPr');
      expect(tcPr).toBeDefined();

      const rPr = (tblStylePr as any)?.children?.filter((c: any) => typeof c !== 'string').find((c: any) => c.name === 'w:rPr');
      expect(rPr).toBeDefined();
    });
  });

  describe('Round-Trip Testing', () => {
    test('should preserve table properties through save/load', async () => {
      const doc = Document.create();

      const style = Style.create({
        styleId: 'RoundTripTable',
        name: 'Round Trip Table',
        type: 'table',
      })
        .setTableFormatting({
          indent: 720,
          alignment: 'center',
          cellSpacing: 50,
          borders: {
            top: { style: 'single', size: 6, color: '000000' },
            bottom: { style: 'single', size: 6, color: '000000' },
          },
          cellMargins: {
            top: 50,
            left: 108,
            bottom: 50,
            right: 108,
          },
        })
        .setRowBandSize(1);

      doc.addStyle(style);

      const filePath = path.join(outputDir, 'test-table-style-roundtrip.docx');
      await doc.save(filePath);

      // Load and verify
      const loaded = await Document.load(filePath);
      const loadedStyle = loaded.getStyle('RoundTripTable');
      expect(loadedStyle).toBeDefined();

      const props = loadedStyle!.getProperties();
      expect(props.type).toBe('table');
      expect(props.tableStyle?.table?.indent).toBe(720);
      expect(props.tableStyle?.table?.alignment).toBe('center');
      expect(props.tableStyle?.rowBandSize).toBe(1);
    });

    test('should preserve conditional formatting through save/load', async () => {
      const doc = Document.create();

      const style = Style.create({
        styleId: 'ConditionalRoundTrip',
        name: 'Conditional Round Trip',
        type: 'table',
      })
        .addConditionalFormatting({
          type: 'firstRow',
          cellFormatting: {
            shading: { fill: 'D0CECE' },
          },
          runFormatting: {
            bold: true,
          },
        })
        .addConditionalFormatting({
          type: 'band1Horz',
          cellFormatting: {
            shading: { fill: 'F0F0F0' },
          },
        });

      doc.addStyle(style);

      const filePath = path.join(outputDir, 'test-table-conditional-roundtrip.docx');
      await doc.save(filePath);

      // Load and verify
      const loaded = await Document.load(filePath);
      const loadedStyle = loaded.getStyle('ConditionalRoundTrip');
      expect(loadedStyle).toBeDefined();

      const props = loadedStyle!.getProperties();
      const conditionals = props.tableStyle?.conditionalFormatting;
      expect(conditionals).toBeDefined();
      expect(conditionals?.length).toBe(2);
      if (conditionals && conditionals.length >= 2) {
        expect(conditionals[0]!.type).toBe('firstRow');
        expect(conditionals[1]!.type).toBe('band1Horz');
      }
    });

    test('should preserve all table style properties', async () => {
      const doc = Document.create();

      const style = Style.create({
        styleId: 'FullRoundTrip',
        name: 'Full Round Trip',
        type: 'table',
      })
        .setTableFormatting({
          indent: 100,
          alignment: 'right',
          cellSpacing: 75,
          borders: {
            top: { style: 'double', size: 8, color: 'FF0000' },
            bottom: { style: 'double', size: 8, color: 'FF0000' },
          },
          shading: {
            fill: 'F8F8F8',
          },
        })
        .setTableCellFormatting({
          verticalAlignment: 'center',
        })
        .setTableRowFormatting({
          height: 500,
          heightRule: 'exact',
        })
        .setRowBandSize(2)
        .setColBandSize(1);

      doc.addStyle(style);

      const filePath = path.join(outputDir, 'test-table-full-roundtrip.docx');
      await doc.save(filePath);

      // Load and verify
      const loaded = await Document.load(filePath);
      const loadedStyle = loaded.getStyle('FullRoundTrip');
      expect(loadedStyle).toBeDefined();

      const props = loadedStyle!.getProperties();
      expect(props.tableStyle?.table?.indent).toBe(100);
      expect(props.tableStyle?.table?.alignment).toBe('right');
      expect(props.tableStyle?.cell?.verticalAlignment).toBe('center');
      expect(props.tableStyle?.row?.height).toBe(500);
      expect(props.tableStyle?.rowBandSize).toBe(2);
      expect(props.tableStyle?.colBandSize).toBe(1);
    });
  });
});
