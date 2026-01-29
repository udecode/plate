/**
 * Tests for Revision field context functionality
 * Tests field-revision linkage for revisions inside complex fields
 */

import { Revision, FieldContext } from '../../src/elements/Revision';
import { ComplexField } from '../../src/elements/Field';
import { Run } from '../../src/elements/Run';

describe('Revision Field Context', () => {
  describe('Field Context Properties', () => {
    it('should set and get field context', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      const context: FieldContext = {
        position: 'result',
        instruction: 'HYPERLINK "http://example.com"',
      };

      revision.setFieldContext(context);

      expect(revision.getFieldContext()).toEqual(context);
    });

    it('should have undefined field context by default', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      expect(revision.getFieldContext()).toBeUndefined();
    });

    it('should support field context in constructor', () => {
      const context: FieldContext = {
        position: 'instruction',
        instruction: 'TOC',
      };

      const revision = new Revision({
        author: 'Author',
        type: 'insert',
        content: new Run('text'),
        fieldContext: context,
      });

      expect(revision.getFieldContext()).toEqual(context);
    });
  });

  describe('isInsideField', () => {
    it('should return false when no field context', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      expect(revision.isInsideField()).toBe(false);
    });

    it('should return true when field context is set', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      revision.setFieldContext({ position: 'result' });
      expect(revision.isInsideField()).toBe(true);
    });
  });

  describe('isInsideFieldResult', () => {
    it('should return false when no field context', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      expect(revision.isInsideFieldResult()).toBe(false);
    });

    it('should return true when position is result', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      revision.setFieldContext({ position: 'result' });
      expect(revision.isInsideFieldResult()).toBe(true);
    });

    it('should return false when position is instruction', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      revision.setFieldContext({ position: 'instruction' });
      expect(revision.isInsideFieldResult()).toBe(false);
    });
  });

  describe('isInsideFieldInstruction', () => {
    it('should return false when no field context', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      expect(revision.isInsideFieldInstruction()).toBe(false);
    });

    it('should return false when position is result', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      revision.setFieldContext({ position: 'result' });
      expect(revision.isInsideFieldInstruction()).toBe(false);
    });

    it('should return true when position is instruction', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      revision.setFieldContext({ position: 'instruction' });
      expect(revision.isInsideFieldInstruction()).toBe(true);
    });
  });

  describe('getParentField', () => {
    it('should return undefined when no field context', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      expect(revision.getParentField()).toBeUndefined();
    });

    it('should return undefined when field context has no field reference', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));
      revision.setFieldContext({ position: 'result' });
      expect(revision.getParentField()).toBeUndefined();
    });

    it('should return the parent field when set', () => {
      const field = new ComplexField({
        instruction: 'HYPERLINK "http://example.com"',
        result: 'Example Link',
      });

      const revision = Revision.createInsertion('Author', new Run('text'));
      revision.setFieldContext({
        field,
        instruction: field.getInstruction(),
        position: 'result',
      });

      expect(revision.getParentField()).toBe(field);
    });
  });

  describe('Field-Revision Bidirectional Linkage', () => {
    it('should support bidirectional linkage between field and revision', () => {
      const field = new ComplexField({
        instruction: 'TOC \\o "1-3" \\h',
        result: 'Table of Contents',
      });

      const revision = Revision.createInsertion(
        'Author',
        new Run('inserted text')
      );

      // Set up bidirectional linkage
      revision.setFieldContext({
        field,
        instruction: field.getInstruction(),
        position: 'result',
      });
      field.addResultRevision(revision);

      // Verify from revision side
      expect(revision.getParentField()).toBe(field);
      expect(revision.isInsideFieldResult()).toBe(true);

      // Verify from field side
      expect(field.getResultRevisions()).toContain(revision);
      expect(field.hasResultRevisions()).toBe(true);
    });

    it('should allow accessing field instruction from revision', () => {
      const instruction = 'MERGEFIELD CustomerName \\* MERGEFORMAT';
      const field = new ComplexField({
        instruction,
        result: 'John Doe',
      });

      const revision = Revision.createDeletion('Author', new Run('old text'));
      revision.setFieldContext({
        field,
        instruction,
        position: 'result',
      });

      expect(revision.getFieldContext()?.instruction).toBe(instruction);
    });
  });

  describe('Chaining Support', () => {
    it('should support method chaining with setFieldContext', () => {
      const revision = Revision.createInsertion('Author', new Run('text'));

      const result = revision
        .setFieldContext({ position: 'result' })
        .setLocation({ paragraphIndex: 0 });

      expect(result).toBe(revision);
      expect(revision.isInsideFieldResult()).toBe(true);
      expect(revision.getLocation()?.paragraphIndex).toBe(0);
    });
  });
});
