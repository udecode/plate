import { AIChatPlugin, AIPlugin, CopilotPlugin } from '@udecode/plate-ai/react';
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
import {
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
} from '@udecode/plate-media/react';
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
  CursorOverlayPlugin,
} from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { getComponentNavItem, getPluginNavItem } from '@/config/docs';
import { FixedToolbarPlugin } from '@/registry/default/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/registry/default/components/editor/plugins/floating-toolbar-plugin';

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

export type CustomizerBadge = {
  label: string;
};

export const customizerBadges = {
  element: {
    description: '',
    label: 'Element',
  },
  inline: {
    label: 'Inline',
  },
  leaf: {
    label: 'Leaf',
  },
  normalizer: {
    label: 'Normalizer',
  },
  style: {
    label: 'Style',
  },
  ui: {
    label: 'UI',
  },
  void: {
    label: 'Void',
  },
  handler: {
    label: 'Handler',
  },
};

export const customizerItems: Record<string, SettingPlugin> = {
  [AIChatPlugin.key]: {
    id: AIChatPlugin.key,
    badges: [customizerBadges.handler],
    dependencies: [AIPlugin.key],
    label: 'AI Chat',
    npmPackage: '@udecode/plate-ai',
    pluginFactory: 'AIChatPlugin',
    route: getPluginNavItem('ai').href,
  },
  [AIPlugin.key]: {
    id: AIPlugin.key,
    badges: [customizerBadges.handler],
    components: [
      {
        id: 'ai-leaf',
        label: 'AILeaf',
        pluginKey: 'AIPlugin.key',
        route: getComponentNavItem('ai-leaf').href,
        usage: 'AILeaf',
      },
    ],
    label: 'AI',
    npmPackage: '@udecode/plate-ai',
    pluginFactory: 'AIPlugin',
    route: getPluginNavItem('ai').href,
  },
  [AlignPlugin.key]: {
    id: AlignPlugin.key,
    badges: [customizerBadges.style],
    label: 'Align',
    npmPackage: '@udecode/plate-alignment',
    pluginFactory: 'AlignPlugin',
    pluginOptions: [`inject: { targetPlugins: ['p', 'h1', 'h2', 'h3'] },`],
    route: getPluginNavItem('alignment').href,
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
    route: getPluginNavItem('autoformat').href,
  },
  [BlockMenuPlugin.key]: {
    id: BlockMenuPlugin.key,
    badges: [customizerBadges.ui],
    dependencies: [BlockSelectionPlugin.key],
    label: 'Block Menu',
    npmPackage: '@udecode/plate-selection',
    pluginFactory: 'BlockMenuPlugin',
    route: getPluginNavItem('block-menu').href,
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
    route: getPluginNavItem('block-selection').href,
  },
  [BlockquotePlugin.key]: {
    id: BlockquotePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'blockquote-element',
        label: 'BlockquoteElement',
        pluginKey: 'BlockquotePlugin.key',
        route: getComponentNavItem('blockquote-element').href,
        usage: 'BlockquoteElement',
      },
    ],
    label: 'Blockquote',
    npmPackage: '@udecode/plate-block-quote',
    pluginFactory: 'BlockquotePlugin',
    reactImport: true,
    route: getPluginNavItem('basic-elements').href,
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
    route: getPluginNavItem('basic-marks').href,
  },
  [CaptionPlugin.key]: {
    id: CaptionPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Caption',
    npmPackage: '@udecode/plate-caption',
    pluginFactory: 'CaptionPlugin',
    pluginOptions: [`options: { plugins: [ImagePlugin, MediaEmbedPlugin] },`],
    reactImport: true,
    route: getPluginNavItem('media').href,
  },
  [CodeBlockPlugin.key]: {
    id: CodeBlockPlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'code-block-element',
        label: 'CodeBlockElement',
        pluginKey: 'CodeBlockPlugin.key',
        route: getComponentNavItem('code-block-element').href,
        usage: 'CodeBlockElement',
      },
      {
        id: 'code-line-element',
        label: 'CodeLineElement',
        pluginImports: ['CodeLinePlugin'],
        pluginKey: 'CodeLinePlugin.key',
        route: getComponentNavItem('code-line-element').href,
        usage: 'CodeLineElement',
      },
      {
        id: 'code-syntax-leaf',
        label: 'CodeSyntaxLeaf',
        pluginImports: ['CodeSyntaxPlugin'],
        pluginKey: 'CodeSyntaxPlugin.key',
        route: getComponentNavItem('code-syntax-leaf').href,
        usage: 'CodeSyntaxLeaf',
      },
    ],
    label: 'Code block',
    npmPackage: '@udecode/plate-code-block',
    pluginFactory: 'CodeBlockPlugin',
    reactImport: true,
    route: getPluginNavItem('basic-elements').href,
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
        route: getComponentNavItem('code-leaf').href,
        usage: `CodeLeaf`,
      },
    ],
    label: 'Code',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'CodePlugin',
    reactImport: true,
    route: getPluginNavItem('basic-marks').href,
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
        route: getComponentNavItem('comment-leaf').href,
        usage: 'CommentLeaf',
      },
      {
        id: 'comments-popover',
        label: 'CommentsPopover',
        pluginOptions: [
          `render: { afterEditable: () => <CommentsPopover /> },`,
        ],
        route: getComponentNavItem('comments-popover').href,
        usage: 'CommentsPopover',
      },
    ],
    label: 'Comments',
    npmPackage: '@udecode/plate-comments',
    pluginFactory: 'CommentsPlugin',
    reactImport: true,
    route: getPluginNavItem('comments').href,
  },
  [CopilotPlugin.key]: {
    id: CopilotPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Copilot',
    npmPackage: '@udecode/plate-ai',
    pluginFactory: 'CopilotPlugin',
    route: getPluginNavItem('copilot').href,
  },
  // Deserialization
  [CsvPlugin.key]: {
    id: CsvPlugin.key,
    badges: [customizerBadges.handler],
    label: 'CSV',
    npmPackage: '@udecode/plate-csv',
    pluginFactory: 'CsvPlugin',
    route: getPluginNavItem('csv').href,
  },
  [CursorOverlayPlugin.key]: {
    id: CursorOverlayPlugin.key,
    badges: [customizerBadges.handler, customizerBadges.ui],
    label: 'Cursor Overlay',
    npmPackage: '@udecode/plate-selection',
    pluginFactory: 'CursorOverlayPlugin',
    pluginOptions: [`render: { afterEditable: () => <CursorOverlay /> },`],
    reactImport: true,
    route: getPluginNavItem('cursor-overlay').href,
  },
  [DatePlugin.key]: {
    id: DatePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'date-element',
        label: 'DateElement',
        pluginKey: 'DatePlugin.key',
        route: getComponentNavItem('date-element').href,
        usage: 'DateElement',
      },
    ],
    label: 'Date',
    npmPackage: '@udecode/plate-date',
    pluginFactory: 'DatePlugin',
    reactImport: true,
    route: getPluginNavItem('date').href,
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
        route: getComponentNavItem('draggable').href,
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
    route: getPluginNavItem('dnd').href,
  },
  [DocxPlugin.key]: {
    id: DocxPlugin.key,
    badges: [customizerBadges.handler],
    dependencies: [JuicePlugin.key],
    label: 'DOCX',
    npmPackage: '@udecode/plate-docx',
    pluginFactory: 'DocxPlugin',
    route: getPluginNavItem('docx').href,
  },
  [EmojiPlugin.key]: {
    id: EmojiPlugin.key,
    badges: [customizerBadges.handler],
    components: [
      {
        id: 'emoji-input-element',
        label: 'EmojiInputElement',
        route: getComponentNavItem('emoji-input-element').href,
        usage: 'EmojiInputElement',
      },
    ],
    label: 'Emoji',
    npmPackage: '@udecode/plate-emoji',
    pluginFactory: 'EmojiPlugin',
    reactImport: true,
    route: getPluginNavItem('emoji').href,
  },
  [ExcalidrawPlugin.key]: {
    id: ExcalidrawPlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'excalidraw-element',
        label: 'ExcalidrawElement',
        pluginKey: 'ExcalidrawPlugin.key',
        route: getComponentNavItem('excalidraw-element').href,
        usage: 'ExcalidrawElement',
      },
    ],
    label: 'Excalidraw',
    npmPackage: '@udecode/plate-excalidraw',
    pluginFactory: 'ExcalidrawPlugin',
    reactImport: true,
    route: getPluginNavItem('excalidraw').href,
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
    route: getPluginNavItem('exit-break').href,
  },
  [FixedToolbarPlugin.key]: {
    id: FixedToolbarPlugin.key,
    badges: [customizerBadges.handler, customizerBadges.ui],
    customImports: [
      `import { FixedToolbarPlugin } from '@/components/editor/plugins/fixed-toolbar-plugin';`,
    ],
    label: 'Fixed Toolbar',
    pluginFactory: 'FixedToolbarPlugin',
    reactImport: true,
    // route: getPluginNavItem('fixed-toolbar').href,
  },
  [FloatingToolbarPlugin.key]: {
    id: FloatingToolbarPlugin.key,
    badges: [customizerBadges.handler, customizerBadges.ui],
    customImports: [
      `import { FloatingToolbarPlugin } from '@/components/editor/plugins/floating-toolbar-plugin';`,
    ],
    label: 'Floating Toolbar',
    pluginFactory: 'FloatingToolbarPlugin',
    reactImport: true,
    // route: getPluginNavItem('floating-toolbar').href,
  },
  [FontBackgroundColorPlugin.key]: {
    id: FontBackgroundColorPlugin.key,
    badges: [customizerBadges.style],
    label: 'Font Background',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'FontBackgroundColorPlugin',
    route: getPluginNavItem('font').href,
  },
  [FontColorPlugin.key]: {
    id: FontColorPlugin.key,
    badges: [customizerBadges.style],
    label: 'Font Color',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'FontColorPlugin',
    route: getPluginNavItem('font').href,
  },
  [FontSizePlugin.key]: {
    id: FontSizePlugin.key,
    badges: [customizerBadges.style],
    label: 'Font Size',
    npmPackage: '@udecode/plate-font',
    pluginFactory: 'FontSizePlugin',
    route: getPluginNavItem('font').href,
  },
  [HighlightPlugin.key]: {
    id: HighlightPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'highlight-leaf',
        label: 'HighlightLeaf',
        pluginKey: 'HighlightPlugin.key',
        route: getComponentNavItem('highlight-leaf').href,
        usage: 'HighlightLeaf',
      },
    ],
    label: 'Highlight',
    npmPackage: '@udecode/plate-highlight',
    pluginFactory: 'HighlightPlugin',
    reactImport: true,
    route: getPluginNavItem('highlight').href,
  },
  [HorizontalRulePlugin.key]: {
    id: HorizontalRulePlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'hr-element',
        label: 'HrElement',
        pluginKey: 'HorizontalRulePlugin.key',
        route: getComponentNavItem('hr-element').href,
        usage: 'HrElement',
      },
    ],
    label: 'Horizontal Rule',
    npmPackage: '@udecode/plate-horizontal-rule',
    pluginFactory: 'HorizontalRulePlugin',
    reactImport: true,
    route: getPluginNavItem('horizontal-rule').href,
  },
  [ImagePlugin.key]: {
    id: ImagePlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'image-element',
        label: 'ImageElement',
        pluginKey: 'ImagePlugin.key',
        route: getComponentNavItem('image-element').href,
        usage: 'ImageElement',
      },
    ],
    label: 'Image',
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'ImagePlugin',
    reactImport: true,
    route: getPluginNavItem('media').href,
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
    route: getPluginNavItem('indent-list').href,
  },
  [IndentPlugin.key]: {
    id: IndentPlugin.key,
    badges: [customizerBadges.style],
    label: 'Indent',
    npmPackage: '@udecode/plate-indent',
    pluginFactory: 'IndentPlugin',
    pluginOptions: [`inject: { targetPlugins: ['p', 'h1', 'h2', 'h3'] },`],
    reactImport: true,
    route: getPluginNavItem('indent').href,
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
    route: getPluginNavItem('basic-marks').href,
  },
  [JuicePlugin.key]: {
    id: JuicePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Juice',
    npmPackage: '@udecode/plate-juice',
    pluginFactory: 'JuicePlugin',
    route: getPluginNavItem('docx').href,
  },
  [KbdPlugin.key]: {
    id: KbdPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'kbd-leaf',
        label: 'KbdLeaf',
        pluginKey: 'KbdPlugin.key',
        route: getComponentNavItem('kbd-leaf').href,
        usage: 'KbdLeaf',
      },
    ],
    label: 'Keyboard Input',
    npmPackage: '@udecode/plate-kbd',
    pluginFactory: 'KbdPlugin',
    reactImport: true,
    // route: getPluginNavItem('kbd').href,
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
    route: getPluginNavItem('line-height').href,
  },
  [LinkPlugin.key]: {
    id: LinkPlugin.key,
    badges: [customizerBadges.element, customizerBadges.inline],
    components: [
      {
        id: 'link-element',
        label: 'LinkElement',
        pluginKey: 'LinkPlugin.key',
        route: getComponentNavItem('link-element').href,
        usage: 'LinkElement',
      },
      {
        id: 'link-floating-toolbar',
        label: 'LinkFloatingToolbar',
        pluginOptions: [
          `render: { afterEditable: () => <LinkFloatingToolbar /> },`,
        ],
        route: getComponentNavItem('link-floating-toolbar').href,
        usage: 'LinkFloatingToolbar',
      },
    ],
    label: 'Link',
    npmPackage: '@udecode/plate-link',
    pluginFactory: 'LinkPlugin',
    reactImport: true,
    route: getPluginNavItem('link').href,
  },
  [MarkdownPlugin.key]: {
    id: MarkdownPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Deserialize MD',
    npmPackage: '@udecode/plate-markdown',
    pluginFactory: 'MarkdownPlugin',
    route: getPluginNavItem('markdown').href,
  },
  [MediaEmbedPlugin.key]: {
    id: MediaEmbedPlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'media-embed-element',
        label: 'MediaEmbedElement',
        pluginKey: 'MediaEmbedPlugin.key',
        route: getComponentNavItem('media-embed-element').href,
        usage: 'MediaEmbedElement',
      },
    ],
    label: 'Media Embed',
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'MediaEmbedPlugin',
    reactImport: true,
    route: getPluginNavItem('media').href,
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
        route: getComponentNavItem('mention-element').href,
        usage: 'MentionElement',
      },
      {
        id: 'mention-input-element',
        label: 'MentionInputElement',
        pluginImports: ['MentionInputPlugin'],
        pluginKey: 'MentionInputPlugin.key',
        route: getComponentNavItem('mention-input-element').href,
        usage: 'MentionInputElement',
      },
    ],
    label: 'Mention',
    npmPackage: '@udecode/plate-mention',
    pluginFactory: 'MentionPlugin',
    reactImport: true,
    route: getPluginNavItem('mention').href,
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
    route: getPluginNavItem('forced-layout').href,
  },
  [ParagraphPlugin.key]: {
    id: ParagraphPlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'paragraph-element',
        label: 'ParagraphElement',
        pluginKey: 'ParagraphPlugin.key',
        route: getComponentNavItem('paragraph-element').href,
        usage: 'ParagraphElement',
      },
    ],
    label: 'Paragraph',
    plateImports: ['ParagraphPlugin'],
    // npmPackage: '@udecode/plate-common',
    pluginFactory: 'ParagraphPlugin',
    reactImport: true,
    // route: getPluginNavItem('basic-nodes').href,
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
    route: getPluginNavItem('reset-node').href,
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
    route: getPluginNavItem('media').href,
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
    route: getPluginNavItem('single-line').href,
  },
  [SlashPlugin.key]: {
    id: SlashPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Slash Command',
    npmPackage: '@udecode/plate-slash-command',
    pluginFactory: 'SlashPlugin',
    route: getPluginNavItem('slash-command').href,
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
    route: getPluginNavItem('soft-break').href,
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
    route: getPluginNavItem('basic-marks').href,
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
    route: getPluginNavItem('basic-marks').href,
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
    route: getPluginNavItem('basic-marks').href,
  },
  [TabbablePlugin.key]: {
    id: TabbablePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Tabbable',
    npmPackage: '@udecode/plate-tabbable',
    pluginFactory: 'TabbablePlugin',
    reactImport: true,
    route: getPluginNavItem('tabbable').href,
  },
  [TablePlugin.key]: {
    id: TablePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'table-element',
        label: 'TableElement',
        pluginKey: 'TablePlugin.key',
        route: getComponentNavItem('table-element').href,
        usage: 'TableElement',
      },
      {
        id: 'table-row-element',
        label: 'TableRowElement',
        pluginImports: ['TableRowPlugin'],
        pluginKey: 'TableRowPlugin.key',
        route: getComponentNavItem('table-row-element').href,
        usage: 'TableRowElement',
      },
      {
        id: 'td',
        filename: 'table-cell-element',
        label: 'TableCellElement',
        pluginImports: ['TableCellPlugin'],
        pluginKey: 'TableCellPlugin.key',
        route: getComponentNavItem('table-cell-element').href,
        usage: 'TableCellElement',
      },
      {
        id: 'th',
        filename: 'table-cell-element',
        label: 'TableCellHeaderElement',
        pluginImports: ['TableCellHeaderPlugin'],
        pluginKey: 'TableCellHeaderPlugin.key',
        route: getComponentNavItem('table-cell-element').href,
        usage: 'TableCellHeaderElement',
      },
    ],
    label: 'Table',
    npmPackage: '@udecode/plate-table',
    pluginFactory: 'TablePlugin',
    reactImport: true,
    route: getPluginNavItem('table').href,
  },
  [TocPlugin.key]: {
    id: TocPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Table of Contents',
    npmPackage: '@udecode/plate-heading',
    pluginFactory: 'TocPlugin',
    route: getPluginNavItem('toc').href,
  },
  [TodoListPlugin.key]: {
    id: TodoListPlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'todo-list-element',
        label: 'TodoListElement',
        pluginKey: 'TodoListPlugin.key',
        route: getComponentNavItem('todo-list-element').href,
        usage: 'TodoListElement',
      },
    ],
    label: 'Todo List',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'TodoListPlugin',
    reactImport: true,
    route: getPluginNavItem('list').href,
  },
  [TogglePlugin.key]: {
    id: TogglePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'toggle-element',
        label: 'ToggleElement',
        pluginKey: 'TogglePlugin.key',
        route: getComponentNavItem('toggle-element').href,
        usage: 'ToggleElement',
      },
    ],
    label: 'Toggle',
    npmPackage: '@udecode/plate-toggle',
    pluginFactory: 'TogglePlugin',
    reactImport: true,
    route: getPluginNavItem('toggle').href,
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
    // route: getPluginNavItem('trailing-block').href,
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
    route: getPluginNavItem('basic-marks').href,
  },
  column: {
    id: 'column',
    badges: [customizerBadges.element],
    components: [
      {
        id: 'column-group-element',
        label: 'ColumnGroupElement',
        pluginKey: 'ColumnPlugin.key',
        route: getComponentNavItem('column-group-element').href,
        usage: 'ColumnGroupElement',
      },
      {
        id: 'column-element',
        label: 'ColumnElement',
        pluginImports: ['ColumnItemPlugin'],
        pluginKey: 'ColumnItemPlugin.key',
        route: getComponentNavItem('column-element').href,
        usage: 'ColumnElement',
      },
    ],
    label: 'Column',
    npmPackage: '@udecode/plate-layout',
    pluginFactory: 'ColumnPlugin',
    reactImport: true,
    route: getPluginNavItem('column').href,
  },
  components: {
    id: 'components',
    badges: [customizerBadges.ui],
    components: [
      {
        id: 'editor',
        import: 'Editor, EditorContainer',
        label: 'Editor',
        route: getComponentNavItem('editor').href,
        usage: 'Editor',
      },
      {
        id: 'placeholder',
        label: 'Placeholder',
        registry: 'placeholder',
        route: getComponentNavItem('placeholder').href,
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
        route: getComponentNavItem('heading-element').href,
        usage: `withProps(HeadingElement, { variant: 'h1' })`,
      },
      {
        id: 'h2',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H2Element',
        pluginKey: 'HEADING_KEYS.h2',
        route: getComponentNavItem('heading-element').href,
        usage: `withProps(HeadingElement, { variant: 'h2' })`,
      },
      {
        id: 'h3',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H3Element',
        pluginKey: 'HEADING_KEYS.h3',
        route: getComponentNavItem('heading-element').href,
        usage: `withProps(HeadingElement, { variant: 'h3' })`,
      },
      {
        id: 'h4',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H4Element',
        pluginKey: 'HEADING_KEYS.h4',
        route: getComponentNavItem('heading-element').href,
        usage: `withProps(HeadingElement, { variant: 'h4' })`,
      },
      {
        id: 'h5',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H5Element',
        pluginKey: 'HEADING_KEYS.h5',
        route: getComponentNavItem('heading-element').href,
        usage: `withProps(HeadingElement, { variant: 'h5' })`,
      },
      {
        id: 'h6',
        cnImports: ['withProps'],
        filename: 'heading-element',
        import: 'HeadingElement',
        label: 'H6Element',
        pluginKey: 'HEADING_KEYS.h6',
        route: getComponentNavItem('heading-element').href,
        usage: `withProps(HeadingElement, { variant: 'h6' })`,
      },
    ],
    customImports: [`import { HEADING_KEYS } from '@udecode/plate-heading';`],
    label: 'Heading',
    npmPackage: '@udecode/plate-heading',
    pluginFactory: 'HeadingPlugin',
    reactImport: true,
    route: getPluginNavItem('basic-elements').href,
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
        route: getComponentNavItem('list-element').href,
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
        route: getComponentNavItem('list-element').href,
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
    route: getPluginNavItem('list').href,
  },
  media_placeholder: {
    id: 'media_placeholder',
    label: 'MediaPlaceholder',
    npmPackage: '@udecode/plate-placeholder',
    pluginFactory: 'PlaceholderPlugin',
    reactImport: true,
    route: getPluginNavItem('media').href,
  },
};

export const customizerList = [
  {
    id: 'ai',
    children: [
      customizerItems[AIPlugin.key],
      customizerItems[AIChatPlugin.key],
      customizerItems[CopilotPlugin.key],
    ],
    label: 'AI',
  },
  {
    id: 'blocks',
    children: [
      customizerItems[BlockquotePlugin.key],
      customizerItems[CodeBlockPlugin.key],
      customizerItems[ExcalidrawPlugin.key],
      customizerItems[HorizontalRulePlugin.key],
      customizerItems[ImagePlugin.key],
      customizerItems[LinkPlugin.key],
      customizerItems[TogglePlugin.key],
      customizerItems.column,
      customizerItems.heading,
      customizerItems.list,
      customizerItems[MediaEmbedPlugin.key],
      customizerItems.media_placeholder,
      customizerItems[MentionPlugin.key],
      customizerItems[ParagraphPlugin.key],
      customizerItems[TablePlugin.key],
      customizerItems[TodoListPlugin.key],
      customizerItems[DatePlugin.key],
      customizerItems[TocPlugin.key],
    ],
    label: 'Nodes',
  },
  {
    id: 'marks',
    children: [
      customizerItems[BoldPlugin.key],
      customizerItems[CodePlugin.key],
      customizerItems[CommentsPlugin.key],
      customizerItems[FontBackgroundColorPlugin.key],
      customizerItems[FontColorPlugin.key],
      customizerItems[FontSizePlugin.key],
      customizerItems[HighlightPlugin.key],
      customizerItems[ItalicPlugin.key],
      customizerItems[KbdPlugin.key],
      customizerItems[StrikethroughPlugin.key],
      customizerItems[SubscriptPlugin.key],
      customizerItems[SuperscriptPlugin.key],
      customizerItems[UnderlinePlugin.key],
    ],
    label: 'Marks',
  },
  {
    id: 'style',
    children: [
      customizerItems[AlignPlugin.key],
      customizerItems[IndentPlugin.key],
      customizerItems[IndentListPlugin.key],
      customizerItems[LineHeightPlugin.key],
    ],
    label: 'Block Style',
  },
  {
    id: 'functionality',
    children: [
      customizerItems.components,
      customizerItems[AutoformatPlugin.key],
      customizerItems[BlockSelectionPlugin.key],
      customizerItems[BlockMenuPlugin.key],
      customizerItems[CaptionPlugin.key],
      customizerItems[CursorOverlayPlugin.key],
      customizerItems[DndPlugin.key],
      customizerItems[EmojiPlugin.key],
      customizerItems[ExitBreakPlugin.key],
      customizerItems[FixedToolbarPlugin.key],
      customizerItems[FloatingToolbarPlugin.key],
      customizerItems[NodeIdPlugin.key],
      customizerItems[NormalizeTypesPlugin.key],
      customizerItems[ResetNodePlugin.key],
      customizerItems[SelectOnBackspacePlugin.key],
      customizerItems[DeletePlugin.key],
      customizerItems[SingleLinePlugin.key],
      customizerItems[SoftBreakPlugin.key],
      customizerItems[TabbablePlugin.key],
      customizerItems[TrailingBlockPlugin.key],
      customizerItems[SlashPlugin.key],
    ],
    label: 'Functionality',
  },
  {
    id: 'Deserialization',
    children: [
      customizerItems[CsvPlugin.key],
      customizerItems[DocxPlugin.key],
      customizerItems[MarkdownPlugin.key],
      customizerItems[JuicePlugin.key],
    ],
    label: 'Deserialization',
  },
];

export const orderedPluginKeys = [
  ParagraphPlugin.key,
  'heading',
  BlockquotePlugin.key,
  CodeBlockPlugin,
  HorizontalRulePlugin.key,
  LinkPlugin.key,
  'list',
  ImagePlugin.key,
  MediaEmbedPlugin.key,
  PlaceholderPlugin.key,
  CaptionPlugin.key,
  MentionPlugin.key,
  TablePlugin.key,
  TodoListPlugin.key,
  ExcalidrawPlugin.key,

  // Marks
  BoldPlugin.key,
  ItalicPlugin.key,
  UnderlinePlugin.key,
  StrikethroughPlugin.key,
  CodePlugin.key,
  SubscriptPlugin.key,
  SuperscriptPlugin.key,
  FontColorPlugin.key,
  FontBackgroundColorPlugin.key,
  FontSizePlugin.key,
  HighlightPlugin.key,
  KbdPlugin.key,

  // Block Style
  AlignPlugin.key,
  IndentPlugin.key,
  IndentListPlugin.key,
  LineHeightPlugin.key,

  // Functionality
  AutoformatPlugin.key,
  BlockSelectionPlugin.key,
  DndPlugin.key,
  EmojiPlugin.key,
  ExitBreakPlugin.key,
  NodeIdPlugin.key,
  NormalizeTypesPlugin.key,
  ResetNodePlugin.key,
  SelectOnBackspacePlugin.key,
  DeletePlugin.key,
  SingleLinePlugin.key,
  SoftBreakPlugin.key,
  TabbablePlugin.key,
  TrailingBlockPlugin.key,
  CursorOverlayPlugin.key,

  // Collaboration
  CommentsPlugin.key,

  // Deserialization
  DocxPlugin.key,
  CsvPlugin.key,
  MarkdownPlugin.key,
  JuicePlugin.key,
];

import { uniqBy } from 'lodash';

export const allPlugins = customizerList.flatMap((group) => group.children);

export const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => plugin.components ?? []),
  'id'
);
