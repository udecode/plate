import type { OverrideEditor, TCodeBlockElement, TElement } from 'platejs';

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
        let shouldRedecorate = false;

        if (getOptions().lowlight && operation.type === 'set_node') {
          const entry = editor.api.node(operation.path);
          const touchesLang =
            'lang' in (operation.properties ?? {}) ||
            'lang' in (operation.newProperties ?? {});
          const langChanged =
            operation.properties?.lang !== operation.newProperties?.lang;

          if (entry?.[0].type === type && touchesLang && langChanged) {
            resetCodeBlockDecorations(entry[0] as TCodeBlockElement);
            shouldRedecorate = true;
          }
        }

        apply(operation);

        if (shouldRedecorate) {
          editor.api.redecorate();
        }
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
            match: { type },
          })
        ) {
          unwrapCodeBlock(editor);
          return;
        }

        return resetBlock(options);
      },
      selectAll: () => {
        const apply = () => {
          const codeBlock = editor.api.above({
            match: { type },
          });

          if (!codeBlock) return;

          if (
            editor.api.isAt({ end: true }) &&
            editor.api.isAt({ start: true })
          ) {
            return;
          }

          // Select the whole code block
          editor.tf.select(codeBlock[1]);
          return true;
        };

        if (apply()) return true;

        return selectAll();
      },
      tab: (options) => {
        const apply = () => {
          const codeLineType = editor.getType('code_line');
          const _codeLines = editor.api.nodes<TElement>({
            match: { type: codeLineType },
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
