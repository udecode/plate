import { PlateEditor } from '@udecode/plate-core';
import { Thread } from '../Thread';
import { upsertThread } from './upsertThread';

export const upsertThreadAtSelection = <T = {}>(
  editor: PlateEditor<T>,
  thread: Thread
): any => {
  const { selection } = editor;
  if (selection) {
    return upsertThread(editor, { thread, at: selection });
  }
};
