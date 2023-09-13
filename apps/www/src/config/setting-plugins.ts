import { KEY_DRAG_OVER_CURSOR } from '@/plate/demo/plugins/dragOverCursorPlugin';
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
import { KEY_SELECT_ON_BACKSPACE } from '@udecode/plate-select';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { KEY_DESERIALIZE_CSV } from '@udecode/plate-serializer-csv';
import { KEY_DESERIALIZE_DOCX } from '@udecode/plate-serializer-docx';
import { KEY_DESERIALIZE_MD } from '@udecode/plate-serializer-md';
import { KEY_TABBABLE } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { KEY_TRAILING_BLOCK } from '@udecode/plate-trailing-block';
import { uniqBy } from 'lodash';

import { SettingBadge, settingBadges } from '@/config/setting-badges';
import { settingValues } from '@/config/setting-values';

export type SettingPlugin = {
  id: string;
  npmPackage: string;
  plateImports?: string[];
  pluginFactory: string;
  label: string;
  route?: string;
  badges?: SettingBadge[];
  dependencies?: string[];
  conflicts?: string[];
  disablePlugins?: string[];
  components?: {
    id: string; // e.g. 'blockquote-element'
    label: string; // e.g. 'Blockquote'
    pluginKey?: string; // Plugin components only, e.g. 'ELEMENT_BLOCKQUOTE'
    reactComponent: string; // e.g. 'BlockquoteElement'
  }[];
};

export const settingPluginItems: Record<string, SettingPlugin> = {
  [ELEMENT_BLOCKQUOTE]: {
    id: ELEMENT_BLOCKQUOTE,
    npmPackage: '@udecode/plate-block-quote',
    pluginFactory: 'createBlockquotePlugin',
    label: 'Blockquote',
    badges: [settingBadges.element],
    route: settingValues.basicnodes.route,
    components: [
      {
        id: 'blockquote-element',
        label: 'Blockquote',
        pluginKey: 'ELEMENT_BLOCKQUOTE',
        reactComponent: 'BlockquoteElement',
      },
    ],
  },
  [ELEMENT_CODE_BLOCK]: {
    id: ELEMENT_CODE_BLOCK,
    npmPackage: '@udecode/plate-code-block',
    pluginFactory: 'createCodeBlockPlugin',
    label: 'Code block',
    badges: [settingBadges.element],
    route: settingValues.basicnodes.route,
    components: [
      {
        id: 'code-block-element',
        label: 'Code Block',
        pluginKey: 'ELEMENT_CODE_BLOCK',
        reactComponent: 'CodeBlockElement',
      },
      {
        id: 'code-line-element',
        label: 'Code Line',
        pluginKey: 'ELEMENT_CODE_LINE',
        reactComponent: 'CodeLineElement',
      },
      {
        id: 'code-syntax-leaf',
        label: 'Code Syntax',
        pluginKey: 'ELEMENT_CODE_SYNTAX',
        reactComponent: 'CodeSyntaxLeaf',
      },
    ],
  },
  [ELEMENT_EXCALIDRAW]: {
    id: ELEMENT_EXCALIDRAW,
    npmPackage: '@udecode/plate-excalidraw',
    pluginFactory: 'createExcalidrawPlugin',
    label: 'Excalidraw',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.excalidraw.route,
    components: [
      {
        id: 'excalidraw-element',
        label: 'Excalidraw',
        pluginKey: 'ELEMENT_EXCALIDRAW',
        reactComponent: 'ExcalidrawElement',
      },
    ],
  },
  [ELEMENT_HR]: {
    id: ELEMENT_HR,
    npmPackage: '@udecode/plate-horizontal-rule',
    pluginFactory: 'createHorizontalRulePlugin',
    label: 'Horizontal Rule',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.hr.route,
  },
  [ELEMENT_IMAGE]: {
    id: ELEMENT_IMAGE,
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'createImagePlugin',
    label: 'Image',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.media.route,
  },
  [ELEMENT_LINK]: {
    id: ELEMENT_LINK,
    npmPackage: '@udecode/plate-link',
    pluginFactory: 'createLinkPlugin',
    label: 'Link',
    badges: [settingBadges.element, settingBadges.inline],
    route: settingValues.link.route,
  },
  heading: {
    id: 'heading',
    npmPackage: '@udecode/plate-heading',
    pluginFactory: 'createHeadingPlugin',
    plateImports: ['withProps'],
    label: 'Heading',
    badges: [settingBadges.element],
    route: settingValues.basicnodes.route,
    components: [
      {
        id: 'heading-element',
        label: 'HeadingElement',
        pluginKey: 'ELEMENT_H1',
        reactComponent: `withProps(HeadingElement, { variant: 'h1' })`,
      },
    ],
  },
  list: {
    id: 'list',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'createListPlugin',
    label: 'List',
    badges: [settingBadges.element],
    conflicts: [KEY_LIST_STYLE_TYPE],
    route: settingValues.list.route,
  },
  [ELEMENT_MEDIA_EMBED]: {
    id: ELEMENT_MEDIA_EMBED,
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'createMediaEmbedPlugin',
    label: 'Media Embed',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.media.route,
  },
  [ELEMENT_MENTION]: {
    id: ELEMENT_MENTION,
    npmPackage: '@udecode/plate-mention',
    pluginFactory: 'createMentionPlugin',
    label: 'Mention',
    badges: [settingBadges.element, settingBadges.inline, settingBadges.void],
    dependencies: [KEY_COMBOBOX],
    route: settingValues.mention.route,
  },
  [ELEMENT_PARAGRAPH]: {
    id: ELEMENT_PARAGRAPH,
    npmPackage: '@udecode/plate-paragraph',
    pluginFactory: 'createParagraphPlugin',
    label: 'Paragraph',
    badges: [settingBadges.element],
    route: settingValues.basicnodes.route,
  },
  [ELEMENT_TABLE]: {
    id: ELEMENT_TABLE,
    npmPackage: '@udecode/plate-table',
    pluginFactory: 'createTablePlugin',
    label: 'Table',
    badges: [settingBadges.element],
    route: settingValues.table.route,
  },
  [ELEMENT_TODO_LI]: {
    id: ELEMENT_TODO_LI,
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'createTodoListPlugin',
    label: 'Todo List',
    badges: [settingBadges.element],
    route: settingValues.todoli.route,
  },
  [MARK_BOLD]: {
    id: MARK_BOLD,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createItalicPlugin',
    label: 'Bold',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_CODE]: {
    id: MARK_CODE,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createCodePlugin',
    label: 'Code',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_COMMENT]: {
    id: MARK_COMMENT,
    npmPackage: '@udecode/plate-comments',
    pluginFactory: 'createCommentsPlugin',
    label: 'Comments',
    badges: [settingBadges.leaf],
    route: settingValues.comment.route,
    components: [
      {
        id: 'comment-leaf',
        label: 'Comment',
        pluginKey: 'MARK_COMMENT',
        reactComponent: 'CommentLeaf',
      },
    ],
  },
  [MARK_BG_COLOR]: {
    id: MARK_BG_COLOR,
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontBackgroundColorPlugin',
    label: 'Font Background',
    badges: [settingBadges.style],
    route: settingValues.font.route,
  },
  [MARK_COLOR]: {
    id: MARK_COLOR,
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontColorPlugin',
    label: 'Font Color',
    badges: [settingBadges.style],
    route: settingValues.font.route,
  },
  [MARK_FONT_SIZE]: {
    id: MARK_FONT_SIZE,
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontSizePlugin',
    label: 'Font Size',
    badges: [settingBadges.style],
    route: settingValues.font.route,
  },
  [MARK_HIGHLIGHT]: {
    id: MARK_HIGHLIGHT,
    npmPackage: '@udecode/plate-highlight',
    pluginFactory: 'createHighlightPlugin',
    label: 'Highlight',
    badges: [settingBadges.leaf],
    route: settingValues.highlight.route,
  },
  [MARK_ITALIC]: {
    id: MARK_ITALIC,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createItalicPlugin',
    label: 'Italic',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_KBD]: {
    id: MARK_KBD,
    npmPackage: '@udecode/plate-kbd',
    pluginFactory: 'createKbdPlugin',
    label: 'Keyboard Input',
    badges: [settingBadges.leaf],
    route: settingValues.kbd.route,
  },
  [MARK_STRIKETHROUGH]: {
    id: MARK_STRIKETHROUGH,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createStrikethroughPlugin',
    label: 'Strikethrough',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_SUBSCRIPT]: {
    id: MARK_SUBSCRIPT,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createSubscriptPlugin',
    label: 'Subscript',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_SUPERSCRIPT]: {
    id: MARK_SUPERSCRIPT,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createSuperscriptPlugin',
    label: 'Superscript',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_UNDERLINE]: {
    id: MARK_UNDERLINE,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createUnderlinePlugin',
    label: 'Underline',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [KEY_ALIGN]: {
    id: KEY_ALIGN,
    npmPackage: '@udecode/plate-alignment',
    pluginFactory: 'createAlignPlugin',
    label: 'Align',
    badges: [settingBadges.style],
    route: settingValues.align.route,
  },
  [KEY_LINE_HEIGHT]: {
    id: KEY_LINE_HEIGHT,
    npmPackage: '@udecode/plate-line-height',
    pluginFactory: 'createLineHeightPlugin',
    label: 'Line Height',
    badges: [settingBadges.style],
    route: settingValues.lineheight.route,
  },
  [KEY_INDENT]: {
    id: KEY_INDENT,
    npmPackage: '@udecode/plate-indent',
    pluginFactory: 'createIndentPlugin',
    label: 'Indent',
    badges: [settingBadges.style],
    route: settingValues.indent.route,
  },
  [KEY_LIST_STYLE_TYPE]: {
    id: KEY_LIST_STYLE_TYPE,
    npmPackage: '@udecode/plate-indent-list',
    pluginFactory: 'createIndentListPlugin',
    label: 'Indent List',
    badges: [settingBadges.style],
    dependencies: [KEY_INDENT],
    conflicts: ['list'],
    route: settingValues.indentlist.route,
  },

  // Functionality
  [KEY_AUTOFORMAT]: {
    id: KEY_AUTOFORMAT,
    npmPackage: '@udecode/plate-autoformat',
    pluginFactory: 'createAutoformatPlugin',
    label: 'Autoformat',
    badges: [settingBadges.handler],
    route: settingValues.autoformat.route,
  },
  [KEY_BLOCK_SELECTION]: {
    id: KEY_BLOCK_SELECTION,
    npmPackage: '@udecode/plate-selection',
    pluginFactory: 'createBlockSelectionPlugin',
    label: 'Block Selection',
    badges: [settingBadges.ui],
    dependencies: [KEY_NODE_ID],
    route: settingValues.blockselection.route,
  },
  [KEY_CAPTION]: {
    id: KEY_CAPTION,
    npmPackage: '@udecode/plate-caption',
    pluginFactory: 'createCaptionPlugin',
    label: 'Caption',
    badges: [settingBadges.handler],
    route: settingValues.media.route,
  },
  [KEY_COMBOBOX]: {
    id: KEY_COMBOBOX,
    npmPackage: '@udecode/plate-combobox',
    pluginFactory: 'createComboboxPlugin',
    label: 'Combobox',
    badges: [settingBadges.handler, settingBadges.ui],
    // route: settingValues.combobox.route,
  },
  [KEY_DND]: {
    id: KEY_DND,
    npmPackage: '@udecode/plate-dnd',
    pluginFactory: 'createDndPlugin',
    label: 'Drag & Drop',
    badges: [settingBadges.handler, settingBadges.ui],
    dependencies: [KEY_NODE_ID],
    route: settingValues.dnd.route,
  },
  [KEY_DRAG_OVER_CURSOR]: {
    id: KEY_DRAG_OVER_CURSOR,
    npmPackage: '@udecode/plate-cursor',
    pluginFactory: '',
    label: 'Drag Cursor',
    badges: [settingBadges.handler, settingBadges.ui],
    route: settingValues.cursoroverlay.route,
  },
  [KEY_EMOJI]: {
    id: KEY_EMOJI,
    npmPackage: '@udecode/plate-emoji',
    pluginFactory: 'createEmojiPlugin',
    label: 'Emoji',
    badges: [settingBadges.handler],
    dependencies: [KEY_COMBOBOX],
    route: settingValues.emoji.route,
  },
  [KEY_EXIT_BREAK]: {
    id: KEY_EXIT_BREAK,
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createExitBreakPlugin',
    label: 'Exit Break',
    badges: [settingBadges.handler],
    route: settingValues.exitbreak.route,
  },
  [KEY_NODE_ID]: {
    id: KEY_NODE_ID,
    npmPackage: '@udecode/plate-node-id',
    pluginFactory: 'createNodeIdPlugin',
    label: 'Id',
    badges: [settingBadges.normalizer],
    // route: settingValues.nodeid.route,
  },
  [KEY_NORMALIZE_TYPES]: {
    id: KEY_NORMALIZE_TYPES,
    npmPackage: '@udecode/plate-normalizers',
    pluginFactory: 'createNormalizeTypesPlugin',
    label: 'Normalize Types',
    badges: [settingBadges.normalizer],
    route: settingValues.forcedlayout.route,
  },
  [KEY_RESET_NODE]: {
    id: KEY_RESET_NODE,
    npmPackage: '@udecode/plate-reset-node',
    pluginFactory: 'createResetNodePlugin',
    label: 'Reset Node',
    badges: [settingBadges.handler],
    route: settingValues.resetnode.route,
  },
  [KEY_SELECT_ON_BACKSPACE]: {
    id: KEY_SELECT_ON_BACKSPACE,
    npmPackage: '@udecode/plate-select',
    pluginFactory: 'createSelectOnBackspacePlugin',
    label: 'Select on Backspace',
    badges: [settingBadges.handler],
    route: settingValues.media.route,
  },
  [KEY_SINGLE_LINE]: {
    id: KEY_SINGLE_LINE,
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createSingleLinePlugin',
    label: 'Single Line',
    disablePlugins: [KEY_TRAILING_BLOCK],
    badges: [settingBadges.normalizer],
    conflicts: [KEY_TRAILING_BLOCK],
    route: settingValues.singleline.route,
  },
  [KEY_SOFT_BREAK]: {
    id: KEY_SOFT_BREAK,
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createSoftBreakPlugin',
    label: 'Soft Break',
    badges: [settingBadges.handler],
    route: settingValues.softbreak.route,
  },
  [KEY_TABBABLE]: {
    id: KEY_TABBABLE,
    npmPackage: '@udecode/plate-tabbable',
    pluginFactory: 'createTabbablePlugin',
    label: 'Tabbable',
    badges: [settingBadges.handler],
    route: settingValues.tabbable.route,
  },
  [KEY_TRAILING_BLOCK]: {
    id: KEY_TRAILING_BLOCK,
    npmPackage: '@udecode/plate-trailing-block',
    pluginFactory: 'createTrailingBlockPlugin',
    label: 'Trailing Block',
    disablePlugins: [KEY_SINGLE_LINE],
    badges: [settingBadges.normalizer],
    conflicts: [KEY_SINGLE_LINE],
    route: settingValues.trailingblock.route,
  },

  // Deserialization
  [KEY_DESERIALIZE_CSV]: {
    id: KEY_DESERIALIZE_CSV,
    npmPackage: '@udecode/plate-serializer-csv',
    pluginFactory: 'createDeserializeCsvPlugin',
    label: 'Deserialize CSV',
    badges: [settingBadges.handler],
    route: settingValues.deserializecsv.route,
  },
  [KEY_DESERIALIZE_DOCX]: {
    id: KEY_DESERIALIZE_DOCX,
    npmPackage: '@udecode/plate-serializer-docx',
    pluginFactory: 'createDeserializeDocxPlugin',
    label: 'Deserialize DOCX',
    badges: [settingBadges.handler],
    dependencies: [KEY_JUICE],
    route: settingValues.deserializedocx.route,
  },
  [KEY_DESERIALIZE_MD]: {
    id: KEY_DESERIALIZE_MD,
    npmPackage: '@udecode/plate-serializer-md',
    pluginFactory: 'createDeserializeMdPlugin',
    label: 'Deserialize MD',
    badges: [settingBadges.handler],
    route: settingValues.deserializemd.route,
  },
  [KEY_JUICE]: {
    id: KEY_JUICE,
    npmPackage: '@udecode/plate-juice',
    pluginFactory: 'createJuicePlugin',
    label: 'Juice',
    badges: [settingBadges.handler],
    route: settingValues.deserializedocx.route,
  },
};

export const settingPlugins = [
  {
    id: 'blocks',
    label: 'Nodes',
    children: [
      settingPluginItems[ELEMENT_BLOCKQUOTE],
      settingPluginItems[ELEMENT_CODE_BLOCK],
      settingPluginItems[ELEMENT_EXCALIDRAW],
      settingPluginItems[ELEMENT_HR],
      settingPluginItems[ELEMENT_IMAGE],
      settingPluginItems[ELEMENT_LINK],
      settingPluginItems.heading,
      settingPluginItems.list,
      settingPluginItems[ELEMENT_MEDIA_EMBED],
      settingPluginItems[ELEMENT_MENTION],
      settingPluginItems[ELEMENT_PARAGRAPH],
      settingPluginItems[ELEMENT_TABLE],
      settingPluginItems[ELEMENT_TODO_LI],
    ],
  },
  {
    id: 'marks',
    label: 'Marks',
    children: [
      settingPluginItems[MARK_BOLD],
      settingPluginItems[MARK_CODE],
      settingPluginItems[MARK_COMMENT],
      settingPluginItems[MARK_BG_COLOR],
      settingPluginItems[MARK_COLOR],
      settingPluginItems[MARK_FONT_SIZE],
      settingPluginItems[MARK_HIGHLIGHT],
      settingPluginItems[MARK_ITALIC],
      settingPluginItems[MARK_KBD],
      settingPluginItems[MARK_STRIKETHROUGH],
      settingPluginItems[MARK_SUBSCRIPT],
      settingPluginItems[MARK_SUPERSCRIPT],
      settingPluginItems[MARK_UNDERLINE],
    ],
  },
  {
    id: 'style',
    label: 'Block Style',
    children: [
      settingPluginItems[KEY_ALIGN],
      settingPluginItems[KEY_INDENT],
      settingPluginItems[KEY_LIST_STYLE_TYPE],
      settingPluginItems[KEY_LINE_HEIGHT],
    ],
  },
  {
    id: 'functionality',
    label: 'Functionality',
    children: [
      settingPluginItems[KEY_AUTOFORMAT],
      settingPluginItems[KEY_BLOCK_SELECTION],
      settingPluginItems[KEY_CAPTION],
      settingPluginItems[KEY_COMBOBOX],
      settingPluginItems[KEY_DND],
      settingPluginItems[KEY_DRAG_OVER_CURSOR],
      settingPluginItems[KEY_EMOJI],
      settingPluginItems[KEY_EXIT_BREAK],
      settingPluginItems[KEY_NODE_ID],
      settingPluginItems[KEY_NORMALIZE_TYPES],
      settingPluginItems[KEY_RESET_NODE],
      settingPluginItems[KEY_SELECT_ON_BACKSPACE],
      settingPluginItems[KEY_SINGLE_LINE],
      settingPluginItems[KEY_SOFT_BREAK],
      settingPluginItems[KEY_TABBABLE],
      settingPluginItems[KEY_TRAILING_BLOCK],
    ],
  },
  {
    id: 'Deserialization',
    label: 'Deserialization',
    children: [
      settingPluginItems[KEY_DESERIALIZE_CSV],
      settingPluginItems[KEY_DESERIALIZE_DOCX],
      settingPluginItems[KEY_DESERIALIZE_MD],
      settingPluginItems[KEY_JUICE],
    ],
  },
];

export const orderedPluginKeys = [
  ELEMENT_PARAGRAPH,
  'heading',
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_HR,
  ELEMENT_LINK,
  'list',
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  KEY_CAPTION,
  ELEMENT_MENTION,
  ELEMENT_TABLE,
  ELEMENT_TODO_LI,
  ELEMENT_EXCALIDRAW,

  // Marks
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  MARK_STRIKETHROUGH,
  MARK_CODE,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_COLOR,
  MARK_BG_COLOR,
  MARK_FONT_SIZE,
  MARK_HIGHLIGHT,
  MARK_KBD,

  // Block Style
  KEY_ALIGN,
  KEY_INDENT,
  KEY_LIST_STYLE_TYPE,
  KEY_LINE_HEIGHT,

  // Functionality
  KEY_AUTOFORMAT,
  KEY_BLOCK_SELECTION,
  KEY_COMBOBOX,
  KEY_DND,
  KEY_EMOJI,
  KEY_EXIT_BREAK,
  KEY_NODE_ID,
  KEY_NORMALIZE_TYPES,
  KEY_RESET_NODE,
  KEY_SELECT_ON_BACKSPACE,
  KEY_SINGLE_LINE,
  KEY_SOFT_BREAK,
  KEY_TABBABLE,
  KEY_TRAILING_BLOCK,
  KEY_DRAG_OVER_CURSOR,

  // Collaboration
  MARK_COMMENT,

  // Deserialization
  KEY_DESERIALIZE_DOCX,
  KEY_DESERIALIZE_CSV,
  KEY_DESERIALIZE_MD,
  KEY_JUICE,
];

export const allPlugins = settingPlugins.flatMap((group) => group.children);

export const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => plugin.components ?? []),
  'id'
);
