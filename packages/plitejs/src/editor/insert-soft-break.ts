import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import {
  getCurrentMarks,
  setCurrentMarks,
  setTypedMarks,
} from '../core/public-state';
import {
  type EditorStaticApi,
  getSelection as editorGetSelection,
} from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { withoutTypedMarks } from '../transforms-text/insert-text';
import { breakAtSelectedBlockVoid } from './block-void-break';
import { refusesReadOnlyWrite } from './element-read-only';
import { applyInsertTextCommand } from './insert-text';

export const applyInsertSoftBreak: EditorStaticApi['insertSoftBreak'] = (
  editor
) => {
  const selection = editorGetSelection(editor);

  if (
    selection &&
    RangeApi.isRange(selection) &&
    refusesReadOnlyWrite(editor, selection)
  ) {
    return;
  }

  if (breakAtSelectedBlockVoid(editor)) {
    return;
  }

  const explicit = getCurrentMarks(editor);

  if (explicit) setCurrentMarks(editor, withoutTypedMarks(editor, explicit));
  setTypedMarks(editor, null);
  applyInsertTextCommand(editor, '\n');
};

export const insertSoftBreak: EditorStaticApi['insertSoftBreak'] = (editor) => {
  dispatchCommand(editor, editorCommands.insertSoftBreak);
};
