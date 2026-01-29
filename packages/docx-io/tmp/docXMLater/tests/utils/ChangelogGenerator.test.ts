/**
 * Tests for ChangelogGenerator
 */

import { ChangelogGenerator, ChangeEntry, ChangeCategory, ConsolidatedChange } from '../../src/utils/ChangelogGenerator';
import { Revision, RevisionType } from '../../src/elements/Revision';
import { Run } from '../../src/elements/Run';

describe('ChangelogGenerator', () => {
  // Helper to create test revisions
  function createRevision(
    type: RevisionType,
    author: string,
    text: string,
    date?: Date
  ): Revision {
    const run = new Run(text);
    return new Revision({
      author,
      type,
      content: run,
      date: date || new Date(),
    });
  }

  describe('categorize', () => {
    it('should categorize insert as content', () => {
      const revision = createRevision('insert', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('content');
    });

    it('should categorize delete as content', () => {
      const revision = createRevision('delete', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('content');
    });

    it('should categorize moveFrom as structural', () => {
      const revision = createRevision('moveFrom', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('structural');
    });

    it('should categorize moveTo as structural', () => {
      const revision = createRevision('moveTo', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('structural');
    });

    it('should categorize runPropertiesChange as formatting', () => {
      const revision = createRevision('runPropertiesChange', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('formatting');
    });

    it('should categorize paragraphPropertiesChange as formatting', () => {
      const revision = createRevision('paragraphPropertiesChange', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('formatting');
    });

    it('should categorize tablePropertiesChange as table', () => {
      const revision = createRevision('tablePropertiesChange', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('table');
    });

    it('should categorize tableCellInsert as table', () => {
      const revision = createRevision('tableCellInsert', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('table');
    });

    it('should categorize sectionPropertiesChange as structural', () => {
      const revision = createRevision('sectionPropertiesChange', 'Test Author', 'test');
      expect(ChangelogGenerator.categorize(revision)).toBe('structural');
    });
  });

  describe('describeRevision', () => {
    it('should describe insertion', () => {
      const revision = createRevision('insert', 'Test Author', 'Hello World');
      const description = ChangelogGenerator.describeRevision(revision);
      expect(description).toContain('Inserted');
      expect(description).toContain('Hello World');
    });

    it('should describe deletion', () => {
      const revision = createRevision('delete', 'Test Author', 'Goodbye');
      const description = ChangelogGenerator.describeRevision(revision);
      expect(description).toContain('Deleted');
      expect(description).toContain('Goodbye');
    });

    it('should truncate long text', () => {
      const longText = 'A'.repeat(100);
      const revision = createRevision('insert', 'Test Author', longText);
      const description = ChangelogGenerator.describeRevision(revision, 20);
      expect(description).toContain('...');
      expect(description.length).toBeLessThan(100);
    });

    it('should describe moveFrom', () => {
      const revision = createRevision('moveFrom', 'Test Author', 'Moved text');
      const description = ChangelogGenerator.describeRevision(revision);
      expect(description).toContain('Moved');
      expect(description).toContain('from here');
    });

    it('should describe moveTo', () => {
      const revision = createRevision('moveTo', 'Test Author', 'Moved text');
      const description = ChangelogGenerator.describeRevision(revision);
      expect(description).toContain('Moved');
      expect(description).toContain('to here');
    });

    it('should describe table cell insert', () => {
      const revision = createRevision('tableCellInsert', 'Test Author', '');
      const description = ChangelogGenerator.describeRevision(revision);
      expect(description).toContain('table cell');
    });
  });

  describe('fromRevisions', () => {
    it('should convert revisions to changelog entries', () => {
      const revisions = [
        createRevision('insert', 'Alice', 'Text 1'),
        createRevision('delete', 'Bob', 'Text 2'),
      ];

      const entries = ChangelogGenerator.fromRevisions(revisions);

      expect(entries).toHaveLength(2);
      expect(entries[0]!.author).toBe('Alice');
      expect(entries[0]!.revisionType).toBe('insert');
      expect(entries[0]!.category).toBe('content');
      expect(entries[1]!.author).toBe('Bob');
      expect(entries[1]!.revisionType).toBe('delete');
    });

    it('should filter by author', () => {
      const revisions = [
        createRevision('insert', 'Alice', 'Text 1'),
        createRevision('insert', 'Bob', 'Text 2'),
        createRevision('insert', 'Alice', 'Text 3'),
      ];

      const entries = ChangelogGenerator.fromRevisions(revisions, {
        filterAuthors: ['Alice'],
      });

      expect(entries).toHaveLength(2);
      expect(entries.every(e => e.author === 'Alice')).toBe(true);
    });

    it('should filter by category', () => {
      const revisions = [
        createRevision('insert', 'Alice', 'Text 1'),
        createRevision('runPropertiesChange', 'Bob', 'Text 2'),
        createRevision('moveFrom', 'Carol', 'Text 3'),
      ];

      const entries = ChangelogGenerator.fromRevisions(revisions, {
        filterCategories: ['content'],
      });

      expect(entries).toHaveLength(1);
      expect(entries[0]!.category).toBe('content');
    });

    it('should filter out formatting changes when requested', () => {
      const revisions = [
        createRevision('insert', 'Alice', 'Text 1'),
        createRevision('runPropertiesChange', 'Bob', 'Text 2'),
        createRevision('delete', 'Carol', 'Text 3'),
      ];

      const entries = ChangelogGenerator.fromRevisions(revisions, {
        includeFormattingChanges: false,
      });

      expect(entries).toHaveLength(2);
      expect(entries.every(e => e.category !== 'formatting')).toBe(true);
    });

    it('should filter by date range', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-06-15');
      const date3 = new Date('2024-12-31');

      const revisions = [
        createRevision('insert', 'Alice', 'Text 1', date1),
        createRevision('insert', 'Bob', 'Text 2', date2),
        createRevision('insert', 'Carol', 'Text 3', date3),
      ];

      const entries = ChangelogGenerator.fromRevisions(revisions, {
        filterDateRange: {
          start: new Date('2024-06-01'),
          end: new Date('2024-07-01'),
        },
      });

      expect(entries).toHaveLength(1);
      expect(entries[0]!.author).toBe('Bob');
    });

    it('should set content.after for insertions', () => {
      const revisions = [createRevision('insert', 'Alice', 'Inserted text')];
      const entries = ChangelogGenerator.fromRevisions(revisions);

      expect(entries.length).toBeGreaterThan(0);
      const entry = entries[0]!;
      expect(entry.content.after).toBe('Inserted text');
      expect(entry.content.before).toBeUndefined();
    });

    it('should set content.before for deletions', () => {
      const revisions = [createRevision('delete', 'Alice', 'Deleted text')];
      const entries = ChangelogGenerator.fromRevisions(revisions);

      expect(entries.length).toBeGreaterThan(0);
      const entry = entries[0]!;
      expect(entry.content.before).toBe('Deleted text');
      expect(entry.content.after).toBeUndefined();
    });
  });

  describe('getSummary', () => {
    it('should return correct total count', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: {},
        },
        {
          id: '2',
          revisionType: 'delete',
          category: 'content',
          description: 'Test',
          author: 'Bob',
          date: new Date(),
          location: { paragraphIndex: 1 },
          content: {},
        },
      ];

      const summary = ChangelogGenerator.getSummary(entries);
      expect(summary.total).toBe(2);
    });

    it('should count by category', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: {},
        },
        {
          id: '2',
          revisionType: 'runPropertiesChange',
          category: 'formatting',
          description: 'Test',
          author: 'Bob',
          date: new Date(),
          location: { paragraphIndex: 1 },
          content: {},
        },
        {
          id: '3',
          revisionType: 'moveFrom',
          category: 'structural',
          description: 'Test',
          author: 'Carol',
          date: new Date(),
          location: { paragraphIndex: 2 },
          content: {},
        },
      ];

      const summary = ChangelogGenerator.getSummary(entries);
      expect(summary.byCategory.content).toBe(1);
      expect(summary.byCategory.formatting).toBe(1);
      expect(summary.byCategory.structural).toBe(1);
      expect(summary.byCategory.table).toBe(0);
    });

    it('should count by author', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: {},
        },
        {
          id: '2',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 1 },
          content: {},
        },
        {
          id: '3',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Bob',
          date: new Date(),
          location: { paragraphIndex: 2 },
          content: {},
        },
      ];

      const summary = ChangelogGenerator.getSummary(entries);
      expect(summary.byAuthor['Alice']).toBe(2);
      expect(summary.byAuthor['Bob']).toBe(1);
    });

    it('should track date range', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-06-20');
      const date3 = new Date('2024-03-10');

      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Alice',
          date: date1,
          location: { paragraphIndex: 0 },
          content: {},
        },
        {
          id: '2',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Bob',
          date: date2,
          location: { paragraphIndex: 1 },
          content: {},
        },
        {
          id: '3',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Carol',
          date: date3,
          location: { paragraphIndex: 2 },
          content: {},
        },
      ];

      const summary = ChangelogGenerator.getSummary(entries);
      expect(summary.dateRange?.earliest).toEqual(date1);
      expect(summary.dateRange?.latest).toEqual(date2);
    });

    it('should return null date range for empty entries', () => {
      const summary = ChangelogGenerator.getSummary([]);
      expect(summary.dateRange).toBeNull();
    });
  });

  describe('consolidate', () => {
    it('should group similar changes', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted "A"',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: { after: 'A' },
        },
        {
          id: '2',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted "B"',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 1 },
          content: { after: 'B' },
        },
      ];

      const consolidated = ChangelogGenerator.consolidate(entries);

      expect(consolidated).toHaveLength(1);
      const first = consolidated[0]!;
      expect(first.count).toBe(2);
      expect(first.changeIds).toContain('1');
      expect(first.changeIds).toContain('2');
    });

    it('should not group changes from different authors', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted "A"',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: { after: 'A' },
        },
        {
          id: '2',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted "B"',
          author: 'Bob',
          date: new Date(),
          location: { paragraphIndex: 1 },
          content: { after: 'B' },
        },
      ];

      const consolidated = ChangelogGenerator.consolidate(entries);

      expect(consolidated).toHaveLength(2);
    });

    it('should group property changes with same property and value', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'runPropertiesChange',
          category: 'formatting',
          description: 'Changed color to blue',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: {},
          propertyChange: { property: 'color', newValue: '0000FF' },
        },
        {
          id: '2',
          revisionType: 'runPropertiesChange',
          category: 'formatting',
          description: 'Changed color to blue',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 1 },
          content: {},
          propertyChange: { property: 'color', newValue: '0000FF' },
        },
      ];

      const consolidated = ChangelogGenerator.consolidate(entries);

      expect(consolidated).toHaveLength(1);
      const first = consolidated[0]!;
      expect(first.count).toBe(2);
      expect(first.commonAttributes.propertyChanged).toBe('color');
      expect(first.commonAttributes.newValue).toBe('0000FF');
    });

    it('should sort consolidated changes by count descending', () => {
      const entries: ChangeEntry[] = [
        // 1 delete
        {
          id: '1',
          revisionType: 'delete',
          category: 'content',
          description: 'Deleted',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: {},
        },
        // 3 inserts
        {
          id: '2',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted',
          author: 'Bob',
          date: new Date(),
          location: { paragraphIndex: 1 },
          content: {},
        },
        {
          id: '3',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted',
          author: 'Bob',
          date: new Date(),
          location: { paragraphIndex: 2 },
          content: {},
        },
        {
          id: '4',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted',
          author: 'Bob',
          date: new Date(),
          location: { paragraphIndex: 3 },
          content: {},
        },
      ];

      const consolidated = ChangelogGenerator.consolidate(entries);

      expect(consolidated.length).toBe(2);
      expect(consolidated[0]!.count).toBe(3); // inserts first
      expect(consolidated[1]!.count).toBe(1); // delete second
    });
  });

  describe('toMarkdown', () => {
    it('should generate valid markdown', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted "Hello"',
          author: 'Alice',
          date: new Date('2024-01-15'),
          location: { paragraphIndex: 0 },
          content: { after: 'Hello' },
        },
      ];

      const markdown = ChangelogGenerator.toMarkdown(entries);

      expect(markdown).toContain('# Document Changes');
      expect(markdown).toContain('## Content Changes');
      expect(markdown).toContain('Alice');
      expect(markdown).toContain('Hello');
    });

    it('should include metadata when requested', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted',
          author: 'Alice',
          date: new Date('2024-01-15'),
          location: { paragraphIndex: 0 },
          content: {},
        },
      ];

      const markdown = ChangelogGenerator.toMarkdown(entries, { includeMetadata: true });

      expect(markdown).toContain('**Total Changes:**');
      expect(markdown).toContain('**Authors:**');
    });

    it('should not include metadata when disabled', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted',
          author: 'Alice',
          date: new Date('2024-01-15'),
          location: { paragraphIndex: 0 },
          content: {},
        },
      ];

      const markdown = ChangelogGenerator.toMarkdown(entries, { includeMetadata: false });

      expect(markdown).not.toContain('**Total Changes:**');
    });
  });

  describe('toPlainText', () => {
    it('should generate plain text output', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted "Hello"',
          author: 'Alice',
          date: new Date('2024-01-15'),
          location: { paragraphIndex: 0 },
          content: { after: 'Hello' },
        },
      ];

      const text = ChangelogGenerator.toPlainText(entries);

      expect(text).toContain('DOCUMENT CHANGES');
      expect(text).toContain('Alice');
      expect(text).toContain('Inserted');
    });

    it('should show before/after markers', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Test',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: { before: 'old', after: 'new' },
        },
      ];

      const text = ChangelogGenerator.toPlainText(entries);

      expect(text).toContain('- old');
      expect(text).toContain('+ new');
    });
  });

  describe('toJSON', () => {
    it('should generate valid JSON', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted',
          author: 'Alice',
          date: new Date('2024-01-15'),
          location: { paragraphIndex: 0 },
          content: {},
        },
      ];

      const json = ChangelogGenerator.toJSON(entries);
      const parsed = JSON.parse(json);

      expect(parsed.generated).toBeDefined();
      expect(parsed.summary).toBeDefined();
      expect(parsed.entries).toHaveLength(1);
    });

    it('should include summary in JSON output', () => {
      const entries: ChangeEntry[] = [
        {
          id: '1',
          revisionType: 'insert',
          category: 'content',
          description: 'Inserted',
          author: 'Alice',
          date: new Date(),
          location: { paragraphIndex: 0 },
          content: {},
        },
      ];

      const json = ChangelogGenerator.toJSON(entries);
      const parsed = JSON.parse(json);

      expect(parsed.summary.total).toBe(1);
      expect(parsed.summary.byCategory.content).toBe(1);
    });
  });
});
