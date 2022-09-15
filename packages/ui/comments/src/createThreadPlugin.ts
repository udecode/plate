import { createPluginFactory } from '@udecode/plate-core';
import { ThreadElement } from './components/ThreadElement';
import { insertTextThreadPlugin } from './transforms/insertTextThreadPlugin';
import { ThreadPlugin } from './types';

export const ELEMENT_THREAD = 'thread';

export const createThreadPlugin = createPluginFactory<ThreadPlugin>({
  key: ELEMENT_THREAD,
  isElement: true,
  isInline: true,
  withOverrides(editor) {
    const { insertText } = editor;
    editor.insertText = insertTextThreadPlugin.bind(null, editor, insertText);
    return editor;
  },
});
