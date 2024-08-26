/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-core';

import { jsx } from '@udecode/plate-test-utils';

import { isPointNextToNode } from './isPointNextToNode';

jsx;

describe('isPointNextToNode', () => {
  const createEditor = (input: JSX.Element): PlateEditor =>
    input as any as PlateEditor;

  describe('when point is next to a node of specified type', () => {
    it('should return true', () => {
      const editor = createEditor(
        <editor>
          <hp>
            <htext>test</htext>
            <cursor />
            <hinlinedate>
              <htext />
            </hinlinedate>
          </hp>
        </editor>
      );

      expect(isPointNextToNode(editor, 'inline_date')).toBe(true);
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
            <hinlinedate>
              <htext />
            </hinlinedate>
          </hp>
        </editor>
      );

      expect(isPointNextToNode(editor, 'inline_date')).toBe(false);
    });
  });

  describe('when reverse option is true', () => {
    it('should check the previous node', () => {
      const editor = createEditor(
        <editor>
          <hp>
            <hinlinedate>
              <htext />
            </hinlinedate>
            <cursor />
            <htext>test</htext>
          </hp>
        </editor>
      );

      expect(isPointNextToNode(editor, 'inline_date', { reverse: true })).toBe(
        true
      );
    });
  });

  describe('when at option is provided', () => {
    it('should check from the specified point', () => {
      const editor = createEditor(
        <editor>
          <hp>
            <htext>test</htext>
            <hinlinedate>
              <htext />
            </hinlinedate>
            <htext> more text</htext>
          </hp>
        </editor>
      );

      const at = { offset: 4, path: [0, 0] };
      expect(
        isPointNextToNode(editor, 'inline_date', { at, reverse: false })
      ).toBe(true);
    });
  });
});
