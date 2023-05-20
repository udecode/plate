import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_PARAGRAPH,
  ELEMENT_TODO_LI,
  isBlockAboveEmpty,
  isCodeBlockEmpty,
  isSelectionAtBlockStart,
  isSelectionAtCodeBlockStart,
  ResetNodePlugin,
  unwrapCodeBlock,
} from '@udecode/plate';
import { MyPlatePlugin } from '../../apps/next/src/lib/plate/typescript/plateTypes';

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH,
};

const resetBlockTypesCodeBlockRule = {
  types: [ELEMENT_CODE_BLOCK],
  defaultType: ELEMENT_PARAGRAPH,
  onReset: unwrapCodeBlock,
};

export const resetBlockTypePlugin: Partial<MyPlatePlugin<ResetNodePlugin>> = {
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
};
