import { PlateEditor, Value } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { TThreadElement } from '../types';
import { upsertThread } from './upsertThread';

export const selectThread = <V extends Value = Value>(
  editor: PlateEditor<V>,
  entry: NodeEntry<TThreadElement>
) => {
  const [node, path] = entry;

  if (!node.selected) {
    upsertThread(editor, {
      thread: node.thread,
      at: path,
      elementProps: { selected: true },
    });
  }
};
