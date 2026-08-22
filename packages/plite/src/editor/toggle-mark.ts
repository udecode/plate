import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import { runEditorTransaction } from '../core/public-state';
import type {
  AnyEditor as Editor,
  EditorStaticApi,
} from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { applyAddMark } from './add-mark';
import { applyRemoveMark } from './remove-mark';

export const applyToggleMark = (
  editor: Editor,
  key: string,
  value?: unknown
) => {
  const nextValue = value === undefined ? true : value;

  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (!selection || !RangeApi.isRange(selection)) {
      return;
    }

    const marks = tx.marks ?? tx.getSelectionMarks();
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
      const canonical = getEditorSchema(editor).canonicalizeTextPropertiesAt(
        { ...marks, [key]: nextValue },
        selection.focus.path,
        selection.focus.root ?? selection.anchor.root ?? 'main',
        key
      );

      Object.keys(marks ?? {}).forEach((mark) => {
        if (!Object.hasOwn(canonical, mark)) applyRemoveMark(editor, mark);
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
