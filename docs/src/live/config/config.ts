import {
  AutoformatPlugin,
  CodeBlockElement,
  createPlateUI,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_PARAGRAPH,
  ELEMENT_TD,
  ELEMENT_TODO_LI,
  ExitBreakPlugin,
  IndentPlugin,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  MARK_BOLD,
  MARK_ITALIC,
  NormalizeTypesPlugin,
  PlatePlugin,
  ResetNodePlugin,
  SelectOnBackspacePlugin,
  SoftBreakPlugin,
  TrailingBlockPlugin,
  withProps,
} from '@udecode/plate';
import {
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-excalidraw';
import { Partial } from 'rollup-plugin-typescript2/dist/partial';
import { EditableProps } from 'slate-react/dist/components/editable';
import { css } from 'styled-components';
import { autoformatRules } from './autoformat/autoformatRules';
import { MENTIONABLES } from './mentionables';

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH,
};

interface Config {
  components: Record<string, any>;
  editableProps: EditableProps;
  docxOptions: Record<string, Partial<PlatePlugin>>;

  align: Partial<PlatePlugin>;
  autoformat: Partial<PlatePlugin<{}, AutoformatPlugin>>;
  exitBreak: Partial<PlatePlugin<{}, ExitBreakPlugin>>;
  forceLayout: Partial<PlatePlugin<{}, NormalizeTypesPlugin>>;
  indent: Partial<PlatePlugin<{}, IndentPlugin>>;
  lineHeight: Partial<PlatePlugin>;
  mentionItems: any;
  resetBlockType: Partial<PlatePlugin<{}, ResetNodePlugin>>;
  selectOnBackspace: Partial<PlatePlugin<{}, SelectOnBackspacePlugin>>;
  softBreak: Partial<PlatePlugin<{}, SoftBreakPlugin>>;
  trailingBlock: Partial<PlatePlugin<{}, TrailingBlockPlugin>>;
}

export const CONFIG: Config = {
  editableProps: {
    autoFocus: process.env.NODE_ENV !== 'production',
    spellCheck: false,
    placeholder: 'Type…',
    style: {
      padding: '15px',
    },
  },
  components: createPlateUI({
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
    [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
  }),

  align: {
    inject: {
      props: {
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
    },
  },
  indent: {
    inject: {
      props: {
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
    },
  },
  lineHeight: {
    inject: {
      props: {
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
    },
  },
  resetBlockType: {
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
      ],
    },
  },
  trailingBlock: { type: ELEMENT_PARAGRAPH },
  softBreak: {
    options: {
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
  },
  exitBreak: {
    options: {
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
  },
  selectOnBackspace: {
    options: {
      query: {
        allow: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED, ELEMENT_HR],
      },
    },
  },
  autoformat: {
    options: {
      rules: autoformatRules,
    },
  },
  mentionItems: MENTIONABLES,
  forceLayout: {
    options: {
      rules: [{ path: [0], strictType: ELEMENT_H1 }],
    },
  },
  docxOptions: {
    [ELEMENT_CODE_BLOCK]: {
      deserializeHtml: {
        validClassName: 'SourceCode',
      },
    },
    [ELEMENT_CODE_LINE]: {
      deserializeHtml: {
        validClassName: 'VerbatimChar',
      },
    },
    [MARK_BOLD]: {
      deserializeHtml: [
        { validNodeName: ['STRONG', 'B'] },
        {
          validStyle: {
            fontWeight: ['600', '700', 'bold'],
          },
        },
      ],
      // query: (el) => {
      //   if (
      //     ['STRONG', 'B'].includes(el.nodeName) &&
      //     (el.children[0] as HTMLElement)?.style.fontWeight === 'normal'
      //   ) {
      //     return false;
      //   }
      //
      //   return true;
    },
    [MARK_ITALIC]: {
      deserializeHtml: {
        query: (el) => {
          if (
            el.nodeName === 'EM' &&
            (el.children[0] as HTMLElement)?.style.fontStyle === 'normal'
          ) {
            return false;
          }

          return true;
        },
      },
    },
  },
};
