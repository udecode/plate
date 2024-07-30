/** @jsx jsx */

import { type PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createCodeBlockPlugin } from '../../client/CodeBlockPlugin';
import { insertCodeBlock } from './insertCodeBlock';

jsx;

describe('insert code block', () => {
  describe('when selection is at start of block', () => {
    it('should turn line to code block', () => {
      const input = (
        <editor>
          <hp>line 1</hp>
          <hp>
            <cursor />
            line 2
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hp>line 1</hp>
          <hcodeblock>
            <hcodeline>
              <cursor />
              line 2
            </hcodeline>
          </hcodeblock>
          <hp>line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createCodeBlockPlugin()],
      });

      insertCodeBlock(editor);

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when selection is not at start of block', () => {
    it('should split line at selection and turn latter line to code block', () => {
      const input = (
        <editor>
          <hp>line 1</hp>
          <hp>
            before <cursor />
            after
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hp>line 1</hp>
          <hp>before </hp>
          <hcodeblock>
            <hcodeline>
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
          <hp>line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createCodeBlockPlugin()],
      });

      insertCodeBlock(editor);

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when selection is expanded', () => {
    it('should do nothing', () => {
      const input = (
        <editor>
          <hp>line 1</hp>
          <hp>
            before <anchor />
            selection
            <focus />
            after
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hp>line 1</hp>
          <hp>
            before <anchor />
            selection
            <focus />
            after
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createCodeBlockPlugin()],
      });

      insertCodeBlock(editor);

      expect(input.children).toEqual(output.children);
    });
  });
});
