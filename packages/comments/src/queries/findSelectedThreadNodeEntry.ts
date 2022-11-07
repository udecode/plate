import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { TThreadElement } from '../types';

export const findSelectedThreadNodeEntry = <V extends Value>(
  editor: PlateEditor<V>
) =>
  getAboveNode<TThreadElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  });
