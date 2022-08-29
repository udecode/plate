import {
  findNode,
  getAboveNode,
  getPluginType,
  isCollapsed,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Editor, Location, NodeEntry, Range, Transforms } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { findSelectedThreadNodeEntry } from '../queries/findSelectedThreadNodeEntry';
import { ThreadElement, ThreadNodeData } from '../types';
import { isThread } from '../utils/isThread';
import { Thread } from '../utils/types';
import { wrapWithThread } from './wrapWithThread';

export const upsertThread = <V extends Value>(
  editor: PlateEditor<V>,
  {
    at,
    thread,
    elementProps,
  }: { thread: Thread; at: Location; elementProps?: Partial<ThreadNodeData> }
): NodeEntry<ThreadElement> | undefined => {
  const type = getPluginType(editor, ELEMENT_THREAD);
  const isRange = Range.isRange(at);

  if (isRange && isCollapsed(at as Range)) {
    const threadLeaf = Editor.leaf(editor as any, at);
    const [, inlinePath] = threadLeaf;
    Transforms.select(editor as any, inlinePath);
    at = editor.selection!;
  }

  const threadNodeEntry2 = getAboveNode(editor, {
    match: {
      type,
    },
  });

  if (threadNodeEntry2) {
    Transforms.setNodes<ThreadElement>(
      editor as any,
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

    Transforms.select(editor as any, threadPath);
  }

  return findSelectedThreadNodeEntry(editor);
};
