/** @jsx jsx */

import { createEditorPlugins } from '@udecode/plate';
import {
  astDeserializerId,
  createDeserializeAstPlugin,
} from '@udecode/plate-ast-serializer';
import { SPEditor } from '@udecode/plate-core';
import {
  createDeserializeHTMLPlugin,
  htmlDeserializerId,
} from '@udecode/plate-html-serializer';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createCodeBlockPlugin } from './createCodeBlockPlugin';
import { getCodeBlockDeserialize } from './getCodeBlockDeserialize';

jsx;

const createCodeBlockDeserialize = <TEditor extends SPEditor = SPEditor>(
  input: TEditor
) => {
  const plugins = [createParagraphPlugin(), createCodeBlockPlugin()];

  plugins.push(
    createDeserializeHTMLPlugin({ plugins }),
    createDeserializeAstPlugin({ plugins })
  );

  return getCodeBlockDeserialize()(
    createEditorPlugins({
      editor: input,
      plugins,
    })
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
      ) as any) as SPEditor;

      const { isDisabled } = createCodeBlockDeserialize(input);

      expect(isDisabled?.(astDeserializerId)).toEqual(false);
      expect(isDisabled?.(htmlDeserializerId)).toEqual(true);
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
      ) as any) as SPEditor;

      const { isDisabled } = createCodeBlockDeserialize(input);

      expect(isDisabled?.(astDeserializerId)).toEqual(false);
      expect(isDisabled?.(htmlDeserializerId)).toEqual(false);
    });
  });
});
