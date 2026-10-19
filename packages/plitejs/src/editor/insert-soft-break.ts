import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import type { EditorStaticApi } from '../interfaces/editor';
import { breakAtSelectedBlockVoid } from './block-void-break';
import { applyInsertTextCommand } from './insert-text';

export const applyInsertSoftBreak: EditorStaticApi['insertSoftBreak'] = (
  editor
) => {
  if (breakAtSelectedBlockVoid(editor)) {
    return;
  }

  applyInsertTextCommand(editor, '\n');
};

export const insertSoftBreak: EditorStaticApi['insertSoftBreak'] = (editor) => {
  dispatchCommand(editor, editorCommands.insertSoftBreak);
};
