import {
  getElementDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import { Deserialize, getOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

// FIXME Handle code_line

export const useDeserializeCodeBlock = (): Deserialize => (editor: Editor) => {
  const { code_block, code_line } = getOptions(editor);

  return {
    element: [
      ...getElementDeserializer({
        type: code_block.type,
        rules: [
          { nodeNames: 'PRE' },
          { className: getSlateClass(code_block.type) },
        ],
        ...code_block.deserialize,
      }),
      ...getElementDeserializer({
        type: code_line.type,
        rules: [{ className: getSlateClass(code_line.type) }],
        ...code_line.deserialize,
      }),
    ],
  };
};
