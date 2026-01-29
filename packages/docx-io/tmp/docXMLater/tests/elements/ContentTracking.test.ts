/**
 * Tests for content addition/deletion tracking in Paragraph and Run
 */

import { Document } from "../../src/core/Document";
import { Paragraph } from "../../src/elements/Paragraph";
import { Run } from "../../src/elements/Run";
import { Revision } from "../../src/elements/Revision";
import { Hyperlink } from "../../src/elements/Hyperlink";

describe("Content Tracking", () => {
  describe("Paragraph.addRun() with tracking", () => {
    it("should wrap run in insert revision when tracking enabled", async () => {
      const doc = new Document();
      doc.enableTrackChanges({ author: "TestUser" });

      const para = doc.createParagraph();
      const run = new Run("Tracked text");
      para.addRun(run);

      // Content should contain a revision, not the plain run
      const content = para.getContent();
      expect(content.length).toBe(1);
      expect(content[0]).toBeInstanceOf(Revision);

      const revision = content[0] as Revision;
      expect(revision.getType()).toBe("insert");
      expect(revision.getAuthor()).toBe("TestUser");
    });

    it("should add run directly when tracking disabled", () => {
      const doc = new Document();
      // Don't enable track changes

      const para = doc.createParagraph();
      const run = new Run("Plain text");
      para.addRun(run);

      const content = para.getContent();
      expect(content.length).toBe(1);
      expect(content[0]).toBeInstanceOf(Run);
      expect(content[0]).toBe(run);
    });

    it("should set parent reference on run", () => {
      const doc = new Document();
      const para = doc.createParagraph();
      const run = new Run("Test");
      para.addRun(run);

      expect(run._getParentParagraph()).toBe(para);
    });
  });

  describe("Paragraph.addText() with tracking", () => {
    it("should wrap created run in insert revision when tracking enabled", async () => {
      const doc = new Document();
      doc.enableTrackChanges({ author: "TestUser" });

      const para = doc.createParagraph();
      para.addText("Tracked text");

      const content = para.getContent();
      expect(content.length).toBe(1);
      expect(content[0]).toBeInstanceOf(Revision);

      const revision = content[0] as Revision;
      expect(revision.getType()).toBe("insert");
    });

    it("should add run directly when tracking disabled", () => {
      const doc = new Document();

      const para = doc.createParagraph();
      para.addText("Plain text");

      const content = para.getContent();
      expect(content.length).toBe(1);
      expect(content[0]).toBeInstanceOf(Run);
    });
  });

  describe("Paragraph.addHyperlink() with tracking", () => {
    it("should wrap hyperlink in insert revision when tracking enabled", async () => {
      const doc = new Document();
      doc.enableTrackChanges({ author: "TestUser" });

      const para = doc.createParagraph();
      para.addHyperlink("https://example.com");

      const content = para.getContent();
      expect(content.length).toBe(1);
      expect(content[0]).toBeInstanceOf(Revision);

      const revision = content[0] as Revision;
      expect(revision.getType()).toBe("insert");
    });
  });

  describe("Paragraph.clearContent() with tracking", () => {
    it("should wrap content in delete revisions when tracking enabled", async () => {
      const doc = new Document();
      const para = doc.createParagraph();
      para.addText("Text 1");
      para.addText("Text 2");

      // Enable tracking AFTER adding content
      doc.enableTrackChanges({ author: "TestUser" });

      // Now clear content
      para.clearContent();

      // Content should now be delete revisions
      const content = para.getContent();
      expect(content.length).toBe(2);
      expect(content[0]).toBeInstanceOf(Revision);
      expect(content[1]).toBeInstanceOf(Revision);

      const rev1 = content[0] as Revision;
      const rev2 = content[1] as Revision;
      expect(rev1.getType()).toBe("delete");
      expect(rev2.getType()).toBe("delete");
    });

    it("should clear content directly when tracking disabled", () => {
      const doc = new Document();
      const para = doc.createParagraph();
      para.addText("Text 1");
      para.addText("Text 2");

      para.clearContent();

      const content = para.getContent();
      expect(content.length).toBe(0);
    });
  });

  describe("Paragraph.removeContentAt() with tracking", () => {
    it("should wrap removed item in delete revision when tracking enabled", async () => {
      const doc = new Document();
      const para = doc.createParagraph();
      para.addText("Text 1");
      para.addText("Text 2");

      // Enable tracking AFTER adding content
      doc.enableTrackChanges({ author: "TestUser" });

      // Remove first item
      para.removeContentAt(0);

      // First item should now be a delete revision
      const content = para.getContent();
      expect(content.length).toBe(2);
      expect(content[0]).toBeInstanceOf(Revision);
      expect(content[1]).toBeInstanceOf(Run); // Second item unchanged

      const rev = content[0] as Revision;
      expect(rev.getType()).toBe("delete");
    });
  });

  describe("Run.setText() with tracking", () => {
    it("should create delete/insert revisions when text changes with tracking", async () => {
      const doc = new Document();
      const para = doc.createParagraph();
      para.addText("Original text");

      // Enable tracking AFTER adding content
      doc.enableTrackChanges({ author: "TestUser" });

      // Get the run and change its text
      const runs = para.getRuns();
      expect(runs.length).toBe(1);

      runs[0]!.setText("New text");

      // The paragraph content should now have delete + insert revisions
      const content = para.getContent();
      expect(content.length).toBe(2);
      expect(content[0]).toBeInstanceOf(Revision);
      expect(content[1]).toBeInstanceOf(Revision);

      const deleteRev = content[0] as Revision;
      const insertRev = content[1] as Revision;
      expect(deleteRev.getType()).toBe("delete");
      expect(insertRev.getType()).toBe("insert");

      // Delete revision should contain original text
      const deletedRuns = deleteRev.getRuns();
      expect(deletedRuns.length).toBe(1);
      expect(deletedRuns[0]!.getText()).toBe("Original text");

      // Insert revision should contain new text
      const insertedRuns = insertRev.getRuns();
      expect(insertedRuns.length).toBe(1);
      expect(insertedRuns[0]!.getText()).toBe("New text");
    });

    it("should not create revisions when text changes without tracking", () => {
      const doc = new Document();
      const para = doc.createParagraph();
      para.addText("Original text");

      // No tracking enabled
      const runs = para.getRuns();
      runs[0]!.setText("New text");

      // Content should still be a single run
      const content = para.getContent();
      expect(content.length).toBe(1);
      expect(content[0]).toBeInstanceOf(Run);

      const run = content[0] as Run;
      expect(run.getText()).toBe("New text");
    });

    it("should not create revisions when text unchanged", async () => {
      const doc = new Document();
      const para = doc.createParagraph();
      para.addText("Same text");

      doc.enableTrackChanges({ author: "TestUser" });

      const runs = para.getRuns();
      runs[0]!.setText("Same text"); // Same value

      // Content should remain unchanged
      const content = para.getContent();
      expect(content.length).toBe(1);
      expect(content[0]).toBeInstanceOf(Run);
    });

    it("should not create revisions for runs without parent", async () => {
      const doc = new Document();
      doc.enableTrackChanges({ author: "TestUser" });

      // Create a standalone run (not added to paragraph)
      const run = new Run("Original");
      run.setText("New");

      // No error, and text is changed
      expect(run.getText()).toBe("New");
    });
  });

  describe("RevisionManager registration", () => {
    it("should register insert revisions with RevisionManager", async () => {
      const doc = new Document();
      doc.enableTrackChanges({ author: "TestUser" });

      const para = doc.createParagraph();
      para.addText("Text 1");
      para.addText("Text 2");

      // Check RevisionManager has the revisions
      const revManager = doc.getRevisionManager();
      expect(revManager.getInsertionCount()).toBe(2);
    });

    it("should register delete revisions with RevisionManager", async () => {
      const doc = new Document();
      const para = doc.createParagraph();
      para.addText("Text 1");

      doc.enableTrackChanges({ author: "TestUser" });
      para.clearContent();

      const revManager = doc.getRevisionManager();
      expect(revManager.getDeletionCount()).toBe(1);
    });
  });
});
