import { authoredDocumentCapabilityPoint } from '../core/authored-document-capability';
import { dispatchCommand } from '../core/command-registry';
import { landTextWriteOutsideStruck } from '../core/content-landing';
import { editorCommands } from '../core/editor-commands';
import { getEditorRuntimeOwner, getEditorSchema } from '../core/editor-runtime';
import { getPluginContributions } from '../core/plugin-registry';
import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
  getChildList,
  runEditorTransaction,
} from '../core/public-state';
import { textPropertiesEqual } from '../core/value-codec';
import type { EditorStaticApi } from '../interfaces/editor';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
  isBlock as editorIsBlock,
  isEmpty as editorIsEmpty,
  isStart as editorIsStart,
  isVoid as editorIsVoid,
  leaf as editorLeaf,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { dividesTextCell, splitNodes } from '../transforms-node/split-nodes';
import { select } from '../transforms-selection/select';
import { deleteText } from '../transforms-text/delete-text';
import { withoutTypedMarks } from '../transforms-text/insert-text';
import { above } from './above';
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

const tryInsertBreakAtBlockStart = (
  editor: Parameters<EditorStaticApi['insertBreak']>[0]
): boolean => {
  if (
    getPluginContributions(
      getEditorRuntimeOwner(editor),
      authoredDocumentCapabilityPoint
    ).length > 0
  ) {
    return false;
  }

  const selection = editorGetSelection(editor);

  if (
    !selection ||
    !RangeApi.isRange(selection) ||
    !RangeApi.isCollapsed(selection)
  ) {
    return false;
  }

  const blockEntry = above(editor, {
    at: selection.anchor,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
    mode: 'lowest',
  });

  if (!blockEntry) return false;

  const [block, blockPath] = blockEntry;

  if (!NodeApi.isElement(block)) return false;

  const schema = getEditorSchema(editor);

  if (
    blockPath.length === 0 ||
    editorIsVoid(editor, block) ||
    schema.isObject(block) ||
    editorIsEmpty(editor, block) ||
    !editorIsStart(editor, selection.anchor, blockPath)
  ) {
    return false;
  }

  const root = getActiveUpdateRoot(editor) ?? 'main';
  const shifted = schema.placeElementAt(block, {
    at: PathApi.next(blockPath),
    root,
  });

  if (!shifted || shifted.type !== block.type) {
    return false;
  }

  const { id: _id, ...splitProps } = schema.elementPropertiesForSplitAt(
    block,
    blockPath,
    root
  ) as Record<string, unknown>;
  const placedAbove = schema.placeElementAt(
    {
      ...splitProps,
      children: [{ text: '' }],
      type: block.type,
    },
    { at: blockPath, root }
  );

  if (
    !placedAbove ||
    !schema.canPlaceAtPath(blockPath, [placedAbove], { root }) ||
    !schema.canPlaceAtPath(PathApi.next(blockPath), [block], { root })
  ) {
    return false;
  }

  const { id: _placedId, ...aboveProps } = NodeApi.extractProps(
    placedAbove
  ) as Record<string, unknown>;
  const aboveBlock = {
    ...aboveProps,
    children: [{ text: '' }],
    type: placedAbove.type,
  };
  const nextAnchorPath = [
    ...PathApi.next(blockPath),
    ...selection.anchor.path.slice(blockPath.length),
  ];

  applyBuiltDocumentChange(editor, (builder, activeRoot) =>
    builder.insertNode(activeRoot, blockPath, aboveBlock)
  );
  select(editor, {
    anchor: { offset: selection.anchor.offset, path: nextAnchorPath },
    focus: { offset: selection.anchor.offset, path: nextAnchorPath },
  });

  return true;
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
    const marks = withoutTypedMarks(editor, tx.marks ?? tx.getSelectionMarks());

    if (tryInsertBreakAtBlockStart(editor)) return;

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
