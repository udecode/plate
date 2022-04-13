import {
  getAbove,
  getPluginType,
  isCollapsed,
  PlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { Thread } from '../types';
import { upsertThreadAtSelection } from './upsertThreadAtSelection';

export async function addThread(editor: PlateEditor, thread: Thread) {
  console.log(thread);
  const type = getPluginType(editor, ELEMENT_THREAD);
  const threadNode = getAbove(editor, {
    match: { type },
  });
  const shouldWrap: boolean =
    threadNode !== undefined && isCollapsed(editor.selection);
  upsertThreadAtSelection(editor, { thread, wrap: shouldWrap });
}
