import {
  getAbove,
  getPluginType,
  PlateEditor,
  unwrapNodes,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
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
    console.log('selection before', editor.selection);
    unwrapNodes(editor, { at: editor.selection, match: { type } });
    wrapThread(editor, { at: editor.selection, thread });
    console.log('selection after', editor.selection);
    Transforms.select(editor, {
      anchor: {
        offset: 1,
        path: [1, 1, 0],
      },
      focus: {
        offset: 1,
        path: [1, 1, 0],
      },
    });
  }
};
