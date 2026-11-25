import { dispatchCommand } from '../core/command-registry';
import { landTextWriteOutsideStruck } from '../core/content-landing';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import { admitLineBlock, textLineAt, wrapTextLine } from '../core/mixed-lines';
import {
  getActiveUpdateRoot,
  getChildList,
  getCurrentMarks,
  getSelectionMarks,
  peekImplicitTarget,
  runEditorTransaction,
} from '../core/public-state';
import { textPropertiesEqual } from '../core/value-codec';
import type { EditorStaticApi } from '../interfaces/editor';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
  leaf as editorLeaf,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { getPointRoot } from '../internal/root-location';
import { dividesTextCell, splitNodes } from '../transforms-node/split-nodes';
import { deleteText } from '../transforms-text/delete-text';
import { withoutTypedMarks } from '../transforms-text/insert-text';
import { breakAtSelectedBlockVoid } from './block-void-break';
import { refusesReadOnlyWrite } from './element-read-only';
import { startEmptyRoot } from './insert-default-child';

const getNextSoftBreakRange = (
  editor: Parameters<EditorStaticApi['insertBreak']>[0]
) => {
  const selection = editorGetSelection(editor);

  if (
    !selection ||
    !RangeApi.isRange(selection) ||
    !RangeApi.isCollapsed(selection)
  ) {
    return null;
  }

  const point = selection.anchor;
  const [leaf] = editorLeaf(editor, point);

  if (leaf.text[point.offset] !== '\n') {
    return null;
  }

  return {
    anchor: point,
    focus: { ...point, offset: point.offset + 1 },
  };
};

export const applyInsertBreak: EditorStaticApi['insertBreak'] = (editor) => {
  const selection = editorGetSelection(editor);

  if (!selection && editorGetChildren(editor).length === 0) {
    startEmptyRoot(editor);
    return;
  }

  const softBreakRange = getNextSoftBreakRange(editor);

  // Node selections may be disjoint, so they have no truthful break target.
  if (selection && !RangeApi.isRange(selection)) return;

  const landed =
    selection &&
    landTextWriteOutsideStruck(editor, selection, getChildList(editor));

  if (
    landed &&
    (refusesReadOnlyWrite(editor, landed) || dividesTextCell(editor, landed))
  ) {
    return;
  }

  const [at, end] =
    landed === selection && selection ? RangeApi.edges(selection) : [];
  const root = getActiveUpdateRoot(editor) ?? 'main';
  const line = at && textLineAt(editor, root, at);
  const block =
    line &&
    end &&
    (PointApi.equals(at, end) || textLineAt(editor, root, end)) &&
    admitLineBlock(editor, line, {
      at,
      end,
      marks: withoutTypedMarks(
        editor,
        getCurrentMarks(editor) ?? getSelectionMarks(editor)
      ),
    });

  const target = block && peekImplicitTarget(editor);
  const samePlace = (point: Point, other: Point) =>
    point.offset === other.offset &&
    PathApi.equals(point.path, other.path) &&
    getPointRoot(point, root).root === getPointRoot(other, root).root;
  const targetIsCaret =
    at &&
    end &&
    RangeApi.isRange(target) &&
    samePlace(RangeApi.start(target), at) &&
    samePlace(RangeApi.end(target), end);

  if (line && block && targetIsCaret) {
    runEditorTransaction(editor, () => {
      wrapTextLine(editor, line, block);

      const softBreak = getNextSoftBreakRange(editor);

      if (softBreak) deleteText(editor, { at: softBreak, hanging: true });
      splitKeepingMarks(editor);
    });
    return;
  }

  if (landed && landed !== selection) {
    runEditorTransaction(editor, (tx) => {
      tx.setSelection(SelectionApi.text(landed));
    });
  }

  if (softBreakRange) {
    deleteText(editor, { at: softBreakRange, hanging: true });
  }

  if (selection && breakAtSelectedBlockVoid(editor)) {
    return;
  }

  splitKeepingMarks(editor);
};

const splitKeepingMarks = (
  editor: Parameters<EditorStaticApi['insertBreak']>[0]
) =>
  runEditorTransaction(editor, (tx) => {
    const marks = withoutTypedMarks(editor, tx.marks ?? tx.getSelectionMarks());

    splitNodes(editor, { always: true });

    const caret = tx.getModelSelection();

    if (!marks || !SelectionApi.isText(caret) || !RangeApi.isCollapsed(caret)) {
      return;
    }

    const { path } = caret.anchor;
    const text = NodeApi.get(editor, path);

    if (!NodeApi.isText(text) || text.text !== '') return;

    const schema = getEditorSchema(editor);
    const root = getActiveUpdateRoot(editor) ?? 'main';
    const preserved = schema.textPropertiesForSplitAt(
      { ...marks, text: '' },
      path,
      root
    );
    const caretMarks = Object.keys(preserved).reduce(
      (properties, key) =>
        schema.canonicalizeTextPropertiesAt(properties, path, root, key),
      { ...NodeApi.extractProps(text), ...preserved }
    );

    if (!textPropertiesEqual(text, { ...caretMarks, text: '' })) {
      tx.setMarks(caretMarks);
    }
  });

export const insertBreak: EditorStaticApi['insertBreak'] = (editor) => {
  dispatchCommand(editor, editorCommands.insertBreak);
};
