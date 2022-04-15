import { PlateEditor } from '@udecode/plate-core';
import { Thread } from '../Thread';
import { upsertThreadAtSelection } from './upsertThreadAtSelection';

export function upsertThread<T = {}>(
  editor: PlateEditor<T>,
  thread: Thread
): any {
  return upsertThreadAtSelection(editor, thread);
}
