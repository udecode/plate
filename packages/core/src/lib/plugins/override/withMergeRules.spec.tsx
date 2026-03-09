/** @jsx jsxt */

import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseTablePlugin } from '@platejs/table';
import { jsxt } from '@platejs/test-utils';

import { type SlateEditor, createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

const createElementPlugin = ({
  key,
  match,
  mergeRules,
  type = key,
}: {
  key: string;
  match?: ({ node }: any) => boolean;
  mergeRules?: Record<string, unknown>;
  type?: string;
}) =>
  createSlatePlugin({
    key,
    node: {
      isElement: true,
      type,
    },
    ...(mergeRules || match
      ? {
          rules: {
            ...(mergeRules ? { merge: mergeRules } : {}),
            ...(match ? { match } : {}),
          },
        }
      : {}),
  });

const getEditorAfterAction = ({
  action,
  input,
  nodeId,
  plugins = [],
}: {
  action: (editor: ReturnType<typeof createSlateEditor>) => void;
  input: any;
  nodeId?: boolean;
  plugins?: any[];
}) => {
  const editor = createSlateEditor({
    nodeId,
    plugins,
    selection: input.selection,
    value: input.children,
  });

  action(editor);

  return editor;
};

describe('withMergeRules', () => {
  describe('remove-empty merge rules', () => {
    it('removes an empty previous node when merging backward', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            key: 'p',
            mergeRules: { removeEmpty: true },
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('keeps previous content when merging into a non-empty node', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            key: 'p',
            mergeRules: { removeEmpty: true },
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('default merge behavior', () => {
    it.each([
      ['with removeEmpty disabled', { removeEmpty: false }],
      ['without merge rules', undefined],
    ])('%s keeps the merged node instead of deleting content', (_label, mergeRules) => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            key: 'custom',
            mergeRules: mergeRules as Record<string, unknown> | undefined,
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('match overrides', () => {
    it('uses the matching override to prevent removeEmpty behavior', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            key: 'p',
            mergeRules: { removeEmpty: true },
          }),
          createElementPlugin({
            key: 'customOverride',
            match: ({ node }: { node: any }) => Boolean(node.customProperty),
            mergeRules: { removeEmpty: false },
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('falls back to the base merge behavior when the override does not match', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            key: 'p',
            mergeRules: { removeEmpty: true },
          }),
          createElementPlugin({
            key: 'customOverride',
            match: ({ node }: { node: any }) => Boolean(node.customProperty),
            mergeRules: { removeEmpty: false },
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('special merge boundaries', () => {
    it('merges an empty paragraph forward into a code block', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteForward('character'),
        input,
        plugins: [BaseCodeBlockPlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('table boundaries', () => {
    it.each([
      [
        'moves backward from after a table into the last cell',
        (
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
        ) as any as SlateEditor,
        (
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
        ) as any as SlateEditor,
        (editor: ReturnType<typeof createSlateEditor>) =>
          editor.tf.deleteBackward(),
      ],
      [
        'moves backward from after a table with an empty last cell into that cell',
        (
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
        ) as any as SlateEditor,
        (
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
        ) as any as SlateEditor,
        (editor: ReturnType<typeof createSlateEditor>) =>
          editor.tf.deleteBackward(),
      ],
      [
        'moves forward from before a table into the first cell',
        (
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
        ) as any as SlateEditor,
        (
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
        ) as any as SlateEditor,
        (editor: ReturnType<typeof createSlateEditor>) =>
          editor.tf.deleteForward(),
      ],
      [
        'moves forward from the last cell into the next block',
        (
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
        ) as any as SlateEditor,
        (
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
        ) as any as SlateEditor,
        (editor: ReturnType<typeof createSlateEditor>) =>
          editor.tf.deleteForward(),
      ],
      [
        'moves backward from the first table cell into the previous block',
        (
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
        ) as any as SlateEditor,
        (
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
        ) as any as SlateEditor,
        (editor: ReturnType<typeof createSlateEditor>) =>
          editor.tf.deleteBackward(),
      ],
    ])('%s', (_label, input, output, action) => {
      const editor = getEditorAfterAction({
        action,
        input,
        nodeId: true,
        plugins: [BaseTablePlugin],
      });

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
