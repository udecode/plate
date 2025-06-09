import {
  type OverrideEditor,
  type TCodeBlockElement,
  type TElement,
  KEYS,
} from '@udecode/plate';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { getCodeLineEntry, getIndentDepth } from './queries';
import { resetCodeBlockDecorations } from './setCodeBlockToDecorations';
import { indentCodeLine, outdentCodeLine, unwrapCodeBlock } from './transforms';
import { withInsertDataCodeBlock } from './withInsertDataCodeBlock';
import { withInsertFragmentCodeBlock } from './withInsertFragmentCodeBlock';
import { withNormalizeCodeBlock } from './withNormalizeCodeBlock';

export const withCodeBlock: OverrideEditor<CodeBlockConfig> = (ctx) => {
  const {
    editor,
    getOptions,
    tf: { apply, insertBreak, resetBlock, selectAll, tab },
    type,
  } = ctx;

  return {
    transforms: {
      apply(operation) {
        if (getOptions().lowlight && operation.type === 'set_node') {
          const entry = editor.api.node(operation.path);

          if (entry?.[0].type === type && operation.newProperties?.lang) {
            // Clear decorations for all code lines in this block
            resetCodeBlockDecorations(entry[0] as TCodeBlockElement);
          }
        }

        apply(operation);
      },
      insertBreak() {
        const apply = () => {
          if (!editor.selection) return;

          const res = getCodeLineEntry(editor, {});

          if (!res) return;

          const { codeBlock, codeLine } = res;
          const indentDepth = getIndentDepth(editor, {
            codeBlock,
            codeLine,
          });

          insertBreak();

          indentCodeLine(editor, {
            codeBlock,
            codeLine,
            indentDepth,
          });

          return true;
        };

        if (apply()) return;

        insertBreak();
      },
      resetBlock(options) {
        if (
          editor.api.block({
            at: options?.at,
            match: { type: editor.getType(KEYS.codeBlock) },
          })
        ) {
          unwrapCodeBlock(editor);
          return;
        }

        return resetBlock(options);
      },
      selectAll: () => {
        const apply = () => {
          const res = getCodeLineEntry(editor, {});

          if (!res) return;

          const { codeBlock } = res;
          const [, codeBlockPath] = codeBlock;

          if (
            editor.api.isAt({ end: true }) &&
            editor.api.isAt({ start: true })
          ) {
            return;
          }

          // Select the whole code block
          editor.tf.select(codeBlockPath);
          return true;
        };

        if (apply()) return true;

        return selectAll();
      },
      tab: (options) => {
        const apply = () => {
          const _codeLines = editor.api.nodes<TElement>({
            match: { type: editor.getType(KEYS.codeLine) },
          });
          const codeLines = Array.from(_codeLines);

          if (codeLines.length > 0) {
            const [, firstLinePath] = codeLines[0];
            const codeBlock = editor.api.parent<TElement>(firstLinePath);

            if (!codeBlock) return;

            editor.tf.withoutNormalizing(() => {
              for (const codeLine of codeLines) {
                if (options.reverse) {
                  outdentCodeLine(editor, { codeBlock, codeLine });
                } else {
                  indentCodeLine(editor, { codeBlock, codeLine });
                }
              }
            });

            return true; // Prevent default
          }
        };

        if (apply()) return true;

        return tab(options);
      },
      ...withInsertDataCodeBlock(ctx).transforms,
      ...withInsertFragmentCodeBlock(ctx).transforms,
      ...withNormalizeCodeBlock(ctx).transforms,
    },
  };
};
