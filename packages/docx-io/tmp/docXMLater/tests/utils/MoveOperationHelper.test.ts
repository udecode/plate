/**
 * Tests for MoveOperationHelper
 *
 * Verifies that move operations are created correctly with all required
 * range markers per ECMA-376 specification.
 */

import { MoveOperationHelper } from '../../src/utils/MoveOperationHelper';
import { Run } from '../../src/elements/Run';
import { Paragraph } from '../../src/elements/Paragraph';
import { XMLBuilder } from '../../src/xml/XMLBuilder';

describe('MoveOperationHelper', () => {
  beforeEach(() => {
    // Reset ID counters before each test
    MoveOperationHelper.resetIdCounters();
  });

  describe('createMoveOperation', () => {
    it('should create a complete move operation with all required elements', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('moved text'),
      });

      // Check source elements
      expect(moveOp.source.rangeStart).toBeDefined();
      expect(moveOp.source.moveFrom).toBeDefined();
      expect(moveOp.source.rangeEnd).toBeDefined();

      // Check destination elements
      expect(moveOp.destination.rangeStart).toBeDefined();
      expect(moveOp.destination.moveTo).toBeDefined();
      expect(moveOp.destination.rangeEnd).toBeDefined();

      // Check moveId is set
      expect(moveOp.moveId).toBeDefined();
      expect(moveOp.moveId).toMatch(/^move-\d+$/);
    });

    it('should use provided moveId', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
        moveId: 'custom-move-id',
      });

      expect(moveOp.moveId).toBe('custom-move-id');
    });

    it('should link all elements with the same moveId/name', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
      });

      // Range markers should have name matching moveId
      expect(moveOp.source.rangeStart.getName()).toBe(moveOp.moveId);
      expect(moveOp.destination.rangeStart.getName()).toBe(moveOp.moveId);

      // Revisions should have matching moveId
      expect(moveOp.source.moveFrom.getMoveId()).toBe(moveOp.moveId);
      expect(moveOp.destination.moveTo.getMoveId()).toBe(moveOp.moveId);
    });

    it('should set correct types for range markers', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
      });

      expect(moveOp.source.rangeStart.getType()).toBe('moveFromRangeStart');
      expect(moveOp.source.rangeEnd.getType()).toBe('moveFromRangeEnd');
      expect(moveOp.destination.rangeStart.getType()).toBe('moveToRangeStart');
      expect(moveOp.destination.rangeEnd.getType()).toBe('moveToRangeEnd');
    });

    it('should set correct revision types', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
      });

      expect(moveOp.source.moveFrom.getType()).toBe('moveFrom');
      expect(moveOp.destination.moveTo.getType()).toBe('moveTo');
    });

    it('should set author on all start markers and revisions', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'John Doe',
        content: new Run('text'),
      });

      // Start markers have author
      expect(moveOp.source.rangeStart.getAuthor()).toBe('John Doe');
      expect(moveOp.destination.rangeStart.getAuthor()).toBe('John Doe');

      // Revisions have author
      expect(moveOp.source.moveFrom.getAuthor()).toBe('John Doe');
      expect(moveOp.destination.moveTo.getAuthor()).toBe('John Doe');
    });

    it('should use custom date when provided', () => {
      const customDate = new Date('2025-01-15T10:30:00Z');
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
        date: customDate,
      });

      expect(moveOp.source.rangeStart.getDate()).toEqual(customDate);
      expect(moveOp.source.moveFrom.getDate()).toEqual(customDate);
      expect(moveOp.destination.rangeStart.getDate()).toEqual(customDate);
      expect(moveOp.destination.moveTo.getDate()).toEqual(customDate);
    });

    it('should handle array of runs as content', () => {
      const runs = [
        new Run('first '),
        new Run('second'),
      ];
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: runs,
      });

      // Source revision should have the original runs
      expect(moveOp.source.moveFrom.getRuns()).toHaveLength(2);

      // Destination revision should have cloned runs
      expect(moveOp.destination.moveTo.getRuns()).toHaveLength(2);
    });

    it('should clone content for destination (independent copies)', () => {
      const originalRun = new Run('text');
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: originalRun,
      });

      const sourceRuns = moveOp.source.moveFrom.getRuns();
      const destRuns = moveOp.destination.moveTo.getRuns();

      // Should be different instances
      expect(sourceRuns[0]).not.toBe(destRuns[0]);

      // But same text
      expect(sourceRuns[0]?.getText()).toBe(destRuns[0]?.getText());
    });

    it('should use ID provider when provided', () => {
      let idCounter = 100;
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
        idProvider: () => ++idCounter,
      });

      // IDs should come from the provider
      expect(moveOp.source.rangeStart.getId()).toBe(101);
      expect(moveOp.source.moveFrom.getId()).toBe(102);
      expect(moveOp.destination.rangeStart.getId()).toBe(103);
      expect(moveOp.destination.moveTo.getId()).toBe(104);
    });

    it('should ensure range start/end pairs have matching IDs', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
      });

      // Source range start/end should have same ID
      expect(moveOp.source.rangeStart.getId()).toBe(moveOp.source.rangeEnd.getId());

      // Destination range start/end should have same ID
      expect(moveOp.destination.rangeStart.getId()).toBe(moveOp.destination.rangeEnd.getId());
    });
  });

  describe('XML Generation', () => {
    it('should generate correct XML for moveFromRangeStart', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
        moveId: 'move-1',
      });

      const xml = moveOp.source.rangeStart.toXML();
      expect(xml.name).toBe('w:moveFromRangeStart');
      expect(xml.attributes?.['w:name']).toBe('move-1');
      expect(xml.attributes?.['w:author']).toBe('TestAuthor');
      expect(xml.attributes?.['w:id']).toBeDefined();
    });

    it('should generate correct XML for moveFromRangeEnd', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
      });

      const xml = moveOp.source.rangeEnd.toXML();
      expect(xml.name).toBe('w:moveFromRangeEnd');
      expect(xml.attributes?.['w:id']).toBeDefined();
      // End markers don't have author/date/name
      expect(xml.attributes?.['w:author']).toBeUndefined();
    });

    it('should generate correct XML for moveFrom revision', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('moved text'),
        moveId: 'move-1',
      });

      const xml = moveOp.source.moveFrom.toXML();
      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:moveFrom');
      expect(xml!.attributes?.['w:author']).toBe('TestAuthor');
      expect(xml!.attributes?.['w:moveId']).toBe('move-1');
    });

    it('should generate correct XML for moveToRangeStart', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('text'),
        moveId: 'move-1',
      });

      const xml = moveOp.destination.rangeStart.toXML();
      expect(xml.name).toBe('w:moveToRangeStart');
      expect(xml.attributes?.['w:name']).toBe('move-1');
      expect(xml.attributes?.['w:author']).toBe('TestAuthor');
    });

    it('should generate correct XML for moveTo revision', () => {
      const moveOp = MoveOperationHelper.createMoveOperation({
        author: 'TestAuthor',
        content: new Run('moved text'),
        moveId: 'move-1',
      });

      const xml = moveOp.destination.moveTo.toXML();
      expect(xml).not.toBeNull();
      expect(xml!.name).toBe('w:moveTo');
      expect(xml!.attributes?.['w:author']).toBe('TestAuthor');
      expect(xml!.attributes?.['w:moveId']).toBe('move-1');
    });
  });

  describe('addMoveOperation', () => {
    it('should add all elements to source and destination paragraphs', () => {
      const sourcePara = new Paragraph();
      const destPara = new Paragraph();

      const moveOp = MoveOperationHelper.addMoveOperation(sourcePara, destPara, {
        author: 'TestAuthor',
        content: new Run('moved text'),
      });

      // Source paragraph should have 3 elements
      const sourceContent = sourcePara.getContent();
      expect(sourceContent.length).toBe(3);

      // Destination paragraph should have 3 elements
      const destContent = destPara.getContent();
      expect(destContent.length).toBe(3);
    });

    it('should add elements in correct order (rangeStart, revision, rangeEnd)', () => {
      const sourcePara = new Paragraph();
      const destPara = new Paragraph();

      MoveOperationHelper.addMoveOperation(sourcePara, destPara, {
        author: 'TestAuthor',
        content: new Run('text'),
      });

      // Check source order via XML generation
      const sourceXml = sourcePara.toXML();
      const sourceChildren = (sourceXml.children?.filter((c: any) => typeof c === 'object') || []) as any[];

      // Skip w:pPr if present, then check order
      const contentChildren = sourceChildren.filter(
        (c: any) => c.name !== 'w:pPr'
      );

      expect(contentChildren.length).toBeGreaterThanOrEqual(3);
      expect(contentChildren[0]?.name).toBe('w:moveFromRangeStart');
      expect(contentChildren[1]?.name).toBe('w:moveFrom');
      expect(contentChildren[2]?.name).toBe('w:moveFromRangeEnd');
    });

    it('should return the move operation result', () => {
      const sourcePara = new Paragraph();
      const destPara = new Paragraph();

      const result = MoveOperationHelper.addMoveOperation(sourcePara, destPara, {
        author: 'TestAuthor',
        content: new Run('text'),
      });

      expect(result.moveId).toBeDefined();
      expect(result.source.moveFrom).toBeDefined();
      expect(result.destination.moveTo).toBeDefined();
    });
  });

  describe('Integration with Paragraph toXML', () => {
    it('should generate valid paragraph XML with move operation', () => {
      const sourcePara = new Paragraph();
      sourcePara.addRun(new Run('before '));

      const destPara = new Paragraph();
      destPara.addRun(new Run('destination '));

      MoveOperationHelper.addMoveOperation(sourcePara, destPara, {
        author: 'TestAuthor',
        content: new Run('moved'),
        moveId: 'move-test',
      });

      sourcePara.addRun(new Run(' after'));

      // Convert to XML string for inspection
      const xml = XMLBuilder.elementToString(sourcePara.toXML());

      // Should contain all move elements
      expect(xml).toContain('w:moveFromRangeStart');
      expect(xml).toContain('w:moveFrom');
      expect(xml).toContain('w:moveFromRangeEnd');
      expect(xml).toContain('move-test');
    });
  });
});
