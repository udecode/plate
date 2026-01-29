/**
 * Tests for Parent Tracking in Table Elements
 * Verifies the parent chain: Run -> Paragraph -> TableCell -> TableRow -> Table
 */

import { Document } from "../../src/core/Document";
import { Paragraph } from "../../src/elements/Paragraph";
import { Run } from "../../src/elements/Run";
import { Table } from "../../src/elements/Table";
import { TableCell } from "../../src/elements/TableCell";
import { TableRow } from "../../src/elements/TableRow";

describe("Parent Tracking", () => {
  describe("Paragraph -> TableCell", () => {
    it("should set parent cell when adding paragraph with addParagraph()", () => {
      const cell = new TableCell();
      const para = new Paragraph();

      cell.addParagraph(para);

      expect(para._getParentCell()).toBe(cell);
    });

    it("should set parent cell when creating paragraph with createParagraph()", () => {
      const cell = new TableCell();
      const para = cell.createParagraph("test text");

      expect(para._getParentCell()).toBe(cell);
    });

    it("should set parent cell when adding paragraph at index with addParagraphAt()", () => {
      const cell = new TableCell();
      cell.createParagraph("first");
      const para = new Paragraph();

      cell.addParagraphAt(0, para);

      expect(para._getParentCell()).toBe(cell);
    });

    it("should clear parent cell when removing paragraph", () => {
      const cell = new TableCell();
      const para = cell.createParagraph("test");

      expect(para._getParentCell()).toBe(cell);

      cell.removeParagraph(0);

      expect(para._getParentCell()).toBeUndefined();
    });

    it("should report isInTableCell() correctly", () => {
      const para = new Paragraph();
      expect(para.isInTableCell()).toBe(false);

      const cell = new TableCell();
      cell.addParagraph(para);

      expect(para.isInTableCell()).toBe(true);
    });

    it("should return cell cnfStyle from getTableConditionalStyle()", () => {
      const cell = new TableCell();
      cell.setConditionalStyle("100000000000"); // firstRow

      const para = cell.createParagraph("test");

      expect(para.getTableConditionalStyle()).toBe("100000000000");
    });

    it("should return paragraph cnfStyle if not in cell", () => {
      const para = new Paragraph({ cnfStyle: "010000000000" }); // lastRow

      expect(para.getTableConditionalStyle()).toBe("010000000000");
    });

    it("should prefer cell cnfStyle over paragraph cnfStyle", () => {
      const cell = new TableCell();
      cell.setConditionalStyle("100000000000"); // firstRow

      const para = new Paragraph({ cnfStyle: "010000000000" }); // lastRow
      cell.addParagraph(para);

      // Cell's cnfStyle should take precedence
      expect(para.getTableConditionalStyle()).toBe("100000000000");
    });
  });

  describe("TableCell -> TableRow", () => {
    it("should set parent row when adding cell with addCell()", () => {
      const row = new TableRow();
      const cell = new TableCell();

      row.addCell(cell);

      expect(cell._getParentRow()).toBe(row);
    });

    it("should set parent row when creating cell with createCell()", () => {
      const row = new TableRow();
      const cell = row.createCell("test");

      expect(cell._getParentRow()).toBe(row);
    });

    it("should set parent row on cells created in constructor", () => {
      const row = new TableRow(3); // Create with 3 cells

      const cells = row.getCells();
      expect(cells).toHaveLength(3);

      for (const cell of cells) {
        expect(cell._getParentRow()).toBe(row);
      }
    });
  });

  describe("TableRow -> Table", () => {
    it("should set parent table when adding row with addRow()", () => {
      const table = new Table();
      const row = new TableRow(2);

      table.addRow(row);

      expect(row._getParentTable()).toBe(table);
    });

    it("should set parent table when creating row with createRow()", () => {
      const table = new Table();
      const row = table.createRow(2);

      expect(row._getParentTable()).toBe(table);
    });

    it("should set parent table on rows created in constructor", () => {
      const table = new Table(3, 2); // 3 rows, 2 columns

      const rows = table.getRows();
      expect(rows).toHaveLength(3);

      for (const row of rows) {
        expect(row._getParentTable()).toBe(table);
      }
    });
  });

  describe("Full Parent Chain", () => {
    it("should traverse from Paragraph to Table", () => {
      const table = new Table(2, 2);
      const row = table.getRow(0)!;
      const cell = row.getCell(0)!;
      const para = cell.createParagraph("test");

      // Verify full chain
      expect(para._getParentCell()).toBe(cell);
      expect(cell._getParentRow()).toBe(row);
      expect(row._getParentTable()).toBe(table);
    });

    it("should return table style ID through getTableStyleId()", () => {
      const table = new Table(2, 2, { style: "TableGrid" });
      const row = table.getRow(0)!;
      const cell = row.getCell(0)!;

      expect(cell.getTableStyleId()).toBe("TableGrid");
    });

    it("should return undefined for getTableStyleId() if not in table", () => {
      const cell = new TableCell();

      expect(cell.getTableStyleId()).toBeUndefined();
    });

    it("should return undefined for getTableStyleId() if table has no style", () => {
      const table = new Table(2, 2);
      const cell = table.getRow(0)!.getCell(0)!;

      expect(cell.getTableStyleId()).toBeUndefined();
    });
  });

  describe("Run -> Paragraph (existing)", () => {
    it("should set parent paragraph when adding run", () => {
      const para = new Paragraph();
      para.addText("test");
      const runs = para.getRuns();
      const run = runs[0];

      expect(run).toBeDefined();
      expect((run as any)._getParentParagraph()).toBe(para);
    });
  });

  describe("Run getEffective* methods", () => {
    it("should return direct formatting from getEffectiveBold()", () => {
      const run = new Run("test", { bold: true });

      expect(run.getEffectiveBold()).toBe(true);
    });

    it("should return undefined if no bold formatting", () => {
      const run = new Run("test");

      expect(run.getEffectiveBold()).toBeUndefined();
    });

    it("should return direct formatting from getEffectiveItalic()", () => {
      const run = new Run("test", { italic: true });

      expect(run.getEffectiveItalic()).toBe(true);
    });

    it("should return direct formatting from getEffectiveColor()", () => {
      const run = new Run("test", { color: "FF0000" });

      expect(run.getEffectiveColor()).toBe("FF0000");
    });

    it("should return direct formatting from getEffectiveFont()", () => {
      const run = new Run("test", { font: "Arial" });

      expect(run.getEffectiveFont()).toBe("Arial");
    });

    it("should return direct formatting from getEffectiveSize()", () => {
      const run = new Run("test", { size: 14 });

      expect(run.getEffectiveSize()).toBe(14);
    });

    it("should return undefined for run not in paragraph", () => {
      const run = new Run("test");
      // Not added to any paragraph

      // Should not throw, should return undefined
      expect(run.getEffectiveBold()).toBeUndefined();
    });

    it("should return undefined for run in paragraph but not in cell", () => {
      const para = new Paragraph();
      para.addText("test");
      const run = para.getRuns()[0]!;

      // Paragraph not in a cell
      expect(run.getEffectiveBold()).toBeUndefined();
    });

    it("should traverse parent chain for run in table cell", () => {
      const table = new Table(2, 2, { style: "TableGrid" });
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("100000000000"); // firstRow

      const para = cell.createParagraph();
      para.addText("test");
      const run = para.getRuns()[0]!;

      // Verify parent chain is established
      expect((run as any)._getParentParagraph()).toBe(para);
      expect(para._getParentCell()).toBe(cell);
      expect(para.isInTableCell()).toBe(true);
      expect(para.getTableConditionalStyle()).toBe("100000000000");
      expect(cell.getTableStyleId()).toBe("TableGrid");

      // Without Document/StylesManager, style resolution returns undefined
      // (Table created directly without Document integration)
      expect(run.getEffectiveBold()).toBeUndefined();
    });
  });

  describe("Style Resolution via Document", () => {
    it("should resolve bold from table conditional formatting (firstRow)", () => {
      const doc = new Document();

      // Create table style with firstRow bold
      const stylesManager = doc.getStylesManager();
      const tableStyle = stylesManager.createTableStyle(
        "TestTableStyle",
        "Test Table Style"
      );
      tableStyle.addConditionalFormatting({
        type: "firstRow",
        runFormatting: { bold: true },
      });

      // Create table via Document (gets StylesManager injected)
      const table = doc.createTable(2, 2);
      table.setStyle("TestTableStyle");

      // Set cnfStyle on first row cell
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("100000000000"); // firstRow

      const para = cell.createParagraph();
      para.addText("Header");
      const run = para.getRuns()[0]!;

      // Should resolve bold from table style's firstRow conditional
      expect(run.getEffectiveBold()).toBe(true);
    });

    it("should resolve italic from table conditional formatting (lastCol)", () => {
      const doc = new Document();

      // Create table style with lastCol italic
      const stylesManager = doc.getStylesManager();
      const tableStyle = stylesManager.createTableStyle(
        "ItalicColStyle",
        "Italic Column Style"
      );
      tableStyle.addConditionalFormatting({
        type: "lastCol",
        runFormatting: { italic: true },
      });

      const table = doc.createTable(2, 2);
      table.setStyle("ItalicColStyle");

      // Set cnfStyle on last column cell
      const cell = table.getRow(0)!.getCell(1)!;
      cell.setConditionalStyle("000100000000"); // lastCol

      const para = cell.createParagraph();
      para.addText("Last Column");
      const run = para.getRuns()[0]!;

      expect(run.getEffectiveItalic()).toBe(true);
    });

    it("should resolve color from wholeTable conditional", () => {
      const doc = new Document();

      // Create table style with wholeTable color
      const stylesManager = doc.getStylesManager();
      const tableStyle = stylesManager.createTableStyle(
        "ColoredTableStyle",
        "Colored Table Style"
      );
      tableStyle.addConditionalFormatting({
        type: "wholeTable",
        runFormatting: { color: "FF0000" },
      });

      const table = doc.createTable(2, 2);
      table.setStyle("ColoredTableStyle");

      // Any cell without specific conditional should get wholeTable styling
      const cell = table.getRow(1)!.getCell(0)!;
      cell.setConditionalStyle("000000000000"); // no specific conditional

      const para = cell.createParagraph();
      para.addText("Normal cell");
      const run = para.getRuns()[0]!;

      expect(run.getEffectiveColor()).toBe("FF0000");
    });

    it("should prioritize direct formatting over conditional", () => {
      const doc = new Document();

      // Create table style with firstRow bold
      const stylesManager = doc.getStylesManager();
      const tableStyle = stylesManager.createTableStyle(
        "BoldHeaderStyle",
        "Bold Header Style"
      );
      tableStyle.addConditionalFormatting({
        type: "firstRow",
        runFormatting: { bold: true },
      });

      const table = doc.createTable(2, 2);
      table.setStyle("BoldHeaderStyle");

      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("100000000000"); // firstRow

      const para = cell.createParagraph();
      // Create run with explicit bold: false
      const run = new Run("Not bold", { bold: false });
      para.addRun(run);

      // Direct formatting (bold: false) should take precedence
      expect(run.getEffectiveBold()).toBe(false);
    });

    it("should prioritize corner over edge conditionals", () => {
      const doc = new Document();

      // Create table style with nwCell (corner) and firstRow (edge)
      const stylesManager = doc.getStylesManager();
      const tableStyle = stylesManager.createTableStyle(
        "CornerEdgeStyle",
        "Corner Edge Style"
      );
      tableStyle.addConditionalFormatting({
        type: "firstRow",
        runFormatting: { color: "0000FF" }, // blue for edge
      });
      tableStyle.addConditionalFormatting({
        type: "nwCell",
        runFormatting: { color: "FF0000" }, // red for corner
      });

      const table = doc.createTable(2, 2);
      table.setStyle("CornerEdgeStyle");

      // Cell is both firstRow AND nwCell (top-left corner)
      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("100000000100"); // firstRow + nwCell

      const para = cell.createParagraph();
      para.addText("Corner cell");
      const run = para.getRuns()[0]!;

      // Corner (nwCell) should take priority over edge (firstRow)
      expect(run.getEffectiveColor()).toBe("FF0000");
    });

    it("should return undefined if no table style defined", () => {
      const doc = new Document();

      // Create table without style
      const table = doc.createTable(2, 2);

      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("100000000000");

      const para = cell.createParagraph();
      para.addText("No style");
      const run = para.getRuns()[0]!;

      // No table style means no conditional formatting to resolve
      expect(run.getEffectiveBold()).toBeUndefined();
    });

    it("should return undefined if style has no conditional formatting", () => {
      const doc = new Document();

      // Create table style without conditional formatting
      const stylesManager = doc.getStylesManager();
      stylesManager.createTableStyle("EmptyStyle", "Empty Style");

      const table = doc.createTable(2, 2);
      table.setStyle("EmptyStyle");

      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("100000000000");

      const para = cell.createParagraph();
      para.addText("Empty style");
      const run = para.getRuns()[0]!;

      expect(run.getEffectiveBold()).toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should handle paragraph moved between cells", () => {
      const cell1 = new TableCell();
      const cell2 = new TableCell();

      const para = cell1.createParagraph("test");
      expect(para._getParentCell()).toBe(cell1);

      // Remove from cell1
      cell1.removeParagraph(0);
      expect(para._getParentCell()).toBeUndefined();

      // Add to cell2
      cell2.addParagraph(para);
      expect(para._getParentCell()).toBe(cell2);
    });

    it("should handle deeply nested table structure", () => {
      // Create a 3x3 table
      const table = new Table(3, 3, { style: "DeepTable" });

      // Get the center cell
      const centerCell = table.getRow(1)!.getCell(1)!;
      centerCell.setConditionalStyle("000000100000"); // band1Horz

      const para = centerCell.createParagraph("center");
      para.addText("text");
      const run = para.getRuns()[0];

      // Verify full chain works
      expect((run as any)._getParentParagraph()).toBe(para);
      expect(para._getParentCell()).toBe(centerCell);
      expect(para.getTableConditionalStyle()).toBe("000000100000");
      expect(centerCell.getTableStyleId()).toBe("DeepTable");
    });
  });

  describe("Default Bold via tblLook (no table style)", () => {
    it("should apply default bold for firstColumn when tblLook.firstColumn is enabled", () => {
      const doc = new Document();

      // Create table without explicit style, but with tblLook
      const table = doc.createTable(2, 2);
      table.setTblLook("0080"); // firstColumn bit set (0x0080)

      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("001000000000"); // firstCol

      const para = cell.createParagraph();
      para.addText("First Column Cell");
      const run = para.getRuns()[0]!;

      // Should return bold=true based on tblLook default
      expect(run.getEffectiveBold()).toBe(true);
    });

    it("should apply default bold for firstRow when tblLook.firstRow is enabled", () => {
      const doc = new Document();

      const table = doc.createTable(2, 2);
      table.setTblLook("0020"); // firstRow bit set (0x0020)

      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("100000000000"); // firstRow

      const para = cell.createParagraph();
      para.addText("Header Row");
      const run = para.getRuns()[0]!;

      expect(run.getEffectiveBold()).toBe(true);
    });

    it("should NOT apply default bold when tblLook flag is not enabled", () => {
      const doc = new Document();

      // Table has NO tblLook flags set
      const table = doc.createTable(2, 2);
      table.setTblLook("0000");

      const cell = table.getRow(0)!.getCell(0)!;
      cell.setConditionalStyle("001000000000"); // firstCol

      const para = cell.createParagraph();
      para.addText("No Bold");
      const run = para.getRuns()[0]!;

      // Should NOT be bold - tblLook.firstColumn is not enabled
      expect(run.getEffectiveBold()).toBeUndefined();
    });

    it("should decode tblLook hex string correctly", () => {
      const table = new Table(2, 2);
      // 0x01E0 = 0000 0001 1110 0000
      // bit 5 (0x0020): firstRow = 1
      // bit 6 (0x0040): lastRow = 1
      // bit 7 (0x0080): firstColumn = 1
      // bit 8 (0x0100): lastColumn = 1
      table.setTblLook("01E0");

      const flags = table.getTblLookFlags();
      expect(flags.firstRow).toBe(true);
      expect(flags.lastRow).toBe(true);
      expect(flags.firstColumn).toBe(true);
      expect(flags.lastColumn).toBe(true);
      expect(flags.noHBand).toBe(false);
      expect(flags.noVBand).toBe(false);
    });
  });
});
