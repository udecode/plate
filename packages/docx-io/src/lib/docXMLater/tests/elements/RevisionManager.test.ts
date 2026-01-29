/**
 * Comprehensive tests for RevisionManager class
 * Tests revision registration, querying, validation, and statistics
 */

import { RevisionManager } from '../../src/elements/RevisionManager';
import { Revision } from '../../src/elements/Revision';
import { Run } from '../../src/elements/Run';

describe('RevisionManager', () => {
  let manager: RevisionManager;

  beforeEach(() => {
    manager = new RevisionManager();
  });

  describe('Basic Operations', () => {
    it('should create empty manager', () => {
      expect(manager.isEmpty()).toBe(true);
      expect(manager.getCount()).toBe(0);
    });

    it('should register revisions and assign unique IDs', () => {
      const rev1 = Revision.fromText('insert', 'Author', 'text1');
      const rev2 = Revision.fromText('insert', 'Author', 'text2');

      manager.register(rev1);
      manager.register(rev2);

      expect(rev1.getId()).toBe(0);
      expect(rev2.getId()).toBe(1);
      expect(manager.getCount()).toBe(2);
    });

    it('should return the registered revision from register()', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      const returned = manager.register(revision);

      expect(returned).toBe(revision);
    });

    it('should clear all revisions', () => {
      manager.register(Revision.fromText('insert', 'A', 'text1'));
      manager.register(Revision.fromText('delete', 'B', 'text2'));

      expect(manager.getCount()).toBe(2);
      manager.clear();
      expect(manager.getCount()).toBe(0);
      expect(manager.isEmpty()).toBe(true);
    });

    it('should reset nextId after clear', () => {
      manager.register(Revision.fromText('insert', 'A', 'text'));
      manager.clear();
      const newRev = Revision.fromText('insert', 'A', 'text2');
      manager.register(newRev);

      expect(newRev.getId()).toBe(0);
    });
  });

  describe('Retrieval Methods', () => {
    beforeEach(() => {
      // Set up test data
      manager.register(Revision.fromText('insert', 'Alice', 'insertion1'));
      manager.register(Revision.fromText('delete', 'Bob', 'deletion1'));
      manager.register(Revision.fromText('insert', 'Alice', 'insertion2'));
      manager.register(Revision.fromText('delete', 'Carol', 'deletion2'));
      manager.register(
        Revision.createRunPropertiesChange('Bob', new Run('formatted'), {
          b: true,
        })
      );
    });

    it('should get all revisions', () => {
      const all = manager.getAllRevisions();
      expect(all).toHaveLength(5);
    });

    it('should return defensive copy from getAllRevisions', () => {
      const all1 = manager.getAllRevisions();
      const all2 = manager.getAllRevisions();
      expect(all1).not.toBe(all2);
    });

    it('should get revisions by type', () => {
      const insertions = manager.getRevisionsByType('insert');
      const deletions = manager.getRevisionsByType('delete');

      expect(insertions).toHaveLength(2);
      expect(deletions).toHaveLength(2);
    });

    it('should get revisions by author', () => {
      const aliceRevs = manager.getRevisionsByAuthor('Alice');
      const bobRevs = manager.getRevisionsByAuthor('Bob');

      expect(aliceRevs).toHaveLength(2);
      expect(bobRevs).toHaveLength(2);
    });

    it('should get revision by ID', () => {
      const rev = manager.getById(2);
      expect(rev).toBeDefined();
      expect(rev?.getType()).toBe('insert');
    });

    it('should return undefined for non-existent ID', () => {
      const rev = manager.getById(999);
      expect(rev).toBeUndefined();
    });

    it('should get all insertions', () => {
      const insertions = manager.getAllInsertions();
      expect(insertions).toHaveLength(2);
      insertions.forEach((r) => expect(r.getType()).toBe('insert'));
    });

    it('should get all deletions', () => {
      const deletions = manager.getAllDeletions();
      expect(deletions).toHaveLength(2);
      deletions.forEach((r) => expect(r.getType()).toBe('delete'));
    });

    it('should get all property changes', () => {
      const propChanges = manager.getAllPropertyChanges();
      expect(propChanges).toHaveLength(1);
    });
  });

  describe('Count Methods', () => {
    beforeEach(() => {
      manager.register(Revision.fromText('insert', 'A', 'text1'));
      manager.register(Revision.fromText('insert', 'A', 'text2'));
      manager.register(Revision.fromText('delete', 'B', 'text3'));
    });

    it('should return total count', () => {
      expect(manager.getCount()).toBe(3);
    });

    it('should return insertion count', () => {
      expect(manager.getInsertionCount()).toBe(2);
    });

    it('should return deletion count', () => {
      expect(manager.getDeletionCount()).toBe(1);
    });
  });

  describe('Author Methods', () => {
    beforeEach(() => {
      manager.register(Revision.fromText('insert', 'Alice', 'text1'));
      manager.register(Revision.fromText('delete', 'Bob', 'text2'));
      manager.register(Revision.fromText('insert', 'Alice', 'text3'));
      manager.register(Revision.fromText('insert', 'Carol', 'text4'));
    });

    it('should get unique authors', () => {
      const authors = manager.getAuthors();
      expect(authors).toHaveLength(3);
      expect(authors).toContain('Alice');
      expect(authors).toContain('Bob');
      expect(authors).toContain('Carol');
    });
  });

  describe('Date Range Filtering', () => {
    beforeEach(() => {
      manager.register(
        Revision.fromText(
          'insert',
          'A',
          'text1',
          new Date('2025-01-01T10:00:00Z')
        )
      );
      manager.register(
        Revision.fromText(
          'insert',
          'A',
          'text2',
          new Date('2025-01-15T10:00:00Z')
        )
      );
      manager.register(
        Revision.fromText(
          'insert',
          'A',
          'text3',
          new Date('2025-02-01T10:00:00Z')
        )
      );
      manager.register(
        Revision.fromText(
          'insert',
          'A',
          'text4',
          new Date('2025-03-01T10:00:00Z')
        )
      );
    });

    it('should filter by date range', () => {
      const filtered = manager.getRevisionsByDateRange(
        new Date('2025-01-10T00:00:00Z'),
        new Date('2025-02-15T00:00:00Z')
      );
      expect(filtered).toHaveLength(2);
    });

    it('should include boundary dates', () => {
      const filtered = manager.getRevisionsByDateRange(
        new Date('2025-01-01T10:00:00Z'),
        new Date('2025-01-01T10:00:00Z')
      );
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Text Search', () => {
    beforeEach(() => {
      manager.register(Revision.fromText('insert', 'A', 'Hello World'));
      manager.register(Revision.fromText('insert', 'A', 'Goodbye World'));
      manager.register(Revision.fromText('delete', 'A', 'Hello Again'));
    });

    it('should find revisions by text (case-insensitive)', () => {
      const results = manager.findRevisionsByText('hello');
      expect(results).toHaveLength(2);
    });

    it('should find revisions containing partial match', () => {
      const results = manager.findRevisionsByText('world');
      expect(results).toHaveLength(2);
    });

    it('should return empty array for no matches', () => {
      const results = manager.findRevisionsByText('xyz');
      expect(results).toHaveLength(0);
    });
  });

  describe('Recent Revisions', () => {
    beforeEach(() => {
      manager.register(
        Revision.fromText('insert', 'A', 'oldest', new Date('2025-01-01'))
      );
      manager.register(
        Revision.fromText('insert', 'A', 'middle1', new Date('2025-01-15'))
      );
      manager.register(
        Revision.fromText('insert', 'A', 'middle2', new Date('2025-02-01'))
      );
      manager.register(
        Revision.fromText('insert', 'A', 'newest', new Date('2025-03-01'))
      );
    });

    it('should return most recent N revisions', () => {
      const recent = manager.getRecentRevisions(2);
      expect(recent).toHaveLength(2);
      // Should be in reverse chronological order
      expect(recent[0]?.getRuns()[0]?.getText()).toBe('newest');
      expect(recent[1]?.getRuns()[0]?.getText()).toBe('middle2');
    });

    it('should return all if N exceeds total', () => {
      const recent = manager.getRecentRevisions(10);
      expect(recent).toHaveLength(4);
    });
  });

  describe('Latest Revision', () => {
    it('should return undefined when empty', () => {
      expect(manager.getLatestRevision()).toBeUndefined();
    });

    it('should return last registered revision', () => {
      manager.register(Revision.fromText('insert', 'A', 'first'));
      manager.register(Revision.fromText('insert', 'A', 'second'));
      manager.register(Revision.fromText('insert', 'A', 'third'));

      const latest = manager.getLatestRevision();
      expect(latest?.getId()).toBe(2);
    });
  });

  describe('Category Filtering', () => {
    beforeEach(() => {
      // Content changes
      manager.register(Revision.fromText('insert', 'A', 'inserted'));
      manager.register(Revision.fromText('delete', 'A', 'deleted'));

      // Formatting changes
      manager.register(
        Revision.createRunPropertiesChange('A', new Run('formatted'), {
          b: true,
        })
      );
      manager.register(
        Revision.createParagraphPropertiesChange('A', new Run('para'), {
          jc: 'center',
        })
      );

      // Structural changes
      manager.register(
        Revision.createMoveFrom('A', new Run('moved'), 'move-1')
      );
      manager.register(Revision.createMoveTo('A', new Run('moved'), 'move-1'));

      // Table changes
      manager.register(Revision.createTableCellInsert('A', new Run('cell')));
    });

    it('should filter by content category', () => {
      const content = manager.getByCategory('content');
      expect(content).toHaveLength(2);
    });

    it('should filter by formatting category', () => {
      const formatting = manager.getByCategory('formatting');
      expect(formatting).toHaveLength(2);
    });

    it('should filter by structural category', () => {
      const structural = manager.getByCategory('structural');
      expect(structural).toHaveLength(2);
    });

    it('should filter by table category', () => {
      const table = manager.getByCategory('table');
      expect(table).toHaveLength(1);
    });

    it('should include internal tracking types in content category', () => {
      // Register internal tracking types (for changelog generation)
      manager.register(
        new Revision({
          author: 'A',
          type: 'imageChange',
          content: new Run('image'),
        })
      );
      manager.register(
        new Revision({
          author: 'A',
          type: 'fieldChange',
          content: new Run('field'),
        })
      );
      manager.register(
        new Revision({
          author: 'A',
          type: 'commentChange',
          content: new Run('comment'),
        })
      );
      manager.register(
        new Revision({
          author: 'A',
          type: 'contentControlChange',
          content: new Run('sdt'),
        })
      );
      manager.register(
        new Revision({
          author: 'A',
          type: 'hyperlinkChange',
          content: new Run('link'),
        })
      );

      const content = manager.getByCategory('content');
      // Original 2 (insert, delete) + 5 new internal types
      expect(content).toHaveLength(7);
    });

    it('should include bookmarkChange in structural category', () => {
      manager.register(
        new Revision({
          author: 'A',
          type: 'bookmarkChange',
          content: new Run('bookmark'),
        })
      );

      const structural = manager.getByCategory('structural');
      // Original 2 (moveFrom, moveTo) + 1 bookmarkChange
      expect(structural).toHaveLength(3);
    });
  });

  describe('Move Operations', () => {
    beforeEach(() => {
      manager.register(Revision.createMoveFrom('A', new Run('text'), 'move-1'));
      manager.register(Revision.createMoveTo('A', new Run('text'), 'move-1'));
      manager.register(
        Revision.createMoveFrom('A', new Run('text2'), 'move-2')
      );
    });

    it('should get all moves', () => {
      const moves = manager.getAllMoves();
      expect(moves).toHaveLength(3);
    });

    it('should get all moveFrom', () => {
      const moveFrom = manager.getAllMoveFrom();
      expect(moveFrom).toHaveLength(2);
    });

    it('should get all moveTo', () => {
      const moveTo = manager.getAllMoveTo();
      expect(moveTo).toHaveLength(1);
    });

    it('should get move pair by ID', () => {
      const pair = manager.getMovePair('move-1');
      expect(pair.moveFrom).toBeDefined();
      expect(pair.moveTo).toBeDefined();
      expect(pair.moveFrom?.getMoveId()).toBe('move-1');
      expect(pair.moveTo?.getMoveId()).toBe('move-1');
    });

    it('should return partial pair for orphaned move', () => {
      const pair = manager.getMovePair('move-2');
      expect(pair.moveFrom).toBeDefined();
      expect(pair.moveTo).toBeUndefined();
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      manager.register(Revision.fromText('insert', 'Alice', 'text1'));
      manager.register(Revision.fromText('insert', 'Bob', 'text2'));
      manager.register(Revision.fromText('delete', 'Alice', 'text3'));
      manager.register(
        Revision.createRunPropertiesChange('Carol', new Run('text'), {
          b: true,
        })
      );
      manager.register(
        Revision.createMoveFrom('Alice', new Run('moved'), 'move-1')
      );
      manager.register(
        Revision.createMoveTo('Alice', new Run('moved'), 'move-1')
      );
    });

    it('should get comprehensive stats', () => {
      const stats = manager.getStats();

      expect(stats.total).toBe(6);
      expect(stats.insertions).toBe(2);
      expect(stats.deletions).toBe(1);
      expect(stats.propertyChanges).toBe(1);
      expect(stats.moves).toBe(2);
      expect(stats.authors).toContain('Alice');
      expect(stats.authors).toContain('Bob');
      expect(stats.authors).toContain('Carol');
    });

    it('should get summary with date range', () => {
      const summary = manager.getSummary();

      expect(summary.total).toBe(6);
      expect(summary.dateRange).toBeDefined();
      expect(summary.byCategory.content).toBe(3); // 2 inserts + 1 delete
      expect(summary.byCategory.formatting).toBe(1);
      expect(summary.byCategory.structural).toBe(2);
    });
  });

  describe('Validation', () => {
    it('should validate unique revision IDs', () => {
      manager.register(Revision.fromText('insert', 'A', 'text1'));
      manager.register(Revision.fromText('insert', 'A', 'text2'));

      const result = manager.validateRevisionIds();
      expect(result.valid).toBe(true);
      expect(result.duplicates).toHaveLength(0);
    });

    it('should detect duplicate revision IDs', () => {
      const rev1 = Revision.fromText('insert', 'A', 'text1');
      const rev2 = Revision.fromText('insert', 'A', 'text2');

      manager.register(rev1);
      manager.register(rev2);

      // Manually set duplicate ID
      rev2.setId(0);

      const result = manager.validateRevisionIds();
      expect(result.valid).toBe(false);
      expect(result.duplicates).toContain(0);
    });

    it('should validate move pairs', () => {
      manager.register(Revision.createMoveFrom('A', new Run('text'), 'move-1'));
      manager.register(Revision.createMoveTo('A', new Run('text'), 'move-1'));

      const result = manager.validateMovePairs();
      expect(result.valid).toBe(true);
    });

    it('should detect orphaned moveFrom', () => {
      manager.register(
        Revision.createMoveFrom('A', new Run('text'), 'orphan-1')
      );

      const result = manager.validateMovePairs();
      expect(result.valid).toBe(false);
      expect(result.orphanedMoveFrom).toContain('orphan-1');
    });

    it('should detect orphaned moveTo', () => {
      manager.register(Revision.createMoveTo('A', new Run('text'), 'orphan-2'));

      const result = manager.validateMovePairs();
      expect(result.valid).toBe(false);
      expect(result.orphanedMoveTo).toContain('orphan-2');
    });
  });

  describe('ID Management', () => {
    it('should peek next ID without incrementing', () => {
      expect(manager.peekNextId()).toBe(0);
      expect(manager.peekNextId()).toBe(0); // Still 0
    });

    it('should consume next ID', () => {
      expect(manager.consumeNextId()).toBe(0);
      expect(manager.consumeNextId()).toBe(1);
      expect(manager.peekNextId()).toBe(2);
    });

    it('should get highest ID', () => {
      manager.register(Revision.fromText('insert', 'A', 'text1'));
      manager.register(Revision.fromText('insert', 'A', 'text2'));

      expect(manager.getHighestId()).toBe(1);
    });

    it('should return -1 for highest ID when empty', () => {
      expect(manager.getHighestId()).toBe(-1);
    });

    it('should reassign all IDs', () => {
      manager.register(Revision.fromText('insert', 'A', 'text1'));
      manager.register(Revision.fromText('insert', 'A', 'text2'));
      manager.register(Revision.fromText('insert', 'A', 'text3'));

      const count = manager.reassignRevisionIds(100);

      expect(count).toBe(3);
      expect(manager.getById(100)).toBeDefined();
      expect(manager.getById(101)).toBeDefined();
      expect(manager.getById(102)).toBeDefined();
      expect(manager.peekNextId()).toBe(103);
    });

    it('should sync next ID after loading', () => {
      // Simulate loading revisions with existing IDs
      // First register normally (gets ID 0), then manually override to simulate loaded state
      const rev = Revision.fromText('insert', 'A', 'text');
      manager.register(rev); // Gets ID 0
      rev.setId(50); // Simulate that this was loaded with ID 50

      // After loading, nextId is 1 but highest ID is 50
      manager.syncNextId();

      // Should now be at least 51
      expect(manager.peekNextId()).toBe(51);
    });
  });

  describe('Location-Based Queries', () => {
    beforeEach(() => {
      const rev1 = Revision.fromText('insert', 'A', 'para0-run0');
      rev1.setLocation({ paragraphIndex: 0, runIndex: 0 });
      manager.register(rev1);

      const rev2 = Revision.fromText('insert', 'A', 'para0-run1');
      rev2.setLocation({ paragraphIndex: 0, runIndex: 1 });
      manager.register(rev2);

      const rev3 = Revision.fromText('insert', 'A', 'para1');
      rev3.setLocation({ paragraphIndex: 1, runIndex: 0 });
      manager.register(rev3);

      const rev4 = Revision.fromText('insert', 'A', 'no-location');
      manager.register(rev4);
    });

    it('should get revisions for paragraph', () => {
      const revs = manager.getRevisionsForParagraph(0);
      expect(revs).toHaveLength(2);
    });

    it('should get revisions for specific run', () => {
      const revs = manager.getRevisionsForRun(0, 1);
      expect(revs).toHaveLength(1);
    });

    it('should return empty for negative paragraph index', () => {
      const revs = manager.getRevisionsForParagraph(-1);
      expect(revs).toHaveLength(0);
    });

    it('should get revisions with location', () => {
      const revs = manager.getRevisionsWithLocation();
      expect(revs).toHaveLength(3);
    });

    it('should get revisions without location', () => {
      const revs = manager.getRevisionsWithoutLocation();
      expect(revs).toHaveLength(1);
    });

    it('should get revisions by location criteria', () => {
      const revs = manager.getRevisionsByLocation({ paragraphIndex: 0 });
      expect(revs).toHaveLength(2);
    });
  });

  describe('Multi-Criteria Matching', () => {
    beforeEach(() => {
      manager.register(
        Revision.fromText('insert', 'Alice', 'text1', new Date('2025-01-15'))
      );
      manager.register(
        Revision.fromText('delete', 'Alice', 'text2', new Date('2025-01-15'))
      );
      manager.register(
        Revision.fromText('insert', 'Bob', 'text3', new Date('2025-02-15'))
      );
      manager.register(
        Revision.fromText('delete', 'Bob', 'text4', new Date('2025-02-15'))
      );
    });

    it('should match by types', () => {
      const matches = manager.getMatching({ types: ['insert'] });
      expect(matches).toHaveLength(2);
    });

    it('should match by authors', () => {
      const matches = manager.getMatching({ authors: ['Alice'] });
      expect(matches).toHaveLength(2);
    });

    it('should match by types AND authors', () => {
      const matches = manager.getMatching({
        types: ['insert'],
        authors: ['Alice'],
      });
      expect(matches).toHaveLength(1);
    });

    it('should match by date range', () => {
      const matches = manager.getMatching({
        dateRange: {
          start: new Date('2025-02-01'),
          end: new Date('2025-02-28'),
        },
      });
      expect(matches).toHaveLength(2);
    });

    it('should match by all criteria', () => {
      const matches = manager.getMatching({
        types: ['insert'],
        authors: ['Bob'],
        dateRange: {
          start: new Date('2025-02-01'),
          end: new Date('2025-02-28'),
        },
      });
      expect(matches).toHaveLength(1);
    });
  });

  describe('Status Methods', () => {
    it('should report not tracking when empty', () => {
      expect(manager.isTrackingChanges()).toBe(false);
      expect(manager.hasRevisions()).toBe(false);
    });

    it('should report tracking when has revisions', () => {
      manager.register(Revision.fromText('insert', 'A', 'text'));
      expect(manager.isTrackingChanges()).toBe(true);
      expect(manager.hasRevisions()).toBe(true);
    });
  });

  describe('Remove Operations', () => {
    beforeEach(() => {
      manager.register(Revision.fromText('insert', 'A', 'text1'));
      manager.register(Revision.fromText('insert', 'A', 'text2'));
      manager.register(Revision.fromText('insert', 'A', 'text3'));
    });

    it('should remove revision by ID', () => {
      const removed = manager.removeById(1);
      expect(removed).toBe(true);
      expect(manager.getCount()).toBe(2);
      expect(manager.getById(1)).toBeUndefined();
    });

    it('should return false for non-existent ID', () => {
      const removed = manager.removeById(999);
      expect(removed).toBe(false);
    });
  });

  describe('Static Factory', () => {
    it('should create manager via static method', () => {
      const mgr = RevisionManager.create();
      expect(mgr).toBeInstanceOf(RevisionManager);
      expect(mgr.isEmpty()).toBe(true);
    });
  });
});
