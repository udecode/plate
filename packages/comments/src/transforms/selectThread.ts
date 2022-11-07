import { PlateEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { TThreadElement } from '../types';
import { upsertThread } from './upsertThread';

export const selectThread = (
  editor: PlateEditor,
  threadEntry: NodeEntry<TThreadElement>
) => {
  const [threadNode, threadPath] = threadEntry;
  if (!threadNode.selected) {
    upsertThread(editor, {
      thread: threadNode.thread,
      at: threadPath,
      elementProps: { selected: true },
    });
  }
};
