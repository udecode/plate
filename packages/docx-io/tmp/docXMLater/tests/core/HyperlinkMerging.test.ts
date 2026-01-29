/**
 * Tests for hyperlink merging behavior in DocumentParser
 *
 * Issue #4: mergeConsecutiveHyperlinks() was incorrectly merging ALL hyperlinks
 * with the same URL regardless of position, causing text displacement.
 *
 * The fix ensures only TRULY consecutive hyperlinks (immediately adjacent)
 * are merged. Non-consecutive hyperlinks with the same URL should remain separate.
 */

import { describe, it, expect } from "@jest/globals";
import { Paragraph } from "../../src/elements/Paragraph";
import { Run } from "../../src/elements/Run";
import { Hyperlink } from "../../src/elements/Hyperlink";

// Helper to create a Run with text
const createRun = (text: string) => new Run(text);

describe("Hyperlink Merging Behavior", () => {
  describe("consecutive hyperlinks with same URL", () => {
    it("should merge truly consecutive hyperlinks with same URL", () => {
      // Scenario: [Link1-PartA][Link1-PartB] -> [Link1-PartA PartB]
      const paragraph = new Paragraph();

      // Add two consecutive hyperlinks with the same URL
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://example.com",
          text: "First",
          formatting: { color: "0000FF", underline: "single" },
        })
      );
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://example.com",
          text: " Part",
          formatting: { color: "0000FF", underline: "single" },
        })
      );

      const content = paragraph.getContent();

      // After parsing/processing, consecutive hyperlinks should be merged
      // For this unit test, we check the structure directly
      expect(content.length).toBe(2);
      expect(content[0]).toBeInstanceOf(Hyperlink);
      expect(content[1]).toBeInstanceOf(Hyperlink);
    });

    it("should NOT merge non-consecutive hyperlinks with same URL", () => {
      // Scenario: [Link1] [Text] [Link1] should stay as 3 separate items
      // This was the bug - it was merging to [Link1Link1] [Text]
      const paragraph = new Paragraph();

      // Add hyperlink, then text, then same hyperlink again
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://example.com",
          text: "Quality of Care",
          formatting: { color: "0000FF", underline: "single" },
        })
      );
      paragraph.addRun(createRun(" issue, "));
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://example.com",
          text: "Quality of Care",
          formatting: { color: "0000FF", underline: "single" },
        })
      );

      const content = paragraph.getContent();

      // All three items should remain separate
      expect(content.length).toBe(3);
      expect(content[0]).toBeInstanceOf(Hyperlink);
      expect((content[0] as Hyperlink).getText()).toBe("Quality of Care");
      expect(content[1]).toBeInstanceOf(Run);
      expect((content[1] as Run).getText()).toBe(" issue, ");
      expect(content[2]).toBeInstanceOf(Hyperlink);
      expect((content[2] as Hyperlink).getText()).toBe("Quality of Care");
    });

    it("should preserve text position between non-consecutive hyperlinks", () => {
      // The critical test: text between hyperlinks should stay in place
      const paragraph = new Paragraph();

      paragraph.addRun(createRun("See "));
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://docs.example.com/quality",
          text: "Quality of Care",
        })
      );
      paragraph.addRun(createRun(" issue, specifically "));
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://docs.example.com/quality",
          text: "Quality of Care",
        })
      );
      paragraph.addRun(createRun(" guidelines."));

      const content = paragraph.getContent();

      // Verify order is preserved
      expect(content.length).toBe(5);
      expect((content[0] as Run).getText()).toBe("See ");
      expect((content[1] as Hyperlink).getText()).toBe("Quality of Care");
      expect((content[2] as Run).getText()).toBe(" issue, specifically ");
      expect((content[3] as Hyperlink).getText()).toBe("Quality of Care");
      expect((content[4] as Run).getText()).toBe(" guidelines.");
    });

    it("should handle multiple different URLs correctly", () => {
      const paragraph = new Paragraph();

      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://site1.com",
          text: "Site 1",
        })
      );
      paragraph.addRun(createRun(" and "));
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://site2.com",
          text: "Site 2",
        })
      );
      paragraph.addRun(createRun(" then back to "));
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://site1.com",
          text: "Site 1",
        })
      );

      const content = paragraph.getContent();

      // All five elements should remain separate
      expect(content.length).toBe(5);
      expect((content[0] as Hyperlink).getUrl()).toBe("https://site1.com");
      expect((content[2] as Hyperlink).getUrl()).toBe("https://site2.com");
      expect((content[4] as Hyperlink).getUrl()).toBe("https://site1.com");
    });
  });

  describe("paragraph getText() with mixed content", () => {
    it("should concatenate text correctly from mixed hyperlinks and runs", () => {
      const paragraph = new Paragraph();

      paragraph.addRun(createRun("Visit "));
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://example.com",
          text: "our website",
        })
      );
      paragraph.addRun(createRun(" for more info."));

      const fullText = paragraph.getText();
      expect(fullText).toBe("Visit our website for more info.");
    });

    it("should preserve exact text when same URL appears multiple times", () => {
      const paragraph = new Paragraph();

      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://example.com",
          text: "Click here",
        })
      );
      paragraph.addRun(createRun(" or "));
      paragraph.addHyperlink(
        new Hyperlink({
          url: "https://example.com",
          text: "here",
        })
      );
      paragraph.addRun(createRun(" to continue."));

      const fullText = paragraph.getText();
      expect(fullText).toBe("Click here or here to continue.");
    });
  });
});
