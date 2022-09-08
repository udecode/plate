import {
  getPluginType,
  PlateEditor,
  unwrapNodes,
  Value,
} from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';

export const deleteThread = <V extends Value>(
  editor: PlateEditor<V>,
  thread: Location
): void => {
  unwrapNodes(editor, {
    at: thread,
    match: { type: getPluginType(editor, ELEMENT_THREAD) },
  });
};
