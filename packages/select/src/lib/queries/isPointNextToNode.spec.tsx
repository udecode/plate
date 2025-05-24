/** @jsx jsxt */

import type { JSX } from 'react';

import { createEditor, createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import { UnselectablePlugin } from '../UnselectablePlugin';
import { isPointNextToNode } from './isPointNextToNode';

jsxt;

describe('isPointNextToNode', () => {
  const createTestEditor = (input: JSX.Element) =>
    createSlateEditor({
      editor: createEditor(input as any),
      plugins: [
        UnselectablePlugin.configure({
          options: {
            query: {
              allow: ['date'],
            },
          },
        }),
      ],
    });

  describe('when point is next to a node of specified type', () => {
    it('should return true', () => {
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

      expect(isPointNextToNode(editor)).toBe(true);
    });
  });

  describe('when point is not next to a node of specified type', () => {
    it('should return false', () => {
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

      expect(isPointNextToNode(editor)).toBe(false);
    });
  });

  describe('when reverse option is true', () => {
    it('should check the previous node', () => {
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

      expect(isPointNextToNode(editor, { reverse: true })).toBe(true);
    });
  });

  describe('when at option is provided', () => {
    it('should check from the specified point', () => {
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
      expect(isPointNextToNode(editor, { at, reverse: false })).toBe(true);
    });
  });
});
