/** @jsx jsxt */

import { createEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { insertCodeBlock } from './insertCodeBlock';

jsxt;

describe('insert code block', () => {
  describe('when selection is at start of block', () => {
    it('should turn line to code block', () => {
      const input = createEditor(
        (
          <editor>
            <hp>line 1</hp>
            <hp>
              <cursor />
              line 2
            </hp>
            <hp>line 3</hp>
          </editor>
        ) as any
      );

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
      ) as any;

      const editor = createPlateEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      insertCodeBlock(editor);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when selection is not at start of block', () => {
    it('should split line at selection and turn latter line to code block', () => {
      const input = createEditor(
        (
          <editor>
            <hp>line 1</hp>
            <hp>
              before <cursor />
              after
            </hp>
            <hp>line 3</hp>
          </editor>
        ) as any
      );

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
      ) as any;

      const editor = createPlateEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      insertCodeBlock(editor);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when selection is expanded', () => {
    it('should do nothing', () => {
      const input = createEditor(
        (
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
        ) as any
      );

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
      ) as any;

      const editor = createPlateEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      insertCodeBlock(editor);

      expect(editor.children).toEqual(output.children);
    });
  });
});
