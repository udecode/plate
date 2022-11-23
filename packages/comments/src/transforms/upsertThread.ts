import {
  findNode,
  getAboveNode,
  getLeafNode,
  getPluginType,
  isCollapsed,
  PlateEditor,
  select,
  setNodes,
  TNodeEntry,
  TNodeProps,
  Value,
} from '@udecode/plate-core';
import { Location, Range } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { getAboveThreadNode } from '../queries';
import { Thread, TThreadElement } from '../types';
import { isThreadNode } from '../utils';
import { wrapNodesInThread } from './wrapNodesInThread';

export const upsertThread = <V extends Value>(
  editor: PlateEditor<V>,
  {
    at = editor.selection,
    thread,
    elementProps,
  }: {
    thread: Thread;
    at?: Location | null;
    elementProps?: TNodeProps<TThreadElement>;
  }
): TNodeEntry<TThreadElement> | undefined => {
  if (!at) return;

  const type = getPluginType(editor, ELEMENT_THREAD);
  const isRange = Range.isRange(at);

  if (isRange && isCollapsed(at as Range)) {
    const threadLeaf = getLeafNode(editor, at);
    const [, inlinePath] = threadLeaf;
    select(editor, inlinePath);
    at = editor.selection!;
  }

  const threadNodeEntry2 = getAboveNode(editor, {
    match: {
      type,
    },
  });

  if (threadNodeEntry2) {
    setNodes<TThreadElement>(
      editor,
      {
        thread,
        ...elementProps,
      },
      { at: threadNodeEntry2[1] }
    );
  } else {
    wrapNodesInThread(editor, { at, thread, elementProps });
  }

  if (isRange) {
    const threadNodeEntry = findNode(editor, {
      at: [],
      match(node: any) {
        // @ts-ignore
        return isThreadNode(editor, node) && node.thread.id === thread.id;
      },
    });
    const [, threadPath] = threadNodeEntry!;

    select(editor, threadPath);
  }

  return getAboveThreadNode(editor);
};
