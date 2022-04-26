import { getPluginType, PlateEditor, wrapNodes } from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_THREAD } from '../createThreadPlugin';
import { Thread } from '../Thread';

export const wrapThread = <T = {}>(
  editor: PlateEditor<T>,
  { at, thread }: { thread: Thread; at?: Location }
) => {
  wrapNodes(
    editor,
    {
      type: getPluginType(editor, ELEMENT_THREAD),
      thread,
      selected: false,
      children: [],
    },
    { at, split: true }
  );
};
