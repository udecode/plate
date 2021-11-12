import {
  AlignPluginOptions,
  AutoformatPluginOptions,
  CodeBlockElement,
  createPlateComponents,
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
  components: Record<string, any>;
  editableProps: EditableProps;

  align: AlignPluginOptions;
  autoformat: AutoformatPluginOptions;
  exitBreak: ExitBreakPluginOptions;
  forceLayout: NormalizeTypesPluginOptions;
  indent: IndentPluginOptions;
  lineHeight: PlatePlugin;
  mentionItems: any;
  resetBlockType: ResetBlockTypePluginOptions;
  selectOnBackspace: SelectOnBackspacePluginOptions;
  softBreak: SoftBreakPluginOptions;
  trailingBlock: TrailingBlockPluginOptions;
} = {
  editableProps: {
    autoFocus: process.env.NODE_ENV !== 'production',
    spellCheck: false,
    placeholder: 'Type…',
    style: {
      padding: '15px',
    },
  },
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
    validTypes: [
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
    validTypes: [
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
  lineHeight: {
    defaultNodeValue: 1.5,
    validNodeValues: [1, 1.2, 1.5, 2, 3],
    validTypes: [
      ELEMENT_PARAGRAPH,
      ELEMENT_H1,
      ELEMENT_H2,
      ELEMENT_H3,
      ELEMENT_H4,
      ELEMENT_H5,
      ELEMENT_H6,
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
