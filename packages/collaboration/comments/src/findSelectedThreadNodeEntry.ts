import { getAbove, getPluginType, PlateEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { ELEMENT_THREAD } from './createThreadPlugin';
import { ThreadNode } from './types';

export function findSelectedThreadNodeEntry<T = {}>(
  editor: PlateEditor<T>
): NodeEntry<ThreadNode> | undefined {
  return getAbove(editor, {
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  }) as NodeEntry<ThreadNode> | undefined;
}
