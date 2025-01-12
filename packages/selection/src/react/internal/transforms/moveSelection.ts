import { type NodeEntry, type TElement, PathApi } from '@udecode/plate';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';

export const moveSelection = (
  editor: PlateEditor,
  direction: 'down' | 'up'
) => {
  const { api, getOptions, setOption } = getEditorPlugin(
    editor,
    BlockSelectionPlugin
  );
  const isSelectable = getOptions().isSelectable;
  const blocks = api.blockSelection.getNodes();

  if (blocks.length === 0) return;
  if (direction === 'up') {
    const [, topPath] = blocks[0];

    let prevEntry: NodeEntry | undefined;

    while (!prevEntry) {
      prevEntry = editor.api.previous<TElement & { id: string }>({
        at: topPath,
        block: true,
        mode: 'lowest',
      });

      if (prevEntry) {
        if (
          topPath.length > 1 &&
          !PathApi.equals(PathApi.parent(prevEntry[1]), PathApi.parent(topPath))
        ) {
          let found = false;
          let parentPath = topPath;

          while (!found) {
            const parentEntry = editor.api.parent<TElement & { id: string }>(
              parentPath
            )!;

            if (!parentEntry) {
              break;
            }

            parentPath = parentEntry[1];

            if (isSelectable?.(...parentEntry)) {
              prevEntry = parentEntry;
              found = true;
            }
          }
        }

        const [prevNode] = prevEntry;
        setOption('anchorId', prevNode.id ?? null);
        api.blockSelection.addSelectedRow(prevNode.id, { clear: true });

        return;
      }
    }
  } else {
    // direction === 'down'
    const [, bottomPath] = blocks.at(-1)!;

    const nextEntry = editor.api.next<TElement & { id: string }>({
      at: bottomPath,
      block: true,
    });

    if (!nextEntry) return;

    const [nextNode] = nextEntry;
    setOption('anchorId', nextNode.id ?? null);
    api.blockSelection.addSelectedRow(nextNode.id, { clear: true });
  }
};
