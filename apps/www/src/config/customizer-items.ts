import { AIPlugin, CopilotPlugin } from '@udecode/plate-ai/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  ExitBreakPlugin,
  SingleLinePlugin,
  SoftBreakPlugin,
} from '@udecode/plate-break/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { CsvPlugin } from '@udecode/plate-csv';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { TodoListPlugin } from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import {
  MentionInputPlugin,
  MentionPlugin,
} from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import {
  BlockMenuPlugin,
  BlockSelectionPlugin,
} from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import {
  type CustomizerBadge,
  customizerBadges,
} from '@/config/customizer-badges';
import { customizerComponents } from '@/config/customizer-components';
import { customizerPlugins } from '@/config/customizer-plugins';
import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';

export type SettingPlugin = {
  id: string;
  components?: {
    id: string; // e.g. 'blockquote-element'
    label: string; // e.g. 'Blockquote'
    usage: string; // e.g. 'BlockquoteElement'
    cnImports?: string[];
    customImports?: string[];
    filename?: string; // e.g. 'blockquote-element' (default: id)
    import?: string;
    noImport?: boolean;
    plateImports?: string[];
    pluginImports?: string[];
    pluginKey?: string; // Plugin components only, e.g. 'BlockquotePlugin.key'
    pluginOptions?: string[];
    registry?: string;
    route?: string;
  }[];
  badges?: CustomizerBadge[];
  cnImports?: string[];
  conflicts?: string[];
  customImports?: string[];
  dependencies?: string[];
  disablePlugins?: string[];
  label?: string;
  npmPackage?: string;
  packageImports?: string[];
  plateImports?: string[];
  pluginFactory?: string;
  pluginOptions?: string[];
  reactImport?: boolean;
  route?: string;
};

export const customizerItems: Record<string, SettingPlugin> = {
  [AIPlugin.key]: {
    id: AIPlugin.key,
    badges: [customizerBadges.handler],
    label: 'AI',
    npmPackage: '@udecode/plate-ai',
    pluginFactory: 'AIPlugin',
    route: customizerPlugins.ai.route,
  },
  [AlignPlugin.key]: {
    id: AlignPlugin.key,
    badges: [customizerBadges.style],
    label: 'Align',
    npmPackage: '@udecode/plate-alignment',
    pluginFactory: 'AlignPlugin',
    pluginOptions: [`inject: { targetPlugins: ['p', 'h1', 'h2', 'h3'] },`],
    route: customizerPlugins.align.route,
  },
  [AutoformatPlugin.key]: {
    id: AutoformatPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Autoformat',
    npmPackage: '@udecode/plate-autoformat',
    pluginFactory: 'AutoformatPlugin',
    pluginOptions: [
      `options: {`,
      `  enableUndoOnDelete: true,`,
      `  rules: [`,
      `    // Usage: https://platejs.org/docs/autoformat`,
      `  ],`,
      `},`,
    ],
    reactImport: true,
    route: customizerPlugins.autoformat.route,
  },
  [BlockMenuPlugin.key]: {
    id: BlockMenuPlugin.key,
    badges: [customizerBadges.ui],
    dependencies: [BlockSelectionPlugin.key],
    label: 'Block Menu',
    npmPackage: '@udecode/plate-selection',
    pluginFactory: 'BlockMenuPlugin',
    route: customizerPlugins.blockmenu.route,
  },
  [BlockSelectionPlugin.key]: {
    id: BlockSelectionPlugin.key,
    badges: [customizerBadges.ui],
    dependencies: [NodeIdPlugin.key],
    label: 'Block Selection',
    npmPackage: '@udecode/plate-selection',
    pluginFactory: 'BlockSelectionPlugin',
    // pluginOptions: [
    //   `options: {`,
    //   `  sizes: {`,
    //   `    top: 0,`,
    //   `    bottom: 0,`,
    //   `  },`,
    //   `},`,
    // ],
    reactImport: true,
    route: customizerPlugins.blockselection.route,
  },
  [BlockquotePlugin.key]: {
    id: BlockquotePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'blockquote-element',
        label: 'BlockquoteElement',
        pluginKey: 'BlockquotePlugin.key',
        route: customizerComponents.blockquoteElement.href,
        usage: 'BlockquoteElement',
      },
    ],
    label: 'Blockquote',
    npmPackage: '@udecode/plate-block-quote',
    pluginFactory: 'BlockquotePlugin',
    reactImport: true,
    route: customizerPlugins.basicnodes.route,
  },
  [BoldPlugin.key]: {
    id: BoldPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'bold',
        cnImports: ['withProps'],
        label: 'BoldLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'BoldPlugin.key',
        usage: `withProps(PlateLeaf, { as: 'strong' })`,
      },
    ],
    label: 'Bold',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'BoldPlugin',
    reactImport: true,
    route: customizerPlugins.basicmarks.route,
  },
  [CaptionPlugin.key]: {
    id: CaptionPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Caption',
    npmPackage: '@udecode/plate-caption',
    pluginFactory: 'CaptionPlugin',
    pluginOptions: [`options: { plugins: [ImagePlugin, MediaEmbedPlugin] },`],
    reactImport: true,
    route: customizerPlugins.media.route,
  },
  [CodeBlockPlugin.key]: {
    id: CodeBlockPlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'code-block-element',
        label: 'CodeBlockElement',
        pluginKey: 'CodeBlockPlugin.key',
        route: customizerComponents.codeBlockElement.href,
        usage: 'CodeBlockElement',
      },
      {
        id: 'code-line-element',
        label: 'CodeLineElement',
        pluginImports: ['CodeLinePlugin'],
        pluginKey: 'CodeLinePlugin.key',
        route: customizerComponents.codeLineElement.href,
        usage: 'CodeLineElement',
      },
      {
        id: 'code-syntax-leaf',
        label: 'CodeSyntaxLeaf',
        pluginImports: ['CodeSyntaxPlugin'],
        pluginKey: 'CodeSyntaxPlugin.key',
        route: customizerComponents.codeSyntaxLeaf.href,
        usage: 'CodeSyntaxLeaf',
      },
    ],
    label: 'Code block',
    npmPackage: '@udecode/plate-code-block',
    pluginFactory: 'CodeBlockPlugin',
    reactImport: true,
    route: customizerPlugins.basicnodes.route,
  },
  [CodeLinePlugin.key]: {
    id: CodeLinePlugin.key,
    label: 'Code Line',
    npmPackage: '@udecode/plate-code-block',
    pluginFactory: 'CodeLinePlugin',
    reactImport: true,
  },
  [CodePlugin.key]: {
    id: CodePlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'code-leaf',
        label: 'CodeLeaf',
        pluginKey: 'CodePlugin.key',
        route: customizerComponents.codeLeaf.href,
        usage: `CodeLeaf`,
      },
    ],
    label: 'Code',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'CodePlugin',
    reactImport: true,
    route: customizerPlugins.basicmarks.route,
  },
  [CodeSyntaxPlugin.key]: {
    id: CodeSyntaxPlugin.key,
    label: 'Code Syntax',
    npmPackage: '@udecode/plate-code-block',
    pluginFactory: 'CodeSyntaxPlugin',
    reactImport: true,
  },
  [CommentsPlugin.key]: {
    id: CommentsPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'comment-leaf',
        label: 'CommentLeaf',
        pluginKey: 'CommentsPlugin.key',
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
    label: 'Comments',
    npmPackage: '@udecode/plate-comments',
    pluginFactory: 'CommentsPlugin',
    reactImport: true,
    route: customizerPlugins.comment.route,
  },
  [CopilotPlugin.key]: {
    id: CopilotPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Copilot',
    npmPackage: '@udecode/plate-ai',
    pluginFactory: 'CopilotPlugin',
    route: customizerPlugins.copilot.route,
  },
  // Deserialization
  [CsvPlugin.key]: {
    id: CsvPlugin.key,
    badges: [customizerBadges.handler],
    label: 'CSV',
    npmPackage: '@udecode/plate-csv',
    pluginFactory: 'CsvPlugin',
    route: customizerPlugins.csv.route,
  },
  [DatePlugin.key]: {
    id: DatePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'date-element',
        label: 'DateElement',
        pluginKey: 'DatePlugin.key',
        route: customizerComponents.dateElement.href,
        usage: 'DateElement',
      },
    ],
    label: 'Date',
    npmPackage: '@udecode/plate-date',
    pluginFactory: 'DatePlugin',
    reactImport: true,
    route: customizerPlugins.date.route,
  },
  [DeletePlugin.key]: {
    id: DeletePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Delete',
    npmPackage: '@udecode/plate-select',
    pluginFactory: 'DeletePlugin',
  },
  [DndPlugin.key]: {
    id: DndPlugin.key,
    badges: [customizerBadges.handler, customizerBadges.ui],
    components: [
      {
        id: 'draggable',
        filename: 'with-draggables',
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
    dependencies: [NodeIdPlugin.key],
    label: 'Drag & Drop',
    npmPackage: '@udecode/plate-dnd',
    pluginFactory: 'DndPlugin',
    pluginOptions: ['  options: { enableScroller: true },'],
    route: customizerPlugins.dnd.route,
  },
  [DocxPlugin.key]: {
    id: DocxPlugin.key,
    badges: [customizerBadges.handler],
    dependencies: [JuicePlugin.key],
    label: 'DOCX',
    npmPackage: '@udecode/plate-docx',
    pluginFactory: 'DocxPlugin',
    route: customizerPlugins.docx.route,
  },
  [DragOverCursorPlugin.key]: {
    id: DragOverCursorPlugin.key,
    badges: [customizerBadges.handler, customizerBadges.ui],
    // npmPackage: '@udecode/plate-cursor',
    label: 'Drag Cursor',
    reactImport: true,
    route: customizerPlugins.cursoroverlay.route,
  },
  [EmojiPlugin.key]: {
    id: EmojiPlugin.key,
    badges: [customizerBadges.handler],
    components: [
      {
        id: 'emoji-input-element',
        label: 'EmojiInputElement',
        route: customizerComponents.emojiInputElement.href,
        usage: 'EmojiInputElement',
      },
    ],
    label: 'Emoji',
    npmPackage: '@udecode/plate-emoji',
    pluginFactory: 'EmojiPlugin',
    reactImport: true,
    route: customizerPlugins.emoji.route,
  },
  [ExcalidrawPlugin.key]: {
    id: ExcalidrawPlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'excalidraw-element',
        label: 'ExcalidrawElement',
        pluginKey: 'ExcalidrawPlugin.key',
        route: customizerComponents.excalidrawElement.href,
        usage: 'ExcalidrawElement',
      },
    ],
    label: 'Excalidraw',
    npmPackage: '@udecode/plate-excalidraw',
    pluginFactory: 'ExcalidrawPlugin',
    reactImport: true,
    route: customizerPlugins.excalidraw.route,
  },
  [ExitBreakPlugin.key]: {
    id: ExitBreakPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Exit Break',
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'ExitBreakPlugin',
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    {`,
      `      hotkey: 'mod+enter',`,
      `    },`,
      `    {`,
      `      before: true,`,
      `      hotkey: 'mod+shift+enter',`,
      `    },`,
      `    {`,
      `      hotkey: 'enter',`,
      `      level: 1,`,
      `      query: {`,
      `        allow: ['h1', 'h2', 'h3'],`,
      `        end: true,`,
      `        start: true,`,
      `      },`,
      `      relative: true,`,
      `    },`,
      `  ],`,
      `},`,
    ],
    reactImport: true,
    route: customizerPlugins.exitbreak.route,
  },
  [FontBackgroundColorPlugin.key]: {
    id: FontBackgroundColorPlugin.key,
    badges: [customizerBadges.style],
    label: 'Font Background',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'FontBackgroundColorPlugin',
    route: customizerPlugins.font.route,
  },
  [FontColorPlugin.key]: {
    id: FontColorPlugin.key,
    badges: [customizerBadges.style],
    label: 'Font Color',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'FontColorPlugin',
    route: customizerPlugins.font.route,
  },
  [FontSizePlugin.key]: {
    id: FontSizePlugin.key,
    badges: [customizerBadges.style],
    label: 'Font Size',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'FontSizePlugin',
    route: customizerPlugins.font.route,
  },
  [HighlightPlugin.key]: {
    id: HighlightPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'highlight-leaf',
        label: 'HighlightLeaf',
        pluginKey: 'HighlightPlugin.key',
        route: customizerComponents.highlightLeaf.href,
        usage: 'HighlightLeaf',
      },
    ],
    label: 'Highlight',
    npmPackage: '@udecode/plate-highlight',
    pluginFactory: 'HighlightPlugin',
    reactImport: true,
    route: customizerPlugins.highlight.route,
  },
  [HorizontalRulePlugin.key]: {
    id: HorizontalRulePlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'hr-element',
        label: 'HrElement',
        pluginKey: 'HorizontalRulePlugin.key',
        route: customizerComponents.hrElement.href,
        usage: 'HrElement',
      },
    ],
    label: 'Horizontal Rule',
    npmPackage: '@udecode/plate-horizontal-rule',
    pluginFactory: 'HorizontalRulePlugin',
    reactImport: true,
    route: customizerPlugins.hr.route,
  },
  [ImagePlugin.key]: {
    id: ImagePlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'image-element',
        label: 'ImageElement',
        pluginKey: 'ImagePlugin.key',
        route: customizerComponents.imageElement.href,
        usage: 'ImageElement',
      },
    ],
    label: 'Image',
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'ImagePlugin',
    reactImport: true,
    route: customizerPlugins.media.route,
  },
  [IndentListPlugin.key]: {
    id: IndentListPlugin.key,
    badges: [customizerBadges.style],
    conflicts: ['list'],
    dependencies: [IndentPlugin.key],
    label: 'Indent List',
    npmPackage: '@udecode/plate-indent-list',
    pluginFactory: 'IndentListPlugin',
    pluginOptions: [`inject: { targetPlugins: ['p', 'h1', 'h2', 'h3'] },`],
    reactImport: true,
    route: customizerPlugins.indentlist.route,
  },
  [IndentPlugin.key]: {
    id: IndentPlugin.key,
    badges: [customizerBadges.style],
    label: 'Indent',
    npmPackage: '@udecode/plate-indent',
    pluginFactory: 'IndentPlugin',
    pluginOptions: [`inject: { targetPlugins: ['p', 'h1', 'h2', 'h3'] },`],
    reactImport: true,
    route: customizerPlugins.indent.route,
  },
  [ItalicPlugin.key]: {
    id: ItalicPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'italic',
        cnImports: ['withProps'],
        label: 'ItalicLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'ItalicPlugin.key',
        usage: `withProps(PlateLeaf, { as: 'em' })`,
      },
    ],
    label: 'Italic',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'ItalicPlugin',
    reactImport: true,
    route: customizerPlugins.basicmarks.route,
  },
  [JuicePlugin.key]: {
    id: JuicePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Juice',
    npmPackage: '@udecode/plate-juice',
    pluginFactory: 'JuicePlugin',
    route: customizerPlugins.docx.route,
  },
  [KbdPlugin.key]: {
    id: KbdPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'kbd-leaf',
        label: 'KbdLeaf',
        pluginKey: 'KbdPlugin.key',
        route: customizerComponents.kbdLeaf.href,
        usage: 'KbdLeaf',
      },
    ],
    label: 'Keyboard Input',
    npmPackage: '@udecode/plate-kbd',
    pluginFactory: 'KbdPlugin',
    reactImport: true,
    route: customizerPlugins.kbd.route,
  },
  [LineHeightPlugin.key]: {
    id: LineHeightPlugin.key,
    badges: [customizerBadges.style],
    label: 'Line Height',
    npmPackage: '@udecode/plate-line-height',
    pluginFactory: 'LineHeightPlugin',
    pluginOptions: [
      `inject: {`,
      `  nodeProps: {`,
      `    defaultNodeValue: 1.5,`,
      `    validNodeValues: [1, 1.2, 1.5, 2, 3],`,
      `  },`,
      `  targetPlugins: ['p', 'h1', 'h2', 'h3'],`,
      `},`,
    ],
    route: customizerPlugins.lineheight.route,
  },
  [LinkPlugin.key]: {
    id: LinkPlugin.key,
    badges: [customizerBadges.element, customizerBadges.inline],
    components: [
      {
        id: 'link-element',
        label: 'LinkElement',
        pluginKey: 'LinkPlugin.key',
        route: customizerComponents.linkElement.href,
        usage: 'LinkElement',
      },
      {
        id: 'link-floating-toolbar',
        label: 'LinkFloatingToolbar',
        pluginOptions: [
          `render: { afterEditable: () => <LinkFloatingToolbar /> },`,
        ],
        route: customizerComponents.linkFloatingToolbar.href,
        usage: 'LinkFloatingToolbar',
      },
    ],
    label: 'Link',
    npmPackage: '@udecode/plate-link',
    pluginFactory: 'LinkPlugin',
    reactImport: true,
    route: customizerPlugins.link.route,
  },
  [MarkdownPlugin.key]: {
    id: MarkdownPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Deserialize MD',
    npmPackage: '@udecode/plate-markdown',
    pluginFactory: 'MarkdownPlugin',
    route: customizerPlugins.markdown.route,
  },
  [MediaEmbedPlugin.key]: {
    id: MediaEmbedPlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'media-embed-element',
        label: 'MediaEmbedElement',
        pluginKey: 'MediaEmbedPlugin.key',
        route: customizerComponents.mediaEmbedElement.href,
        usage: 'MediaEmbedElement',
      },
    ],
    label: 'Media Embed',
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'MediaEmbedPlugin',
    reactImport: true,
    route: customizerPlugins.media.route,
  },
  [MentionInputPlugin.key]: {
    id: MentionInputPlugin.key,
    label: 'Mention Input',
    npmPackage: '@udecode/plate-mention',
    pluginFactory: 'MentionInputPlugin',
    reactImport: true,
  },

  [MentionPlugin.key]: {
    id: MentionPlugin.key,
    badges: [
      customizerBadges.element,
      customizerBadges.inline,
      customizerBadges.void,
    ],
    components: [
      {
        id: 'mention-element',
        label: 'MentionElement',
        pluginKey: 'MentionPlugin.key',
        route: customizerComponents.mentionElement.href,
        usage: 'MentionElement',
      },
      {
        id: 'mention-input-element',
        label: 'MentionInputElement',
        pluginImports: ['MentionInputPlugin'],
        pluginKey: 'MentionInputPlugin.key',
        route: customizerComponents.mentionInputElement.href,
        usage: 'MentionInputElement',
      },
    ],
    label: 'Mention',
    npmPackage: '@udecode/plate-mention',
    pluginFactory: 'MentionPlugin',
    reactImport: true,
    route: customizerPlugins.mention.route,
  },
  [NodeIdPlugin.key]: {
    id: NodeIdPlugin.key,
    badges: [customizerBadges.normalizer],
    label: 'Id',
    npmPackage: '@udecode/plate-node-id',
    pluginFactory: 'NodeIdPlugin',
    // route: settingValues.nodeid.route,
  },
  [NormalizeTypesPlugin.key]: {
    id: NormalizeTypesPlugin.key,
    badges: [customizerBadges.normalizer],
    label: 'Normalize Types',
    npmPackage: '@udecode/plate-normalizers',
    pluginFactory: 'NormalizeTypesPlugin',
    route: customizerPlugins.forcedlayout.route,
  },
  [ParagraphPlugin.key]: {
    id: ParagraphPlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'paragraph-element',
        label: 'ParagraphElement',
        pluginKey: 'ParagraphPlugin.key',
        route: customizerComponents.paragraphElement.href,
        usage: 'ParagraphElement',
      },
    ],
    label: 'Paragraph',
    plateImports: ['ParagraphPlugin'],
    // npmPackage: '@udecode/plate-common',
    pluginFactory: 'ParagraphPlugin',
    reactImport: true,
    route: customizerPlugins.basicnodes.route,
  },
  [ResetNodePlugin.key]: {
    id: ResetNodePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Reset Node',
    npmPackage: '@udecode/plate-reset-node',
    pluginFactory: 'ResetNodePlugin',
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    // Usage: https://platejs.org/docs/reset-node`,
      `  ],`,
      `},`,
    ],
    reactImport: true,
    route: customizerPlugins.resetnode.route,
  },
  [SelectOnBackspacePlugin.key]: {
    id: SelectOnBackspacePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Select on Backspace',
    npmPackage: '@udecode/plate-select',
    pluginFactory: 'SelectOnBackspacePlugin',
    pluginOptions: [
      `options: {`,
      `  query: {`,
      `    allow: [`,
      `      // ImagePlugin.key, HorizontalRulePlugin.key`,
      `    ],`,
      `  },`,
      `},`,
    ],
    route: customizerPlugins.media.route,
  },
  [SingleLinePlugin.key]: {
    id: SingleLinePlugin.key,
    badges: [customizerBadges.normalizer],
    conflicts: [TrailingBlockPlugin.key],
    disablePlugins: [TrailingBlockPlugin.key],
    label: 'Single Line',
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'SingleLinePlugin',
    reactImport: true,
    route: customizerPlugins.singleline.route,
  },
  [SlashPlugin.key]: {
    id: SlashPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Slash Command',
    npmPackage: '@udecode/plate-slash-command',
    pluginFactory: 'SlashPlugin',
    route: customizerPlugins.slashCommand.route,
  },
  [SoftBreakPlugin.key]: {
    id: SoftBreakPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Soft Break',
    npmPackage: '@udecode/plate-break',
    pluginFactory: 'SoftBreakPlugin',
    pluginOptions: [
      `options: {`,
      `  rules: [`,
      `    { hotkey: 'shift+enter' },`,
      `    {`,
      `      hotkey: 'enter',`,
      `      query: {`,
      `        allow: ['code_block', 'blockquote', 'td', 'th'],`,
      `      },`,
      `    },`,
      `  ],`,
      `},`,
    ],
    reactImport: true,
    route: customizerPlugins.softbreak.route,
  },
  [StrikethroughPlugin.key]: {
    id: StrikethroughPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'strikethrough',
        cnImports: ['withProps'],
        label: 'StrikethroughLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'StrikethroughPlugin.key',
        usage: `withProps(PlateLeaf, { as: 's' })`,
      },
    ],
    label: 'Strikethrough',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'StrikethroughPlugin',
    reactImport: true,
    route: customizerPlugins.basicmarks.route,
  },
  [SubscriptPlugin.key]: {
    id: SubscriptPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'subscript',
        cnImports: ['withProps'],
        label: 'SubscriptLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'SubscriptPlugin.key',
        usage: `withProps(PlateLeaf, { as: 'sub' })`,
      },
    ],
    label: 'Subscript',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'SubscriptPlugin',
    reactImport: true,
    route: customizerPlugins.basicmarks.route,
  },
  [SuperscriptPlugin.key]: {
    id: SuperscriptPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'superscript',
        cnImports: ['withProps'],
        label: 'SuperscriptLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'SuperscriptPlugin.key',
        usage: `withProps(PlateLeaf, { as: 'sup' })`,
      },
    ],
    label: 'Superscript',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'SuperscriptPlugin',
    reactImport: true,
    route: customizerPlugins.basicmarks.route,
  },
  [TabbablePlugin.key]: {
    id: TabbablePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Tabbable',
    npmPackage: '@udecode/plate-tabbable',
    pluginFactory: 'TabbablePlugin',
    reactImport: true,
    route: customizerPlugins.tabbable.route,
  },
  [TablePlugin.key]: {
    id: TablePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'table-element',
        label: 'TableElement',
        pluginKey: 'TablePlugin.key',
        route: customizerComponents.tableElement.href,
        usage: 'TableElement',
      },
      {
        id: 'table-row-element',
        label: 'TableRowElement',
        pluginImports: ['TableRowPlugin'],
        pluginKey: 'TableRowPlugin.key',
        route: customizerComponents.tableRowElement.href,
        usage: 'TableRowElement',
      },
      {
        id: 'td',
        filename: 'table-cell-element',
        label: 'TableCellElement',
        pluginImports: ['TableCellPlugin'],
        pluginKey: 'TableCellPlugin.key',
        route: customizerComponents.tableCellElement.href,
        usage: 'TableCellElement',
      },
      {
        id: 'th',
        filename: 'table-cell-element',
        label: 'TableCellHeaderElement',
        pluginImports: ['TableCellHeaderPlugin'],
        pluginKey: 'TableCellHeaderPlugin.key',
        route: customizerComponents.tableCellElement.href,
        usage: 'TableCellHeaderElement',
      },
    ],
    label: 'Table',
    npmPackage: '@udecode/plate-table',
    pluginFactory: 'TablePlugin',
    reactImport: true,
    route: customizerPlugins.table.route,
  },
  [TocPlugin.key]: {
    id: TocPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Table of Contents',
    npmPackage: '@udecode/plate-heading',
    pluginFactory: 'TocPlugin',
    route: customizerPlugins.toc.route,
  },
  [TodoListPlugin.key]: {
    id: TodoListPlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'todo-list-element',
        label: 'TodoListElement',
        pluginKey: 'TodoListPlugin.key',
        route: customizerComponents.todoListElement.href,
        usage: 'TodoListElement',
      },
    ],
    label: 'Todo List',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'TodoListPlugin',
    reactImport: true,
    route: customizerPlugins.todoli.route,
  },
  [TogglePlugin.key]: {
    id: TogglePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'toggle-element',
        label: 'ToggleElement',
        pluginKey: 'TogglePlugin.key',
        route: customizerComponents.toggleElement.href,
        usage: 'ToggleElement',
      },
    ],
    label: 'Toggle',
    npmPackage: '@udecode/plate-toggle',
    pluginFactory: 'TogglePlugin',
    reactImport: true,
    route: customizerPlugins.toggle.route,
  },
  [TrailingBlockPlugin.key]: {
    id: TrailingBlockPlugin.key,
    badges: [customizerBadges.normalizer],
    conflicts: [SingleLinePlugin.key],
    disablePlugins: [SingleLinePlugin.key],
    label: 'Trailing Block',
    npmPackage: '@udecode/plate-trailing-block',
    pluginFactory: 'TrailingBlockPlugin',
    pluginOptions: [`options: { type: 'p' },`],
    route: customizerPlugins.trailingblock.route,
  },
  [UnderlinePlugin.key]: {
    id: UnderlinePlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'underline',
        cnImports: ['withProps'],
        label: 'UnderlineLeaf',
        noImport: true,
        plateImports: ['PlateLeaf'],
        pluginKey: 'UnderlinePlugin.key',
        usage: `withProps(PlateLeaf, { as: 'u' })`,
      },
    ],
    label: 'Underline',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'UnderlinePlugin',
    reactImport: true,
    route: customizerPlugins.basicmarks.route,
  },
  column: {
    id: 'column',
    badges: [customizerBadges.element],
    components: [
      {
        id: 'column-group-element',
        label: 'ColumnGroupElement',
        pluginKey: 'ColumnPlugin.key',
        route: customizerComponents.columnGroupElement.href,
        usage: 'ColumnGroupElement',
      },
      {
        id: 'column-element',
        label: 'ColumnElement',
        pluginImports: ['ColumnItemPlugin'],
        pluginKey: 'ColumnItemPlugin.key',
        route: customizerComponents.columnElement.href,
        usage: 'ColumnElement',
      },
    ],
    label: 'Column',
    npmPackage: '@udecode/plate-layout',
    pluginFactory: 'ColumnPlugin',
    reactImport: true,
    route: customizerPlugins.column.route,
  },
  components: {
    id: 'components',
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
    label: 'Components',
  },
  heading: {
    id: 'heading',
    badges: [customizerBadges.element],
    components: [
      {
        id: 'h1',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H1Element',
        pluginKey: 'HEADING_KEYS.h1',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h1' })`,
      },
      {
        id: 'h2',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H2Element',
        pluginKey: 'HEADING_KEYS.h2',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h2' })`,
      },
      {
        id: 'h3',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H3Element',
        pluginKey: 'HEADING_KEYS.h3',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h3' })`,
      },
      {
        id: 'h4',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H4Element',
        pluginKey: 'HEADING_KEYS.h4',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h4' })`,
      },
      {
        id: 'h5',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H5Element',
        pluginKey: 'HEADING_KEYS.h5',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h5' })`,
      },
      {
        id: 'h6',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H6Element',
        pluginKey: 'HEADING_KEYS.h6',
        route: customizerComponents.headingElement.href,
        usage: `withProps(HeadingElement, { variant: 'h6' })`,
      },
    ],
    customImports: [`import { HEADING_KEYS } from '@udecode/plate-heading';`],
    label: 'Heading',
    npmPackage: '@udecode/plate-heading',
    pluginFactory: 'HeadingPlugin',
    reactImport: true,
    route: customizerPlugins.basicnodes.route,
  },
  list: {
    id: 'list',
    badges: [customizerBadges.element],
    components: [
      {
        id: 'ul',
        cnImports: ['withProps'],
        filename: 'list-element',
        import: 'ListElement',
        label: 'BulletedListElement',
        pluginImports: ['BulletedListPlugin'],
        pluginKey: 'BulletedListPlugin.key',
        route: customizerComponents.listElement.href,
        usage: `withProps(ListElement, { variant: 'ul' })`,
      },
      {
        id: 'ol',
        cnImports: ['withProps'],
        filename: 'list-element',
        import: 'ListElement',
        label: 'NumberedListElement',
        noImport: true,
        pluginImports: ['NumberedListPlugin'],
        pluginKey: 'NumberedListPlugin.key',
        route: customizerComponents.listElement.href,
        usage: `withProps(ListElement, { variant: 'ol' })`,
      },
      {
        id: 'li',
        cnImports: ['withProps'],
        filename: 'list-element',
        label: 'ListItemElement',
        noImport: true,
        plateImports: ['PlateElement'],
        pluginImports: ['ListItemPlugin'],
        pluginKey: 'ListItemPlugin.key',
        usage: `withProps(PlateElement, { as: 'li' })`,
      },
    ],
    conflicts: [IndentListPlugin.key],
    label: 'List',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'ListPlugin',
    reactImport: true,
    route: customizerPlugins.list.route,
  },
};
