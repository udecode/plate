/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { jsx } from '@udecode/plate-test-utils';

import { isPointNextToNode } from './isPointNextToNode';

jsx;

describe('isPointNextToNode', () => {
  const createEditor = (input: JSX.Element): SlateEditor =>
    input as any as SlateEditor;

  describe('when point is next to a node of specified type', () => {
    it('should return true', () => {
      const editor = createEditor(
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
    it('should return false', () => {
      const editor = createEditor(
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
    it('should check the previous node', () => {
      const editor = createEditor(
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
    it('should check from the specified point', () => {
      const editor = createEditor(
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
});
