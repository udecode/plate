import type { ResetNodePluginOptions } from '@udecode/plate-reset-node';

import { BlockquotePlugin } from '@udecode/plate-block-quote';
import {
  CodeBlockPlugin,
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import {
  ParagraphPlugin,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/plate-common';
import { TodoListPlugin } from '@udecode/plate-list';

const resetBlockTypesCommonRule = {
  defaultType: ParagraphPlugin.key,
  types: [BlockquotePlugin.key, TodoListPlugin.key],
};

const resetBlockTypesCodeBlockRule = {
  defaultType: ParagraphPlugin.key,
  onReset: unwrapCodeBlock,
  types: [CodeBlockPlugin.key],
};

export const resetBlockTypeOptions: Partial<ResetNodePluginOptions> = {
  rules: [
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Enter',
      predicate: isBlockAboveEmpty,
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Backspace',
      predicate: isSelectionAtBlockStart,
    },
    {
      ...resetBlockTypesCodeBlockRule,
      hotkey: 'Enter',
      predicate: isCodeBlockEmpty,
    },
    {
      ...resetBlockTypesCodeBlockRule,
      hotkey: 'Backspace',
      predicate: isSelectionAtCodeBlockStart,
    },
  ],
};
