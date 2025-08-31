import type { PlateEditor } from 'platejs/react';

import { type SerializeMdOptions, serializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type TElement, KEYS } from 'platejs';

// Internal
export const getMarkdown = (
  editor: PlateEditor,
  type: 'block' | 'editor' | 'selection',
  options?: SerializeMdOptions
) => {
  if (type === 'editor') {
    return serializeMd(editor, options);
  }
  if (type === 'block') {
    const blocks = editor.getOption(BlockSelectionPlugin, 'isSelectingSome')
      ? editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()
      : editor.api.nodes({
          mode: 'highest',
          match: (n) => editor.api.isBlock(n),
        });

    const nodes = Array.from(blocks, (entry) => entry[0]);

    return serializeMd(editor, { value: nodes, ...options });
  }
  if (type === 'selection') {
    const fragment = editor.api.fragment<TElement>();

    // Remove any block formatting
    if (fragment.length === 1) {
      const modifiedFragment = [
        {
          children: fragment[0].children,
          type: KEYS.p,
        },
      ];

      return serializeMd(editor, { value: modifiedFragment, ...options });
    }

    return serializeMd(editor, { value: fragment, ...options });
  }

  return '';
};
