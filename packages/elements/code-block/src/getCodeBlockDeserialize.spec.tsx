/** @jsx jsx */

import {
  createDeserializeHtmlPlugin,
  createPlateUIEditor,
} from '@udecode/plate';
import {
  createDeserializeAstPlugin,
  KEY_DESERIALIZE_AST,
} from '@udecode/plate-ast-serializer';
import { getPlugin, PlateEditor } from '@udecode/plate-core';
import { KEY_DESERIALIZE_HTML } from '@udecode/plate-html-serializer';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_CODE_BLOCK } from './constants';
import { createCodeBlockPlugin } from './createCodeBlockPlugin';
import { getCodeBlockDeserialize } from './getCodeBlockDeserialize';
import { CodeBlockPlugin } from './types';

jsx;

const createCodeBlockDeserialize = (input: PlateEditor) => {
  const editor = createPlateUIEditor({
    editor: input,
    plugins: [
      createParagraphPlugin(),
      createCodeBlockPlugin(),
      createDeserializeHtmlPlugin(),
      createDeserializeAstPlugin(),
    ],
  });

  return getCodeBlockDeserialize()(
    editor,
    getPlugin<CodeBlockPlugin>(editor, ELEMENT_CODE_BLOCK)
  );
};

describe('code block deserialization', () => {
  describe('when selection in code line', () => {
    it('should disable all deserializers except the ast serializer', () => {
      const input = ((
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as PlateEditor;

      const { isDisabled } = createCodeBlockDeserialize(input);

      expect(isDisabled?.(KEY_DESERIALIZE_AST)).toEqual(false);
      expect(isDisabled?.(KEY_DESERIALIZE_HTML)).toEqual(true);
    });
  });

  describe('when selection outside of code line', () => {
    it('should not affect deserialization', () => {
      const input = ((
        <editor>
          <hp>
            <htext />
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const { isDisabled } = createCodeBlockDeserialize(input);

      expect(isDisabled?.(KEY_DESERIALIZE_AST)).toEqual(false);
      expect(isDisabled?.(KEY_DESERIALIZE_HTML)).toEqual(false);
    });
  });
});
