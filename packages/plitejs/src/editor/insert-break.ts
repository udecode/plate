import { dispatchCommand } from '../core/command-registry';
import { landTextWrite } from '../core/content-landing';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import {
  getActiveUpdateRoot,
  getChildList,
  runEditorTransaction,
} from '../core/public-state';
import { textPropertiesEqual } from '../core/value-codec';
import type { EditorStaticApi } from '../interfaces/editor';
import {
  getSelection as editorGetSelection,
  leaf as editorLeaf,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { splitNodes } from '../transforms-node/split-nodes';
import { deleteText } from '../transforms-text/delete-text';
import { breakAtSelectedBlockVoid } from './block-void-break';
import { refusesReadOnlyWrite } from './element-read-only';

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
  const softBreakRange = getNextSoftBreakRange(editor);
  const selection = editorGetSelection(editor);

  // Node selections may be disjoint, so they have no truthful break target.
  if (selection && !RangeApi.isRange(selection)) return;

  const landed =
    selection && landTextWrite(editor, selection, getChildList(editor));

  if (landed && refusesReadOnlyWrite(editor, landed)) return;

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

  // Canonical form drops formatting from the new line's empty text, so the
  // caret carries the formatting typing continues with.
  runEditorTransaction(editor, (tx) => {
    const marks = tx.marks ?? tx.getSelectionMarks();

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
};

export const insertBreak: EditorStaticApi['insertBreak'] = (editor) => {
  dispatchCommand(editor, editorCommands.insertBreak);
};
