import type { PlateEditor } from '@udecode/plate-common/react';

import {
  getNodeEntries,
  getSelectionFragment,
  isBlock,
} from '@udecode/plate-common';
import { serializeMd, serializeMdNodes } from '@udecode/plate-markdown';
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
      : getNodeEntries(editor, {
          match: (n) => isBlock(editor, n),
          mode: 'highest',
        });

    const nodes = Array.from(blocks, (entry) => entry[0]);

    return serializeMdNodes(nodes as any);
  }
  if (type === 'selection') {
    const fragment = getSelectionFragment(editor);

    // Remove any block formatting
    if (fragment.length === 1) {
      fragment[0] = {
        children: fragment[0].children,
        type: 'p',
      };
    }

    return serializeMdNodes(fragment);
  }

  return '';
};
