/** @jsx jsx */

import { createPlateUIEditor } from '@udecode/plate';
import {
  astDeserializerId,
  createDeserializeAstPlugin,
} from '@udecode/plate-ast-serializer';
import { PlateEditor } from '@udecode/plate-core';
import {
  createDeserializeHTMLPlugin,
  htmlDeserializerId,
} from '@udecode/plate-html-serializer';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createCodeBlockPlugin } from './createCodeBlockPlugin';
import { getCodeBlockDeserialize } from './getCodeBlockDeserialize';

jsx;

const createCodeBlockDeserialize = (input: PlateEditor) => {
  const plugins = [createParagraphPlugin(), createCodeBlockPlugin()];

  plugins.push(
    createDeserializeHTMLPlugin(),
    createDeserializeAstPlugin({ plugins })
  );

  return getCodeBlockDeserialize()(
    createPlateUIEditor({
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
      ) as any) as PlateEditor;

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
      ) as any) as PlateEditor;

      const { isDisabled } = createCodeBlockDeserialize(input);

      expect(isDisabled?.(astDeserializerId)).toEqual(false);
      expect(isDisabled?.(htmlDeserializerId)).toEqual(false);
    });
  });
});
