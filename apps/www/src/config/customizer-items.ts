import { KEY_ALIGN } from '@udecode/plate-alignment';
import { KEY_AUTOFORMAT } from '@udecode/plate-autoformat';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  KEY_EXIT_BREAK,
  KEY_SINGLE_LINE,
  KEY_SOFT_BREAK,
} from '@udecode/plate-break';
import { KEY_CAPTION } from '@udecode/plate-caption';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { KEY_COMBOBOX } from '@udecode/plate-combobox';
import { MARK_COMMENT } from '@udecode/plate-comments';
import { KEY_DND } from '@udecode/plate-dnd';
import { KEY_EMOJI } from '@udecode/plate-emoji';
import { ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import { MARK_BG_COLOR, MARK_COLOR, MARK_FONT_SIZE } from '@udecode/plate-font';
import { MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { KEY_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { KEY_JUICE } from '@udecode/plate-juice';
import { MARK_KBD } from '@udecode/plate-kbd';
import { KEY_LINE_HEIGHT } from '@udecode/plate-line-height';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_TODO_LI } from '@udecode/plate-list';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
import { ELEMENT_MENTION } from '@udecode/plate-mention';
import { KEY_NODE_ID } from '@udecode/plate-node-id';
import { KEY_NORMALIZE_TYPES } from '@udecode/plate-normalizers';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { KEY_RESET_NODE } from '@udecode/plate-reset-node';
import { KEY_DELETE, KEY_SELECT_ON_BACKSPACE } from '@udecode/plate-select';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { KEY_DESERIALIZE_CSV } from '@udecode/plate-serializer-csv';
import { KEY_DESERIALIZE_DOCX } from '@udecode/plate-serializer-docx';
import { KEY_DESERIALIZE_MD } from '@udecode/plate-serializer-md';
import { KEY_TABBABLE } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ELEMENT_TOGGLE } from '@udecode/plate-toggle';
import { KEY_TRAILING_BLOCK } from '@udecode/plate-trailing-block';

import {
  type CustomizerBadge,
  customizerBadges,
} from '@/config/customizer-badges';
import { customizerComponents } from '@/config/customizer-components';
import { customizerPlugins } from '@/config/customizer-plugins';
import { KEY_DRAG_OVER_CURSOR } from '@/plate/demo/plugins/dragOverCursorPlugin';

export type SettingPlugin = {
  badges?: CustomizerBadge[];
  cnImports?: string[];
  components?: {
    cnImports?: string[];
    customImports?: string[];
    filename?: string; // e.g. 'blockquote-element' (default: id)
    id: string; // e.g. 'blockquote-element'
    import?: string;
    label: string; // e.g. 'Blockquote'
    noImport?: boolean;
    plateImports?: string[];
    pluginKey?: string; // Plugin components only, e.g. 'ELEMENT_BLOCKQUOTE'
    pluginOptions?: string[];
    registry?: string;
    route?: string;
    usage: string; // e.g. 'BlockquoteElement'
  }[];
  conflicts?: string[];
  customImports?: string[];
  dependencies?: string[];
  disablePlugins?: string[];
  id: string;
  label?: string;
  npmPackage?: string;
  packageImports?: string[];
  plateImports?: string[];
  pluginFactory?: string;
  pluginOptions?: string[];
  route?: string;
};

export const customizerItems: Record<string, SettingPlugin> = {
  [ELEMENT_BLOCKQUOTE]: {
    badges: [customizerBadges.element],
    components: [
      {
        id: 'blockquote-element',
        label: 'BlockquoteElement',
        pluginKey: 'ELEMENT_BLOCKQUOTE',
        route: customizerComponents.blockquoteElement.href,
        usage: 'BlockquoteElement',
      },
    ],
    id: ELEMENT_BLOCKQUOTE,
    label: 'Blockquote',
    npmPackage: '@udecode/plate-block-quote',
    pluginFactory: 'createBlockquotePlugin',
    route: customizerPlugins.basicnodes.route,
  },
  [ELEMENT_CODE_BLOCK]: {
    badges: [customizerBadges.element],
    components: [
      {
        id: 'code-block-element',
        label: 'CodeBlockElement',
        pluginKey: 'ELEMENT_CODE_BLOCK',
        route: customizerComponents.codeBlockElement.href,
        usage: 'CodeBlockElement',
      },
      {
        id: 'code-line-element',
        label: 'CodeLineElement',
        pluginKey: 'ELEMENT_CODE_LINE',
        route: customizerComponents.codeLineElement.href,
        usage: 'CodeLineElement',
      },
      {
        id: 'code-syntax-leaf',
        label: 'CodeSyntaxLeaf',
        pluginKey: 'ELEMENT_CODE_SYNTAX',
        route: customizerComponents.codeSyntaxLeaf.href,
        usage: 'CodeSyntaxLeaf',
      },
    ],
    id: ELEMENT_CODE_BLOCK,
    label: 'Code block',
    npmPackage: '@udecode/plate-code-block',
    pluginFactory: 'createCodeBlockPlugin',
    route: customizerPlugins.basicnodes.route,
  },
  [ELEMENT_EXCALIDRAW]: {
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'excalidraw-element',
        label: 'ExcalidrawElement',
        pluginKey: 'ELEMENT_EXCALIDRAW',
        route: customizerComponents.excalidrawElement.href,
        usage: 'ExcalidrawElement',
      },
    ],
    id: ELEMENT_EXCALIDRAW,
    label: 'Excalidraw',
    npmPackage: '@udecode/plate-excalidraw',
    pluginFactory: 'createExcalidrawPlugin',
    route: customizerPlugins.excalidraw.route,
  },
  [ELEMENT_HR]: {
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'hr-element',
        label: 'HrElement',
        pluginKey: 'ELEMENT_HR',
        route: customizerComponents.hrElement.href,
        usage: 'HrElement',
      },
    ],
    id: ELEMENT_HR,
    label: 'Horizontal Rule',
    npmPackage: '@udecode/plate-horizontal-rule',
    pluginFactory: 'createHorizontalRulePlugin',
    route: customizerPlugins.hr.route,
  },
  [ELEMENT_IMAGE]: {
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'image-element',
        label: 'ImageElement',
        pluginKey: 'ELEMENT_IMAGE',
        route: customizerComponents.imageElement.href,
        usage: 'ImageElement',
      },
    ],
    id: ELEMENT_IMAGE,
    label: 'Image',
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'createImagePlugin',
    route: customizerPlugins.media.route,
  },
  [ELEMENT_LINK]: {
    badges: [customizerBadges.element, customizerBadges.inline],
    components: [
      {
        id: 'link-element',
        label: 'LinkElement',
        pluginKey: 'ELEMENT_LINK',
        route: customizerComponents.linkElement.href,
        usage: 'LinkElement',
      },
      {
        id: 'link-floating-toolbar',
        label: 'LinkFloatingToolbar',
        plateImports: ['RenderAfterEditable'],
        pluginOptions: [
          `renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,`,
        ],
        route: customizerComponents.linkFloatingToolbar.href,
        usage: 'LinkFloatingToolbar',
      },
    ],
    id: ELEMENT_LINK,
    label: 'Link',
    npmPackage: '@udecode/plate-link',
    pluginFactory: 'createLinkPlugin',
    route: customizerPlugins.link.route,
  },
  [ELEMENT_MEDIA_EMBED]: {
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'media-embed-element',
        label: 'MediaEmbedElement',
        pluginKey: 'ELEMENT_MEDIA_EMBED',
        route: customizerComponents.mediaEmbedElement.href,
        usage: 'MediaEmbedElement',
      },
    ],
    id: ELEMENT_MEDIA_EMBED,
    label: 'Media Embed',
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'createMediaEmbedPlugin',
    route: customizerPlugins.media.route,
  },
  [ELEMENT_MENTION]: {
    badges: [
      customizerBadges.element,
      customizerBadges.inline,
      customizerBadges.void,
    ],
    components: [
      {
        id: 'mention-element',
        label: 'MentionElement',
        pluginKey: 'ELEMENT_MENTION',
        route: customizerComponents.mentionElement.href,
        usage: 'MentionElement',
      },
      {
        id: 'mention-input-element',
        label: 'MentionInputElement',
        pluginKey: 'ELEMENT_MENTION_INPUT',
        route: customizerComponents.mentionInputElement.href,
        usage: 'MentionInputElement',
      },
      {
        id: 'mention-combobox',
        label: 'MentionCombobox',
        route: customizerComponents.mentionCombobox.href,
        usage: 'MentionCombobox',
      },
    ],
    dependencies: [KEY_COMBOBOX],
    id: ELEMENT_MENTION,
    label: 'Mention',
    npmPackage: '@udecode/plate-mention',
    pluginFactory: 'createMentionPlugin',
    route: customizerPlugins.mention.route,
  },
  [ELEMENT_PARAGRAPH]: {
    badges: [customizerBadges.element],
    components: [
      {
        id: 'paragraph-element',
        label: 'ParagraphElement',
        pluginKey: 'ELEMENT_PARAGRAPH',
        route: customizerComponents.paragraphElement.href,
        usage: 'ParagraphElement',
      },
    ],
    id: ELEMENT_PARAGRAPH,
    label: 'Paragraph',
    npmPackage: '@udecode/plate-paragraph',
    pluginFactory: 'createParagraphPlugin',
    route: customizerPlugins.basicnodes.route,
  },
  [ELEMENT_TABLE]: {
    badges: [customizerBadges.element],
    components: [
      {
        id: 'table-element',
        label: 'TableElement',
        pluginKey: 'ELEMENT_TABLE',
        route: customizerComponents.tableElement.href,
        usage: 'TableElement',
      },
      {
        id: 'table-row-element',
        label: 'TableRowElement',
        pluginKey: 'ELEMENT_TR',
        route: customizerComponents.tableRowElement.href,
        usage: 'TableRowElement',
      },
      {
        filename: 'table-cell-element',
        id: 'td',
        label: 'TableCellElement',
        pluginKey: 'ELEMENT_TD',
        route: customizerComponents.tableCellElement.href,
        usage: 'TableCellElement',
      },
      {
        filename: 'table-cell-element',
        id: 'th',
        label: 'TableCellHeaderElement',
        pluginKey: 'ELEMENT_TH',
        route: customizerComponents.tableCellElement.href,
        usage: 'TableCellHeaderElement',
      },
    ],
    id: ELEMENT_TABLE,
    label: 'Table',
    npmPackage: '@udecode/plate-table',
    pluginFactory: 'createTablePlugin',
    route: customizerPlugins.table.route,
  },
  [ELEMENT_TODO_LI]: {
    badges: [customizerBadges.element],
    components: [
      {
        id: 'todo-list-element',
        label: 'TodoListElement',
        pluginKey: 'ELEMENT_TODO_LI',
        route: customizerComponents.todoListElement.href,
        usage: 'TodoListElement',
      },
    ],
    id: ELEMENT_TODO_LI,
    label: 'Todo List',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'createTodoListPlugin',
    route: customizerPlugins.todoli.route,
  },
  [ELEMENT_TOGGLE]: {
    badges: [customizerBadges.element],
    components: [
      {
        id: 'toggle-element',
        label: 'ToggleElement',
        pluginKey: 'ELEMENT_TOGGLE',
        route: customizerComponents.toggleElement.href,
        usage: 'ToggleElement',
      },
    ],
    id: ELEMENT_TOGGLE,
    label: 'Toggle',
    npmPackage: '@udecode/plate-toggle',
    pluginFactory: 'createTogglePlugin',
    route: customizerPlugins.toggle.route,
  },
  [KEY_ALIGN]: {
    badges: [customizerBadges.style],
    id: KEY_ALIGN,
    label: 'Align',
    npmPackage: '@udecode/plate-alignment',
    pluginFactory: 'createAlignPlugin',
    pluginOptions: [
      `inject: {`,
      `  props: {`,
      `    validTypes: [`,
      `      ELEMENT_PARAGRAPH,`,
      `      // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3`,
      `    ],`,
      `  },`,
      `},`,
    ],
    route: customizerPlugins.align.route,
  },
  // Functionality
  [KEY_AUTOFORMAT]: {
    badges: [customizerBadges.handler],
    id: KEY_AUTOFORMAT,
    label: 'Autoformat',
    npmPackage: '@udecode/plate-autoformat',
    pluginFactory: 'createAutoformatPlugin',
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    // Usage: https://platejs.org/docs/autoformat`,
      `  ],`,
      `  enableUndoOnDelete: true,`,
      `},`,
    ],
    route: customizerPlugins.autoformat.route,
  },
  [KEY_BLOCK_SELECTION]: {
    badges: [customizerBadges.ui],
    dependencies: [KEY_NODE_ID],
    id: KEY_BLOCK_SELECTION,
    label: 'Block Selection',
    npmPackage: '@udecode/plate-selection',
    pluginFactory: 'createBlockSelectionPlugin',
    pluginOptions: [
      `options: {`,
      `  sizes: {`,
      `    top: 0,`,
      `    bottom: 0,`,
      `  },`,
      `},`,
    ],
    route: customizerPlugins.blockselection.route,
  },
  [KEY_CAPTION]: {
    badges: [customizerBadges.handler],
    id: KEY_CAPTION,
    label: 'Caption',
    npmPackage: '@udecode/plate-caption',
    pluginFactory: 'createCaptionPlugin',
    pluginOptions: [
      `options: {`,
      `  pluginKeys: [`,
      `    // ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED`,
      `  ]`,
      `},`,
    ],
    route: customizerPlugins.media.route,
  },
  [KEY_COMBOBOX]: {
    badges: [customizerBadges.handler, customizerBadges.ui],
    id: KEY_COMBOBOX,
    label: 'Combobox',
    npmPackage: '@udecode/plate-combobox',
    pluginFactory: 'createComboboxPlugin',
    route: customizerPlugins.combobox.route,
  },
  [KEY_DELETE]: {
    badges: [customizerBadges.handler],
    id: KEY_DELETE,
    label: 'Delete',
    npmPackage: '@udecode/plate-select',
    pluginFactory: 'createDeletePlugin',
  },
  // Deserialization
  [KEY_DESERIALIZE_CSV]: {
    badges: [customizerBadges.handler],
    id: KEY_DESERIALIZE_CSV,
    label: 'Deserialize CSV',
    npmPackage: '@udecode/plate-serializer-csv',
    pluginFactory: 'createDeserializeCsvPlugin',
    route: customizerPlugins.deserializecsv.route,
  },
  [KEY_DESERIALIZE_DOCX]: {
    badges: [customizerBadges.handler],
    dependencies: [KEY_JUICE],
    id: KEY_DESERIALIZE_DOCX,
    label: 'Deserialize DOCX',
    npmPackage: '@udecode/plate-serializer-docx',
    pluginFactory: 'createDeserializeDocxPlugin',
    route: customizerPlugins.deserializedocx.route,
  },
  [KEY_DESERIALIZE_MD]: {
    badges: [customizerBadges.handler],
    id: KEY_DESERIALIZE_MD,
    label: 'Deserialize MD',
    npmPackage: '@udecode/plate-serializer-md',
    pluginFactory: 'createDeserializeMdPlugin',
    route: customizerPlugins.deserializemd.route,
  },
  [KEY_DND]: {
    badges: [customizerBadges.handler, customizerBadges.ui],
    components: [
      {
        filename: 'with-draggables',
        id: 'draggable',
        label: 'Draggable',
        registry: 'draggable',
        route: customizerComponents.draggable.href,
        usage: 'withDraggables',
      },
    ],
    customImports: [
      `import { DndProvider } from 'react-dnd';`,
      `import { HTML5Backend } from 'react-dnd-html5-backend';`,
    ],
    dependencies: [KEY_NODE_ID],
    id: KEY_DND,
    label: 'Drag & Drop',
    npmPackage: '@udecode/plate-dnd',
    pluginFactory: 'createDndPlugin',
    pluginOptions: ['  options: { enableScroller: true },'],
    route: customizerPlugins.dnd.route,
  },
  [KEY_DRAG_OVER_CURSOR]: {
    badges: [customizerBadges.handler, customizerBadges.ui],
    id: KEY_DRAG_OVER_CURSOR,
    // npmPackage: '@udecode/plate-cursor',
    label: 'Drag Cursor',
    route: customizerPlugins.cursoroverlay.route,
  },
  [KEY_EMOJI]: {
    badges: [customizerBadges.handler],
    components: [
      // {
      //   id: 'emoji-combobox',
      //   label: 'EmojiCombobox',
      //   pluginOptions: [`renderAfterEditable: EmojiCombobox,`],
      //   route: customizerComponents.emojiCombobox.href,
      //   usage: 'EmojiCombobox',
      // },
    ],
    dependencies: [KEY_COMBOBOX],
    id: KEY_EMOJI,
    label: 'Emoji',
    npmPackage: '@udecode/plate-emoji',
    pluginFactory: 'createEmojiPlugin',
    route: customizerPlugins.emoji.route,
  },
  [KEY_EXIT_BREAK]: {
    badges: [customizerBadges.handler],
    id: KEY_EXIT_BREAK,
    label: 'Exit Break',
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createExitBreakPlugin',
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    {`,
      `      hotkey: 'mod+enter',`,
      `    },`,
      `    {`,
      `      hotkey: 'mod+shift+enter',`,
      `      before: true,`,
      `    },`,
      `    {`,
      `      hotkey: 'enter',`,
      `      query: {`,
      `        start: true,`,
      `        end: true,`,
      `        // allow: KEYS_HEADING,`,
      `      },`,
      `      relative: true,`,
      `      level: 1,`,
      `    },`,
      `  ],`,
      `},`,
    ],
    route: customizerPlugins.exitbreak.route,
  },
  [KEY_INDENT]: {
    badges: [customizerBadges.style],
    id: KEY_INDENT,
    label: 'Indent',
    npmPackage: '@udecode/plate-indent',
    pluginFactory: 'createIndentPlugin',
    pluginOptions: [
      `inject: {`,
      `  props: {`,
      `    validTypes: [`,
      `      ELEMENT_PARAGRAPH,`,
      `      // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK`,
      `    ],`,
      `  },`,
      `},`,
    ],
    route: customizerPlugins.indent.route,
  },
  [KEY_JUICE]: {
    badges: [customizerBadges.handler],
    id: KEY_JUICE,
    label: 'Juice',
    npmPackage: '@udecode/plate-juice',
    pluginFactory: 'createJuicePlugin',
    route: customizerPlugins.deserializedocx.route,
  },
  [KEY_LINE_HEIGHT]: {
    badges: [customizerBadges.style],
    id: KEY_LINE_HEIGHT,
    label: 'Line Height',
    npmPackage: '@udecode/plate-line-height',
    pluginFactory: 'createLineHeightPlugin',
    pluginOptions: [
      `inject: {`,
      `  props: {`,
      `    defaultNodeValue: 1.5,`,
      `    validNodeValues: [1, 1.2, 1.5, 2, 3],`,
      `    validTypes: [`,
      `      ELEMENT_PARAGRAPH,`,
      `      // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3`,
      `    ],`,
      `  },`,
      `},`,
    ],
    route: customizerPlugins.lineheight.route,
  },
  [KEY_LIST_STYLE_TYPE]: {
    badges: [customizerBadges.style],
    conflicts: ['list'],
    dependencies: [KEY_INDENT],
    id: KEY_LIST_STYLE_TYPE,
    label: 'Indent List',
    npmPackage: '@udecode/plate-indent-list',
    pluginFactory: 'createIndentListPlugin',
    pluginOptions: [
      `inject: {`,
      `  props: {`,
      `    validTypes: [`,
      `      ELEMENT_PARAGRAPH,`,
      `      // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK`,
      `    ],`,
      `  },`,
      `},`,
    ],
    route: customizerPlugins.indentlist.route,
  },
  [KEY_NODE_ID]: {
    badges: [customizerBadges.normalizer],
    id: KEY_NODE_ID,
    label: 'Id',
    npmPackage: '@udecode/plate-node-id',
    pluginFactory: 'createNodeIdPlugin',
    // route: settingValues.nodeid.route,
  },
  [KEY_NORMALIZE_TYPES]: {
    badges: [customizerBadges.normalizer],
    id: KEY_NORMALIZE_TYPES,
    label: 'Normalize Types',
    npmPackage: '@udecode/plate-normalizers',
    pluginFactory: 'createNormalizeTypesPlugin',
    route: customizerPlugins.forcedlayout.route,
  },
  [KEY_RESET_NODE]: {
    badges: [customizerBadges.handler],
    id: KEY_RESET_NODE,
    label: 'Reset Node',
    npmPackage: '@udecode/plate-reset-node',
    pluginFactory: 'createResetNodePlugin',
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    // Usage: https://platejs.org/docs/reset-node`,
      `  ],`,
      `},`,
    ],
    route: customizerPlugins.resetnode.route,
  },
  [KEY_SELECT_ON_BACKSPACE]: {
    badges: [customizerBadges.handler],
    id: KEY_SELECT_ON_BACKSPACE,
    label: 'Select on Backspace',
    npmPackage: '@udecode/plate-select',
    pluginFactory: 'createSelectOnBackspacePlugin',
    pluginOptions: [
      `options: {`,
      `  query: {`,
      `    allow: [`,
      `      // ELEMENT_IMAGE, ELEMENT_HR`,
      `    ],`,
      `  },`,
      `},`,
    ],
    route: customizerPlugins.media.route,
  },

  [KEY_SINGLE_LINE]: {
    badges: [customizerBadges.normalizer],
    conflicts: [KEY_TRAILING_BLOCK],
    disablePlugins: [KEY_TRAILING_BLOCK],
    id: KEY_SINGLE_LINE,
    label: 'Single Line',
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createSingleLinePlugin',
    route: customizerPlugins.singleline.route,
  },
  [KEY_SOFT_BREAK]: {
    badges: [customizerBadges.handler],
    id: KEY_SOFT_BREAK,
    label: 'Soft Break',
    // options: {
    //         rules: [
    //           { hotkey: 'shift+enter' },
    //           {
    //             hotkey: 'enter',
    //             query: {
    //               allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
    //             },
    //           },
    //         ],
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createSoftBreakPlugin',
    //       },
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    { hotkey: 'shift+enter' },`,
      `    {`,
      `      hotkey: 'enter',`,
      `      query: {`,
      `        allow: [`,
      `          // ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD`,
      `        ],`,
      `      },`,
      `    },`,
      `  ],`,
      `},`,
    ],
    route: customizerPlugins.softbreak.route,
  },
  [KEY_TABBABLE]: {
    badges: [customizerBadges.handler],
    id: KEY_TABBABLE,
    label: 'Tabbable',
    npmPackage: '@udecode/plate-tabbable',
    pluginFactory: 'createTabbablePlugin',
    route: customizerPlugins.tabbable.route,
  },
  [KEY_TRAILING_BLOCK]: {
    badges: [customizerBadges.normalizer],
    conflicts: [KEY_SINGLE_LINE],
    disablePlugins: [KEY_SINGLE_LINE],
    id: KEY_TRAILING_BLOCK,
    label: 'Trailing Block',
    npmPackage: '@udecode/plate-trailing-block',
    pluginFactory: 'createTrailingBlockPlugin',
    pluginOptions: [`options: { type: ELEMENT_PARAGRAPH },`],
    route: customizerPlugins.trailingblock.route,
  },
  [MARK_BG_COLOR]: {
    badges: [customizerBadges.style],
    id: MARK_BG_COLOR,
    label: 'Font Background',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontBackgroundColorPlugin',
    route: customizerPlugins.font.route,
  },
  [MARK_BOLD]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        cnImports: ['withProps'],
        id: 'bold',
        label: 'BoldLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_BOLD',
        usage: `withProps(PlateLeaf, { as: 'strong' })`,
      },
    ],
    id: MARK_BOLD,
    label: 'Bold',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createBoldPlugin',
    route: customizerPlugins.basicmarks.route,
  },
  [MARK_CODE]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'code-leaf',
        label: 'CodeLeaf',
        pluginKey: 'MARK_CODE',
        route: customizerComponents.codeLeaf.href,
        usage: `CodeLeaf`,
      },
    ],
    id: MARK_CODE,
    label: 'Code',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createCodePlugin',
    route: customizerPlugins.basicmarks.route,
  },
  [MARK_COLOR]: {
    badges: [customizerBadges.style],
    id: MARK_COLOR,
    label: 'Font Color',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontColorPlugin',
    route: customizerPlugins.font.route,
  },
  [MARK_COMMENT]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'comment-leaf',
        label: 'CommentLeaf',
        pluginKey: 'MARK_COMMENT',
        route: customizerComponents.commentLeaf.href,
        usage: 'CommentLeaf',
      },
      {
        id: 'comments-popover',
        label: 'CommentsPopover',
        route: customizerComponents.commentsPopover.href,
        usage: 'CommentsPopover',
      },
    ],
    id: MARK_COMMENT,
    label: 'Comments',
    npmPackage: '@udecode/plate-comments',
    packageImports: ['CommentsProvider'],
    pluginFactory: 'createCommentsPlugin',
    route: customizerPlugins.comment.route,
  },
  [MARK_FONT_SIZE]: {
    badges: [customizerBadges.style],
    id: MARK_FONT_SIZE,
    label: 'Font Size',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontSizePlugin',
    route: customizerPlugins.font.route,
  },
  [MARK_HIGHLIGHT]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'highlight-leaf',
        label: 'HighlightLeaf',
        pluginKey: 'MARK_HIGHLIGHT',
        route: customizerComponents.highlightLeaf.href,
        usage: 'HighlightLeaf',
      },
    ],
    id: MARK_HIGHLIGHT,
    label: 'Highlight',
    npmPackage: '@udecode/plate-highlight',
    pluginFactory: 'createHighlightPlugin',
    route: customizerPlugins.highlight.route,
  },
  [MARK_ITALIC]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        cnImports: ['withProps'],
        id: 'italic',
        label: 'ItalicLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_ITALIC',
        usage: `withProps(PlateLeaf, { as: 'em' })`,
      },
    ],
    id: MARK_ITALIC,
    label: 'Italic',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createItalicPlugin',
    route: customizerPlugins.basicmarks.route,
  },
  [MARK_KBD]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'kbd-leaf',
        label: 'KbdLeaf',
        pluginKey: 'MARK_KBD',
        route: customizerComponents.kbdLeaf.href,
        usage: 'KbdLeaf',
      },
    ],
    id: MARK_KBD,
    label: 'Keyboard Input',
    npmPackage: '@udecode/plate-kbd',
    pluginFactory: 'createKbdPlugin',
    route: customizerPlugins.kbd.route,
  },
  [MARK_STRIKETHROUGH]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        cnImports: ['withProps'],
        id: 'strikethrough',
        label: 'StrikethroughLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_STRIKETHROUGH',
        usage: `withProps(PlateLeaf, { as: 's' })`,
      },
    ],
    id: MARK_STRIKETHROUGH,
    label: 'Strikethrough',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createStrikethroughPlugin',
    route: customizerPlugins.basicmarks.route,
  },
  [MARK_SUBSCRIPT]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        cnImports: ['withProps'],
        id: 'subscript',
        label: 'SubscriptLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_SUBSCRIPT',
        usage: `withProps(PlateLeaf, { as: 'sub' })`,
      },
    ],
    id: MARK_SUBSCRIPT,
    label: 'Subscript',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createSubscriptPlugin',
    route: customizerPlugins.basicmarks.route,
  },
  [MARK_SUPERSCRIPT]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        cnImports: ['withProps'],
        id: 'superscript',
        label: 'SuperscriptLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_SUPERSCRIPT',
        usage: `withProps(PlateLeaf, { as: 'sup' })`,
      },
    ],
    id: MARK_SUPERSCRIPT,
    label: 'Superscript',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createSuperscriptPlugin',
    route: customizerPlugins.basicmarks.route,
  },
  [MARK_UNDERLINE]: {
    badges: [customizerBadges.leaf],
    components: [
      {
        cnImports: ['withProps'],
        id: 'underline',
        label: 'UnderlineLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_UNDERLINE',
        usage: `withProps(PlateLeaf, { as: 'u' })`,
      },
    ],
    id: MARK_UNDERLINE,
    label: 'Underline',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createUnderlinePlugin',
    route: customizerPlugins.basicmarks.route,
  },

  column: {
    badges: [customizerBadges.element],
    components: [
      {
        id: 'column-group-element',
        label: 'ColumnGroupElement',
        pluginKey: 'ELEMENT_COLUMN_GROUP',
        route: customizerComponents.columnGroupElement.href,
        usage: 'ColumnGroupElement',
      },
      {
        id: 'column-element',
        label: 'ColumnElement',
        pluginKey: 'ELEMENT_COLUMN',
        route: customizerComponents.columnElement.href,
        usage: 'ColumnElement',
      },
    ],
    id: 'column',
    label: 'Column',
    npmPackage: '@udecode/plate-layout',
    pluginFactory: 'createColumnPlugin',
    route: customizerPlugins.column.route,
  },
  components: {
    badges: [customizerBadges.ui],
    components: [
      {
        id: 'editor',
        label: 'Editor',
        route: customizerComponents.editor.href,
        usage: 'Editor',
      },
      {
        id: 'fixed-toolbar',
        label: 'FixedToolbar',
        route: customizerComponents.fixedToolbar.href,
        usage: 'FixedToolbar',
      },
      {
        id: 'fixed-toolbar-buttons',
        label: 'FixedToolbarButtons',
        route: customizerComponents.fixedToolbarButtons.href,
        usage: 'FixedToolbarButtons',
      },
      {
        id: 'floating-toolbar',
        label: 'FloatingToolbar',
        route: customizerComponents.floatingToolbar.href,
        usage: 'FloatingToolbar',
      },
      {
        id: 'floating-toolbar-buttons',
        label: 'FloatingToolbarButtons',
        route: customizerComponents.floatingToolbarButtons.href,
        usage: 'FloatingToolbarButtons',
      },
      {
        id: 'placeholder',
        label: 'Placeholder',
        registry: 'placeholder',
        route: customizerComponents.placeholder.href,
        usage: 'withPlaceholders',
      },
    ],
    id: 'components',
    label: 'Components',
  },
  heading: {
    badges: [customizerBadges.element],
    components: [
      {
        cnImports: ['withProps'],
        filename: 'heading-element',
        id: 'h1',
        import: 'HeadingElement',
        label: 'H1Element',
        pluginKey: 'ELEMENT_H1',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h1' })`,
      },
      {
        cnImports: ['withProps'],
        filename: 'heading-element',
        id: 'h2',
        import: 'HeadingElement',
        label: 'H2Element',
        pluginKey: 'ELEMENT_H2',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h2' })`,
      },
      {
        cnImports: ['withProps'],
        filename: 'heading-element',
        id: 'h3',
        import: 'HeadingElement',
        label: 'H3Element',
        pluginKey: 'ELEMENT_H3',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h3' })`,
      },
      {
        cnImports: ['withProps'],
        filename: 'heading-element',
        id: 'h4',
        import: 'HeadingElement',
        label: 'H4Element',
        pluginKey: 'ELEMENT_H4',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h4' })`,
      },
      {
        cnImports: ['withProps'],
        filename: 'heading-element',
        id: 'h5',
        import: 'HeadingElement',
        label: 'H5Element',
        pluginKey: 'ELEMENT_H5',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h5' })`,
      },
      {
        cnImports: ['withProps'],
        filename: 'heading-element',
        id: 'h6',
        import: 'HeadingElement',
        label: 'H6Element',
        pluginKey: 'ELEMENT_H6',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h6' })`,
      },
    ],
    id: 'heading',
    label: 'Heading',
    npmPackage: '@udecode/plate-heading',
    pluginFactory: 'createHeadingPlugin',
    route: customizerPlugins.basicnodes.route,
  },
  list: {
    badges: [customizerBadges.element],
    components: [
      {
        cnImports: ['withProps'],
        filename: 'list-element',
        id: 'ul',
        import: 'ListElement',
        label: 'BulletedListElement',
        pluginKey: 'ELEMENT_UL',
        route: customizerComponents.listElement.href,
        usage: `withProps(ListElement, { variant: 'ul' })`,
      },
      {
        cnImports: ['withProps'],
        filename: 'list-element',
        id: 'ol',
        import: 'ListElement',
        label: 'NumberedListElement',
        noImport: true,
        pluginKey: 'ELEMENT_OL',
        route: customizerComponents.listElement.href,
        usage: `withProps(ListElement, { variant: 'ol' })`,
      },
      {
        cnImports: ['withProps'],
        filename: 'list-element',
        id: 'li',
        label: 'ListItemElement',
        noImport: true,
        plateImports: ['PlateElement'],
        pluginKey: 'ELEMENT_LI',
        usage: `withProps(PlateElement, { as: 'li' })`,
      },
    ],
    conflicts: [KEY_LIST_STYLE_TYPE],
    id: 'list',
    label: 'List',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'createListPlugin',
    route: customizerPlugins.list.route,
  },
};
