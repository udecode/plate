import { jsonEqual } from '../core/change/json';
import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import {
  getSelectionRoot,
  readEditor,
  runEditorTransaction,
  withEditorRootChildren,
  withTransactionSpecDraftRead,
} from '../core/public-state';
import type {
  AnyEditor as Editor,
  EditorStaticApi,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { stripLocationRoots } from '../internal/root-location';
import { applyAddMark } from './add-mark';
import { applyRemoveMark } from './remove-mark';

export const applyToggleMark = (
  editor: Editor,
  key: string,
  value?: unknown
) => {
  const nextValue = value === undefined ? true : value;
  const isActive = (stored: unknown) => jsonEqual(stored, nextValue);

  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (!selection) return;

    if (SelectionApi.isNode(selection)) {
      const schema = getEditorSchema(editor);
      const root = getSelectionRoot(editor, selection);
      const entries = withTransactionSpecDraftRead(editor, () =>
        withEditorRootChildren(editor, root, () =>
          readEditor(editor, (state) =>
            state.selection
              .ranges()
              .flatMap((range) =>
                state.nodes.toArray({
                  at: range,
                  match: NodeApi.isText,
                  voids: true,
                })
              )
              .filter(([, path]) => {
                const parentEntry = state.nodes.parent(path);

                return (
                  !!parentEntry &&
                  NodeApi.isElement(parentEntry[0]) &&
                  schema.isTextPropertyAllowedAt(key, path, root) &&
                  (!schema.isVoid(parentEntry[0]) ||
                    schema.isMarkableVoid(parentEntry[0]))
                );
              })
          )
        )
      );
      if (
        entries.length > 0 &&
        entries.every(([node]) => isActive(node[key as keyof typeof node]))
      ) {
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

    const schema = getEditorSchema(editor);
    const root = getSelectionRoot(editor, selection);
    let { marks } = tx;
    let canonicalPath = selection.focus.path;

    if (!marks && RangeApi.isExpanded(selection)) {
      const [rawStart, rawEnd] = RangeApi.edges(stripLocationRoots(selection));
      const eligible = withTransactionSpecDraftRead(editor, () =>
        withEditorRootChildren(editor, root, () =>
          readEditor(editor, (state) => {
            let start = rawStart;
            const startEnd = state.points.end(start.path);

            if (
              startEnd &&
              start.offset === startEnd.offset &&
              PathApi.equals(start.path, startEnd.path)
            ) {
              const after = state.points.after(start);

              if (after) start = stripLocationRoots(after);
            }

            return state.nodes
              .toArray({
                at: { anchor: start, focus: rawEnd },
                match: NodeApi.isText,
                voids: true,
              })
              .filter(([, path]) => {
                if (
                  rawEnd.offset === 0 &&
                  PathApi.equals(path, rawEnd.path) &&
                  !PathApi.equals(start.path, rawEnd.path)
                ) {
                  return false;
                }
                const parentEntry = state.nodes.parent(path);

                return (
                  !!parentEntry &&
                  NodeApi.isElement(parentEntry[0]) &&
                  schema.isTextPropertyAllowedAt(key, path, root) &&
                  (!schema.isVoid(parentEntry[0]) ||
                    schema.isMarkableVoid(parentEntry[0]))
                );
              });
          })
        )
      );

      if (eligible.length === 0) return;

      const [[firstNode, firstPath]] = eligible;
      const { text: _text, ...rest } = firstNode;

      marks = rest;
      canonicalPath = firstPath;
    } else if (!marks) {
      marks = tx.getSelectionMarks();
    }

    if (isActive(marks?.[key])) {
      applyRemoveMark(editor, key);
    } else {
      const canonical = schema.canonicalizeTextPropertiesAt(
        { ...marks, [key]: nextValue },
        canonicalPath,
        root,
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
