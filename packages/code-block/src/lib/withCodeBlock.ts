import type { BaseEditor, ExtendPlateEditorExtension } from '@platejs/core';
import {
  editorCommands,
  type EditorUpdateTransaction,
  type EditorTransactionChangeContext,
  ElementApi,
  type Element,
  type Location,
  NodeApi,
  RangeApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';
import { indentCodeLine, outdentCodeLine, unwrapCodeBlock } from './transforms';

const NON_WHITESPACE = /\S/;
const NON_WHITESPACE_OR_END = /\S|$/;

export const getCodeBlockLanguageChange = (
  context: Pick<
    EditorTransactionChangeContext<BaseEditor>,
    'after' | 'before' | 'change' | 'changed'
  >,
  type: string
) => {
  const roots = new Set<string | undefined>();

  context.change.iterChangedRanges((root) => roots.add(root ?? undefined));

  for (const root of roots) {
    if (!context.changed.has('properties', root)) continue;

    const beforeChildren =
      root === undefined
        ? context.before.children
        : (context.before.roots?.[root] ?? []);
    const afterChildren =
      root === undefined
        ? context.after.children
        : (context.after.roots?.[root] ?? []);

    for (const path of context.changed.paths(root)) {
      const before = NodeApi.getIf(
        { children: beforeChildren } as Element,
        path
      );
      const after = NodeApi.getIf({ children: afterChildren } as Element, path);

      const beforeLanguage =
        ElementApi.isElement(before) && before.type === type
          ? before.lang
          : undefined;
      const afterLanguage =
        ElementApi.isElement(after) && after.type === type
          ? after.lang
          : undefined;

      if (
        (beforeLanguage !== undefined || afterLanguage !== undefined) &&
        beforeLanguage !== afterLanguage
      ) {
        return { after, before };
      }
    }
  }
};

export const resetCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  options: { at?: Location } = {}
) => {
  const codeBlockType = editor.getType(KEYS.codeBlock);

  if (
    !tx.nodes.block({
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
  const codeBlock = tx.nodes.above<Element>({
    match: { type: codeBlockType },
  });

  if (!codeBlock) return false;

  const selection = tx.selection();
  const blockRange = tx.ranges.get(codeBlock[1]);

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
  const codeLines = tx.nodes.toArray<Element>({
    at: tx.selection() ?? undefined,
    match: { type: codeLineType },
  });

  if (codeLines.length === 0) return false;

  const codeBlock = tx.nodes.parent<Element>(codeLines[0][1]);

  if (!codeBlock) return false;

  const codeLineAnchors = codeLines.map(([, path]) =>
    tx.anchor(path, {
      association: 'forward',
      deletion: 'drop',
    })
  );

  for (const codeLineAnchor of codeLineAnchors) {
    const path = codeLineAnchor.release();
    const codeLine = path ? tx.nodes.get<Element>(path) : undefined;
    const currentCodeBlock = codeLine
      ? tx.nodes.parent<Element>(codeLine[1])
      : undefined;

    if (!codeLine || !currentCodeBlock) continue;

    if (options.reverse) {
      outdentCodeLine(tx, { codeBlock: currentCodeBlock, codeLine });
    } else {
      indentCodeLine(tx, { codeBlock: currentCodeBlock, codeLine });
    }
  }

  return true;
};

export const withCodeBlock: ExtendPlateEditorExtension<CodeBlockConfig> = ({
  editor,
}) => ({
  commands: ({ around, handle }) => [
    handle(editorCommands.delete, ({ input, state }) => {
      if (input.direction !== 'backward') return false;

      const selection = state.selection();

      if (!selection || state.selection.isExpanded()) return false;

      const codeLine = state.nodes.above<Element>({
        match: { type: editor.getType(KEYS.codeLine) },
      });
      const codeBlock = codeLine
        ? state.nodes.parent<Element>(codeLine[1])
        : undefined;

      if (
        !codeLine ||
        !codeBlock ||
        codeBlock[0].type !== editor.getType(KEYS.codeBlock) ||
        !state.selection.isAtBlockStart({
          match: { type: editor.getType(KEYS.codeLine) },
        })
      ) {
        return false;
      }

      const previousCodeLine = state.nodes.previous<Element>({
        at: codeLine[1],
        match: { type: editor.getType(KEYS.codeLine) },
      });
      const codeLineText = NodeApi.string(codeLine[0]);

      if (!previousCodeLine) {
        if (codeLineText.length > 0) return state.transaction(() => {});

        return state.transaction((tx) => {
          codeBlock[0].children.forEach((child, index) => {
            if (!ElementApi.isElement(child)) return;

            tx.nodes.set(
              { type: editor.getType(KEYS.p) },
              { at: codeBlock[1].concat(index) }
            );
          });
          tx.nodes.unwrap({
            at: codeBlock[1],
            match: { type: editor.getType(KEYS.codeBlock) },
          });
        });
      }

      if (codeLineText.length > 0) return false;

      const previousLineEnd = state.points.end(previousCodeLine[1]);

      return state.transaction((tx) => {
        tx.nodes.remove({ at: codeLine[1] });

        if (previousLineEnd) {
          tx.selection.set(previousLineEnd);
        }
      });
    }),
    around(editorCommands.insertBreak, ({ state, next }) => {
      const selection = state.selection();
      const codeLine = selection
        ? state.nodes.above<Element>({
            at: selection,
            match: { type: editor.getType(KEYS.codeLine) },
          })
        : undefined;
      const codeBlock = codeLine
        ? state.nodes.parent<Element>(codeLine[1])
        : undefined;

      if (
        !selection ||
        !codeLine ||
        !codeBlock ||
        codeBlock[0].type !== editor.getType(KEYS.codeBlock)
      ) {
        return false;
      }

      const indentDepth = state.text
        .string(codeLine[1])
        .search(NON_WHITESPACE_OR_END);
      const result = next();

      if (result === false) return false;

      return state.transaction.extend(result, (tx) => {
        const insertedCodeLine = tx.nodes.above<Element>({
          match: { type: editor.getType(KEYS.codeLine) },
        });

        if (!insertedCodeLine) return;

        const start = tx.points.start(insertedCodeLine[1]);

        if (!start) return;

        const currentIndentDepth = tx.text
          .string(insertedCodeLine[1])
          .search(NON_WHITESPACE_OR_END);
        const indent = ' '.repeat(
          Math.max(0, indentDepth - currentIndentDepth)
        );

        if (!tx.selection.isExpanded()) {
          const nextSelection = tx.selection();
          const cursor = nextSelection?.anchor;
          const range = cursor && tx.ranges.get(start, cursor);
          const text = range ? tx.text.string(range) : '';

          if (NON_WHITESPACE.test(text)) {
            if (nextSelection) {
              tx.text.insert(indent, { at: nextSelection });
            }

            return;
          }
        }

        tx.text.insert(indent, { at: start });
      });
    }),
  ],
  priority: 10,
});
