import {
  createPlateOptions,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_PARAGRAPH,
  ELEMENT_TD,
  ELEMENT_TODO_LI,
  ExitBreakPluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  ResetBlockTypePluginOptions,
  SoftBreakPluginOptions,
  WithAutoformatOptions,
} from '@udecode/plate';
import { autoformatRules } from './autoformat/autoformatRules';

export const options = createPlateOptions();

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH,
};

export const optionsResetBlockTypePlugin: ResetBlockTypePluginOptions = {
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
  ],
};

export const optionsSoftBreakPlugin: SoftBreakPluginOptions = {
  rules: [
    { hotkey: 'shift+enter' },
    {
      hotkey: 'enter',
      query: {
        allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
      },
    },
  ],
};

export const optionsExitBreakPlugin: ExitBreakPluginOptions = {
  rules: [
    {
      hotkey: 'mod+enter',
    },
    {
      hotkey: 'mod+shift+enter',
      before: true,
    },
    {
      hotkey: 'enter',
      query: {
        start: true,
        end: true,
        allow: KEYS_HEADING,
      },
    },
  ],
};

export const optionsAutoformat: WithAutoformatOptions = {
  rules: autoformatRules,
};

export const editableProps = {
  // placeholder: 'Enter some rich text…',
  spellCheck: false,
  autoFocus: true,
};
