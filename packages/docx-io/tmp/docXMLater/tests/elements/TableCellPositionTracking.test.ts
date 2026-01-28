/**
 * Tests for TableCell position tracking and trailing blank removal
 * Critical bug fix: rawNestedContent positions must update when paragraphs are added/removed
 */

import { Document } from "../../src/core/Document";
import { Table } from "../../src/elements/Table";
import { TableCell } from "../../src/elements/TableCell";
import { Paragraph } from "../../src/elements/Paragraph";

describe("TableCell Position Tracking", () => {
  describe("removeParagraph position updates", () => {
    it("should decrement rawNestedContent positions when paragraph is removed before nested content", () => {
      const cell = new TableCell();

      // Add paragraphs
      cell.createParagraph("Para 0");
      cell.createParagraph("Para 1 - blank");
      cell.createParagraph("Para 2");

      // Simulate nested content at position 2 (after Para 1)
      cell.addRawNestedContent(2, "<w:tbl>nested table</w:tbl>", "table");

      // Verify initial position
      const initialContent = cell.getRawNestedContent();
      expect(initialContent[0]?.position).toBe(2);

      // Remove paragraph at index 1 (before nested content)
      cell.removeParagraph(1);

      // Position should decrement from 2 to 1
      const updatedContent = cell.getRawNestedContent();
      expect(updatedContent[0]?.position).toBe(1);
    });

    it("should NOT change rawNestedContent position when paragraph is removed after nested content", () => {
      const cell = new TableCell();

      // Add paragraphs
      cell.createParagraph("Para 0");
      cell.createParagraph("Para 1");
      cell.createParagraph("Para 2 - to remove");

      // Simulate nested content at position 1 (after Para 0)
      cell.addRawNestedContent(1, "<w:tbl>nested table</w:tbl>", "table");

      // Verify initial position
      expect(cell.getRawNestedContent()[0]?.position).toBe(1);

      // Remove paragraph at index 2 (after nested content position)
      cell.removeParagraph(2);

      // Position should remain 1
      expect(cell.getRawNestedContent()[0]?.position).toBe(1);
    });

    it("should handle multiple rawNestedContent items correctly", () => {
      const cell = new TableCell();

      // Add paragraphs
      cell.createParagraph("Para 0");
      cell.createParagraph("Para 1 - blank");
      cell.createParagraph("Para 2");
      cell.createParagraph("Para 3");

      // Add nested content at different positions
      cell.addRawNestedContent(1, "<w:tbl>table1</w:tbl>", "table");
      cell.addRawNestedContent(3, "<w:tbl>table2</w:tbl>", "table");

      // Verify initial positions
      const content = cell.getRawNestedContent();
      expect(content[0]?.position).toBe(1);
      expect(content[1]?.position).toBe(3);

      // Remove paragraph at index 1
      cell.removeParagraph(1);

      // First item position should stay 1 (removed at same position)
      // Second item position should decrement from 3 to 2
      const updated = cell.getRawNestedContent();
      expect(updated[0]?.position).toBe(1);
      expect(updated[1]?.position).toBe(2);
    });
  });

  describe("addParagraphAt position updates", () => {
    it("should increment rawNestedContent positions when paragraph is inserted before nested content", () => {
      const cell = new TableCell();

      // Add paragraphs
      cell.createParagraph("Para 0");
      cell.createParagraph("Para 1");

      // Simulate nested content at position 1 (after Para 0)
      cell.addRawNestedContent(1, "<w:tbl>nested table</w:tbl>", "table");

      // Verify initial position
      expect(cell.getRawNestedContent()[0]?.position).toBe(1);

      // Insert new paragraph at index 0
      const newPara = new Paragraph();
      newPara.addText("Inserted Para");
      cell.addParagraphAt(0, newPara);

      // Position should increment from 1 to 2
      expect(cell.getRawNestedContent()[0]?.position).toBe(2);
    });

    it("should NOT change rawNestedContent position when paragraph is added after nested content", () => {
      const cell = new TableCell();

      // Add paragraphs
      cell.createParagraph("Para 0");
      cell.createParagraph("Para 1");

      // Simulate nested content at position 1 (after Para 0)
      cell.addRawNestedContent(1, "<w:tbl>nested table</w:tbl>", "table");

      // Verify initial position
      expect(cell.getRawNestedContent()[0]?.position).toBe(1);

      // Insert new paragraph at end
      const newPara = new Paragraph();
      newPara.addText("Appended Para");
      cell.addParagraphAt(10, newPara); // Index beyond array pushes to end

      // Position should remain 1
      expect(cell.getRawNestedContent()[0]?.position).toBe(1);
    });
  });

  describe("removeTrailingBlankParagraphs", () => {
    it("should remove trailing blank paragraphs from cell", () => {
      const cell = new TableCell();

      cell.createParagraph("Content");
      cell.createParagraph(""); // blank
      cell.createParagraph(""); // blank

      expect(cell.getParagraphs().length).toBe(3);

      const removed = cell.removeTrailingBlankParagraphs();

      expect(removed).toBe(2);
      expect(cell.getParagraphs().length).toBe(1);
      expect(cell.getParagraphs()[0]?.getText()).toBe("Content");
    });

    it("should keep at least one paragraph in cell", () => {
      const cell = new TableCell();

      cell.createParagraph(""); // blank
      cell.createParagraph(""); // blank

      expect(cell.getParagraphs().length).toBe(2);

      const removed = cell.removeTrailingBlankParagraphs();

      // Should only remove 1, keeping at least one paragraph
      expect(removed).toBe(1);
      expect(cell.getParagraphs().length).toBe(1);
    });

    it("should stop at non-blank paragraph", () => {
      const cell = new TableCell();

      cell.createParagraph("Content 1");
      cell.createParagraph("Content 2");
      cell.createParagraph(""); // blank at end

      const removed = cell.removeTrailingBlankParagraphs();

      expect(removed).toBe(1);
      expect(cell.getParagraphs().length).toBe(2);
    });

    it("should respect preserve flag when ignorePreserveFlag is false", () => {
      const cell = new TableCell();

      cell.createParagraph("Content");
      const blankPara = cell.createParagraph("");
      blankPara.setPreserved(true);

      const removed = cell.removeTrailingBlankParagraphs({
        ignorePreserveFlag: false,
      });

      expect(removed).toBe(0);
      expect(cell.getParagraphs().length).toBe(2);
    });

    it("should ignore preserve flag when ignorePreserveFlag is true", () => {
      const cell = new TableCell();

      cell.createParagraph("Content");
      const blankPara = cell.createParagraph("");
      blankPara.setPreserved(true);

      const removed = cell.removeTrailingBlankParagraphs({
        ignorePreserveFlag: true,
      });

      expect(removed).toBe(1);
      expect(cell.getParagraphs().length).toBe(1);
    });

    it("should NOT remove blank if raw nested content is positioned after it", () => {
      const cell = new TableCell();

      cell.createParagraph("Content");
      cell.createParagraph(""); // blank

      // Nested content positioned at the end (after the blank)
      cell.addRawNestedContent(2, "<w:tbl>nested</w:tbl>", "table");

      const removed = cell.removeTrailingBlankParagraphs();

      // Should NOT remove the blank because nested content depends on it
      expect(removed).toBe(0);
      expect(cell.getParagraphs().length).toBe(2);
    });
  });
});

describe("Document removeTrailingBlanksInTableCells", () => {
  it("should remove trailing blanks from all table cells", async () => {
    const doc = Document.create();
    const table = new Table(2, 2);

    // Cell 0,0: content + trailing blanks
    const cell00 = table.getCell(0, 0);
    cell00?.createParagraph("Cell 0,0 content");
    cell00?.createParagraph("");
    cell00?.createParagraph("");

    // Cell 0,1: content only
    const cell01 = table.getCell(0, 1);
    cell01?.createParagraph("Cell 0,1 content");

    // Cell 1,0: trailing blanks only (should keep one)
    const cell10 = table.getCell(1, 0);
    cell10?.createParagraph("");
    cell10?.createParagraph("");

    // Cell 1,1: content + one trailing blank
    const cell11 = table.getCell(1, 1);
    cell11?.createParagraph("Cell 1,1 content");
    cell11?.createParagraph("");

    doc.addTable(table);

    const removed = doc.removeTrailingBlanksInTableCells();

    // Cell 0,0: 2 blanks removed
    // Cell 0,1: 0 blanks removed
    // Cell 1,0: 1 blank removed (keeps one)
    // Cell 1,1: 1 blank removed
    expect(removed).toBe(4);

    // Verify cell contents
    const tables = doc.getTables();
    expect(tables[0]?.getCell(0, 0)?.getParagraphs().length).toBe(1);
    expect(tables[0]?.getCell(0, 1)?.getParagraphs().length).toBe(1);
    expect(tables[0]?.getCell(1, 0)?.getParagraphs().length).toBe(1);
    expect(tables[0]?.getCell(1, 1)?.getParagraphs().length).toBe(1);
  });

  it("should be called by removeExtraBlankParagraphs when option is enabled", async () => {
    const doc = Document.create();
    const table = new Table(1, 1);

    const cell = table.getCell(0, 0);
    cell?.createParagraph("Content");
    cell?.createParagraph(""); // trailing blank

    doc.addTable(table);

    const result = doc.removeExtraBlankParagraphs({
      addStructureBlankLines: false,
      removeTrailingCellBlanks: true,
    });

    expect(result.removed).toBeGreaterThanOrEqual(1);
    expect(doc.getTables()[0]?.getCell(0, 0)?.getParagraphs().length).toBe(1);
  });

  it("should call removeTrailingBlanksInTableCells directly to remove trailing blanks", async () => {
    const doc = Document.create();
    const table = new Table(1, 1);

    const cell = table.getCell(0, 0);
    cell?.createParagraph("Content");
    cell?.createParagraph(""); // trailing blank

    doc.addTable(table);

    // Call the new method directly
    const removed = doc.removeTrailingBlanksInTableCells();

    expect(removed).toBe(1);
    expect(doc.getTables()[0]?.getCell(0, 0)?.getParagraphs().length).toBe(1);
  });
});
