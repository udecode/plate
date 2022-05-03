import { getPluginType, PlateEditor, wrapNodes } from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { Thread } from '../Thread';
import { ThreadNodeData } from '../types';

export const wrapWithThread = <T = {}>(
  editor: PlateEditor<T>,
  {
    at,
    thread,
    elementProps,
  }: { thread: Thread; at?: Location; elementProps?: Partial<ThreadNodeData> }
) => {
  wrapNodes(
    editor,
    {
      type: getPluginType(editor, ELEMENT_THREAD),
      thread,
      selected: false,
      children: [],
      ...elementProps,
    },
    { at, split: true }
  );
};
