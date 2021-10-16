import {
  AlignPluginOptions,
  AutoformatPluginOptions,
  CodeBlockElement,
  createPlateComponents,
  createPlateOptions,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_PARAGRAPH,
  ELEMENT_TD,
  ELEMENT_TODO_LI,
  ExitBreakPluginOptions,
  IndentPluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  NormalizeTypesPluginOptions,
  PlatePluginOptions,
  ResetBlockTypePluginOptions,
  SelectOnBackspacePluginOptions,
  SoftBreakPluginOptions,
  TrailingBlockPluginOptions,
  withProps,
} from '@udecode/plate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { css } from 'styled-components';
import { autoformatRules } from './autoformat/autoformatRules';
import { MENTIONABLES } from './mentionables';

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH,
};

export const CONFIG: {
  options: Record<string, PlatePluginOptions>;
  components: Record<string, any>;
  editableProps: EditableProps;

  align: AlignPluginOptions;
  autoformat: AutoformatPluginOptions;
  exitBreak: ExitBreakPluginOptions;
  forceLayout: NormalizeTypesPluginOptions;
  indent: IndentPluginOptions;
  mentionItems: any;
  resetBlockType: ResetBlockTypePluginOptions;
  selectOnBackspace: SelectOnBackspacePluginOptions;
  softBreak: SoftBreakPluginOptions;
  trailingBlock: TrailingBlockPluginOptions;
} = {
  editableProps: {
    spellCheck: false,
    autoFocus: false,
    placeholder: 'Type…',
    style: {
      padding: '15px',
    },
  },
  options: createPlateOptions(),
  components: createPlateComponents({
    [ELEMENT_CODE_BLOCK]: withProps(CodeBlockElement, {
      styles: {
        root: [
          css`
            background-color: #111827;
            code {
              color: white;
            }
          `,
        ],
      },
    }),
  }),

  align: {
    types: [
      ELEMENT_PARAGRAPH,
      ELEMENT_H1,
      ELEMENT_H2,
      ELEMENT_H3,
      ELEMENT_H4,
      ELEMENT_H5,
      ELEMENT_H6,
    ],
  },
  indent: {
    types: [
      ELEMENT_PARAGRAPH,
      ELEMENT_H1,
      ELEMENT_H2,
      ELEMENT_H3,
      ELEMENT_H4,
      ELEMENT_H5,
      ELEMENT_H6,
      ELEMENT_BLOCKQUOTE,
      ELEMENT_CODE_BLOCK,
    ],
  },
  resetBlockType: {
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
  },
  trailingBlock: { type: ELEMENT_PARAGRAPH },
  softBreak: {
    rules: [
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
        },
      },
    ],
  },
  exitBreak: {
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
  },
  selectOnBackspace: { allow: [ELEMENT_IMAGE, ELEMENT_HR] },
  autoformat: {
    rules: autoformatRules,
  },
  mentionItems: MENTIONABLES,
  forceLayout: {
    rules: [{ path: [0], strictType: ELEMENT_H1 }],
  },
};
