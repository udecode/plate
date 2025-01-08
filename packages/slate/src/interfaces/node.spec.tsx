/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../create-editor';
import { NodeApi } from './node';

jsx;

describe('NodeApi', () => {
  describe('.firstChild', () => {
    it('should get first child', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
              <text>two</text>
            </element>
          </editor>
        ) as any
      );

      const [node] = NodeApi.firstChild(editor, [0]) ?? [];
      expect(node).toEqual({ text: 'one' });
    });
  });

  describe('.firstText', () => {
    it('should get first text node', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <element>
                <text>one</text>
              </element>
              <text>two</text>
            </element>
          </editor>
        ) as any
      );

      const [node] = NodeApi.firstText(editor) ?? [];
      expect(node).toEqual({ text: 'one' });
    });
  });

  describe('.isLastChild', () => {
    it('should return true if node is last child', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
              <text>two</text>
            </element>
          </editor>
        ) as any
      );

      expect(NodeApi.isLastChild(editor, [0, 1])).toBe(true);
      expect(NodeApi.isLastChild(editor, [0, 0])).toBe(false);
    });

    it('should return false for root node', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
            </element>
          </editor>
        ) as any
      );

      expect(NodeApi.isLastChild(editor, [])).toBe(false);
    });
  });

  describe('.lastChild', () => {
    it('should get last child', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
              <text>two</text>
            </element>
          </editor>
        ) as any
      );

      const [node] = NodeApi.lastChild(editor, [0]) ?? [];
      expect(node).toEqual({ text: 'two' });
    });
  });
});
