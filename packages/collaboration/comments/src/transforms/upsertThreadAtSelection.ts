import { PlateEditor, Value } from '@udecode/plate-core';
import { Thread } from '../Thread';
import { upsertThread } from './upsertThread';

export const upsertThreadAtSelection = <V extends Value>(
  editor: PlateEditor<V>,
  thread: Thread
): any => {
  const { selection } = editor;
  if (selection) {
    return upsertThread(editor, { thread, at: selection });
  }
};
