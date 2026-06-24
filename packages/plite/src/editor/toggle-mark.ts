import { executeCommand } from '../core/command-registry';
import { runEditorTransaction } from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { leaf as editorLeaf } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';

type ToggleMarkCommand = {
  key: string;
  type: 'toggle_mark';
  value: Parameters<EditorStaticApi['toggleMark']>[2];
};

const applyToggleMark: EditorStaticApi['toggleMark'] = (
  editor,
  key,
  value = true
) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (!selection || !RangeApi.isRange(selection)) {
      return;
    }

    const marks = editor.read((state) => state.marks.get()) as Record<
      string,
      unknown
    > | null;
    const inheritedCollapsedMark =
      marks === null && RangeApi.isCollapsed(selection)
        ? editorLeaf(editor, selection.anchor)[0]
        : null;
    const isActive =
      marks?.[key] === value ||
      inheritedCollapsedMark?.[key as keyof typeof inheritedCollapsedMark] ===
        value;

    if (isActive) {
      getEditorTransformRegistry(editor).removeMark(key);
    } else {
      getEditorTransformRegistry(editor).addMark(key, value);
    }
  });
};

export const toggleMark: EditorStaticApi['toggleMark'] = (
  editor,
  key,
  value = true
) => {
  executeCommand<ToggleMarkCommand>(
    editor,
    { key, type: 'toggle_mark', value },
    (command) => {
      applyToggleMark(editor, command.key, command.value);
      return true;
    },
    { implicitUpdate: true }
  );
};
