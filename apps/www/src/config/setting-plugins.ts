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

import { SettingBadge, settingBadges } from '@/config/setting-badges';
import { settingValues } from '@/config/setting-values';

export type SettingPlugin = {
  id: string;
  npmPackage: string;
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
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
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
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Code block',
    badges: [settingBadges.element],
    route: settingValues.basicnodes.route,
  },
  [ELEMENT_EXCALIDRAW]: {
    id: ELEMENT_EXCALIDRAW,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Excalidraw',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.excalidraw.route,
  },
  [ELEMENT_HR]: {
    id: ELEMENT_HR,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Horizontal Rule',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.hr.route,
  },
  [ELEMENT_IMAGE]: {
    id: ELEMENT_IMAGE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Image',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.media.route,
  },
  [ELEMENT_LINK]: {
    id: ELEMENT_LINK,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Link',
    badges: [settingBadges.element, settingBadges.inline],
    route: settingValues.link.route,
  },
  heading: {
    id: 'heading',
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Heading',
    badges: [settingBadges.element],
    route: settingValues.basicnodes.route,
  },
  list: {
    id: 'list',
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'List',
    badges: [settingBadges.element],
    conflicts: [KEY_LIST_STYLE_TYPE],
    route: settingValues.list.route,
  },
  [ELEMENT_MEDIA_EMBED]: {
    id: ELEMENT_MEDIA_EMBED,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Media Embed',
    badges: [settingBadges.element, settingBadges.void],
    route: settingValues.media.route,
  },
  [ELEMENT_MENTION]: {
    id: ELEMENT_MENTION,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Mention',
    badges: [settingBadges.element, settingBadges.inline, settingBadges.void],
    dependencies: [KEY_COMBOBOX],
    route: settingValues.mention.route,
  },
  [ELEMENT_PARAGRAPH]: {
    id: ELEMENT_PARAGRAPH,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Paragraph',
    badges: [settingBadges.element],
    route: settingValues.basicnodes.route,
  },
  [ELEMENT_TABLE]: {
    id: ELEMENT_TABLE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Table',
    badges: [settingBadges.element],
    route: settingValues.table.route,
  },
  [ELEMENT_TODO_LI]: {
    id: ELEMENT_TODO_LI,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Todo List',
    badges: [settingBadges.element],
    route: settingValues.todoli.route,
  },
  [MARK_BOLD]: {
    id: MARK_BOLD,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Bold',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_CODE]: {
    id: MARK_CODE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Code',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_COMMENT]: {
    id: MARK_COMMENT,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Comments',
    badges: [settingBadges.leaf],
    route: settingValues.comment.route,
  },
  [MARK_BG_COLOR]: {
    id: MARK_BG_COLOR,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Font Background',
    badges: [settingBadges.style],
    route: settingValues.font.route,
  },
  [MARK_COLOR]: {
    id: MARK_COLOR,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Font Color',
    badges: [settingBadges.style],
    route: settingValues.font.route,
  },
  [MARK_FONT_SIZE]: {
    id: MARK_FONT_SIZE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Font Size',
    badges: [settingBadges.style],
    route: settingValues.font.route,
  },
  [MARK_HIGHLIGHT]: {
    id: MARK_HIGHLIGHT,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Highlight',
    badges: [settingBadges.leaf],
    route: settingValues.highlight.route,
  },
  [MARK_ITALIC]: {
    id: MARK_ITALIC,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Italic',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_KBD]: {
    id: MARK_KBD,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Keyboard Input',
    badges: [settingBadges.leaf],
    route: settingValues.kbd.route,
  },
  [MARK_STRIKETHROUGH]: {
    id: MARK_STRIKETHROUGH,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Strikethrough',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_SUBSCRIPT]: {
    id: MARK_SUBSCRIPT,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Subscript',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_SUPERSCRIPT]: {
    id: MARK_SUPERSCRIPT,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Superscript',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [MARK_UNDERLINE]: {
    id: MARK_UNDERLINE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Underline',
    badges: [settingBadges.leaf],
    route: settingValues.basicmarks.route,
  },
  [KEY_ALIGN]: {
    id: KEY_ALIGN,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Align',
    badges: [settingBadges.style],
    route: settingValues.align.route,
  },
  [KEY_LINE_HEIGHT]: {
    id: KEY_LINE_HEIGHT,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Line Height',
    badges: [settingBadges.style],
    route: settingValues.lineheight.route,
  },
  [KEY_INDENT]: {
    id: KEY_INDENT,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Indent',
    badges: [settingBadges.style],
    route: settingValues.indent.route,
  },
  [KEY_LIST_STYLE_TYPE]: {
    id: KEY_LIST_STYLE_TYPE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Indent List',
    badges: [settingBadges.style],
    dependencies: [KEY_INDENT],
    conflicts: ['list'],
    route: settingValues.indentlist.route,
  },

  // Functionality
  [KEY_AUTOFORMAT]: {
    id: KEY_AUTOFORMAT,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Autoformat',
    badges: [settingBadges.handler],
    route: settingValues.autoformat.route,
  },
  [KEY_BLOCK_SELECTION]: {
    id: KEY_BLOCK_SELECTION,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Block Selection',
    badges: [settingBadges.ui],
    dependencies: [KEY_NODE_ID],
    route: settingValues.blockselection.route,
  },
  [KEY_CAPTION]: {
    id: KEY_CAPTION,
    label: 'Caption',
    badges: [settingBadges.handler],
    route: settingValues.media.route,
  },
  [KEY_COMBOBOX]: {
    id: KEY_COMBOBOX,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Combobox',
    badges: [settingBadges.handler, settingBadges.ui],
    // route: settingValues.combobox.route,
  },
  [KEY_DND]: {
    id: KEY_DND,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Drag & Drop',
    badges: [settingBadges.handler, settingBadges.ui],
    dependencies: [KEY_NODE_ID],
    route: settingValues.dnd.route,
  },
  [KEY_DRAG_OVER_CURSOR]: {
    id: KEY_DRAG_OVER_CURSOR,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Drag Cursor',
    badges: [settingBadges.handler, settingBadges.ui],
    route: settingValues.cursoroverlay.route,
  },
  [KEY_EMOJI]: {
    id: KEY_EMOJI,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Emoji',
    badges: [settingBadges.handler],
    dependencies: [KEY_COMBOBOX],
    route: settingValues.emoji.route,
  },
  [KEY_EXIT_BREAK]: {
    id: KEY_EXIT_BREAK,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Exit Break',
    badges: [settingBadges.handler],
    route: settingValues.exitbreak.route,
  },
  [KEY_NODE_ID]: {
    id: KEY_NODE_ID,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Id',
    badges: [settingBadges.normalizer],
    // route: settingValues.nodeid.route,
  },
  [KEY_NORMALIZE_TYPES]: {
    id: KEY_NORMALIZE_TYPES,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Normalize Types',
    badges: [settingBadges.normalizer],
    route: settingValues.forcedlayout.route,
  },
  [KEY_RESET_NODE]: {
    id: KEY_RESET_NODE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Reset Node',
    badges: [settingBadges.handler],
    route: settingValues.resetnode.route,
  },
  [KEY_SELECT_ON_BACKSPACE]: {
    id: KEY_SELECT_ON_BACKSPACE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Select on Backspace',
    badges: [settingBadges.handler],
    route: settingValues.media.route,
  },
  [KEY_SINGLE_LINE]: {
    id: KEY_SINGLE_LINE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Single Line',
    disablePlugins: [KEY_TRAILING_BLOCK],
    badges: [settingBadges.normalizer],
    conflicts: [KEY_TRAILING_BLOCK],
    route: settingValues.singleline.route,
  },
  [KEY_SOFT_BREAK]: {
    id: KEY_SOFT_BREAK,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Soft Break',
    badges: [settingBadges.handler],
    route: settingValues.softbreak.route,
  },
  [KEY_TABBABLE]: {
    id: KEY_TABBABLE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Tabbable',
    badges: [settingBadges.handler],
    route: settingValues.tabbable.route,
  },
  [KEY_TRAILING_BLOCK]: {
    id: KEY_TRAILING_BLOCK,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Trailing Block',
    disablePlugins: [KEY_SINGLE_LINE],
    badges: [settingBadges.normalizer],
    conflicts: [KEY_SINGLE_LINE],
    route: settingValues.trailingblock.route,
  },

  // Deserialization
  [KEY_DESERIALIZE_CSV]: {
    id: KEY_DESERIALIZE_CSV,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Deserialize CSV',
    badges: [settingBadges.handler],
    route: settingValues.deserializecsv.route,
  },
  [KEY_DESERIALIZE_DOCX]: {
    id: KEY_DESERIALIZE_DOCX,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Deserialize DOCX',
    badges: [settingBadges.handler],
    dependencies: [KEY_JUICE],
    route: settingValues.deserializedocx.route,
  },
  [KEY_DESERIALIZE_MD]: {
    id: KEY_DESERIALIZE_MD,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
    label: 'Deserialize MD',
    badges: [settingBadges.handler],
    route: settingValues.deserializemd.route,
  },
  [KEY_JUICE]: {
    id: KEY_JUICE,
    npmPackage: 'TODO',
    pluginFactory: 'createTODOPlugin',
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
