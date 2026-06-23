import { executeCommand } from '../core/command-registry';
import {
  getCurrentMarks,
  getCurrentSelection,
  getCurrentSelectionRoot,
  runEditorTransaction,
  setCurrentMarks,
  withEditorOperationRoot,
  withEditorOperationRootChildren,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import {
  LocationApi,
  type Range,
  RangeApi,
  type Location as PliteLocation,
} from '../interfaces';
import type { EditorStaticApi } from '../interfaces/editor';
import { Editor } from '../interfaces/editor';
import type { TextInsertTextOptions } from '../interfaces/transforms/text';
import { applyInsertText } from '../transforms-text/insert-text';
import { getDefaultInsertLocation } from '../utils';
import { elementReadOnly } from './element-read-only';

type InsertTextCommand = {
  options: Parameters<EditorStaticApi['insertText']>[2];
  text: string;
  type: 'insert_text';
};

const shouldIgnoreTarget = (
  editor: Parameters<EditorStaticApi['insertText']>[0],
  at: PliteLocation | null | undefined,
  options: TextInsertTextOptions | undefined
) => {
  const voids = options?.voids ?? false;
  const target = (() => {
    if (!at) return null;
    if (LocationApi.isPoint(at)) return at;
    if (LocationApi.isRange(at) && RangeApi.isCollapsed(at)) return at.anchor;
    return null;
  })();

  return (
    target != null &&
    ((!voids && Editor.void(editor, { at: target })) ||
      elementReadOnly(editor, { at: target }))
  );
};

const getExplicitRangeRoot = (range: Range) => {
  const anchorRoot = range.anchor.root;
  const focusRoot = range.focus.root;

  if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
    return;
  }

  return anchorRoot ?? focusRoot;
};

const getExplicitLocationRoot = (
  at: TextInsertTextOptions['at']
): string | undefined => {
  if (!at || LocationApi.isPath(at)) {
    return;
  }

  if (LocationApi.isPoint(at)) {
    return at.root;
  }

  return getExplicitRangeRoot(at);
};

const getImplicitSelectionRoot = (
  editor: Parameters<EditorStaticApi['insertText']>[0]
) =>
  getCurrentSelection(editor) ? getCurrentSelectionRoot(editor) : undefined;

export const insertText: EditorStaticApi['insertText'] = (
  editor,
  text,
  options = {}
) => {
  executeCommand<InsertTextCommand>(
    editor,
    { options, text, type: 'insert_text' },
    (command) => {
      const explicitRoot = getExplicitLocationRoot(command.options?.at);
      const transactionRoot =
        explicitRoot ??
        (command.options?.at === undefined
          ? getImplicitSelectionRoot(editor)
          : undefined);
      let handled = false;

      const run = () => {
        runEditorTransaction(editor, (tx) => {
          const hasExplicitAt = command.options?.at !== undefined;
          let target = tx.resolveTarget({ at: command.options?.at });
          const marks = getCurrentMarks(editor);

          if (!target && !hasExplicitAt && tx.getModelSelection() == null) {
            target = getDefaultInsertLocation(editor);
          }

          if (!target) {
            return;
          }

          if (shouldIgnoreTarget(editor, target, command.options)) {
            handled = true;
            return;
          }

          if (marks && !hasExplicitAt) {
            const node = { text: command.text, ...marks };
            getEditorTransformRegistry(editor).insertNodes(node, {
              at: target,
              select: !hasExplicitAt,
              voids: command.options?.voids,
            });
          } else {
            if (
              command.text.length > 0 &&
              !hasExplicitAt &&
              tx.getModelSelection() == null &&
              LocationApi.isPoint(target)
            ) {
              getEditorTransformRegistry(editor).select(target);
            }

            applyInsertText(editor, command.text, {
              ...command.options,
              at: target,
            });
          }

          if (!hasExplicitAt) {
            setCurrentMarks(editor, null);
          }
          handled = true;
        });
      };

      if (transactionRoot) {
        withEditorOperationRoot(editor, transactionRoot, () =>
          withEditorOperationRootChildren(editor, transactionRoot, run)
        );
      } else {
        run();
      }

      return handled;
    }
  );
};
