import { boolean, text } from '@storybook/addon-knobs';
import {
  ELEMENT_TODO_LI,
  ExitBreakPluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  MentionNodeData,
  ResetBlockTypePluginOptions,
  SoftBreakPluginOptions,
} from '@udecode/slate-plugins';
import { options } from './initialValues';
import { MENTIONABLES } from './mentionables';

export const optionsMentionPlugin = {
  mentionables: MENTIONABLES,
  maxSuggestions: 10,
  insertSpaceAfterMention: boolean('insert Space After Mention', false),
  trigger: '@',
  mentionableFilter: (s: string) => (mentionable: MentionNodeData) =>
    mentionable.email.toLowerCase().includes(s.toLowerCase()) ||
    mentionable.name.toLowerCase().includes(s.toLowerCase()),
  mentionableSearchPattern: boolean('useCustomMentionableSearchPattern', true)
    ? text('mentionableSearchPattern', '\\S*')
    : undefined,
};

const resetBlockTypesCommonRule = {
  types: [options.blockquote.type, options[ELEMENT_TODO_LI].type],
  defaultType: options.p.type,
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
        allow: [
          options.code_block.type,
          options.blockquote.type,
          options.td.type,
        ],
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
