import { PlateEditor, TNodeEntry, Value } from '@udecode/plate-core';
import { TThreadElement } from '../types';
import { upsertThread } from './upsertThread';

export const deselectThread = <V extends Value = Value>(
  editor: PlateEditor<V>,
  entry: TNodeEntry<TThreadElement>
) => {
  const [node, path] = entry;

  if (node.selected) {
    upsertThread(editor, {
      thread: node.thread,
      at: path,
      elementProps: { selected: false },
    });
  }
};
