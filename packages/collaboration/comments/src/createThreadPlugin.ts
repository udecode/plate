import { createPluginFactory, PlateEditor } from '@udecode/plate-core';
import { insertTextThreadPlugin } from './insertTextThreadPlugin';
import { ThreadPlugin } from './types';

export const ELEMENT_THREAD = 'thread';

export const createThreadPlugin = createPluginFactory<ThreadPlugin>({
  key: ELEMENT_THREAD,
  isElement: true,
  isInline: true,
  handlers: {
    onChange(editor: PlateEditor<{}>) {
      return () => {
        // const threadNodeEntries = findThreadNodeEntries(editor);
        // for (const threadNodeEntry of threadNodeEntries) {
        //   deselectThread(editor, threadNodeEntry);
        // }
        //
        // const threadNodeEntry = findSelectedThreadNodeEntry(editor);
        // if (threadNodeEntry) {
        //   const { thread } = threadNodeEntry[0];
        //   if (thread) {
        //     selectThread(editor, threadNodeEntry);
        //   }
        // }
      };
    },
  },
  withOverrides(editor) {
    const { insertText } = editor;

    editor.insertText = insertTextThreadPlugin.bind(null, editor, insertText);

    return editor;
  },
});
