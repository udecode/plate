import type { TElement } from '@udecode/plate';
import type { PlateEditor } from '@udecode/plate/react';

import { serializeMd } from '@udecode/plate-markdown';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

// Internal
export const getMarkdown = (
  editor: PlateEditor,
  type: 'block' | 'editor' | 'selection'
) => {
  if (type === 'editor') {
    return serializeMd(editor);
  }
  if (type === 'block') {
    const blocks = editor.getOption(BlockSelectionPlugin, 'isSelectingSome')
      ? editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()
      : editor.api.nodes({
          mode: 'highest',
          match: (n) => editor.api.isBlock(n),
        });

    const nodes = Array.from(blocks, (entry) => entry[0]);

    return serializeMd(editor, { value: nodes });
  }
  if (type === 'selection') {
    const fragment = editor.api.fragment<TElement>();

    // Remove any block formatting
    if (fragment.length === 1) {
      const modifiedFragment = [
        {
          children: fragment[0].children,
          type: 'p',
        },
      ];

      return serializeMd(editor, { value: modifiedFragment });
    }

    return serializeMd(editor, { value: fragment });
  }

  return '';
};
