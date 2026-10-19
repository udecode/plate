import { dispatchCommand } from '../core/command-registry';
import { landTextWrite } from '../core/content-landing';
import { editorCommands } from '../core/editor-commands';
import { limitTextInsert } from '../core/insert-limit';
import {
  getChildList,
  getCurrentMarks,
  getCurrentSelection,
  getCurrentSelectionRoot,
  getEditorStateView,
  runEditorTransaction,
  setCurrentMarks,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../core/public-state';
import {
  LocationApi,
  PointApi,
  RangeApi,
  SelectionApi,
  type Location as PliteLocation,
  type Range,
} from '../interfaces';
import type { EditorStaticApi } from '../interfaces/editor';
import { void as editorVoid } from '../interfaces/editor';
import type { TextInsertTextOptions } from '../interfaces/transforms/text';
import { applyInsertText } from '../transforms-text/insert-text';
import { getDefaultInsertLocation } from '../utils';
import { elementReadOnly } from './element-read-only';

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
    ((!voids && editorVoid(editor, { at: target })) ||
      elementReadOnly(editor, { at: target }))
  );
};

const getExplicitRangeRoot = (range: Range) => {
  const anchorRoot = range.anchor.root;
  const focusRoot = range.focus.root;

  if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
    return undefined;
  }

  return anchorRoot ?? focusRoot;
};

const getExplicitLocationRoot = (
  at: TextInsertTextOptions['at']
): string | undefined => {
  if (!at || LocationApi.isPath(at)) {
    return undefined;
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

export const applyInsertTextCommand: EditorStaticApi['insertText'] = (
  editor,
  text,
  options = {}
) => {
  const explicitRoot = getExplicitLocationRoot(options.at);
  const transactionRoot =
    explicitRoot ??
    (options.at === undefined ? getImplicitSelectionRoot(editor) : undefined);
  const run = () => {
    runEditorTransaction(editor, (tx) => {
      const hasExplicitAt = options.at !== undefined;
      const pendingMarks =
        !hasExplicitAt && options.marks !== false
          ? getCurrentMarks(editor)
          : null;
      let target = tx.resolveTarget({ at: options.at });
      if (!target && !hasExplicitAt && tx.getModelSelection() == null) {
        target = getDefaultInsertLocation(editor);
      }
      if (PointApi.isPoint(target) || RangeApi.isRange(target)) {
        target = landTextWrite(editor, target, getChildList(editor));
      }

      if (
        !target ||
        !LocationApi.isLocation(target) ||
        shouldIgnoreTarget(editor, target, options)
      ) {
        return;
      }

      const limited = limitTextInsert(getEditorStateView(editor), text, {
        at: target,
      });

      if (limited.length === 0 && text.length > 0) return;

      if (!hasExplicitAt) {
        if (LocationApi.isPoint(target)) {
          tx.setSelection(SelectionApi.text({ anchor: target, focus: target }));
        } else if (LocationApi.isRange(target)) {
          tx.setSelection(SelectionApi.text(target));
        }

        const selection = tx.getModelSelection();

        if (
          pendingMarks &&
          SelectionApi.isText(selection) &&
          RangeApi.isCollapsed(selection)
        ) {
          tx.setMarks(pendingMarks);
        }
      }

      applyInsertText(editor, limited, {
        ...options,
        at: hasExplicitAt ? target : undefined,
      });

      if (!hasExplicitAt && options.marks !== false) {
        setCurrentMarks(editor, null);
      }
    });
  };

  if (transactionRoot) {
    withEditorUpdateRoot(editor, transactionRoot, () => {
      withEditorUpdateRootChildren(editor, transactionRoot, run);
    });
  } else {
    run();
  }
};

export const insertText: EditorStaticApi['insertText'] = (
  editor,
  text,
  options = {}
) => {
  dispatchCommand(editor, editorCommands.insertText, {
    options,
    text,
  });
};
