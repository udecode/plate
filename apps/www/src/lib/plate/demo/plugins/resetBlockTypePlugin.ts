import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { TodoListPlugin } from '@udecode/plate-list/react';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';

const resetBlockTypesCommonRule = {
  defaultType: ParagraphPlugin.key,
  types: [BlockquotePlugin.key, TodoListPlugin.key],
};

const resetBlockTypesCodeBlockRule = {
  defaultType: ParagraphPlugin.key,
  types: [CodeBlockPlugin.key],
  onReset: unwrapCodeBlock,
};

export const resetBlockTypePlugin = ResetNodePlugin.configure({
  options: {
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
  },
});
