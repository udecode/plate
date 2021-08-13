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
  MentionNodeData,
  ResetBlockTypePluginOptions,
  SoftBreakPluginOptions,
  WithAutoformatOptions,
} from '@udecode/plate';
import { autoformatBlocks } from './autoFormatRules/block/autoformatBlocks';
import { autoformatLists } from './autoFormatRules/block/autoformatLists';
import { autoformatMarks } from './autoFormatRules/mark/autoformatMarks';
import { autoformatArrow } from './autoFormatRules/text/autoformatArrow';
import {
  autoformatLegal,
  autoformatLegalHtml,
} from './autoFormatRules/text/autoformatLegal';
import { autoformatPunctuation } from './autoFormatRules/text/autoformatPunctuation';
import { autoformatMathComparison } from './autoFormatRules/text/math/autoformatMathComparison';
import { autoformatMathEquality } from './autoFormatRules/text/math/autoformatMathEquality';
import { autoformatMathFraction } from './autoFormatRules/text/math/autoformatMathFraction';
import {
  autoformatMathDivision,
  autoformatMathMultiplication,
  autoformatMathOperation,
} from './autoFormatRules/text/math/autoformatMathOperation';
import {
  autoformatMathSubscriptNumbers,
  autoformatMathSubscriptSymbols,
} from './autoFormatRules/text/math/autoformatMathSubscript';
import {
  autoformatMathSuperscriptNumbers,
  autoformatMathSuperscriptSymbols,
} from './autoFormatRules/text/math/autoformatMathSuperscript';
import { MENTIONABLES } from './mentionables';

export const options = createPlateOptions();

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
  rules: [
    ...autoformatBlocks,
    ...autoformatLists,
    ...autoformatMarks,
    ...autoformatPunctuation,
    ...autoformatLegal,
    ...autoformatLegalHtml,
    ...autoformatMathComparison,
    ...autoformatMathEquality,
    ...autoformatMathOperation,
    ...autoformatMathMultiplication,
    ...autoformatMathDivision,
    ...autoformatMathFraction,
    ...autoformatMathSuperscriptSymbols,
    ...autoformatMathSubscriptSymbols,
    ...autoformatMathSuperscriptNumbers,
    ...autoformatMathSubscriptNumbers,
    ...autoformatArrow,
  ],
};

export const editableProps = {
  // placeholder: 'Enter some rich text…',
  spellCheck: false,
  autoFocus: true,
};
