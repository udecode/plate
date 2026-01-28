/**
 * Regression Test: Punctuation Ordering Bug Fix
 *
 * This test verifies that punctuation and hyperlinks are preserved in
 * the correct order during parsing. Specifically, it tests the fix for
 * the bug where ".Aetna Compass..." was being parsed as "Aetna. Compass...".
 *
 * Root Cause: The old parser grouped paragraph children by type (all runs first,
 * then all hyperlinks) instead of preserving document order. This caused punctuation
 * in separate runs to appear at the beginning instead of the end.
 *
 * Fix: The parseOrderedParagraphChildren() method now scans the raw XML to extract
 * children in document order, preserving the original sequence.
 *
 * Related Issue: GitHub Issue - Punctuation Reordering in Mixed Content Paragraphs
 */

import { Document } from "../../src/core/Document";

describe("Punctuation Ordering - Regression Test", () => {
  describe("Mixed Run and Hyperlink Ordering", () => {
    it("should preserve punctuation before hyperlinks", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Simulate the problematic paragraph structure:
      // <w:r><w:t>.</w:t></w:r><w:hyperlink>...<w:t>Aetna Compass...</w:t>...</w:hyperlink>

      // Add period in first run
      para.addText(".");

      // Add hyperlink with text
      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com/aetna");
      hyperlink.setText("Aetna Compass");
      hyperlink.getFormatting().setColor("0563C1").setUnderline("single");

      // Save and reload to ensure round-trip works
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);
      const reloadedPara = reloadedDoc.getParagraphs()[0]!;
      const text = reloadedPara.getText();

      // Verify punctuation comes BEFORE hyperlink text, not after
      expect(text).toBe(".Aetna Compass");
      expect(text).not.toBe("Aetna. Compass");
      expect(text).not.toBe("Aetna Compass.");
    });

    it("should preserve punctuation after hyperlinks", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Simulate: <w:hyperlink>...<w:t>Link Text</w:t>...</w:hyperlink><w:r><w:t>.</w:t></w:r>

      // Add hyperlink first
      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com");
      hyperlink.setText("Link Text");
      hyperlink.getFormatting().setColor("0563C1").setUnderline("single");

      // Add period in second run
      para.addText(".");

      // Verify through round-trip
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);
      const reloadedPara = reloadedDoc.getParagraphs()[0]!;
      const text = reloadedPara.getText();

      // Verify punctuation comes AFTER hyperlink text
      expect(text).toBe("Link Text.");
      expect(text).not.toBe(".Link Text");
    });

    it("should handle multiple punctuation marks with hyperlinks", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Structure: <run>"X"</run><hyperlink>A</hyperlink><run>!"</run>
      para.addText('"');

      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com/a");
      hyperlink.setText("A");
      hyperlink.getFormatting().setColor("0563C1");

      para.addText('!"');

      // Verify round-trip
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);
      const reloadedPara = reloadedDoc.getParagraphs()[0]!;
      const text = reloadedPara.getText();

      expect(text).toBe('"A!"');
    });

    it("should preserve complex mixed content", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Structure: text - hyperlink - punctuation - text - hyperlink - punctuation
      para.addText("See ");

      const link1 = para.addHyperlink();
      link1.setUrl("https://example.com/1");
      link1.setText("Link 1");
      link1.getFormatting().setColor("0563C1");

      para.addText(", ");
      para.addText("then visit ");

      const link2 = para.addHyperlink();
      link2.setUrl("https://example.com/2");
      link2.setText("Link 2");
      link2.getFormatting().setColor("0563C1");

      para.addText(".");

      // Reload and verify
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);
      const reloadedPara = reloadedDoc.getParagraphs()[0]!;
      const text = reloadedPara.getText();

      expect(text).toBe("See Link 1, then visit Link 2.");
      expect(text).not.toContain(", Link 1");
      expect(text).not.toContain("Link 2 .");
    });

    it("should preserve exact sequence in real-world scenario", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Real-world pattern from the bug report: period, then hyperlink
      para.addText(".");

      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com/compass");
      hyperlink.setText("Aetna Compass - Requests for Formularies");
      hyperlink.getFormatting().setColor("0563C1").setUnderline("single");

      // Verify without round-trip first (direct structure)
      const directText = para.getText();
      expect(directText).toBe(".Aetna Compass - Requests for Formularies");

      // Now verify through round-trip
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);
      const reloadedPara = reloadedDoc.getParagraphs()[0]!;
      const text = reloadedPara.getText();

      expect(text).toBe(".Aetna Compass - Requests for Formularies");
    });
  });

  describe("Edge Cases", () => {
    it("should handle paragraph with only punctuation before hyperlink", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Just punctuation and hyperlink
      para.addText("...");
      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com");
      hyperlink.setText("Link");

      const text = para.getText();
      expect(text).toBe("...Link");
    });

    it("should handle paragraph with only hyperlink and punctuation", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com");
      hyperlink.setText("Link");

      para.addText("!");

      const text = para.getText();
      expect(text).toBe("Link!");
    });

    it("should handle multiple consecutive hyperlinks with punctuation", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      const link1 = para.addHyperlink();
      link1.setUrl("https://example.com/1");
      link1.setText("First");

      para.addText(", ");

      const link2 = para.addHyperlink();
      link2.setUrl("https://example.com/2");
      link2.setText("Second");

      para.addText(".");

      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);
      const reloadedPara = reloadedDoc.getParagraphs()[0]!;
      const text = reloadedPara.getText();

      expect(text).toBe("First, Second.");
    });

    it("should not reorder elements that are already in correct order", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Already correct order: text, hyperlink, text
      para.addText("Click ");

      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com");
      hyperlink.setText("here");

      para.addText(" for more.");

      const text = para.getText();
      expect(text).toBe("Click here for more.");
    });
  });

  describe("XML Structure Preservation", () => {
    it("should generate correct XML order in document.xml", async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Create specific structure to verify
      para.addText(".");

      const hyperlink = para.addHyperlink();
      hyperlink.setUrl("https://example.com");
      hyperlink.setText("Test");

      // Save and check the generated XML
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);

      // Verify the document is valid and parseable
      expect(reloadedDoc.getParagraphs().length).toBe(1);
      const reloadedPara = reloadedDoc.getParagraphs()[0]!;
      const text = reloadedPara.getText();

      // Most importantly: verify order is preserved
      expect(text).toBe(".Test");
    });
  });
});
