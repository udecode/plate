/**
 * Tests for body-level w:del (deleted element) detection in DocumentParser
 *
 * Issue #3: Tables and paragraphs wrapped in w:del at the body level
 * should be skipped during parsing, not parsed as empty elements.
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Document } from "../../src/core/Document";
import { ZipHandler } from "../../src/zip/ZipHandler";

describe("Body-Level Deletion Detection", () => {
  describe("isPositionInsideDel detection", () => {
    it("should skip tables wrapped in w:del at body level", async () => {
      // Create a minimal DOCX with a table wrapped in w:del
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Before deleted table</w:t></w:r>
    </w:p>
    <w:del w:author="Test User" w:date="2025-01-01T00:00:00Z">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>Deleted Cell</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    </w:del>
    <w:p>
      <w:r><w:t>After deleted table</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const zipHandler = await createMinimalDocx(documentXml);
      const buffer = await zipHandler.toBuffer();
      const doc = await Document.loadFromBuffer(buffer);

      // The document should have 2 paragraphs (before and after)
      // but NO tables (the deleted table should be skipped)
      const paragraphs = doc.getParagraphs();
      const tables = doc.getTables();

      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0]!.getText()).toBe("Before deleted table");
      expect(paragraphs[1]!.getText()).toBe("After deleted table");
      expect(tables.length).toBe(0); // Deleted table should not appear

      doc.dispose();
    });

    it("should skip paragraphs wrapped in w:del at body level", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>First paragraph</w:t></w:r>
    </w:p>
    <w:del w:author="Test User" w:date="2025-01-01T00:00:00Z">
      <w:p>
        <w:r><w:t>Deleted paragraph</w:t></w:r>
      </w:p>
    </w:del>
    <w:p>
      <w:r><w:t>Third paragraph</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const zipHandler = await createMinimalDocx(documentXml);
      const buffer = await zipHandler.toBuffer();
      const doc = await Document.loadFromBuffer(buffer);

      const paragraphs = doc.getParagraphs();

      // Should have 2 paragraphs (deleted one should be skipped)
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0]!.getText()).toBe("First paragraph");
      expect(paragraphs[1]!.getText()).toBe("Third paragraph");

      doc.dispose();
    });

    it("should preserve non-deleted tables", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Before table</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc>
          <w:p><w:r><w:t>Normal Cell</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:p>
      <w:r><w:t>After table</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const zipHandler = await createMinimalDocx(documentXml);
      const buffer = await zipHandler.toBuffer();
      const doc = await Document.loadFromBuffer(buffer);

      const paragraphs = doc.getParagraphs();
      const tables = doc.getTables();

      // 3 paragraphs: 2 at body level + 1 inside the table cell
      expect(paragraphs.length).toBe(3);
      expect(tables.length).toBe(1); // Non-deleted table should be preserved

      doc.dispose();
    });

    it("should handle multiple deleted elements", async () => {
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Keep 1</w:t></w:r>
    </w:p>
    <w:del w:author="User1" w:date="2025-01-01T00:00:00Z">
      <w:p>
        <w:r><w:t>Delete 1</w:t></w:r>
      </w:p>
    </w:del>
    <w:p>
      <w:r><w:t>Keep 2</w:t></w:r>
    </w:p>
    <w:del w:author="User2" w:date="2025-01-02T00:00:00Z">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>Delete 2</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    </w:del>
    <w:p>
      <w:r><w:t>Keep 3</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const zipHandler = await createMinimalDocx(documentXml);
      const buffer = await zipHandler.toBuffer();
      const doc = await Document.loadFromBuffer(buffer);

      const paragraphs = doc.getParagraphs();
      const tables = doc.getTables();

      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0]!.getText()).toBe("Keep 1");
      expect(paragraphs[1]!.getText()).toBe("Keep 2");
      expect(paragraphs[2]!.getText()).toBe("Keep 3");
      expect(tables.length).toBe(0); // Both deleted elements skipped

      doc.dispose();
    });

    it("should NOT skip paragraphs containing paragraph-level w:del (run deletions)", async () => {
      // CRITICAL TEST: This was the bug that caused 98% content loss
      // Paragraph-level w:del (deletions inside paragraphs wrapping runs) should NOT
      // cause the entire paragraph to be skipped. Only body-level w:del should be skipped.
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>First paragraph with </w:t></w:r>
      <w:del w:author="Test User" w:date="2025-01-01T00:00:00Z">
        <w:r><w:delText>deleted text</w:delText></w:r>
      </w:del>
      <w:r><w:t> and more text.</w:t></w:r>
    </w:p>
    <w:p>
      <w:del w:author="Test User" w:date="2025-01-01T00:00:00Z">
        <w:r><w:delText>All deleted</w:delText></w:r>
      </w:del>
    </w:p>
    <w:p>
      <w:r><w:t>Third paragraph is normal.</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const zipHandler = await createMinimalDocx(documentXml);
      const buffer = await zipHandler.toBuffer();
      const doc = await Document.loadFromBuffer(buffer);

      const paragraphs = doc.getParagraphs();

      // ALL 3 paragraphs should be preserved
      // Paragraph-level w:del does not cause paragraph skipping
      expect(paragraphs.length).toBe(3);

      doc.dispose();
    });

    it("should NOT skip paragraphs with multiple run-level deletions", async () => {
      // Simulates a complex document with many w:del elements inside paragraphs
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Para 1</w:t></w:r>
      <w:del w:author="A"><w:r><w:delText>del1</w:delText></w:r></w:del>
      <w:del w:author="B"><w:r><w:delText>del2</w:delText></w:r></w:del>
      <w:del w:author="C"><w:r><w:delText>del3</w:delText></w:r></w:del>
    </w:p>
    <w:p>
      <w:r><w:t>Para 2</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Para 3</w:t></w:r>
      <w:del w:author="D"><w:r><w:delText>del4</w:delText></w:r></w:del>
    </w:p>
  </w:body>
</w:document>`;

      const zipHandler = await createMinimalDocx(documentXml);
      const buffer = await zipHandler.toBuffer();
      const doc = await Document.loadFromBuffer(buffer);

      const paragraphs = doc.getParagraphs();

      // ALL paragraphs should be preserved despite run-level deletions
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0]!.getText()).toContain("Para 1");
      expect(paragraphs[1]!.getText()).toBe("Para 2");
      expect(paragraphs[2]!.getText()).toContain("Para 3");

      doc.dispose();
    });
  });
});

/**
 * Helper function to create a minimal DOCX file with custom document.xml content
 */
async function createMinimalDocx(documentXml: string): Promise<ZipHandler> {
  const zipHandler = new ZipHandler();

  // [Content_Types].xml
  zipHandler.addFile(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zipHandler.addFile(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/_rels/document.xml.rels
  zipHandler.addFile(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
  );

  // word/document.xml
  zipHandler.addFile("word/document.xml", documentXml);

  return zipHandler;
}
