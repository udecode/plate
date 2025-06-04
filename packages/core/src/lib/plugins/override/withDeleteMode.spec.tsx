/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withDeleteMode', () => {
  describe('deleteMode: { empty: "reset" }', () => {
    it('should reset on deleteBackward when block is empty', () => {
      const input = (
        <editor>
          <element type="blockquote">
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'blockquote',
            node: {
              deleteMode: { empty: 'reset' },
              isElement: true,
              type: 'blockquote',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should NOT reset on deleteBackward when at start with content', () => {
      const input = (
        <editor>
          <element type="blockquote">
            <cursor />
            some content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="blockquote">
            <cursor />
            some content
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'blockquote',
            node: {
              deleteMode: { empty: 'reset' },
              isElement: true,
              type: 'blockquote',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('deleteMode: { start: "reset" }', () => {
    it('should reset on deleteBackward when at start with content', () => {
      const input = (
        <editor>
          <element type="h1">
            <cursor />
            Heading content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            Heading content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should reset on deleteBackward when block is empty', () => {
      const input = (
        <editor>
          <element type="h1">
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should NOT reset when not at start and has content', () => {
      const input = (
        <editor>
          <element type="h1">
            Head
            <cursor />
            ing
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="h1">
            Hea
            <cursor />
            ing
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('deleteMode: undefined (default)', () => {
    it('should NOT reset on deleteBackward when at start', () => {
      const input = (
        <editor>
          <element type="custom">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="custom">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'custom',
            node: {
              isElement: true,
              type: 'custom',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('property cleanup', () => {
    it('should remove custom properties when resetting', () => {
      const input = (
        <editor>
          <element customProp="value" level={1} type="h1">
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
