import type { ResetNodePluginOptions } from '@udecode/plate-reset-node';

import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/plate-common';
import { ELEMENT_TODO_LI } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

const resetBlockTypesCommonRule = {
  defaultType: ELEMENT_PARAGRAPH,
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
};

const resetBlockTypesCodeBlockRule = {
  defaultType: ELEMENT_PARAGRAPH,
  onReset: unwrapCodeBlock,
  types: [ELEMENT_CODE_BLOCK],
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
