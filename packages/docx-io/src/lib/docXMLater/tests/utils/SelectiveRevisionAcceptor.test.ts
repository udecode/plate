/**
 * Tests for SelectiveRevisionAcceptor
 */

import { SelectiveRevisionAcceptor } from '../../src/utils/SelectiveRevisionAcceptor';
import { Revision, RevisionType } from '../../src/elements/Revision';
import { RevisionManager } from '../../src/elements/RevisionManager';
import { Run } from '../../src/elements/Run';

// Mock Document class for testing
class MockDocument {
  private revisionManager: RevisionManager;

  constructor() {
    this.revisionManager = new RevisionManager();
  }

  getRevisionManager(): RevisionManager {
    return this.revisionManager;
  }

  addRevision(
    type: RevisionType,
    author: string,
    text: string,
    date?: Date
  ): Revision {
    const run = new Run(text);
    const revision = new Revision({
      author,
      type,
      content: run,
      date: date || new Date(),
    });
    this.revisionManager.register(revision);
    return revision;
  }
}

describe('SelectiveRevisionAcceptor', () => {
  describe('accept', () => {
    it('should accept revisions matching criteria', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('insert', 'Bob', 'Text 2');
      doc.addRevision('insert', 'Alice', 'Text 3');

      const result = SelectiveRevisionAcceptor.accept(doc as any, {
        authors: ['Alice'],
      });

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
      expect(result.summary.acceptedCount).toBe(2);
      expect(result.summary.remainingCount).toBe(1);
    });

    it('should return empty result for document without revision manager', () => {
      const doc = { getRevisionManager: () => null };
      const result = SelectiveRevisionAcceptor.accept(doc as any, {
        types: ['insert'],
      });

      expect(result.accepted).toHaveLength(0);
      expect(result.remaining).toHaveLength(0);
      expect(result.summary.totalProcessed).toBe(0);
    });

    it('should accept nothing if no criteria matches', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('insert', 'Bob', 'Text 2');

      const result = SelectiveRevisionAcceptor.accept(doc as any, {
        authors: ['Carol'], // No revisions by Carol
      });

      expect(result.accepted).toHaveLength(0);
      expect(result.remaining).toHaveLength(2);
    });
  });

  describe('reject', () => {
    it('should reject revisions matching criteria', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');
      doc.addRevision('insert', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.reject(doc as any, {
        types: ['delete'],
      });

      expect(result.rejected).toHaveLength(1);
      expect(result.remaining).toHaveLength(2);
      expect(result.summary.rejectedCount).toBe(1);
    });
  });

  describe('preview', () => {
    it('should preview accept action', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text');

      const result = SelectiveRevisionAcceptor.preview(
        doc as any,
        {
          authors: ['Alice'],
        },
        'accept'
      );

      expect(result.accepted).toHaveLength(1);
      expect(result.rejected).toHaveLength(0);
    });

    it('should preview reject action', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text');

      const result = SelectiveRevisionAcceptor.preview(
        doc as any,
        {
          authors: ['Alice'],
        },
        'reject'
      );

      expect(result.accepted).toHaveLength(0);
      expect(result.rejected).toHaveLength(1);
    });
  });

  describe('acceptByAuthor', () => {
    it('should accept all revisions by specific author', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('insert', 'Bob', 'Text 2');
      doc.addRevision('delete', 'Alice', 'Text 3');

      const result = SelectiveRevisionAcceptor.acceptByAuthor(
        doc as any,
        'Alice'
      );

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('rejectByAuthor', () => {
    it('should reject all revisions by specific author', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('insert', 'Bob', 'Text 2');

      const result = SelectiveRevisionAcceptor.rejectByAuthor(
        doc as any,
        'Alice'
      );

      expect(result.rejected).toHaveLength(1);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('acceptByType', () => {
    it('should accept all revisions of specific types', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');
      doc.addRevision('insert', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.acceptByType(doc as any, [
        'insert',
      ]);

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('rejectByType', () => {
    it('should reject all revisions of specific types', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');

      const result = SelectiveRevisionAcceptor.rejectByType(doc as any, [
        'delete',
      ]);

      expect(result.rejected).toHaveLength(1);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('acceptBeforeDate', () => {
    it('should accept revisions before cutoff date', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1', new Date('2024-01-01'));
      doc.addRevision('insert', 'Bob', 'Text 2', new Date('2024-06-15'));
      doc.addRevision('insert', 'Carol', 'Text 3', new Date('2024-12-31'));

      const result = SelectiveRevisionAcceptor.acceptBeforeDate(
        doc as any,
        new Date('2024-06-01')
      );

      expect(result.accepted).toHaveLength(1);
      expect(result.remaining).toHaveLength(2);
    });
  });

  describe('acceptAfterDate', () => {
    it('should accept revisions after start date', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1', new Date('2024-01-01'));
      doc.addRevision('insert', 'Bob', 'Text 2', new Date('2024-06-15'));
      doc.addRevision('insert', 'Carol', 'Text 3', new Date('2024-12-31'));

      const result = SelectiveRevisionAcceptor.acceptAfterDate(
        doc as any,
        new Date('2024-06-01')
      );

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('acceptInsertionsOnly', () => {
    it('should accept only insertions', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');
      doc.addRevision('insert', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.acceptInsertionsOnly(doc as any);

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('acceptDeletionsOnly', () => {
    it('should accept only deletions', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('delete', 'Bob', 'Text 2');
      doc.addRevision('delete', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.acceptDeletionsOnly(doc as any);

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('rejectFormattingChanges', () => {
    it('should reject formatting changes', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('runPropertiesChange', 'Bob', 'Text 2');
      doc.addRevision('paragraphPropertiesChange', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.rejectFormattingChanges(
        doc as any
      );

      expect(result.rejected).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('acceptContentChangesOnly', () => {
    it('should accept only content changes', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('runPropertiesChange', 'Bob', 'Text 2');
      doc.addRevision('delete', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.acceptContentChangesOnly(
        doc as any
      );

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('category filtering', () => {
    it('should correctly categorize table changes', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('tableCellInsert', 'Bob', 'Text 2');
      doc.addRevision('tableCellDelete', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.accept(doc as any, {
        categories: ['table'],
      });

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });

    it('should correctly categorize structural changes', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1');
      doc.addRevision('moveFrom', 'Bob', 'Text 2');
      doc.addRevision('moveTo', 'Carol', 'Text 3');

      const result = SelectiveRevisionAcceptor.accept(doc as any, {
        categories: ['structural'],
      });

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('custom filter', () => {
    it('should apply custom filter function', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Short');
      doc.addRevision('insert', 'Bob', 'A longer text here');
      doc.addRevision('insert', 'Carol', 'Even longer text content');

      const result = SelectiveRevisionAcceptor.accept(doc as any, {
        custom: (rev) => {
          const text = rev
            .getRuns()
            .map((r) => r.getText())
            .join('');
          return text.length > 10;
        },
      });

      expect(result.accepted).toHaveLength(2);
      expect(result.remaining).toHaveLength(1);
    });
  });

  describe('combined criteria', () => {
    it('should combine multiple criteria with AND logic', () => {
      const doc = new MockDocument();
      doc.addRevision('insert', 'Alice', 'Text 1', new Date('2024-01-01'));
      doc.addRevision('insert', 'Alice', 'Text 2', new Date('2024-06-15'));
      doc.addRevision('delete', 'Alice', 'Text 3', new Date('2024-01-01'));
      doc.addRevision('insert', 'Bob', 'Text 4', new Date('2024-01-01'));

      const result = SelectiveRevisionAcceptor.accept(doc as any, {
        types: ['insert'],
        authors: ['Alice'],
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2024-06-01'),
        },
      });

      // Only "Text 1" matches all criteria (insert + Alice + before June 2024)
      expect(result.accepted).toHaveLength(1);
      expect(result.remaining).toHaveLength(3);
    });
  });
});
