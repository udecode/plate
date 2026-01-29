/**
 * Tests for RevisionAwareProcessor
 */

import { RevisionAwareProcessor } from '../../src/utils/RevisionAwareProcessor';
import { Revision, RevisionType } from '../../src/elements/Revision';
import { RevisionManager } from '../../src/elements/RevisionManager';
import { Run } from '../../src/elements/Run';

// Mock Document class for testing
class MockDocument {
  private revisionManager: RevisionManager;
  private paragraphs: any[] = [];
  private zipHandler: any = null;
  private _hasRawXmlRevisions = false;
  private _preserveRawXmlCalled = false;

  constructor() {
    this.revisionManager = new RevisionManager();
  }

  getRevisionManager(): RevisionManager {
    return this.revisionManager;
  }

  getParagraphs() {
    return this.paragraphs;
  }

  getZipHandler() {
    return this.zipHandler;
  }

  // Mock for raw XML revision check
  hasRawXmlRevisions(): boolean {
    return this._hasRawXmlRevisions;
  }

  // Mock for preserving raw XML
  preserveRawXml(): this {
    this._preserveRawXmlCalled = true;
    return this;
  }

  // Mock for accepting all revisions
  async acceptAllRevisions(): Promise<this> {
    // Clear all revisions from the manager (simulating acceptance)
    this.revisionManager.clear();
    return this;
  }

  addRevision(type: RevisionType, author: string, text: string): Revision {
    const run = new Run(text);
    const revision = new Revision({
      author,
      type,
      content: run,
      date: new Date(),
    });
    this.revisionManager.register(revision);
    return revision;
  }

  // Helper for tests to simulate raw XML revisions
  setHasRawXmlRevisions(value: boolean): void {
    this._hasRawXmlRevisions = value;
  }
}

describe('RevisionAwareProcessor', () => {
  describe('hasTrackedChanges', () => {
    it('should return false for document without revisions', () => {
      const doc = new MockDocument();
      expect(RevisionAwareProcessor.hasTrackedChanges(doc as any)).toBe(false);
    });

    it('should return true for document with revisions', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Test');
      expect(RevisionAwareProcessor.hasTrackedChanges(doc as any)).toBe(true);
    });
  });

  describe('getTrackedChangesSummary', () => {
    it('should return null for document without revision manager', () => {
      const doc = { getRevisionManager: () => null };
      expect(
        RevisionAwareProcessor.getTrackedChangesSummary(doc as any)
      ).toBeNull();
    });

    it('should return summary for document with revisions', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');
      doc.addRevision('insert', 'Alice', 'Text 3');

      const summary = RevisionAwareProcessor.getTrackedChangesSummary(
        doc as any
      );

      expect(summary).not.toBeNull();
      expect(summary!.total).toBe(3);
      expect(summary!.insertions).toBe(2);
      expect(summary!.deletions).toBe(1);
      expect(summary!.authors).toContain('Alice');
      expect(summary!.authors).toContain('Bob');
    });
  });

  describe('prepare', () => {
    it('should handle document without revisions', async () => {
      const doc = new MockDocument();
      const result = await RevisionAwareProcessor.prepare(doc as any, {
        mode: 'accept_all',
      });

      expect(result.success).toBe(true);
      expect(result.acceptedRevisions).toHaveLength(0);
      expect(result.preservedRevisions).toHaveLength(0);
    });

    it('should preserve revisions in preserve mode', async () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');

      const result = await RevisionAwareProcessor.prepare(doc as any, {
        mode: 'preserve',
      });

      expect(result.success).toBe(true);
      expect(result.preservedRevisions).toHaveLength(2);
      expect(result.acceptedRevisions).toHaveLength(0);
    });

    it('should track revisions for preserve_and_wrap mode', async () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');

      const result = await RevisionAwareProcessor.prepare(doc as any, {
        mode: 'preserve_and_wrap',
        author: 'Processor',
      });

      expect(result.success).toBe(true);
      expect(result.preservedRevisions).toHaveLength(1);
      expect(result.log.some((l) => l.details.includes('Processor'))).toBe(
        true
      );
    });

    it('should log processing actions', async () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text');

      const result = await RevisionAwareProcessor.prepare(doc as any, {
        mode: 'preserve',
      });

      expect(result.log.length).toBeGreaterThan(0);
      expect(result.log.some((l) => l.action === 'start')).toBe(true);
      expect(result.log.some((l) => l.action === 'complete')).toBe(true);
    });
  });

  describe('acceptSelective', () => {
    it('should filter revisions by type', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');
      doc.addRevision('insert', 'Carol', 'Text 3');

      const accepted = RevisionAwareProcessor.acceptSelective(doc as any, {
        types: ['insert'],
      });

      expect(accepted).toHaveLength(2);
    });

    it('should filter revisions by author', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('insert', 'Bob', 'Text 2');
      doc.addRevision('insert', 'Alice', 'Text 3');

      const accepted = RevisionAwareProcessor.acceptSelective(doc as any, {
        authors: ['Alice'],
      });

      expect(accepted).toHaveLength(2);
    });

    it('should filter revisions by category', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('runPropertiesChange', 'Bob', 'Text 2');
      doc.addRevision('delete', 'Carol', 'Text 3');

      const accepted = RevisionAwareProcessor.acceptSelective(doc as any, {
        categories: ['content'],
      });

      expect(accepted).toHaveLength(2);
    });

    it('should apply custom filter', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Short');
      doc.addRevision('insert', 'Bob', 'This is a much longer text');

      const accepted = RevisionAwareProcessor.acceptSelective(doc as any, {
        custom: (rev) =>
          rev
            .getRuns()
            .map((r) => r.getText())
            .join('').length > 10,
      });

      expect(accepted).toHaveLength(1);
    });
  });

  describe('checkConflict', () => {
    it('should return null for document without revision manager', () => {
      const doc = { getRevisionManager: () => null };
      expect(RevisionAwareProcessor.checkConflict(doc as any, 0)).toBeNull();
    });

    it('should return revision if conflict exists', () => {
      const doc = new MockDocument();
      const revision = doc.addRevision('insert', 'Alice', 'Text');
      // Set location on revision for proper location-based filtering
      revision.setLocation({ paragraphIndex: 0 });

      const conflict = RevisionAwareProcessor.checkConflict(doc as any, 0);
      expect(conflict).not.toBeNull();
    });
  });

  describe('getAffectedRevisions', () => {
    it('should return empty array for document without revision manager', () => {
      const doc = { getRevisionManager: () => null };
      expect(
        RevisionAwareProcessor.getAffectedRevisions(doc as any, 0)
      ).toEqual([]);
    });
  });
});
