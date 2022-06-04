import {
  findNode,
  getAbove,
  getPluginType,
  isCollapsed,
  PlateEditor,
} from '@udecode/plate-core';
import { Editor, Location, Range, Transforms } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { findSelectedThreadNodeEntry } from '../findSelectedThreadNodeEntry';
import { isThread } from '../isThread';
import { Thread } from '../Thread';
import { ThreadNode, ThreadNodeData } from '../types';
import { wrapWithThread } from './wrapWithThread';

export function upsertThread<T = {}>(
  editor: PlateEditor<T>,
  {
    at,
    thread,
    elementProps,
  }: { thread: Thread; at: Location; elementProps?: Partial<ThreadNodeData> }
): any {
  const type = getPluginType(editor, ELEMENT_THREAD);
  const isRange = Range.isRange(at);

  if (isRange && isCollapsed(at as Range)) {
    const threadLeaf = Editor.leaf(editor, at);
    const [, inlinePath] = threadLeaf;
    Transforms.select(editor, inlinePath);
    at = editor.selection!;
  }

  const threadNodeEntry2 = getAbove(editor, {
    match: {
      type,
    },
  });

  if (threadNodeEntry2) {
    Transforms.setNodes<ThreadNode>(
      editor,
      {
        thread,
        ...elementProps,
      },
      { at: threadNodeEntry2[1] }
    );
  } else {
    wrapWithThread(editor, { at, thread, elementProps });
  }

  if (isRange) {
    const threadNodeEntry = findNode(editor, {
      at: [],
      match(node: any) {
        return isThread(editor, node) && node.thread.id === thread.id;
      },
    });
    const [, threadPath] = threadNodeEntry!;

    Transforms.select(editor, threadPath);
  }

  return findSelectedThreadNodeEntry(editor);
}
