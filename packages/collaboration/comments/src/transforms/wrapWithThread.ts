import {
  getPluginType,
  PlateEditor,
  Value,
  wrapNodes,
} from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { Thread } from '../Thread';
import { ThreadElement, ThreadNodeData } from '../types';

export const wrapWithThread = <V extends Value>(
  editor: PlateEditor<V>,
  {
    at,
    thread,
    elementProps,
  }: { thread: Thread; at?: Location; elementProps?: Partial<ThreadNodeData> }
) => {
  wrapNodes<ThreadElement>(
    editor,
    {
      type: getPluginType(editor, ELEMENT_THREAD),
      thread,
      selected: false,
      children: [],
      ...elementProps,
    },
    { at, split: true, match: () => true }
  );
};
