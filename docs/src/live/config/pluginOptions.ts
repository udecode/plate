import {
  createSlatePluginsOptions,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_PARAGRAPH,
  ELEMENT_LI,
  ELEMENT_TD,
  ELEMENT_TODO_LI,
  ExitBreakPluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  MentionNodeData,
  ResetBlockTypePluginOptions,
  SoftBreakPluginOptions,
} from '@udecode/slate-plugins';
import { MENTIONABLES } from './mentionables';

export const options = createSlatePluginsOptions();

export const optionsMentionPlugin = {
  mentionables: MENTIONABLES,
  maxSuggestions: 10,
  insertSpaceAfterMention: false,
  trigger: '@',
  mentionableFilter: (s: string) => (mentionable: MentionNodeData) =>
    mentionable.email.toLowerCase().includes(s.toLowerCase()) ||
    mentionable.name.toLowerCase().includes(s.toLowerCase()),
  mentionableSearchPattern: '\\S*',
};

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI, ELEMENT_LI],
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

export const editableProps = {
  // placeholder: 'Enter some rich text…',
  spellCheck: false,
  autoFocus: true,
};
