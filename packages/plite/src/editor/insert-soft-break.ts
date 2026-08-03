import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { limitTextInsert } from '../core/insert-limit';
import type { EditorStaticApi } from '../interfaces/editor';
import { applyInsertTextCommand } from './insert-text';
import { insertDefaultBlockAfterSelectedBlockVoid } from './block-void-break';

export const applyInsertSoftBreak: EditorStaticApi['insertSoftBreak'] = (
  editor
) => {
  if (insertDefaultBlockAfterSelectedBlockVoid(editor)) {
    return;
  }

  const text = limitTextInsert(editor, '\n', undefined);

  if (text) applyInsertTextCommand(editor, text);
};

export const insertSoftBreak: EditorStaticApi['insertSoftBreak'] = (editor) => {
  dispatchCommand(editor, editorCommands.insertSoftBreak);
};
