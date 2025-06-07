/** @jsx jsxt */

import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
import { jsxt } from '@udecode/plate-test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withMergeRules', () => {
  describe('mergeRules: { removeEmpty: true }', () => {
    it('should remove empty previous node when merging', () => {
      const input = (
        <editor>
          <hp>
            <htext />
          </hp>
          <hp>
            <cursor />
            test
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            test
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'p',
            node: {
              isElement: true,
              mergeRules: { removeEmpty: true },
              type: 'p',
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

    it('should NOT remove non-empty previous node when merging', () => {
      const input = (
        <editor>
          <hp>previous content</hp>
          <hp>
            <cursor />
            current content
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            previous content
            <cursor />
            current content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'p',
            node: {
              isElement: true,
              mergeRules: { removeEmpty: true },
              type: 'p',
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

  describe('mergeRules: { removeEmpty: false }', () => {
    it('should NOT remove empty previous node when merging', () => {
      const input = (
        <editor>
          <element type="custom">
            <htext />
          </element>
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
              mergeRules: { removeEmpty: false },
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

  describe('mergeRules: undefined (default)', () => {
    it('should NOT remove empty previous node by default', () => {
      const input = (
        <editor>
          <element type="custom">
            <htext />
          </element>
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

  describe('matchRules override behavior', () => {
    it('should use matchRules override to prevent removal', () => {
      const input = (
        <editor>
          <hp customProperty="customValue">
            <htext />
          </hp>
          <hp>
            <cursor />
            content
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp customProperty="customValue">
            <cursor />
            content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          // Base paragraph plugin that normally removes empty previous
          createSlatePlugin({
            key: 'p',
            node: {
              isElement: true,
              mergeRules: { removeEmpty: true },
              type: 'p',
            },
          }),
          // Override plugin that prevents removal for nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              mergeRules: { removeEmpty: false },
              type: 'override',
              matchRules: ({ node }) => Boolean(node.customProperty),
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

    describe('matchRules override behavior (reverse)', () => {
      it('should use matchRules override to prevent removal', () => {
        const input = (
          <editor>
            <hp>
              <cursor />
            </hp>
            <hcodeblock>
              <hcodeline>content</hcodeline>
            </hcodeblock>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>
                <cursor />
                content
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as any;

        const editor = createSlateEditor({
          plugins: [BaseCodeBlockPlugin],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteForward('character');

        expect(editor.children).toEqual(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
    });

    it('should use default behavior when matchRules does not match', () => {
      const input = (
        <editor>
          <hp>
            <htext />
          </hp>
          <hp>
            <cursor />
            content
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          // Base paragraph plugin that removes empty previous
          createSlatePlugin({
            key: 'p',
            node: {
              isElement: true,
              mergeRules: { removeEmpty: true },
              type: 'p',
            },
          }),
          // Override plugin that only matches nodes with customProperty (won't match)
          createSlatePlugin({
            key: 'customOverride',
            node: {
              mergeRules: { removeEmpty: false },
              type: 'override',
              matchRules: ({ node }) => Boolean(node.customProperty),
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
