import {
  getPluginType,
  insertNodes,
  isCollapsed,
  PlateEditor,
  TElement,
  unwrapNodes,
} from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { Thread } from '../types';
import { wrapThread } from './wrapThread';

/**
 * Unwrap link at a location (default: selection).
 * Then, the focus of the location is set to selection focus.
 * Then, wrap the link at the location.
 */
export const upsertThreadAtSelection = <T = {}>(
  editor: PlateEditor<T>,
  {
    thread,
    wrap,
  }: {
    thread: Thread;
    /**
     * If true, wrap the thread at the location (default: selection) even if the selection is collapsed.
     */
    wrap?: boolean;
  }
) => {
  if (!editor.selection) return;

  const type = getPluginType(editor, ELEMENT_THREAD);

  if (!wrap && isCollapsed(editor.selection)) {
    return insertNodes<TElement>(editor, {
      type,
      thread,
      children: [],
    });
  }

  // if our cursor is inside an existing comment, but don't have the text selected, select it now
  if (wrap && isCollapsed(editor.selection)) {
    const threadLeaf = Editor.leaf(editor, editor.selection);
    const [, inlinePath] = threadLeaf;
    Transforms.select(editor, inlinePath);
  }

  unwrapNodes(editor, { at: editor.selection, match: { type } });

  wrapThread(editor, { at: editor.selection, thread });

  Transforms.collapse(editor, { edge: 'end' });
};
