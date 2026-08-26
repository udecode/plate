import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import { runEditorTransaction } from '../core/public-state';
import { parent as editorParent } from '../interfaces/editor';
import type {
  AnyEditor as Editor,
  EditorStaticApi,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
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

    if (!selection) return;

    if (SelectionApi.isNode(selection)) {
      const schema = getEditorSchema(editor);
      const root = selection.root ?? 'main';
      const entries = editor.read.selection
        .ranges()
        .flatMap((range) =>
          editor.read.nodes.toArray({
            at: range,
            match: NodeApi.isText,
            voids: true,
          })
        )
        .filter(([node, path]) => {
          const [parentNode] = editorParent(editor, path);

          return (
            NodeApi.isElement(parentNode) &&
            schema.isTextPropertyAllowedAt(key, path, root) &&
            (!schema.isVoid(parentNode) || schema.isMarkableVoid(parentNode))
          );
        });
      const isActive =
        entries.length > 0 &&
        entries.every(([node, path]) =>
          schema.isTextPropertyEqualAt(
            key,
            node[key as keyof typeof node],
            nextValue,
            path,
            root
          )
        );

      if (isActive) {
        applyRemoveMark(editor, key);
        return;
      }

      const removeKeys = new Set<string>();

      for (const [node, path] of entries) {
        const marks = Object.fromEntries(
          Object.entries(node).filter(([mark]) => mark !== 'text')
        );
        const canonical = schema.canonicalizeTextPropertiesAt(
          { ...marks, [key]: nextValue },
          path,
          root,
          key
        );

        for (const mark of Object.keys(marks)) {
          if (!Object.hasOwn(canonical, mark)) removeKeys.add(mark);
        }
      }
      for (const mark of removeKeys) applyRemoveMark(editor, mark);
      applyAddMark(editor, key, nextValue);
      return;
    }

    if (!RangeApi.isRange(selection)) return;

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
