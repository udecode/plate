import type { OverrideEditor } from '@udecode/plate';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { getCodeLineEntry, getIndentDepth } from './queries';
import { indentCodeLine } from './transforms';
import { withInsertDataCodeBlock } from './withInsertDataCodeBlock';
import { withInsertFragmentCodeBlock } from './withInsertFragmentCodeBlock';
import { withNormalizeCodeBlock } from './withNormalizeCodeBlock';

export const withCodeBlock: OverrideEditor<CodeBlockConfig> = (ctx) => {
  const {
    editor,
    tf: { insertBreak },
  } = ctx;

  const insertBreakCodeBlock = () => {
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

  return {
    transforms: {
      insertBreak() {
        if (insertBreakCodeBlock()) return;

        insertBreak();
      },
      ...withInsertDataCodeBlock(ctx).transforms,
      ...withInsertFragmentCodeBlock(ctx).transforms,
      ...withNormalizeCodeBlock(ctx).transforms,
    },
  };
};
