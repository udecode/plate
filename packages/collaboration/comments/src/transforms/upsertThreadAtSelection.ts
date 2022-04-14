import {
  getPluginType,
  isCollapsed,
  PlateEditor,
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
  thread: Thread
) => {
  if (editor.selection) {
    const type = getPluginType(editor, ELEMENT_THREAD);

    if (isCollapsed(editor.selection)) {
      const threadLeaf = Editor.leaf(editor, editor.selection);
      const [, inlinePath] = threadLeaf;
      Transforms.select(editor, inlinePath);
    }

    const selectionLength =
      editor.selection.focus.offset - editor.selection.anchor.offset;
    unwrapNodes(editor, { at: editor.selection, match: { type } });
    wrapThread(editor, { at: editor.selection, thread });
    Transforms.select(editor, {
      anchor: editor.selection.anchor,
      focus: {
        offset: selectionLength,
        path: editor.selection.anchor.path,
      },
    });
  }
};
