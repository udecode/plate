import type { PlateEditor } from 'platejs/react';

import { type Element, type Path, PathApi } from '@platejs/slate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

const getInsertedElement = (editor: PlateEditor, path: Path) => {
  const node = editor.api.node<Element>(path)?.[0];

  if (!node) {
    throw new Error(
      `insertBlocksAndSelect: inserted node not found at path ${path.join('.')}`
    );
  }

  return node;
};

export const insertBlocksAndSelect = (
  editor: PlateEditor,
  nodes: Element[],
  { at, insertedCallback }: { at: Path; insertedCallback?: () => void }
) => {
  editor.update((tx) => {
    tx.nodes.insert(nodes, { at });
  });

  insertedCallback?.();

  const insertedNodes = [getInsertedElement(editor, at)];

  let count = 1;

  while (count < nodes.length) {
    at = PathApi.next(at);
    const nextNode = getInsertedElement(editor, at);
    insertedNodes.push(nextNode);
    count++;
  }

  setTimeout(() => {
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(insertedNodes.map((n) => n.id as string))
    );
  }, 0);
};
