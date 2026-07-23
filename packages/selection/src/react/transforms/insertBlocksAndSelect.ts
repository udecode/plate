import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateContext,
  EditorUpdateTransaction,
  Element,
  Path,
} from '@platejs/plite';

import { PathApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const insertBlocksAndSelect = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { afterCommit }: EditorUpdateContext,
  nodes: Element[],
  { at, insertedCallback }: { at: Path; insertedCallback?: () => void }
) => {
  const { setOption } = editor.plugin(BlockSelectionPlugin);

  tx.nodes.insert(nodes, { at });

  const insertedNodes = [tx.nodes.get<Element>(at)![0]];
  let count = 1;
  let path = at;

  while (count < nodes.length) {
    path = PathApi.next(path);
    const nextNode = tx.nodes.get<Element>(path)![0];
    insertedNodes.push(nextNode);
    count++;
  }
  const ids = insertedNodes.map((node) => node.id as string);

  afterCommit(() => {
    insertedCallback?.();
    setOption('selectedIds', new Set(ids));
  });
};
