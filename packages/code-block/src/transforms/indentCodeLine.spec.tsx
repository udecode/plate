/** @jsx jsx */

import { createCodeBlockPlugin } from '@/packages/code-block/src/createCodeBlockPlugin';
import {
  PlateEditor,
  TElementEntry,
  createPlateEditor,
  getNodeEntry,
} from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { indentCodeLine } from './indentCodeLine';

jsx;

describe('indent code line', () => {
  describe('when the selection is expanded', () => {
    it('should indent', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'  '}before <anchor />
              selection
              <focus /> after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'    '}before <anchor />
              selection
              <focus /> after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [createCodeBlockPlugin()],
      });

      const codeBlock = getNodeEntry(editor, [0]) as TElementEntry;
      const codeLine = getNodeEntry(editor, [0, 0]) as TElementEntry;

      indentCodeLine(editor, { codeBlock, codeLine });

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when the selection is collapsed', () => {
    describe('when there are only whitespace characters left of the cursor', () => {
      it('should indent', () => {
        const input = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'  '}
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'    '}
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
          plugins: [createCodeBlockPlugin()],
        });

        const codeBlock = getNodeEntry(editor, [0]) as TElementEntry;
        const codeLine = getNodeEntry(editor, [0, 0]) as TElementEntry;

        indentCodeLine(editor, { codeBlock, codeLine });

        expect(input.children).toEqual(output.children);
      });
    });

    describe('when there are non-whitespace characters left of the cursor', () => {
      it('should insert 2 spaces at the cursor', () => {
        const input = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'  '}before
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'  '}before{'  '}
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
          plugins: [createCodeBlockPlugin()],
        });

        const codeBlock = getNodeEntry(editor, [0]) as TElementEntry;
        const codeLine = getNodeEntry(editor, [0, 0]) as TElementEntry;

        indentCodeLine(editor, { codeBlock, codeLine });

        expect(input.children).toEqual(output.children);
      });
    });
  });
});
