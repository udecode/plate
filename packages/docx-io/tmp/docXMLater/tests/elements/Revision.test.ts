/**
 * Comprehensive tests for Revision class
 * Tests revision creation, serialization, and all revision types
 */

import { Revision, RevisionType } from '../../src/elements/Revision';
import { Run } from '../../src/elements/Run';
import { XMLBuilder } from '../../src/xml/XMLBuilder';

describe('Revision', () => {
  describe('Basic Creation', () => {
    it('should create an insertion revision', () => {
      const run = new Run('inserted text');
      const revision = Revision.createInsertion('Author', run);

      expect(revision.getType()).toBe('insert');
      expect(revision.getAuthor()).toBe('Author');
      expect(revision.getRuns()).toHaveLength(1);
      expect(revision.getRuns()[0]?.getText()).toBe('inserted text');
    });

    it('should create a deletion revision', () => {
      const run = new Run('deleted text');
      const revision = Revision.createDeletion('Author', run);

      expect(revision.getType()).toBe('delete');
      expect(revision.getAuthor()).toBe('Author');
      expect(revision.getRuns()).toHaveLength(1);
      expect(revision.getRuns()[0]?.getText()).toBe('deleted text');
    });

    it('should create revision from text', () => {
      const revision = Revision.fromText('insert', 'TestAuthor', 'Hello World');

      expect(revision.getType()).toBe('insert');
      expect(revision.getAuthor()).toBe('TestAuthor');
      expect(revision.getRuns()).toHaveLength(1);
      expect(revision.getRuns()[0]?.getText()).toBe('Hello World');
    });

    it('should create revision with custom date', () => {
      const customDate = new Date('2025-01-15T10:30:00Z');
      const revision = Revision.fromText('insert', 'Author', 'text', customDate);

      expect(revision.getDate()).toEqual(customDate);
    });

    it('should default to current date if not provided', () => {
      const beforeCreate = new Date();
      const revision = Revision.fromText('insert', 'Author', 'text');
      const afterCreate = new Date();

      expect(revision.getDate().getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(revision.getDate().getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('Property Change Revisions', () => {
    it('should create run properties change revision', () => {
      const run = new Run('formatted text');
      const previousProps = { b: true, sz: 24 };
      const revision = Revision.createRunPropertiesChange('Editor', run, previousProps);

      expect(revision.getType()).toBe('runPropertiesChange');
      expect(revision.getPreviousProperties()).toEqual(previousProps);
    });

    it('should create paragraph properties change revision', () => {
      const run = new Run('paragraph text');
      const previousProps = { jc: 'left', spacing: { before: 120 } };
      const revision = Revision.createParagraphPropertiesChange('Editor', run, previousProps);

      expect(revision.getType()).toBe('paragraphPropertiesChange');
      expect(revision.getPreviousProperties()).toEqual(previousProps);
    });

    it('should create table properties change revision', () => {
      const run = new Run('table content');
      const previousProps = { tblW: { w: 5000, type: 'dxa' } };
      const revision = Revision.createTablePropertiesChange('Editor', run, previousProps);

      expect(revision.getType()).toBe('tablePropertiesChange');
    });

    it('should create table exception properties change revision', () => {
      const run = new Run('content');
      const previousProps = { tblBorders: {} };
      const revision = Revision.createTableExceptionPropertiesChange('Editor', run, previousProps);

      expect(revision.getType()).toBe('tableExceptionPropertiesChange');
    });

    it('should create numbering change revision', () => {
      const run = new Run('list item');
      const previousProps = { numId: 1, ilvl: 0 };
      const revision = Revision.createNumberingChange('Editor', run, previousProps);

      expect(revision.getType()).toBe('numberingChange');
    });
  });

  describe('Move Operations', () => {
    it('should create moveFrom revision with move ID', () => {
      const run = new Run('moved text');
      const revision = Revision.createMoveFrom('Author', run, 'move-001');

      expect(revision.getType()).toBe('moveFrom');
      expect(revision.getMoveId()).toBe('move-001');
    });

    it('should create moveTo revision with move ID', () => {
      const run = new Run('moved text');
      const revision = Revision.createMoveTo('Author', run, 'move-001');

      expect(revision.getType()).toBe('moveTo');
      expect(revision.getMoveId()).toBe('move-001');
    });

    it('should link moveFrom and moveTo with same move ID', () => {
      const run = new Run('text to move');
      const moveFrom = Revision.createMoveFrom('Author', run, 'move-unique');
      const moveTo = Revision.createMoveTo('Author', run, 'move-unique');

      expect(moveFrom.getMoveId()).toBe(moveTo.getMoveId());
    });
  });

  describe('Table Cell Operations', () => {
    it('should create table cell insert revision', () => {
      const run = new Run('cell content');
      const revision = Revision.createTableCellInsert('Author', run);

      expect(revision.getType()).toBe('tableCellInsert');
    });

    it('should create table cell delete revision', () => {
      const run = new Run('cell content');
      const revision = Revision.createTableCellDelete('Author', run);

      expect(revision.getType()).toBe('tableCellDelete');
    });

    it('should create table cell merge revision', () => {
      const run = new Run('merged content');
      const revision = Revision.createTableCellMerge('Author', run);

      expect(revision.getType()).toBe('tableCellMerge');
    });
  });

  describe('Multiple Runs', () => {
    it('should accept array of runs for insertion', () => {
      const runs = [
        new Run('first '),
        new Run('second '),
        new Run('third'),
      ];
      const revision = Revision.createInsertion('Author', runs);

      expect(revision.getRuns()).toHaveLength(3);
    });

    it('should add runs incrementally', () => {
      const revision = Revision.fromText('insert', 'Author', 'initial');
      revision.addRun(new Run(' added'));

      expect(revision.getRuns()).toHaveLength(2);
    });
  });

  describe('Author and Date Modification', () => {
    it('should allow setting author', () => {
      const revision = Revision.fromText('insert', 'OriginalAuthor', 'text');
      revision.setAuthor('NewAuthor');

      expect(revision.getAuthor()).toBe('NewAuthor');
    });

    it('should allow setting date', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      const newDate = new Date('2025-06-15T14:00:00Z');
      revision.setDate(newDate);

      expect(revision.getDate()).toEqual(newDate);
    });

    it('should support method chaining', () => {
      const revision = Revision.fromText('insert', 'Author', 'text')
        .setAuthor('ChainedAuthor')
        .setDate(new Date('2025-01-01T00:00:00Z'));

      expect(revision.getAuthor()).toBe('ChainedAuthor');
    });
  });

  describe('Location Tracking', () => {
    it('should set and get revision location', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      const location = {
        paragraphIndex: 5,
        runIndex: 2,
      };
      revision.setLocation(location);

      expect(revision.getLocation()).toEqual(location);
    });

    it('should support all location fields', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      const location = {
        paragraphIndex: 3,
        runIndex: 1,
        tableRow: 2,
        tableCell: 1,
        sectionIndex: 0,
        headerFooterType: 'header' as const,
      };
      revision.setLocation(location);

      const loc = revision.getLocation();
      expect(loc?.tableRow).toBe(2);
      expect(loc?.headerFooterType).toBe('header');
    });
  });

  describe('Field Instruction Handling', () => {
    it('should create field instruction deletion', () => {
      const run = new Run('MERGEFIELD Name');
      const revision = Revision.createFieldInstructionDeletion('Author', run);

      expect(revision.getType()).toBe('delete');
      expect(revision.isFieldInstructionDeletion()).toBe(true);
    });

    it('should mark revision as field instruction', () => {
      const revision = Revision.fromText('delete', 'Author', 'FIELD');
      revision.setAsFieldInstruction();

      expect(revision.isFieldInstructionDeletion()).toBe(true);
    });
  });

  describe('XML Generation', () => {
    it('should generate valid XML for insertion', () => {
      const revision = Revision.fromText('insert', 'TestAuthor', 'inserted text');
      revision.setId(0);
      const xml = revision.toXML();

      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:ins');
      expect(xml!.attributes?.['w:id']).toBe('0');
      expect(xml!.attributes?.['w:author']).toBe('TestAuthor');
      expect(xml!.attributes?.['w:date']).toBeDefined();
      expect(xml!.children).toHaveLength(1);
    });

    it('should generate valid XML for deletion', () => {
      const revision = Revision.fromText('delete', 'TestAuthor', 'deleted text');
      revision.setId(1);
      const xml = revision.toXML();

      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:del');
      expect(xml!.attributes?.['w:id']).toBe('1');

      // Check that the run uses w:delText instead of w:t
      const runXml = xml!.children?.[0] as any;
      const textChild = runXml?.children?.find((c: any) => c.name === 'w:delText');
      expect(textChild).toBeDefined();
    });

    it('should include move ID in move revisions', () => {
      const run = new Run('moved');
      const revision = Revision.createMoveFrom('Author', run, 'move-123');
      revision.setId(5);
      const xml = revision.toXML();

      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:moveFrom');
      expect(xml!.attributes?.['w:moveId']).toBe('move-123');
    });

    it('should generate correct element names for all types', () => {
      const types: Array<{ type: RevisionType; expectedName: string }> = [
        { type: 'insert', expectedName: 'w:ins' },
        { type: 'delete', expectedName: 'w:del' },
        { type: 'runPropertiesChange', expectedName: 'w:rPrChange' },
        { type: 'paragraphPropertiesChange', expectedName: 'w:pPrChange' },
        { type: 'tablePropertiesChange', expectedName: 'w:tblPrChange' },
        { type: 'tableExceptionPropertiesChange', expectedName: 'w:tblPrExChange' },
        { type: 'tableRowPropertiesChange', expectedName: 'w:trPrChange' },
        { type: 'tableCellPropertiesChange', expectedName: 'w:tcPrChange' },
        { type: 'sectionPropertiesChange', expectedName: 'w:sectPrChange' },
        { type: 'moveFrom', expectedName: 'w:moveFrom' },
        { type: 'moveTo', expectedName: 'w:moveTo' },
        { type: 'tableCellInsert', expectedName: 'w:cellIns' },
        { type: 'tableCellDelete', expectedName: 'w:cellDel' },
        { type: 'tableCellMerge', expectedName: 'w:cellMerge' },
        { type: 'numberingChange', expectedName: 'w:numberingChange' },
      ];

      for (const { type, expectedName } of types) {
        const revision = new Revision({
          author: 'Test',
          type,
          content: new Run('text'),
        });
        const xml = revision.toXML();
        expect(xml).not.toBeNull();
        expect(xml!.name).toBe(expectedName);
      }
    });

    it('should generate previous properties for property change revisions', () => {
      const run = new Run('text');
      const revision = Revision.createRunPropertiesChange('Author', run, {
        b: true,
        sz: 24,
      });
      revision.setId(0);
      const xml = revision.toXML();

      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:rPrChange');
      // Should contain w:rPr child with previous properties
      const rPrChild = xml!.children?.find((c: any) => c.name === 'w:rPr');
      expect(rPrChild).toBeDefined();
    });

    it('should format date as ISO 8601', () => {
      const revision = Revision.fromText('insert', 'Author', 'text', new Date('2025-06-15T12:30:45.000Z'));
      revision.setId(0);
      const xml = revision.toXML();

      expect(xml).not.toBeNull();
      expect(xml!.attributes?.['w:date']).toBe('2025-06-15T12:30:45.000Z');
    });

    it('should return null for internal tracking types', () => {
      const internalTypes: RevisionType[] = [
        'hyperlinkChange',
        'imageChange',
        'fieldChange',
        'commentChange',
        'bookmarkChange',
        'contentControlChange',
      ];

      for (const type of internalTypes) {
        const revision = new Revision({
          author: 'Test',
          type,
          content: new Run('text'),
        });
        const xml = revision.toXML();
        expect(xml).toBeNull();
      }
    });
  });

  describe('Content Access', () => {
    it('should return defensive copy of content', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      const content1 = revision.getContent();
      const content2 = revision.getContent();

      expect(content1).not.toBe(content2);
      expect(content1).toEqual(content2);
    });

    it('should return defensive copy of runs', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      const runs1 = revision.getRuns();
      const runs2 = revision.getRuns();

      expect(runs1).not.toBe(runs2);
    });
  });

  describe('ID Management', () => {
    it('should start with default ID of 0', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      expect(revision.getId()).toBe(0);
    });

    it('should allow setting ID', () => {
      const revision = Revision.fromText('insert', 'Author', 'text');
      revision.setId(42);
      expect(revision.getId()).toBe(42);
    });
  });

  describe('Internal Tracking Types', () => {
    // These types are used internally for changelog generation and tracking,
    // but have no OOXML element equivalent - toXML() returns null for graceful handling

    it('should allow creating internal tracking type revisions for metadata purposes', () => {
      // These can be created for tracking/changelog purposes, just not serialized
      const revision = new Revision({
        author: 'Test',
        type: 'hyperlinkChange',
        content: new Run('text'),
        previousProperties: { url: 'http://old.example.com' },
        newProperties: { url: 'http://new.example.com' },
      });

      expect(revision.getType()).toBe('hyperlinkChange');
      expect(revision.getAuthor()).toBe('Test');
      expect(revision.getPreviousProperties()?.url).toBe('http://old.example.com');
    });
  });
});
