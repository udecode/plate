import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getPluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_BLOCKQUOTE } from './defaults';

export const useDeserializeBlockquote = (): DeserializeHtml => (
  editor: Editor
) => {
  const options = getPluginOptions(editor, ELEMENT_BLOCKQUOTE);

  return {
    element: getElementDeserializer({
      type: options.type,
      rules: [{ nodeNames: 'BLOCKQUOTE' }],
      ...options.deserialize,
    }),
  };
};
