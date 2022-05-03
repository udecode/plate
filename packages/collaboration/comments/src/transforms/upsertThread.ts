import {
  findNode,
  getPluginType,
  isCollapsed,
  PlateEditor,
  unwrapNodes,
} from '@udecode/plate-core';
import { Editor, Location, Range, Transforms } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { findSelectedThreadNodeEntry } from '../findSelectedThreadNodeEntry';
import { isThread } from '../isThread';
import { Thread } from '../Thread';
import { ThreadNodeData } from '../types';
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
  }

  wrapWithThread(editor, { at, thread, elementProps });
  unwrapNodes(editor, { at, match: { type } });

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
