import type { OverrideEditor } from '@udecode/plate';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { withInsertDataCodeBlock } from './withInsertDataCodeBlock';
import { withInsertFragmentCodeBlock } from './withInsertFragmentCodeBlock';
import { withNormalizeCodeBlock } from './withNormalizeCodeBlock';

export const withCodeBlock: OverrideEditor<CodeBlockConfig> = (ctx) => {
  const {
    editor,
    tf: { insertBreak },
    type,
  } = ctx;

  const insertBreakCodeBlock = () => {
    if (!editor.selection) return;

    // Check if we're in a code block
    const [codeBlock] = editor.api.nodes({
      match: { type },
      mode: 'lowest',
    });

    if (!codeBlock) return;

    // Insert a newline character instead of breaking the node
    editor.tf.insertText('\n');

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
