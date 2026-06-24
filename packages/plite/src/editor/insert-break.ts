import { executeCommand } from '../core/command-registry';
import { getEditorTransformRegistry } from '../core/transform-registry';
import type { EditorStaticApi } from '../interfaces/editor';
import {
  getSelection as editorGetSelection,
  leaf as editorLeaf,
} from '../interfaces/editor';
import { RangeApi } from '../interfaces/range';
import { insertParagraphAfterSelectedBlockVoid } from './block-void-break';

type InsertBreakCommand = {
  type: 'insert_break';
};

const getNextSoftBreakRange = (
  editor: Parameters<EditorStaticApi['insertBreak']>[0]
) => {
  const selection = editorGetSelection(editor);

  if (!selection || !RangeApi.isCollapsed(selection)) {
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

const applyInsertBreak: EditorStaticApi['insertBreak'] = (editor) => {
  const transforms = getEditorTransformRegistry(editor);
  const softBreakRange = getNextSoftBreakRange(editor);
  const selection = editorGetSelection(editor);

  if (softBreakRange) {
    transforms.delete({ at: softBreakRange, hanging: true });
  }

  if (selection && insertParagraphAfterSelectedBlockVoid(editor)) {
    return;
  }

  transforms.splitNodes({ always: true });
};

export const insertBreak: EditorStaticApi['insertBreak'] = (editor) => {
  executeCommand<InsertBreakCommand>(editor, { type: 'insert_break' }, () => {
    applyInsertBreak(editor);
    return true;
  });
};
