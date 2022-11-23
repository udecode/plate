import {
  getPluginType,
  PlateEditor,
  TNodeProps,
  Value,
  wrapNodes,
} from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { Thread, TThreadElement } from '../types';

export const wrapNodesInThread = <V extends Value>(
  editor: PlateEditor<V>,
  options: {
    thread: Thread;
    at?: Location;
    elementProps?: Partial<TNodeProps<TThreadElement>>;
  }
) => {
  const { at, thread, elementProps } = options;
  wrapNodes<TThreadElement>(
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
