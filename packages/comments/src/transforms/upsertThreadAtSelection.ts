import { PlateEditor, Value } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { Thread, ThreadElement } from '../types';
import { upsertThread } from './upsertThread';

export const upsertThreadAtSelection = <V extends Value>(
  editor: PlateEditor<V>,
  thread: Thread
): NodeEntry<ThreadElement> | undefined => {
  const { selection } = editor;
  if (selection) {
    return upsertThread(editor, { thread, at: selection });
  }
};
