import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { TThreadElement } from '../types';

export const findSelectedThreadNodeEntry = <V extends Value>(
  editor: PlateEditor<V>
) => {
  return getAboveNode(editor, {
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  }) as NodeEntry<TThreadElement> | undefined;
};
