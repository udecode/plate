import {
  getPluginType,
  PlateEditor,
  Value,
  wrapNodes,
} from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { ThreadElement, ThreadNodeData } from '../types';
import { Thread } from '../utils/types';

export const wrapWithThread = <V extends Value>(
  editor: PlateEditor<V>,
  options: {
    thread: Thread;
    at?: Location;
    elementProps?: Partial<ThreadNodeData>;
  }
) => {
  const { at, thread, elementProps } = options;
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
