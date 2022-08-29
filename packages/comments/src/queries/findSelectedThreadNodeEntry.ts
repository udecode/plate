import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { ThreadElement } from '../types';

export function findSelectedThreadNodeEntry<V extends Value>(
  editor: PlateEditor<V>
): NodeEntry<ThreadElement> | undefined {
  return getAboveNode(editor, {
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  }) as NodeEntry<ThreadElement> | undefined;
}
