import {
  AutoformatPlugin,
  createPlateUI,
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
  ExitBreakPlugin,
  IndentPlugin,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  NormalizeTypesPlugin,
  ResetNodePlugin,
  SelectOnBackspacePlugin,
  SoftBreakPlugin,
  TEditableProps,
  TrailingBlockPlugin,
} from '@udecode/plate'
import { autoformatRules } from './autoformat/autoformatRules'
import { MENTIONABLES } from './mentionables'
import { MyEditor, MyPlatePlugin, MyValue } from './typescript'

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH,
}

export const CONFIG: {
  components: Record<string, any>
  editableProps: TEditableProps<MyValue>

  align: Partial<MyPlatePlugin>
  autoformat: Partial<MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>>
  exitBreak: Partial<MyPlatePlugin<ExitBreakPlugin>>
  forceLayout: Partial<MyPlatePlugin<NormalizeTypesPlugin>>
  indent: Partial<MyPlatePlugin<IndentPlugin>>
  lineHeight: Partial<MyPlatePlugin>
  mentionItems: any
  resetBlockType: Partial<MyPlatePlugin<ResetNodePlugin>>
  selectOnBackspace: Partial<MyPlatePlugin<SelectOnBackspacePlugin>>
  softBreak: Partial<MyPlatePlugin<SoftBreakPlugin>>
  trailingBlock: Partial<MyPlatePlugin<TrailingBlockPlugin>>
} = {
  editableProps: {
    spellCheck: false,
    autoFocus: false,
    placeholder: 'Type…',
    style: {
      padding: '15px',
    },
  },
  components: createPlateUI(),

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
        allow: [ELEMENT_IMAGE, ELEMENT_HR],
      },
    },
  },
  autoformat: {
    options: {
      rules: autoformatRules as any,
    },
  },
  mentionItems: MENTIONABLES,
  forceLayout: {
    options: {
      rules: [{ path: [0], strictType: ELEMENT_H1 }],
    },
  },
}
