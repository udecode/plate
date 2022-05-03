import { PlateEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { ThreadNode } from '../types';
import { upsertThread } from './upsertThread';

export function selectThread(
  editor: PlateEditor,
  threadEntry: NodeEntry<ThreadNode>
) {
  const [threadNode, threadPath] = threadEntry;
  if (!threadNode.selected) {
    upsertThread(editor, {
      thread: threadNode.thread,
      at: threadPath,
      elementProps: { selected: true },
    });
  }
}
