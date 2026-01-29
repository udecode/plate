/**
 * Word Compatibility Tests for Track Changes
 *
 * These tests verify that the framework generates XML structures that will
 * display correctly in Microsoft Word. Key requirements per ECMA-376:
 *
 * 1. w:rPrChange must be a CHILD of w:rPr (not a sibling of w:r)
 * 2. w:pPrChange must be a CHILD of w:pPr (not a sibling of w:p)
 * 3. Deletions must use w:delText (not w:t)
 * 4. Move operations require paired range markers
 * 5. ISO 8601 date format for revision dates
 * 6. Unique revision IDs per document part
 */

import {
  Paragraph,
  ParagraphPropertiesChange,
} from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import { Revision } from '../../src/elements/Revision';
import { XMLBuilder, XMLElement } from '../../src/xml/XMLBuilder';
import { MoveOperationHelper } from '../../src/utils/MoveOperationHelper';
import { RunPropertyChange } from '../../src/elements/PropertyChangeTypes';

describe('Word Compatibility - Track Changes', () => {
  beforeEach(() => {
    MoveOperationHelper.resetIdCounters();
  });

  describe('Run Property Changes (w:rPrChange)', () => {
    it('should place w:rPrChange as child of w:rPr in run XML', () => {
      // Create a run with formatting change tracking
      const run = new Run('formatted text');
      run.setBold(true);

      // Set formatting change using the correct method
      const propChange: RunPropertyChange = {
        author: 'TestAuthor',
        date: new Date('2025-01-15T10:30:00Z'),
        id: 1,
        previousProperties: { italic: true }, // Was italic, now bold
      };
      run.setPropertyChangeRevision(propChange);

      const xml = run.toXML();

      // Find w:rPr element
      const rPr = xml.children?.find(
        (c): c is XMLElement => typeof c === 'object' && c.name === 'w:rPr'
      );
      expect(rPr).toBeDefined();

      // w:rPrChange should be inside w:rPr
      const rPrChange = rPr?.children?.find(
        (c): c is XMLElement =>
          typeof c === 'object' && c.name === 'w:rPrChange'
      );
      expect(rPrChange).toBeDefined();
      expect(rPrChange?.attributes?.['w:author']).toBe('TestAuthor');
      expect(rPrChange?.attributes?.['w:id']).toBe('1');
    });

    it('should include previous properties in w:rPrChange', () => {
      const run = new Run('text');
      run.setBold(true);
      run.setPropertyChangeRevision({
        author: 'Author',
        date: new Date(),
        id: 1,
        previousProperties: {
          italic: true,
          color: 'FF0000',
        },
      });

      const xml = run.toXML();
      const xmlString = XMLBuilder.elementToString(xml);

      // Should contain the previous properties structure
      expect(xmlString).toContain('w:rPrChange');
      expect(xmlString).toContain('w:rPr'); // Child w:rPr with previous values
    });

    it('should place w:rPrChange last in w:rPr per ECMA-376 ordering', () => {
      const run = new Run('text');
      run.setBold(true);
      run.setItalic(true);
      run.setPropertyChangeRevision({
        author: 'Author',
        date: new Date(),
        id: 1,
        previousProperties: { underline: 'single' },
      });

      const xml = run.toXML();
      const rPr = xml.children?.find(
        (c): c is XMLElement => typeof c === 'object' && c.name === 'w:rPr'
      );

      // Get all children that are XMLElements
      const rPrChildren =
        rPr?.children?.filter(
          (c): c is XMLElement => typeof c === 'object' && c.name !== undefined
        ) || [];

      // w:rPrChange should be the last element
      expect(rPrChildren.length).toBeGreaterThan(0);
      expect(rPrChildren[rPrChildren.length - 1]?.name).toBe('w:rPrChange');
    });
  });

  describe('Paragraph Property Changes (w:pPrChange)', () => {
    it('should place w:pPrChange as child of w:pPr in paragraph XML', () => {
      const para = new Paragraph();
      para.addText('text');
      para.setAlignment('center');

      // Set paragraph property change using the correct method
      const propChange: ParagraphPropertiesChange = {
        author: 'TestAuthor',
        date: '2025-01-15T10:30:00Z',
        id: '2',
        previousProperties: { alignment: 'left' },
      };
      para.setParagraphPropertiesChange(propChange);

      const xml = para.toXML();

      // Find w:pPr element
      const pPr = xml.children?.find(
        (c): c is XMLElement => typeof c === 'object' && c.name === 'w:pPr'
      );
      expect(pPr).toBeDefined();

      // w:pPrChange should be inside w:pPr
      const pPrChange = pPr?.children?.find(
        (c): c is XMLElement =>
          typeof c === 'object' && c.name === 'w:pPrChange'
      );
      expect(pPrChange).toBeDefined();
      expect(pPrChange?.attributes?.['w:author']).toBe('TestAuthor');
      expect(pPrChange?.attributes?.['w:id']).toBe('2');
    });

    it('should skip empty w:pPrChange to avoid Word corruption', () => {
      const para = new Paragraph();
      para.addText('text');
      para.setAlignment('center');

      // No previous properties - should result in no pPrChange
      const xml = para.toXML();
      const xmlString = XMLBuilder.elementToString(xml);

      // Should not contain empty pPrChange
      expect(xmlString).not.toContain('w:pPrChange');
    });
  });

  describe('Deletion Revisions (w:del)', () => {
    it('should use w:delText instead of w:t for deleted content', () => {
      const revision = Revision.fromText('delete', 'Author', 'deleted text');
      revision.setId(1);
      const xml = revision.toXML();

      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:del');

      // Convert to string to verify w:delText usage
      const xmlString = XMLBuilder.elementToString(xml!);
      expect(xmlString).toContain('w:delText');
      expect(xmlString).not.toMatch(/<w:t[^>]*>deleted text<\/w:t>/);
    });

    it('should preserve spaces in deleted text with xml:space="preserve"', () => {
      const revision = Revision.fromText(
        'delete',
        'Author',
        'deleted text with spaces'
      );
      revision.setId(1);
      const xml = revision.toXML();

      const xmlString = XMLBuilder.elementToString(xml!);
      expect(xmlString).toContain('xml:space="preserve"');
    });
  });

  describe('Insertion Revisions (w:ins)', () => {
    it('should generate correct w:ins structure', () => {
      const revision = Revision.fromText('insert', 'Author', 'inserted text');
      revision.setId(1);
      const xml = revision.toXML();

      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:ins');
      expect(xml!.attributes?.['w:id']).toBe('1');
      expect(xml!.attributes?.['w:author']).toBe('Author');
      expect(xml!.attributes?.['w:date']).toBeDefined();

      // Should contain run with w:t
      const xmlString = XMLBuilder.elementToString(xml!);
      expect(xmlString).toContain('<w:t');
    });

    it('should use ISO 8601 date format', () => {
      const date = new Date('2025-06-15T14:30:45.123Z');
      const revision = Revision.fromText('insert', 'Author', 'text', date);
      revision.setId(1);
      const xml = revision.toXML();

      expect(xml!.attributes?.['w:date']).toBe('2025-06-15T14:30:45.123Z');
    });
  });

  describe('Move Operations', () => {
    it('should generate moveFrom with all required elements', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'Author',
        content: new Run('moved text'),
        moveId: 'move-1',
      });

      // Check source elements
      expect(moveOp.source.rangeStart.getType()).toBe('moveFromRangeStart');
      expect(moveOp.source.moveFrom.getType()).toBe('moveFrom');
      expect(moveOp.source.rangeEnd.getType()).toBe('moveFromRangeEnd');

      // Check destination elements
      expect(moveOp.destination.rangeStart.getType()).toBe('moveToRangeStart');
      expect(moveOp.destination.moveTo.getType()).toBe('moveTo');
      expect(moveOp.destination.rangeEnd.getType()).toBe('moveToRangeEnd');
    });

    it('should link moveFrom and moveTo with same moveId', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'Author',
        content: new Run('text'),
      });

      // Range markers should share the moveId as name
      expect(moveOp.source.rangeStart.getName()).toBe(moveOp.moveId);
      expect(moveOp.destination.rangeStart.getName()).toBe(moveOp.moveId);

      // Revisions should have matching moveId
      expect(moveOp.source.moveFrom.getMoveId()).toBe(moveOp.moveId);
      expect(moveOp.destination.moveTo.getMoveId()).toBe(moveOp.moveId);
    });

    it('should generate valid XML for move operation range markers', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('moved'),
        moveId: 'move-test',
        date: new Date('2025-01-15T10:30:00Z'),
      });

      // Source range start
      const sourceStartXml = moveOp.source.rangeStart.toXML();
      expect(sourceStartXml.name).toBe('w:moveFromRangeStart');
      expect(sourceStartXml.attributes?.['w:name']).toBe('move-test');
      expect(sourceStartXml.attributes?.['w:author']).toBe('TestAuthor');

      // Source range end
      const sourceEndXml = moveOp.source.rangeEnd.toXML();
      expect(sourceEndXml.name).toBe('w:moveFromRangeEnd');

      // Destination range start
      const destStartXml = moveOp.destination.rangeStart.toXML();
      expect(destStartXml.name).toBe('w:moveToRangeStart');
      expect(destStartXml.attributes?.['w:name']).toBe('move-test');

      // Destination range end
      const destEndXml = moveOp.destination.rangeEnd.toXML();
      expect(destEndXml.name).toBe('w:moveToRangeEnd');
    });

    it('should include moveId attribute in move revisions', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'Author',
        content: new Run('text'),
        moveId: 'move-123',
      });

      const moveFromXml = moveOp.source.moveFrom.toXML();
      expect(moveFromXml!.attributes?.['w:moveId']).toBe('move-123');

      const moveToXml = moveOp.destination.moveTo.toXML();
      expect(moveToXml!.attributes?.['w:moveId']).toBe('move-123');
    });
  });

  describe('Complete Paragraph with Revisions', () => {
    it('should generate valid paragraph XML with insertion revision', () => {
      const para = new Paragraph();
      para.addText('normal text ');

      const revision = Revision.createInsertion('Author', new Run('inserted'));
      revision.setId(1);
      para.addRevision(revision);

      para.addText(' more text');

      const xml = para.toXML();
      const xmlString = XMLBuilder.elementToString(xml);

      // Should have runs and ins element
      expect(xmlString).toContain('<w:r>');
      expect(xmlString).toContain('<w:ins');
      expect(xmlString).toContain('w:author="Author"');
    });

    it('should generate valid paragraph XML with deletion revision', () => {
      const para = new Paragraph();
      para.addText('before ');

      const revision = Revision.createDeletion('Author', new Run('deleted'));
      revision.setId(1);
      para.addRevision(revision);

      para.addText(' after');

      const xml = para.toXML();
      const xmlString = XMLBuilder.elementToString(xml);

      // Should have runs and del element with delText
      expect(xmlString).toContain('<w:r>');
      expect(xmlString).toContain('<w:del');
      expect(xmlString).toContain('w:delText');
    });

    it('should generate valid paragraph XML with move operation', () => {
      const sourcePara = new Paragraph();
      sourcePara.addText('before ');

      const destPara = new Paragraph();
      destPara.addText('destination ');

      MoveOperationHelper.addMoveOperation(sourcePara, destPara, {
        author: 'MoveAuthor',
        content: new Run('moved content'),
        moveId: 'move-doc',
      });

      sourcePara.addText(' after');

      const sourceXml = XMLBuilder.elementToString(sourcePara.toXML());
      const destXml = XMLBuilder.elementToString(destPara.toXML());

      // Source should have moveFrom and range markers
      expect(sourceXml).toContain('w:moveFromRangeStart');
      expect(sourceXml).toContain('w:moveFrom');
      expect(sourceXml).toContain('w:moveFromRangeEnd');

      // Destination should have moveTo and range markers
      expect(destXml).toContain('w:moveToRangeStart');
      expect(destXml).toContain('w:moveTo');
      expect(destXml).toContain('w:moveToRangeEnd');
    });
  });

  describe('Revision Attributes', () => {
    it('should include all required attributes per ECMA-376', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const revision = Revision.fromText('insert', 'TestAuthor', 'text', date);
      revision.setId(42);
      const xml = revision.toXML();

      // Required attributes
      expect(xml!.attributes?.['w:id']).toBe('42');
      expect(xml!.attributes?.['w:author']).toBe('TestAuthor');
      // Date is optional but recommended
      expect(xml!.attributes?.['w:date']).toBe('2025-01-15T10:30:00.000Z');
    });

    it('should use unique IDs across revisions', () => {
      const rev1 = Revision.fromText('insert', 'Author', 'text1');
      rev1.setId(1);
      const rev2 = Revision.fromText('delete', 'Author', 'text2');
      rev2.setId(2);
      const rev3 = Revision.fromText('insert', 'Author', 'text3');
      rev3.setId(3);

      expect(rev1.getId()).toBe(1);
      expect(rev2.getId()).toBe(2);
      expect(rev3.getId()).toBe(3);
    });
  });

  describe('Revision Element Names', () => {
    const typeToName: Array<{ type: string; name: string }> = [
      { type: 'insert', name: 'w:ins' },
      { type: 'delete', name: 'w:del' },
      { type: 'moveFrom', name: 'w:moveFrom' },
      { type: 'moveTo', name: 'w:moveTo' },
      { type: 'runPropertiesChange', name: 'w:rPrChange' },
      { type: 'paragraphPropertiesChange', name: 'w:pPrChange' },
      { type: 'tablePropertiesChange', name: 'w:tblPrChange' },
      { type: 'tableCellInsert', name: 'w:cellIns' },
      { type: 'tableCellDelete', name: 'w:cellDel' },
      { type: 'tableCellMerge', name: 'w:cellMerge' },
      { type: 'numberingChange', name: 'w:numberingChange' },
    ];

    for (const { type, name } of typeToName) {
      it(`should map ${type} to ${name}`, () => {
        const revision = new Revision({
          author: 'Test',
          type: type as any,
          content: new Run('text'),
        });
        revision.setId(1);
        const xml = revision.toXML();

        expect(xml).not.toBeNull();
        expect(xml!.name).toBe(name);
      });
    }
  });
});
