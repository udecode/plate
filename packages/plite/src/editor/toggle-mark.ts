import { executeCommand } from '../core/command-registry';
import { runEditorTransaction } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { leaf as editorLeaf } from '../interfaces/editor';
import type {
  EditorStaticApi,
  EditorToggleMarkOptions,
} from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';

type ToggleMarkCommand = {
  key: string;
  options?: EditorToggleMarkOptions;
  type: 'toggle_mark';
  value: Parameters<EditorStaticApi['toggleMark']>[2];
};

const getClearMarks = (clear: EditorToggleMarkOptions['clear']) =>
  clear ? (Array.isArray(clear) ? clear : [clear]) : [];

const applyToggleMark: EditorStaticApi['toggleMark'] = (
  editor,
  key,
  value,
  options
) => {
  const nextValue = value === undefined ? true : value;

  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (!selection || !RangeApi.isRange(selection)) {
      return;
    }

    const marks = editor.read((state) => state.marks()) as Record<
      string,
      unknown
    > | null;
    const inheritedCollapsedMark =
      marks === null && RangeApi.isCollapsed(selection)
        ? editorLeaf(editor, selection.anchor)[0]
        : null;
    const isActive =
      marks?.[key] === nextValue ||
      inheritedCollapsedMark?.[key as keyof typeof inheritedCollapsedMark] ===
        nextValue;

    if (isActive) {
      getEditorTransformRegistry(editor).removeMark(key);
    } else {
      getClearMarks(options?.clear).forEach((mark) => {
        getEditorTransformRegistry(editor).removeMark(mark);
      });
      getEditorTransformRegistry(editor).addMark(key, nextValue);
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

  executeCommand<ToggleMarkCommand>(
    editor,
    { key, options, type: 'toggle_mark', value: nextValue },
    (command) => {
      applyToggleMark(editor, command.key, command.value, command.options);
      return true;
    },
    { implicitUpdate: true }
  );
};
