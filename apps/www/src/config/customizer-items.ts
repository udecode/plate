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
import { KEY_DELETE, KEY_SELECT_ON_BACKSPACE } from '@udecode/plate-select';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { KEY_DESERIALIZE_CSV } from '@udecode/plate-serializer-csv';
import { KEY_DESERIALIZE_DOCX } from '@udecode/plate-serializer-docx';
import { KEY_DESERIALIZE_MD } from '@udecode/plate-serializer-md';
import { KEY_TABBABLE } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ELEMENT_TOGGLE } from '@udecode/plate-toggle';
import { KEY_TRAILING_BLOCK } from '@udecode/plate-trailing-block';

import { CustomizerBadge, customizerBadges } from '@/config/customizer-badges';
import { customizerComponents } from '@/config/customizer-components';
import { customizerPlugins } from '@/config/customizer-plugins';

export type SettingPlugin = {
  id: string;
  npmPackage?: string;
  packageImports?: string[];
  customImports?: string[];
  cnImports?: string[];
  plateImports?: string[];
  pluginFactory?: string;
  pluginOptions?: string[];
  label?: string;
  route?: string;
  badges?: CustomizerBadge[];
  dependencies?: string[];
  conflicts?: string[];
  disablePlugins?: string[];
  components?: {
    id: string; // e.g. 'blockquote-element'
    registry?: string;
    filename?: string; // e.g. 'blockquote-element' (default: id)
    customImports?: string[];
    cnImports?: string[];
    plateImports?: string[];
    pluginOptions?: string[];
    route?: string;
    label: string; // e.g. 'Blockquote'
    pluginKey?: string; // Plugin components only, e.g. 'ELEMENT_BLOCKQUOTE'
    import?: string;
    noImport?: boolean;
    usage: string; // e.g. 'BlockquoteElement'
  }[];
};

export const customizerItems: Record<string, SettingPlugin> = {
  components: {
    id: 'components',
    label: 'Components',
    badges: [customizerBadges.ui],
    components: [
      {
        id: 'editor',
        label: 'Editor',
        usage: 'Editor',
        route: customizerComponents.editor.href,
      },
      {
        id: 'fixed-toolbar',
        label: 'FixedToolbar',
        usage: 'FixedToolbar',
        route: customizerComponents.fixedToolbar.href,
      },
      {
        id: 'fixed-toolbar-buttons',
        label: 'FixedToolbarButtons',
        usage: 'FixedToolbarButtons',
        route: customizerComponents.fixedToolbarButtons.href,
      },
      {
        id: 'floating-toolbar',
        label: 'FloatingToolbar',
        usage: 'FloatingToolbar',
        route: customizerComponents.floatingToolbar.href,
      },
      {
        id: 'floating-toolbar-buttons',
        label: 'FloatingToolbarButtons',
        usage: 'FloatingToolbarButtons',
        route: customizerComponents.floatingToolbarButtons.href,
      },
      {
        id: 'placeholder',
        registry: 'placeholder',
        label: 'Placeholder',
        usage: 'withPlaceholders',
        route: customizerComponents.placeholder.href,
      },
    ],
  },
  [ELEMENT_BLOCKQUOTE]: {
    id: ELEMENT_BLOCKQUOTE,
    npmPackage: '@udecode/plate-block-quote',
    pluginFactory: 'createBlockquotePlugin',
    label: 'Blockquote',
    badges: [customizerBadges.element],
    route: customizerPlugins.basicnodes.route,
    components: [
      {
        id: 'blockquote-element',
        label: 'BlockquoteElement',
        pluginKey: 'ELEMENT_BLOCKQUOTE',
        usage: 'BlockquoteElement',
        route: customizerComponents.blockquoteElement.href,
      },
    ],
  },
  [ELEMENT_CODE_BLOCK]: {
    id: ELEMENT_CODE_BLOCK,
    npmPackage: '@udecode/plate-code-block',
    pluginFactory: 'createCodeBlockPlugin',
    label: 'Code block',
    badges: [customizerBadges.element],
    route: customizerPlugins.basicnodes.route,
    components: [
      {
        id: 'code-block-element',
        label: 'CodeBlockElement',
        pluginKey: 'ELEMENT_CODE_BLOCK',
        usage: 'CodeBlockElement',
        route: customizerComponents.codeBlockElement.href,
      },
      {
        id: 'code-line-element',
        label: 'CodeLineElement',
        pluginKey: 'ELEMENT_CODE_LINE',
        usage: 'CodeLineElement',
        route: customizerComponents.codeLineElement.href,
      },
      {
        id: 'code-syntax-leaf',
        label: 'CodeSyntaxLeaf',
        pluginKey: 'ELEMENT_CODE_SYNTAX',
        usage: 'CodeSyntaxLeaf',
        route: customizerComponents.codeSyntaxLeaf.href,
      },
    ],
  },
  [ELEMENT_EXCALIDRAW]: {
    id: ELEMENT_EXCALIDRAW,
    npmPackage: '@udecode/plate-excalidraw',
    pluginFactory: 'createExcalidrawPlugin',
    label: 'Excalidraw',
    badges: [customizerBadges.element, customizerBadges.void],
    route: customizerPlugins.excalidraw.route,
    components: [
      {
        id: 'excalidraw-element',
        label: 'ExcalidrawElement',
        pluginKey: 'ELEMENT_EXCALIDRAW',
        usage: 'ExcalidrawElement',
        route: customizerComponents.excalidrawElement.href,
      },
    ],
  },
  [ELEMENT_HR]: {
    id: ELEMENT_HR,
    npmPackage: '@udecode/plate-horizontal-rule',
    pluginFactory: 'createHorizontalRulePlugin',
    label: 'Horizontal Rule',
    badges: [customizerBadges.element, customizerBadges.void],
    route: customizerPlugins.hr.route,
    components: [
      {
        id: 'hr-element',
        label: 'HrElement',
        pluginKey: 'ELEMENT_HR',
        usage: 'HrElement',
        route: customizerComponents.hrElement.href,
      },
    ],
  },
  [ELEMENT_IMAGE]: {
    id: ELEMENT_IMAGE,
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'createImagePlugin',
    label: 'Image',
    badges: [customizerBadges.element, customizerBadges.void],
    route: customizerPlugins.media.route,
    components: [
      {
        id: 'image-element',
        label: 'ImageElement',
        pluginKey: 'ELEMENT_IMAGE',
        usage: 'ImageElement',
        route: customizerComponents.imageElement.href,
      },
    ],
  },
  [ELEMENT_LINK]: {
    id: ELEMENT_LINK,
    npmPackage: '@udecode/plate-link',
    pluginFactory: 'createLinkPlugin',
    label: 'Link',
    badges: [customizerBadges.element, customizerBadges.inline],
    route: customizerPlugins.link.route,
    components: [
      {
        id: 'link-element',
        label: 'LinkElement',
        pluginKey: 'ELEMENT_LINK',
        usage: 'LinkElement',
        route: customizerComponents.linkElement.href,
      },
      {
        id: 'link-floating-toolbar',
        plateImports: ['RenderAfterEditable'],
        pluginOptions: [
          `renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,`,
        ],
        label: 'LinkFloatingToolbar',
        usage: 'LinkFloatingToolbar',
        route: customizerComponents.linkFloatingToolbar.href,
      },
    ],
  },
  [ELEMENT_TOGGLE]: {
    id: ELEMENT_TOGGLE,
    npmPackage: '@udecode/plate-toggle',
    pluginFactory: 'createTogglePlugin',
    label: 'Toggle',
    badges: [customizerBadges.element],
    route: customizerPlugins.toggle.route,
    components: [
      {
        id: 'toggle-element',
        label: 'ToggleElement',
        pluginKey: 'ELEMENT_TOGGLE',
        usage: 'ToggleElement',
        route: customizerComponents.toggleElement.href,
      },
    ],
  },
  column: {
    id: 'column',
    npmPackage: '@udecode/plate-layout',
    pluginFactory: 'createColumnPlugin',
    label: 'Column',
    badges: [customizerBadges.element],
    route: customizerPlugins.column.route,
    components: [
      {
        id: 'column-group-element',
        label: 'ColumnGroupElement',
        pluginKey: 'ELEMENT_COLUMN_GROUP',
        usage: 'ColumnGroupElement',
        route: customizerComponents.columnGroupElement.href,
      },
      {
        id: 'column-element',
        label: 'ColumnElement',
        pluginKey: 'ELEMENT_COLUMN',
        usage: 'ColumnElement',
        route: customizerComponents.columnElement.href,
      },
    ],
  },
  heading: {
    id: 'heading',
    npmPackage: '@udecode/plate-heading',
    pluginFactory: 'createHeadingPlugin',
    label: 'Heading',
    badges: [customizerBadges.element],
    route: customizerPlugins.basicnodes.route,
    components: [
      {
        id: 'h1',
        filename: 'heading-element',
        cnImports: ['withProps'],
        label: 'H1Element',
        pluginKey: 'ELEMENT_H1',
        import: 'HeadingElement',
        usage: `withProps(HeadingElement, { variant: 'h1' })`,
        route: customizerComponents.headingElement.href,
      },
      {
        id: 'h2',
        filename: 'heading-element',
        cnImports: ['withProps'],
        label: 'H2Element',
        pluginKey: 'ELEMENT_H2',
        import: 'HeadingElement',
        usage: `withProps(HeadingElement, { variant: 'h2' })`,
        route: customizerComponents.headingElement.href,
      },
      {
        id: 'h3',
        filename: 'heading-element',
        cnImports: ['withProps'],
        label: 'H3Element',
        pluginKey: 'ELEMENT_H3',
        import: 'HeadingElement',
        usage: `withProps(HeadingElement, { variant: 'h3' })`,
        route: customizerComponents.headingElement.href,
      },
      {
        id: 'h4',
        filename: 'heading-element',
        cnImports: ['withProps'],
        label: 'H4Element',
        pluginKey: 'ELEMENT_H4',
        import: 'HeadingElement',
        usage: `withProps(HeadingElement, { variant: 'h4' })`,
        route: customizerComponents.headingElement.href,
      },
      {
        id: 'h5',
        filename: 'heading-element',
        cnImports: ['withProps'],
        label: 'H5Element',
        pluginKey: 'ELEMENT_H5',
        import: 'HeadingElement',
        usage: `withProps(HeadingElement, { variant: 'h5' })`,
        route: customizerComponents.headingElement.href,
      },
      {
        id: 'h6',
        filename: 'heading-element',
        cnImports: ['withProps'],
        label: 'H6Element',
        pluginKey: 'ELEMENT_H6',
        import: 'HeadingElement',
        usage: `withProps(HeadingElement, { variant: 'h6' })`,
        route: customizerComponents.headingElement.href,
      },
    ],
  },
  list: {
    id: 'list',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'createListPlugin',
    label: 'List',
    badges: [customizerBadges.element],
    conflicts: [KEY_LIST_STYLE_TYPE],
    route: customizerPlugins.list.route,
    components: [
      {
        id: 'ul',
        filename: 'list-element',
        cnImports: ['withProps'],
        label: 'BulletedListElement',
        pluginKey: 'ELEMENT_UL',
        import: 'ListElement',
        usage: `withProps(ListElement, { variant: 'ul' })`,
        route: customizerComponents.listElement.href,
      },
      {
        id: 'ol',
        filename: 'list-element',
        cnImports: ['withProps'],
        label: 'NumberedListElement',
        pluginKey: 'ELEMENT_OL',
        noImport: true,
        import: 'ListElement',
        usage: `withProps(ListElement, { variant: 'ol' })`,
        route: customizerComponents.listElement.href,
      },
      {
        id: 'li',
        filename: 'list-element',
        cnImports: ['withProps'],
        plateImports: ['PlateElement'],
        label: 'ListItemElement',
        pluginKey: 'ELEMENT_LI',
        noImport: true,
        usage: `withProps(PlateElement, { as: 'li' })`,
      },
    ],
  },
  [ELEMENT_MEDIA_EMBED]: {
    id: ELEMENT_MEDIA_EMBED,
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'createMediaEmbedPlugin',
    label: 'Media Embed',
    badges: [customizerBadges.element, customizerBadges.void],
    route: customizerPlugins.media.route,
    components: [
      {
        id: 'media-embed-element',
        label: 'MediaEmbedElement',
        pluginKey: 'ELEMENT_MEDIA_EMBED',
        usage: 'MediaEmbedElement',
        route: customizerComponents.mediaEmbedElement.href,
      },
    ],
  },
  [ELEMENT_MENTION]: {
    id: ELEMENT_MENTION,
    npmPackage: '@udecode/plate-mention',
    pluginFactory: 'createMentionPlugin',
    label: 'Mention',
    badges: [
      customizerBadges.element,
      customizerBadges.inline,
      customizerBadges.void,
    ],
    dependencies: [KEY_COMBOBOX],
    route: customizerPlugins.mention.route,
    components: [
      {
        id: 'mention-element',
        label: 'MentionElement',
        pluginKey: 'ELEMENT_MENTION',
        usage: 'MentionElement',
        route: customizerComponents.mentionElement.href,
      },
      {
        id: 'mention-input-element',
        label: 'MentionInputElement',
        pluginKey: 'ELEMENT_MENTION_INPUT',
        usage: 'MentionInputElement',
        route: customizerComponents.mentionInputElement.href,
      },
      {
        id: 'mention-combobox',
        label: 'MentionCombobox',
        usage: 'MentionCombobox',
        route: customizerComponents.mentionCombobox.href,
      },
    ],
  },
  [ELEMENT_PARAGRAPH]: {
    id: ELEMENT_PARAGRAPH,
    npmPackage: '@udecode/plate-paragraph',
    pluginFactory: 'createParagraphPlugin',
    label: 'Paragraph',
    badges: [customizerBadges.element],
    route: customizerPlugins.basicnodes.route,
    components: [
      {
        id: 'paragraph-element',
        label: 'ParagraphElement',
        pluginKey: 'ELEMENT_PARAGRAPH',
        usage: 'ParagraphElement',
        route: customizerComponents.paragraphElement.href,
      },
    ],
  },
  [ELEMENT_TABLE]: {
    id: ELEMENT_TABLE,
    npmPackage: '@udecode/plate-table',
    pluginFactory: 'createTablePlugin',
    label: 'Table',
    badges: [customizerBadges.element],
    route: customizerPlugins.table.route,
    components: [
      {
        id: 'table-element',
        label: 'TableElement',
        pluginKey: 'ELEMENT_TABLE',
        usage: 'TableElement',
        route: customizerComponents.tableElement.href,
      },
      {
        id: 'table-row-element',
        label: 'TableRowElement',
        pluginKey: 'ELEMENT_TR',
        usage: 'TableRowElement',
        route: customizerComponents.tableRowElement.href,
      },
      {
        id: 'td',
        filename: 'table-cell-element',
        label: 'TableCellElement',
        pluginKey: 'ELEMENT_TD',
        usage: 'TableCellElement',
        route: customizerComponents.tableCellElement.href,
      },
      {
        id: 'th',
        filename: 'table-cell-element',
        label: 'TableCellHeaderElement',
        pluginKey: 'ELEMENT_TH',
        usage: 'TableCellHeaderElement',
        route: customizerComponents.tableCellElement.href,
      },
    ],
  },
  [ELEMENT_TODO_LI]: {
    id: ELEMENT_TODO_LI,
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'createTodoListPlugin',
    label: 'Todo List',
    badges: [customizerBadges.element],
    route: customizerPlugins.todoli.route,
    components: [
      {
        id: 'todo-list-element',
        label: 'TodoListElement',
        pluginKey: 'ELEMENT_TODO_LI',
        usage: 'TodoListElement',
        route: customizerComponents.todoListElement.href,
      },
    ],
  },
  [MARK_BOLD]: {
    id: MARK_BOLD,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createBoldPlugin',
    label: 'Bold',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.basicmarks.route,
    components: [
      {
        id: 'bold',
        label: 'BoldLeaf',
        cnImports: ['withProps'],
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_BOLD',
        noImport: true,
        usage: `withProps(PlateLeaf, { as: 'strong' })`,
      },
    ],
  },
  [MARK_CODE]: {
    id: MARK_CODE,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createCodePlugin',
    label: 'Code',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.basicmarks.route,
    components: [
      {
        id: 'code-leaf',
        label: 'CodeLeaf',
        pluginKey: 'MARK_CODE',
        usage: `CodeLeaf`,
        route: customizerComponents.codeLeaf.href,
      },
    ],
  },
  [MARK_COMMENT]: {
    id: MARK_COMMENT,
    npmPackage: '@udecode/plate-comments',
    packageImports: ['CommentsProvider'],
    pluginFactory: 'createCommentsPlugin',
    label: 'Comments',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.comment.route,
    components: [
      {
        id: 'comment-leaf',
        label: 'CommentLeaf',
        pluginKey: 'MARK_COMMENT',
        usage: 'CommentLeaf',
        route: customizerComponents.commentLeaf.href,
      },
      {
        id: 'comments-popover',
        label: 'CommentsPopover',
        usage: 'CommentsPopover',
        route: customizerComponents.commentsPopover.href,
      },
    ],
  },
  [MARK_BG_COLOR]: {
    id: MARK_BG_COLOR,
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontBackgroundColorPlugin',
    label: 'Font Background',
    badges: [customizerBadges.style],
    route: customizerPlugins.font.route,
  },
  [MARK_COLOR]: {
    id: MARK_COLOR,
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontColorPlugin',
    label: 'Font Color',
    badges: [customizerBadges.style],
    route: customizerPlugins.font.route,
  },
  [MARK_FONT_SIZE]: {
    id: MARK_FONT_SIZE,
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'createFontSizePlugin',
    label: 'Font Size',
    badges: [customizerBadges.style],
    route: customizerPlugins.font.route,
  },
  [MARK_HIGHLIGHT]: {
    id: MARK_HIGHLIGHT,
    npmPackage: '@udecode/plate-highlight',
    pluginFactory: 'createHighlightPlugin',
    label: 'Highlight',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.highlight.route,
    components: [
      {
        id: 'highlight-leaf',
        label: 'HighlightLeaf',
        pluginKey: 'MARK_HIGHLIGHT',
        usage: 'HighlightLeaf',
        route: customizerComponents.highlightLeaf.href,
      },
    ],
  },
  [MARK_ITALIC]: {
    id: MARK_ITALIC,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createItalicPlugin',
    label: 'Italic',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.basicmarks.route,
    components: [
      {
        id: 'italic',
        label: 'ItalicLeaf',
        cnImports: ['withProps'],
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_ITALIC',
        noImport: true,
        usage: `withProps(PlateLeaf, { as: 'em' })`,
      },
    ],
  },
  [MARK_KBD]: {
    id: MARK_KBD,
    npmPackage: '@udecode/plate-kbd',
    pluginFactory: 'createKbdPlugin',
    label: 'Keyboard Input',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.kbd.route,
    components: [
      {
        id: 'kbd-leaf',
        label: 'KbdLeaf',
        pluginKey: 'MARK_KBD',
        usage: 'KbdLeaf',
        route: customizerComponents.kbdLeaf.href,
      },
    ],
  },
  [MARK_STRIKETHROUGH]: {
    id: MARK_STRIKETHROUGH,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createStrikethroughPlugin',
    label: 'Strikethrough',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.basicmarks.route,
    components: [
      {
        id: 'strikethrough',
        label: 'StrikethroughLeaf',
        cnImports: ['withProps'],
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_STRIKETHROUGH',
        noImport: true,
        usage: `withProps(PlateLeaf, { as: 's' })`,
      },
    ],
  },
  [MARK_SUBSCRIPT]: {
    id: MARK_SUBSCRIPT,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createSubscriptPlugin',
    label: 'Subscript',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.basicmarks.route,
    components: [
      {
        id: 'subscript',
        label: 'SubscriptLeaf',
        cnImports: ['withProps'],
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_SUBSCRIPT',
        noImport: true,
        usage: `withProps(PlateLeaf, { as: 'sub' })`,
      },
    ],
  },
  [MARK_SUPERSCRIPT]: {
    id: MARK_SUPERSCRIPT,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createSuperscriptPlugin',
    label: 'Superscript',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.basicmarks.route,
    components: [
      {
        id: 'superscript',
        label: 'SuperscriptLeaf',
        cnImports: ['withProps'],
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_SUPERSCRIPT',
        noImport: true,
        usage: `withProps(PlateLeaf, { as: 'sup' })`,
      },
    ],
  },
  [MARK_UNDERLINE]: {
    id: MARK_UNDERLINE,
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'createUnderlinePlugin',
    label: 'Underline',
    badges: [customizerBadges.leaf],
    route: customizerPlugins.basicmarks.route,
    components: [
      {
        id: 'underline',
        label: 'UnderlineLeaf',
        cnImports: ['withProps'],
        plateImports: ['PlateLeaf'],
        pluginKey: 'MARK_UNDERLINE',
        noImport: true,
        usage: `withProps(PlateLeaf, { as: 'u' })`,
      },
    ],
  },
  [KEY_ALIGN]: {
    id: KEY_ALIGN,
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
    label: 'Align',
    badges: [customizerBadges.style],
    route: customizerPlugins.align.route,
  },
  [KEY_LINE_HEIGHT]: {
    id: KEY_LINE_HEIGHT,
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
    label: 'Line Height',
    badges: [customizerBadges.style],
    route: customizerPlugins.lineheight.route,
  },
  [KEY_INDENT]: {
    id: KEY_INDENT,
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
    label: 'Indent',
    badges: [customizerBadges.style],
    route: customizerPlugins.indent.route,
  },
  [KEY_LIST_STYLE_TYPE]: {
    id: KEY_LIST_STYLE_TYPE,
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
    label: 'Indent List',
    badges: [customizerBadges.style],
    dependencies: [KEY_INDENT],
    conflicts: ['list'],
    route: customizerPlugins.indentlist.route,
  },

  // Functionality
  [KEY_AUTOFORMAT]: {
    id: KEY_AUTOFORMAT,
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
    label: 'Autoformat',
    badges: [customizerBadges.handler],
    route: customizerPlugins.autoformat.route,
  },
  [KEY_BLOCK_SELECTION]: {
    id: KEY_BLOCK_SELECTION,
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
    label: 'Block Selection',
    badges: [customizerBadges.ui],
    dependencies: [KEY_NODE_ID],
    route: customizerPlugins.blockselection.route,
  },
  [KEY_CAPTION]: {
    id: KEY_CAPTION,
    npmPackage: '@udecode/plate-caption',
    pluginFactory: 'createCaptionPlugin',
    pluginOptions: [
      `options: {`,
      `  pluginKeys: [`,
      `    // ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED`,
      `  ]`,
      `},`,
    ],
    label: 'Caption',
    badges: [customizerBadges.handler],
    route: customizerPlugins.media.route,
  },
  [KEY_COMBOBOX]: {
    id: KEY_COMBOBOX,
    npmPackage: '@udecode/plate-combobox',
    pluginFactory: 'createComboboxPlugin',
    label: 'Combobox',
    badges: [customizerBadges.handler, customizerBadges.ui],
    route: customizerPlugins.combobox.route,
  },
  [KEY_DND]: {
    id: KEY_DND,
    npmPackage: '@udecode/plate-dnd',
    customImports: [
      `import { DndProvider } from 'react-dnd';`,
      `import { HTML5Backend } from 'react-dnd-html5-backend';`,
    ],
    pluginFactory: 'createDndPlugin',
    pluginOptions: ['  options: { enableScroller: true },'],
    label: 'Drag & Drop',
    badges: [customizerBadges.handler, customizerBadges.ui],
    dependencies: [KEY_NODE_ID],
    route: customizerPlugins.dnd.route,
    components: [
      {
        id: 'draggable',
        registry: 'draggable',
        filename: 'with-draggables',
        label: 'Draggable',
        usage: 'withDraggables',
        route: customizerComponents.draggable.href,
      },
    ],
  },
  [KEY_DRAG_OVER_CURSOR]: {
    id: KEY_DRAG_OVER_CURSOR,
    // npmPackage: '@udecode/plate-cursor',
    label: 'Drag Cursor',
    badges: [customizerBadges.handler, customizerBadges.ui],
    route: customizerPlugins.cursoroverlay.route,
  },
  [KEY_EMOJI]: {
    id: KEY_EMOJI,
    npmPackage: '@udecode/plate-emoji',
    pluginFactory: 'createEmojiPlugin',
    label: 'Emoji',
    badges: [customizerBadges.handler],
    dependencies: [KEY_COMBOBOX],
    route: customizerPlugins.emoji.route,
    components: [
      {
        id: 'emoji-combobox',
        pluginOptions: [`renderAfterEditable: EmojiCombobox,`],
        label: 'EmojiCombobox',
        usage: 'EmojiCombobox',
        route: customizerComponents.emojiCombobox.href,
      },
    ],
  },
  [KEY_EXIT_BREAK]: {
    id: KEY_EXIT_BREAK,
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
    label: 'Exit Break',
    badges: [customizerBadges.handler],
    route: customizerPlugins.exitbreak.route,
  },
  [KEY_NODE_ID]: {
    id: KEY_NODE_ID,
    npmPackage: '@udecode/plate-node-id',
    pluginFactory: 'createNodeIdPlugin',
    label: 'Id',
    badges: [customizerBadges.normalizer],
    // route: settingValues.nodeid.route,
  },
  [KEY_NORMALIZE_TYPES]: {
    id: KEY_NORMALIZE_TYPES,
    npmPackage: '@udecode/plate-normalizers',
    pluginFactory: 'createNormalizeTypesPlugin',
    label: 'Normalize Types',
    badges: [customizerBadges.normalizer],
    route: customizerPlugins.forcedlayout.route,
  },
  [KEY_RESET_NODE]: {
    id: KEY_RESET_NODE,
    npmPackage: '@udecode/plate-reset-node',
    pluginFactory: 'createResetNodePlugin',
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    // Usage: https://platejs.org/docs/reset-node`,
      `  ],`,
      `},`,
    ],
    label: 'Reset Node',
    badges: [customizerBadges.handler],
    route: customizerPlugins.resetnode.route,
  },
  [KEY_SELECT_ON_BACKSPACE]: {
    id: KEY_SELECT_ON_BACKSPACE,
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
    label: 'Select on Backspace',
    badges: [customizerBadges.handler],
    route: customizerPlugins.media.route,
  },
  [KEY_DELETE]: {
    id: KEY_DELETE,
    npmPackage: '@udecode/plate-select',
    pluginFactory: 'createDeletePlugin',
    label: 'Delete',
    badges: [customizerBadges.handler],
  },
  [KEY_SINGLE_LINE]: {
    id: KEY_SINGLE_LINE,
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createSingleLinePlugin',
    label: 'Single Line',
    disablePlugins: [KEY_TRAILING_BLOCK],
    badges: [customizerBadges.normalizer],
    conflicts: [KEY_TRAILING_BLOCK],
    route: customizerPlugins.singleline.route,
  },
  [KEY_SOFT_BREAK]: {
    id: KEY_SOFT_BREAK,
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'createSoftBreakPlugin',
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
    label: 'Soft Break',
    badges: [customizerBadges.handler],
    route: customizerPlugins.softbreak.route,
  },
  [KEY_TABBABLE]: {
    id: KEY_TABBABLE,
    npmPackage: '@udecode/plate-tabbable',
    pluginFactory: 'createTabbablePlugin',
    label: 'Tabbable',
    badges: [customizerBadges.handler],
    route: customizerPlugins.tabbable.route,
  },
  [KEY_TRAILING_BLOCK]: {
    id: KEY_TRAILING_BLOCK,
    npmPackage: '@udecode/plate-trailing-block',
    pluginFactory: 'createTrailingBlockPlugin',
    pluginOptions: [`options: { type: ELEMENT_PARAGRAPH },`],
    label: 'Trailing Block',
    disablePlugins: [KEY_SINGLE_LINE],
    badges: [customizerBadges.normalizer],
    conflicts: [KEY_SINGLE_LINE],
    route: customizerPlugins.trailingblock.route,
  },

  // Deserialization
  [KEY_DESERIALIZE_CSV]: {
    id: KEY_DESERIALIZE_CSV,
    npmPackage: '@udecode/plate-serializer-csv',
    pluginFactory: 'createDeserializeCsvPlugin',
    label: 'Deserialize CSV',
    badges: [customizerBadges.handler],
    route: customizerPlugins.deserializecsv.route,
  },
  [KEY_DESERIALIZE_DOCX]: {
    id: KEY_DESERIALIZE_DOCX,
    npmPackage: '@udecode/plate-serializer-docx',
    pluginFactory: 'createDeserializeDocxPlugin',
    label: 'Deserialize DOCX',
    badges: [customizerBadges.handler],
    dependencies: [KEY_JUICE],
    route: customizerPlugins.deserializedocx.route,
  },
  [KEY_DESERIALIZE_MD]: {
    id: KEY_DESERIALIZE_MD,
    npmPackage: '@udecode/plate-serializer-md',
    pluginFactory: 'createDeserializeMdPlugin',
    label: 'Deserialize MD',
    badges: [customizerBadges.handler],
    route: customizerPlugins.deserializemd.route,
  },
  [KEY_JUICE]: {
    id: KEY_JUICE,
    npmPackage: '@udecode/plate-juice',
    pluginFactory: 'createJuicePlugin',
    label: 'Juice',
    badges: [customizerBadges.handler],
    route: customizerPlugins.deserializedocx.route,
  },
};
