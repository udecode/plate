/** @jsx jsxt */
import { describe, expect, test as it } from 'bun:test';

import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseTablePlugin } from '@platejs/table';
import { jsxt } from '@platejs/test-utils';

import { type SlateEditor, createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withMergeRules', () => {
  describe('rules: { merge: { removeEmpty: true } }', () => {
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
              type: 'p',
            },
            rules: { merge: { removeEmpty: true } },
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
              type: 'p',
            },
            rules: { merge: { removeEmpty: true } },
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

  describe('rules: { merge: { removeEmpty: false } }', () => {
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
              type: 'custom',
            },
            rules: { merge: { removeEmpty: false } },
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
              type: 'p',
            },
            rules: { merge: { removeEmpty: true } },
          }),
          // Override plugin that prevents removal for nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              merge: { removeEmpty: false },
              match: ({ node }: { node: any }) => Boolean(node.customProperty),
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

    describe('deleteForward empty -> codeblock', () => {
      it('should merge', () => {
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
            <hp>
              <cursor />
              content
            </hp>
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
              type: 'p',
            },
            rules: { merge: { removeEmpty: true } },
          }),
          // Override plugin that only matches nodes with customProperty (won't match)
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              merge: { removeEmpty: false },
              match: ({ node }: { node: any }) => Boolean(node.customProperty),
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

  describe('table', () => {
    // https://github.com/udecode/editor-protocol/issues/22
    describe('Delete backward after a table', () => {
      it('should select the last cell', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
            <hp>
              <cursor />a
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>
                    12
                    <cursor />a
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          nodeId: true,
          plugins: [BaseTablePlugin],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward();

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
    });

    describe('Delete backward after empty cell', () => {
      it('should select the last cell', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>
              <cursor />a
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>
                    <cursor />a
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          nodeId: true,
          plugins: [BaseTablePlugin],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward();

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
    });

    // https://github.com/udecode/editor-protocol/issues/23
    describe('Delete forward before a table', () => {
      it('should select its first cell', () => {
        const input = (
          <editor>
            <hp>
              a
              <cursor />
            </hp>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              a<cursor />
              11
            </hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          nodeId: true,
          plugins: [BaseTablePlugin],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteForward();

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
    });

    describe('Delete forward from end of last cell', () => {
      it('should merge with next element', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>
                    12
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>next content</hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>
                    12
                    <cursor />
                    next content
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          nodeId: true,
          plugins: [BaseTablePlugin],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteForward();

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
    });

    describe('Delete backward from start of first cell', () => {
      it('should merge with previous element', () => {
        const input = (
          <editor>
            <hp>previous content</hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                    11
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              previous content
              <cursor />
              11
            </hp>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          nodeId: true,
          plugins: [BaseTablePlugin],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward();

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
    });
  });
});
