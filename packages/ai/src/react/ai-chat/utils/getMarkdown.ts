import type { PlateEditor } from 'platejs/react';

import { serializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { type TElement, KEYS } from 'platejs';

// Internal
export const getMarkdown = (
  editor: PlateEditor,
  type:
    | 'block'
    | 'blockWithBlockId'
    | 'editor'
    | 'editorWithBlockId'
    | 'selection'
) => {
  if (type === 'editor') {
    return serializeMd(editor);
  }
  if (type === 'editorWithBlockId') {
    return serializeMd(editor, { withBlockId: true });
  }

  if (type === 'block') {
    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes({ selectionFallback: true, sort: true });

    const nodes = Array.from(blocks, (entry) => entry[0]);

    return serializeMd(editor, { value: nodes });
  }

  if (type === 'blockWithBlockId') {
    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes({ selectionFallback: true, sort: true });
    const nodes = Array.from(blocks, (entry) => entry[0]);

    return serializeMd(editor, { value: nodes, withBlockId: true });
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

      return serializeMd(editor, { value: modifiedFragment });
    }

    return serializeMd(editor, { value: fragment });
  }

  return '';
};
