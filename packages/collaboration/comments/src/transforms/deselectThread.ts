import { PlateEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { ThreadElement } from '../types';
import { upsertThread } from './upsertThread';

export const deselectThread = (
  editor: PlateEditor,
  threadEntry: NodeEntry<ThreadElement>
) => {
  const [threadNode, threadPath] = threadEntry;
  if (threadNode.selected) {
    upsertThread(editor, {
      thread: threadNode.thread,
      at: threadPath,
      elementProps: { selected: false },
    });
  }
};
