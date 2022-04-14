import { PlateEditor } from '@udecode/plate-core';
import { Thread } from '../types';
import { upsertThreadAtSelection } from './upsertThreadAtSelection';

export async function upsertThread(editor: PlateEditor, thread: Thread) {
  upsertThreadAtSelection(editor, thread);
}
