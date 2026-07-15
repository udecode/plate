import type { BaseEditor, ExtendPlateEditorExtension } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  ElementApi,
  type Element,
  type Location,
  NodeApi,
  type Operation,
  RangeApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { getCodeLineEntry, getIndentDepth } from './queries';
import { resetCodeBlockDecorations } from './setCodeBlockToDecorations';
import { indentCodeLine, outdentCodeLine, unwrapCodeBlock } from './transforms';

export const getCodeBlockLanguageChange = (
  editor: BaseEditor,
  operation: Operation,
  type: string
) => {
  if (operation.type !== 'set_node') return;

  const entry = editor.read.nodes.get(operation.path);
  const touchesLang =
    'lang' in (operation.properties ?? {}) ||
    'lang' in (operation.newProperties ?? {});
  const langChanged =
    operation.properties?.lang !== operation.newProperties?.lang;

  if (
    entry &&
    ElementApi.isElement(entry[0]) &&
    entry[0].type === type &&
    touchesLang &&
    langChanged
  ) {
    return entry[0];
  }
};

export const resetCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  options: { at?: Location } = {}
) => {
  const codeBlockType = editor.getType(KEYS.codeBlock);

  if (
    !editor.read.nodes.block({
      at: options.at,
      match: { type: codeBlockType },
    })
  ) {
    return false;
  }

  unwrapCodeBlock(editor, tx, options);
  return true;
};

export const selectCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const codeBlockType = editor.getType(KEYS.codeBlock);
  const codeBlock = editor.read.nodes.above<Element>({
    match: { type: codeBlockType },
  });

  if (!codeBlock) return false;

  const selection = tx.selection();
  const blockRange = editor.read.ranges.get(codeBlock[1]);

  if (selection && blockRange && RangeApi.equals(selection, blockRange)) {
    return false;
  }

  tx.selection.set(codeBlock[1]);
  return true;
};

export const tabCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  options: { reverse?: boolean } = {}
) => {
  const codeLineType = editor.getType(KEYS.codeLine);
  const codeLines = editor.read.nodes.toArray<Element>({
    at: tx.selection() ?? undefined,
    match: { type: codeLineType },
  });

  if (codeLines.length === 0) return false;

  const codeBlock = editor.read.nodes.parent<Element>(codeLines[0][1]);

  if (!codeBlock) return false;

  for (const codeLine of codeLines) {
    if (options.reverse) {
      outdentCodeLine(editor, tx, { codeBlock, codeLine });
    } else {
      indentCodeLine(editor, tx, { codeBlock, codeLine });
    }
  }

  return true;
};

export const withCodeBlock: ExtendPlateEditorExtension<CodeBlockConfig> = ({
  editor,
  getOptions,
  type,
}) => ({
  priority: 10,
  operations: {
    apply({ operation, next }) {
      const codeBlock =
        getOptions().lowlight &&
        getCodeBlockLanguageChange(editor, operation, type);

      if (codeBlock) {
        resetCodeBlockDecorations(codeBlock);
      }

      next(operation);
    },
  },
  transforms: {
    deleteBackward({ next, tx }) {
      const selection = editor.read.selection();

      if (!selection || editor.read.selection.isExpanded()) return next();

      const res = getCodeLineEntry(editor);

      if (!res) return next();

      const { codeLine } = res;
      const [, codeLinePath] = codeLine;

      if (
        !editor.read.selection.isAtBlockStart({
          match: { type: editor.getType(KEYS.codeLine) },
        })
      ) {
        return next();
      }

      const previousCodeLine = editor.read.nodes.previous<Element>({
        at: codeLinePath,
        match: { type: editor.getType(KEYS.codeLine) },
      });
      const codeLineText = NodeApi.string(codeLine[0]);

      if (!previousCodeLine) {
        if (codeLineText.length > 0) return true;

        resetCodeBlock(editor, tx);
        return true;
      }

      if (codeLineText.length > 0) return next();

      const previousLineEnd = editor.read.points.end(previousCodeLine[1]);

      tx.nodes.remove({ at: codeLinePath });

      if (previousLineEnd) {
        tx.selection.set(previousLineEnd);
      }

      return true;
    },
    insertBreak({ next, tx }) {
      const selection = editor.read.selection();

      if (!selection) return next();

      const res = getCodeLineEntry(editor);

      if (!res) return next();

      const { codeBlock, codeLine } = res;
      const indentDepth = getIndentDepth(editor, {
        codeBlock,
        codeLine,
      });

      next();

      indentCodeLine(editor, tx, { codeBlock, codeLine, indentDepth });

      return true;
    },
  },
});
