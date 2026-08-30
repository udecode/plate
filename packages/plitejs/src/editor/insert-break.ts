import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import type { EditorStaticApi } from '../interfaces/editor';
import {
  getSelection as editorGetSelection,
  leaf as editorLeaf,
} from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { splitNodes } from '../transforms-node/split-nodes';
import { deleteText } from '../transforms-text/delete-text';
import { insertDefaultBlockAfterSelectedBlockVoid } from './block-void-break';

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

  if (softBreakRange) {
    deleteText(editor, { at: softBreakRange, hanging: true });
  }

  if (selection && insertDefaultBlockAfterSelectedBlockVoid(editor)) {
    return;
  }

  splitNodes(editor, { always: true });
};

export const insertBreak: EditorStaticApi['insertBreak'] = (editor) => {
  dispatchCommand(editor, editorCommands.insertBreak);
};
