/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { ElementApi, RangeApi } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';

import { isPointNextToNode } from './isPointNextToNode';

jsxt;

describe('isPointNextToNode', () => {
  const createTestEditor = (input: unknown) => {
    if (
      typeof input !== 'object' ||
      input === null ||
      !('children' in input) ||
      !ElementApi.isElementList(input.children) ||
      !('selection' in input) ||
      !(input.selection === null || RangeApi.isRange(input.selection))
    ) {
      throw new TypeError('Expected an editor fixture');
    }

    return createBaseEditor({
      selection: input.selection,
      value: input.children,
    });
  };

  describe('when point is next to a node of specified type', () => {
    it('returns true', () => {
      const editor = createTestEditor(
        <editor>
          <hp>
            <htext>test</htext>
            <cursor />
            <hdate>
              <htext />
            </hdate>
          </hp>
        </editor>
      );

      expect(isPointNextToNode(editor, { nodeType: 'date' })).toBe(true);
    });
  });

  describe('when point is not next to a node of specified type', () => {
    it('returns false', () => {
      const editor = createTestEditor(
        <editor>
          <hp>
            <htext>test</htext>
            <cursor />
            <htext />
            <hdate>
              <htext />
            </hdate>
          </hp>
        </editor>
      );

      expect(isPointNextToNode(editor, { nodeType: 'date' })).toBe(false);
    });
  });

  describe('when reverse option is true', () => {
    it('check the previous node', () => {
      const editor = createTestEditor(
        <editor>
          <hp>
            <hdate>
              <htext />
            </hdate>
            <cursor />
            <htext>test</htext>
          </hp>
        </editor>
      );

      expect(
        isPointNextToNode(editor, { nodeType: 'date', reverse: true })
      ).toBe(true);
    });
  });

  describe('when at option is provided', () => {
    it('check from the specified point', () => {
      const editor = createTestEditor(
        <editor>
          <hp>
            <htext>test</htext>
            <hdate>
              <htext />
            </hdate>
            <htext> more text</htext>
          </hp>
        </editor>
      );

      const at = { offset: 4, path: [0, 0] };
      expect(
        isPointNextToNode(editor, { at, nodeType: 'date', reverse: false })
      ).toBe(true);
    });
  });

  describe('when the point is at both start and end of an empty text node', () => {
    it('checks the next node as a single boundary', () => {
      const editor = createTestEditor(
        <editor>
          <hp>
            <htext>
              <cursor />
            </htext>
            <hdate>
              <htext />
            </hdate>
          </hp>
        </editor>
      );

      expect(isPointNextToNode(editor, { nodeType: 'date' })).toBe(true);
    });
  });

  describe('when the point is in the middle of text', () => {
    it('returns false', () => {
      const editor = createTestEditor(
        <editor>
          <hp>
            te
            <cursor />
            st
            <hdate>
              <htext />
            </hdate>
          </hp>
        </editor>
      );

      expect(isPointNextToNode(editor, { nodeType: 'date' })).toBe(false);
    });
  });

  describe('when neither selection nor at is available', () => {
    it('throws a clear error', () => {
      const editor = createBaseEditor({
        value: [
          {
            children: [{ text: 'test' }],
            type: 'p',
          },
        ],
      });

      expect(() => isPointNextToNode(editor, { nodeType: 'date' })).toThrow(
        'No valid selection point found'
      );
    });
  });
});
