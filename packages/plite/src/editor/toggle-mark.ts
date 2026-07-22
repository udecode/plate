import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import { runEditorTransaction } from '../core/public-state';
import type {
  Editor,
  EditorMarkToggleOptions,
  EditorStaticApi,
} from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { applyAddMark } from './add-mark';
import { applyRemoveMark } from './remove-mark';

const getClearMarks = (clear: EditorMarkToggleOptions['clear']) =>
  clear ? (Array.isArray(clear) ? clear : [clear]) : [];

export const applyToggleMark = (
  editor: Editor,
  key: string,
  value?: unknown,
  options?: EditorMarkToggleOptions
) => {
  const nextValue = value === undefined ? true : value;

  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (!selection || !RangeApi.isRange(selection)) {
      return;
    }

    const marks = (tx.marks ?? tx.getSelectionMarks()) as Record<
      string,
      unknown
    > | null;
    const currentValue = marks?.[key];
    const isActive =
      currentValue !== undefined &&
      getEditorSchema(editor).isTextPropertyEqualAt(
        key,
        currentValue,
        nextValue,
        selection.focus.path,
        selection.focus.root ?? selection.anchor.root ?? 'main'
      );

    if (isActive) {
      applyRemoveMark(editor, key);
    } else {
      getClearMarks(options?.clear).forEach((mark) => {
        applyRemoveMark(editor, mark);
      });
      applyAddMark(editor, key, nextValue);
    }
  });
};

export const toggleMark: EditorStaticApi['toggleMark'] = (
  editor,
  key,
  value,
  options
) => {
  const nextValue = value === undefined ? true : value;

  dispatchCommand(editor, editorCommands.toggleMark, {
    key,
    options,
    value: nextValue,
  });
};
