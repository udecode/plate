/** @jsx jsxt */

import type { BasePlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import {
  BaseParagraphPlugin,
  createEditorPlugin,
  HtmlPlugin,
  ParserPlugin,
} from 'platejs';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { CodeBlockPlugin } from './CodeBlockPlugin';

jsxt;

describe('code block deserialization', () => {
  describe('when selection in code line', () => {
    it('disable all deserializers except the ast serializer', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as BasePlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createPlateRuntimeEditor({
        initialSelection: input.selection,
        initialValue: input.children,
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          createEditorPlugin({
            key: 'a',
            parser: {
              format: 'text/plain',
              deserialize() {
                return [{ text: 'test' }];
              },
            },
          }),
        ],
      });

      getCurrentRuntimeTransforms(editor).insertData({
        getData: (format: string) =>
          format === 'text/html'
            ? `<pre><code>test</code></pre>`
            : format === 'text/plain'
              ? 'test'
              : '',
      } as any);

      expect(editor.read((state) => state.value.root())).toEqual(
        output.children
      );
    });
  });

  describe('when selection outside of code line', () => {
    it('does not affect deserialization', () => {
      const input = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createPlateRuntimeEditor({
        initialSelection: input.selection,
        initialValue: input.children,
        plugins: [
          ParserPlugin,
          HtmlPlugin,
          BaseParagraphPlugin,
          CodeBlockPlugin,
        ],
      });

      getCurrentRuntimeTransforms(editor).insertData({
        getData: (format: string) =>
          format === 'text/html'
            ? `<pre><code>test</code></pre>`
            : format === 'text/plain'
              ? 'test'
              : '',
      } as any);

      expect(editor.read((state) => state.value.root())).toEqual(
        output.children
      );
    });
  });

  describe('deleting lines after the codeblock', () => {
    it('normalizes inserted nodes into code lines', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>Line 1</hcodeline>
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
          <hp>Line 3</hp>
        </editor>
      ) as any as BasePlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              Line 1
              <cursor />
            </hcodeline>
          </hcodeblock>
          <hp>Line 3</hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createPlateRuntimeEditor({
        initialSelection: input.selection,
        initialValue: input.children,
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
      });

      editor.update((tx) => {
        tx.text.deleteBackward({ unit: 'character' });
      });
      expect(editor.read((state) => state.value.root())).toEqual(
        output.children
      );
    });
  });
});
