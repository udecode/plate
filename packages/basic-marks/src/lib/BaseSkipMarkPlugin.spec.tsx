/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { BaseParagraphPlugin, createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseBoldPlugin } from './BaseBoldPlugin';
import { BaseCodePlugin } from './BaseCodePlugin';
import { BaseItalicPlugin } from './BaseItalicPlugin';
import { BaseSkipMarkPlugin } from './BaseSkipMarkPlugin';

jsxt;

const skipMarkPlugin = BaseSkipMarkPlugin.configure({
  options: {
    query: {
      allow: [BaseCodePlugin.key],
    },
  },
});
const plugins = [
  BaseParagraphPlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  skipMarkPlugin,
];

describe('BaseSkipMarkPlugin', () => {
  describe('insertText', () => {
    describe('when cursor is not in a mark', () => {
      it('should insert text normally', () => {
        const input = (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              testinserted
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          plugins,
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('inserted');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when cursor is at the end of a mark', () => {
      it('should remove marks when inserting text', () => {
        const input = (
          <editor>
            <hp>
              <htext code>test</htext>
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              <htext code>test</htext>
              <htext>inserted</htext>
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          plugins,
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('inserted');

        expect(editor.children).toEqual(output.children);
      });

      it('should not remove marks when between same marks', () => {
        const input = (
          <editor>
            <hp>
              <htext code>test</htext>
              <cursor />
              <htext bold code>
                more
              </htext>
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              <htext code>testinserted</htext>
              <cursor />
              <htext bold code>
                more
              </htext>
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          plugins,
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('inserted');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when different mark types are adjacent', () => {
      it('should remove marks when inserting text', () => {
        const input = (
          <editor>
            <hp>
              <htext code>test</htext>
              <cursor />
              <htext italic>more</htext>
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              <htext code>test</htext>
              <htext>inserted</htext>
              <cursor />
              <htext italic>more</htext>
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          plugins,
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('inserted');

        expect(editor.children).toEqual(output.children);
      });
    });
  });
});
