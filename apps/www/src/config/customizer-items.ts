import {
  DeletePlugin,
  NormalizeTypesPlugin,
  SelectOnBackspacePlugin,
  TrailingBlockPlugin,
} from '@udecode/plate';
import { AIChatPlugin, AIPlugin, CopilotPlugin } from '@udecode/plate-ai/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BlockquotePlugin,
  HorizontalRulePlugin,
} from '@udecode/plate-basic-elements/react';
import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  KbdPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { CommentPlugin } from '@udecode/plate-comments/react';
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
import { IndentPlugin } from '@udecode/plate-indent/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ListPlugin as ListClassicPlugin } from '@udecode/plate-list-classic/react';
import { ListPlugin } from '@udecode/plate-list/react';
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
import {
  BlockMenuPlugin,
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TocPlugin } from '@udecode/plate-toc/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import {
  ExitBreakPlugin,
  ParagraphPlugin,
  ResetNodePlugin,
  SingleLinePlugin,
  SoftBreakPlugin,
} from '@udecode/plate/react';

import { getComponentNavItem, getPluginNavItem } from '@/config/docs';

export type CustomizerBadge = {
  label: string;
};

export type SettingPlugin = {
  id: string;
  badges?: CustomizerBadge[];
  cnImports?: string[];
  components?: {
    id: string; // e.g. 'blockquote-node'
    label: string; // e.g. 'Blockquote'
    usage: string; // e.g. 'BlockquoteElement'
    cnImports?: string[];
    customImports?: string[];
    filename?: string; // e.g. 'blockquote-node' (default: id)
    import?: string;
    noImport?: boolean;
    plateImports?: string[];
    pluginImports?: string[];
    pluginKey?: string; // Plugin components only, e.g. 'BlockquotePlugin.key'
    pluginOptions?: string[];
    registry?: string;
    route?: string;
  }[];
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

export const customizerBadges = {
  element: {
    description: '',
    label: 'Element',
  },
  handler: {
    label: 'Handler',
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
        id: 'ai-node',
        label: 'AILeaf',
        pluginKey: 'AIPlugin.key',
        route: getComponentNavItem('ai-node').href,
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
  [BlockquotePlugin.key]: {
    id: BlockquotePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'blockquote-node',
        label: 'BlockquoteElement',
        pluginKey: 'BlockquotePlugin.key',
        route: getComponentNavItem('blockquote-node').href,
        usage: 'BlockquoteElement',
      },
    ],
    label: 'Blockquote',
    npmPackage: '@udecode/plate-basic-elements',
    pluginFactory: 'BlockquotePlugin',
    reactImport: true,
    route: getPluginNavItem('basic-elements').href,
  },
  [BlockSelectionPlugin.key]: {
    id: BlockSelectionPlugin.key,
    badges: [customizerBadges.ui],
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
  [BoldPlugin.key]: {
    id: BoldPlugin.key,
    badges: [customizerBadges.leaf],
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
        id: 'code-block-node',
        label: 'CodeBlockElement',
        pluginKey: 'CodeBlockPlugin.key',
        route: getComponentNavItem('code-block-node').href,
        usage: 'CodeBlockElement',
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
        id: 'code-node',
        label: 'CodeLeaf',
        pluginKey: 'CodePlugin.key',
        route: getComponentNavItem('code-node').href,
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
  column: {
    id: 'column',
    badges: [customizerBadges.element],
    components: [
      {
        id: 'column-node',
        label: 'ColumnElement',
        pluginImports: ['ColumnItemPlugin'],
        pluginKey: 'ColumnItemPlugin.key',
        route: getComponentNavItem('column-node').href,
        usage: 'ColumnElement',
      },
    ],
    label: 'Column',
    npmPackage: '@udecode/plate-layout',
    pluginFactory: 'ColumnPlugin',
    reactImport: true,
    route: getPluginNavItem('column').href,
  },
  [CommentPlugin.key]: {
    id: CommentPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'comment-node',
        label: 'CommentLeaf',
        pluginKey: 'CommentPlugin.key',
        route: getComponentNavItem('comment-node').href,
        usage: 'CommentLeaf',
      },
      // TODO: block-discussion
    ],
    label: 'Comments',
    npmPackage: '@udecode/plate-comments',
    pluginFactory: 'CommentPlugin',
    reactImport: true,
    route: getPluginNavItem('comments').href,
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
    ],
    label: 'Components',
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
        id: 'date-node',
        label: 'DateElement',
        pluginKey: 'DatePlugin.key',
        route: getComponentNavItem('date-node').href,
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
    npmPackage: '@udecode/plate',
    pluginFactory: 'DeletePlugin',
    route: getPluginNavItem('select').href,
  },
  [DndPlugin.key]: {
    id: DndPlugin.key,
    badges: [customizerBadges.handler, customizerBadges.ui],
    customImports: [
      `import { DndProvider } from 'react-dnd';`,
      `import { HTML5Backend } from 'react-dnd-html5-backend';`,
    ],
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
        id: 'emoji-node',
        label: 'EmojiInputElement',
        route: getComponentNavItem('emoji-node').href,
        usage: 'EmojiInputElement',
      },
    ],
    label: 'Emoji',
    npmPackage: '@udecode/plate-emoji @emoji-mart/data',
    pluginFactory: 'EmojiPlugin',
    reactImport: true,
    route: getPluginNavItem('emoji').href,
  },
  [EquationPlugin.key]: {
    id: EquationPlugin.key,
    label: 'Equation',
    npmPackage: '@udecode/plate-math',
    pluginFactory: 'EquationPlugin',
    route: getPluginNavItem('equation').href,
  },
  [ExcalidrawPlugin.key]: {
    id: ExcalidrawPlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'excalidraw-node',
        label: 'ExcalidrawElement',
        pluginKey: 'ExcalidrawPlugin.key',
        route: getComponentNavItem('excalidraw-node').href,
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
    npmPackage: '@udecode/plate',
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
  ['fixed-toolbar']: {
    id: 'fixed-toolbar',
    badges: [customizerBadges.handler, customizerBadges.ui],
    customImports: [
      `import { FixedToolbarKit } from '@/components/editor/plugins/fixed-toolbar-kit';`,
    ],
    label: 'Fixed Toolbar',
    pluginFactory: 'FixedToolbarKit',
    reactImport: true,
    // route: getPluginNavItem('fixed-toolbar').href,
  },
  ['floating-toolbar']: {
    id: 'floating-toolbar',
    badges: [customizerBadges.handler, customizerBadges.ui],
    customImports: [
      `import { FloatingToolbarKit } from '@/components/editor/plugins/floating-toolbar-kit';`,
    ],
    label: 'Floating Toolbar',
    pluginFactory: 'FloatingToolbarKit',
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
  heading: {
    id: 'heading',
    badges: [customizerBadges.element],
    components: [
      {
        id: 'h1',
        cnImports: ['withProps'],
        filename: 'heading-node',
        import: 'H1Element',
        label: 'H1Element',
        pluginKey: 'h1',
        route: getComponentNavItem('heading-node').href,
        usage: `H1Element`,
      },
      {
        id: 'h2',
        cnImports: ['withProps'],
        filename: 'heading-node',
        import: 'H2Element',
        label: 'H2Element',
        pluginKey: 'h2',
        route: getComponentNavItem('heading-node').href,
        usage: `H2Element`,
      },
      {
        id: 'h3',
        cnImports: ['withProps'],
        filename: 'heading-node',
        import: 'H3Element',
        label: 'H3Element',
        pluginKey: 'h3',
        route: getComponentNavItem('heading-node').href,
        usage: `H3Element`,
      },
      {
        id: 'h4',
        cnImports: ['withProps'],
        filename: 'heading-node',
        import: 'H4Element',
        label: 'H4Element',
        pluginKey: 'h4',
        route: getComponentNavItem('heading-node').href,
        usage: `H4Element`,
      },
      {
        id: 'h5',
        cnImports: ['withProps'],
        filename: 'heading-node',
        import: 'H5Element',
        label: 'H5Element',
        pluginKey: 'h5',
        route: getComponentNavItem('heading-node').href,
        usage: `H5Element`,
      },
      {
        id: 'h6',
        cnImports: ['withProps'],
        filename: 'heading-node',
        import: 'H6Element',
        label: 'H6Element',
        pluginKey: 'h6',
        route: getComponentNavItem('heading-node').href,
        usage: `H6Element`,
      },
    ],
    customImports: [`import { KEYS } from '@udecode/plate';`],
    label: 'Heading',
    npmPackage: '@udecode/plate-basic-elements',
    pluginFactory: 'HeadingPlugin',
    reactImport: true,
    route: getPluginNavItem('basic-elements').href,
  },
  [HighlightPlugin.key]: {
    id: HighlightPlugin.key,
    badges: [customizerBadges.leaf],
    components: [
      {
        id: 'highlight-node',
        label: 'HighlightLeaf',
        pluginKey: 'HighlightPlugin.key',
        route: getComponentNavItem('highlight-node').href,
        usage: 'HighlightLeaf',
      },
    ],
    label: 'Highlight',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'HighlightPlugin',
    reactImport: true,
    route: getPluginNavItem('highlight').href,
  },
  [HorizontalRulePlugin.key]: {
    id: HorizontalRulePlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'hr-node',
        label: 'HrElement',
        pluginKey: 'HorizontalRulePlugin.key',
        route: getComponentNavItem('hr-node').href,
        usage: 'HrElement',
      },
    ],
    label: 'Horizontal Rule',
    npmPackage: '@udecode/plate-basic-elements',
    pluginFactory: 'HorizontalRulePlugin',
    reactImport: true,
    route: getPluginNavItem('horizontal-rule').href,
  },
  [ImagePlugin.key]: {
    id: ImagePlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'media-image-node',
        label: 'ImageElement',
        pluginKey: 'ImagePlugin.key',
        route: getComponentNavItem('media-image-node').href,
        usage: 'ImageElement',
      },
    ],
    label: 'Image',
    npmPackage: '@udecode/plate-media',
    pluginFactory: 'ImagePlugin',
    reactImport: true,
    route: getPluginNavItem('media').href,
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
        id: 'kbd-node',
        label: 'KbdLeaf',
        pluginKey: 'KbdPlugin.key',
        route: getComponentNavItem('kbd-node').href,
        usage: 'KbdLeaf',
      },
    ],
    label: 'Keyboard Input',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'KbdPlugin',
    reactImport: true,
    route: getPluginNavItem('kbd').href,
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
        id: 'link-node',
        label: 'LinkElement',
        pluginKey: 'LinkPlugin.key',
        route: getComponentNavItem('link-node').href,
        usage: 'LinkElement',
      },
      {
        id: 'link-toolbar',
        label: 'LinkFloatingToolbar',
        pluginOptions: [
          `render: { afterEditable: () => <LinkFloatingToolbar /> },`,
        ],
        route: getComponentNavItem('link-toolbar').href,
        usage: 'LinkFloatingToolbar',
      },
    ],
    label: 'Link',
    npmPackage: '@udecode/plate-link',
    pluginFactory: 'LinkPlugin',
    reactImport: true,
    route: getPluginNavItem('link').href,
  },
  listClassic: {
    id: 'listClassic',
    badges: [customizerBadges.element],
    components: [
      {
        id: 'ul',
        cnImports: ['withProps'],
        filename: 'list-classic-node',
        import: 'ListElement',
        label: 'BulletedListElement',
        pluginImports: ['BulletedListPlugin'],
        pluginKey: 'BulletedListPlugin.key',
        route: getComponentNavItem('list-classic-node').href,
        usage: `withProps(ListElement, { variant: 'ul' })`,
      },
      {
        id: 'ol',
        cnImports: ['withProps'],
        filename: 'list-classic-node',
        import: 'ListElement',
        label: 'NumberedListElement',
        noImport: true,
        pluginImports: ['NumberedListPlugin'],
        pluginKey: 'NumberedListPlugin.key',
        route: getComponentNavItem('list-classic-node').href,
        usage: `withProps(ListElement, { variant: 'ol' })`,
      },
    ],
    conflicts: [ListPlugin.key],
    label: 'List',
    npmPackage: '@udecode/plate-list-classic',
    pluginFactory: 'ListPlugin',
    reactImport: true,
    route: getPluginNavItem('list').href,
  },
  [ListPlugin.key]: {
    id: ListPlugin.key,
    badges: [customizerBadges.style],
    conflicts: ['list'],
    dependencies: [IndentPlugin.key],
    label: 'List',
    npmPackage: '@udecode/plate-list',
    pluginFactory: 'ListPlugin',
    pluginOptions: [`inject: { targetPlugins: ['p', 'h1', 'h2', 'h3'] },`],
    reactImport: true,
    route: getPluginNavItem('list').href,
  },

  [MarkdownPlugin.key]: {
    id: MarkdownPlugin.key,
    badges: [customizerBadges.handler],
    label: 'Deserialize MD',
    npmPackage: '@udecode/plate-markdown',
    pluginFactory: 'MarkdownPlugin',
    route: getPluginNavItem('markdown').href,
  },
  media_placeholder: {
    id: 'media_placeholder',
    label: 'MediaPlaceholder',
    npmPackage: '@udecode/plate-placeholder',
    pluginFactory: 'PlaceholderPlugin',
    reactImport: true,
    route: getPluginNavItem('media').href,
  },
  [MediaEmbedPlugin.key]: {
    id: MediaEmbedPlugin.key,
    badges: [customizerBadges.element, customizerBadges.void],
    components: [
      {
        id: 'media-embed-node',
        label: 'MediaEmbedElement',
        pluginKey: 'MediaEmbedPlugin.key',
        route: getComponentNavItem('media-embed-node').href,
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
        id: 'mention-node',
        label: 'MentionElement',
        pluginKey: 'MentionPlugin.key',
        route: getComponentNavItem('mention-node').href,
        usage: 'MentionElement',
      },
    ],
    label: 'Mention',
    npmPackage: '@udecode/plate-mention',
    pluginFactory: 'MentionPlugin',
    reactImport: true,
    route: getPluginNavItem('mention').href,
  },
  [NormalizeTypesPlugin.key]: {
    id: NormalizeTypesPlugin.key,
    badges: [customizerBadges.normalizer],
    label: 'Normalize Types',
    npmPackage: '@udecode/plate',
    pluginFactory: 'NormalizeTypesPlugin',
    route: getPluginNavItem('forced-layout').href,
  },
  [ParagraphPlugin.key]: {
    id: ParagraphPlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'paragraph-node',
        label: 'ParagraphElement',
        pluginKey: 'ParagraphPlugin.key',
        route: getComponentNavItem('paragraph-node').href,
        usage: 'ParagraphElement',
      },
    ],
    label: 'Paragraph',
    plateImports: ['ParagraphPlugin'],
    // npmPackage: '@udecode/plate',
    pluginFactory: 'ParagraphPlugin',
    reactImport: true,
    // route: getPluginNavItem('basic-nodes').href,
  },
  [ResetNodePlugin.key]: {
    id: ResetNodePlugin.key,
    badges: [customizerBadges.handler],
    label: 'Reset Node',
    npmPackage: '@udecode/plate',
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
    npmPackage: '@udecode/plate',
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
    route: getPluginNavItem('select').href,
  },
  [SingleLinePlugin.key]: {
    id: SingleLinePlugin.key,
    badges: [customizerBadges.normalizer],
    conflicts: [TrailingBlockPlugin.key],
    disablePlugins: [TrailingBlockPlugin.key],
    label: 'Single Line',
    npmPackage: '@udecode/plate',
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
    npmPackage: '@udecode/plate',
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
    label: 'Strikethrough',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'StrikethroughPlugin',
    reactImport: true,
    route: getPluginNavItem('basic-marks').href,
  },
  [SubscriptPlugin.key]: {
    id: SubscriptPlugin.key,
    badges: [customizerBadges.leaf],
    label: 'Subscript',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'SubscriptPlugin',
    reactImport: true,
    route: getPluginNavItem('basic-marks').href,
  },
  [SuperscriptPlugin.key]: {
    id: SuperscriptPlugin.key,
    badges: [customizerBadges.leaf],
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
        id: 'table-node',
        label: 'TableElement',
        pluginKey: 'TablePlugin.key',
        route: getComponentNavItem('table-node').href,
        usage: 'TableElement',
      },
      {
        id: 'table-node',
        label: 'TableRowElement',
        pluginImports: ['TableRowPlugin'],
        pluginKey: 'TableRowPlugin.key',
        route: getComponentNavItem('table-node').href,
        usage: 'TableRowElement',
      },
      {
        id: 'td',
        filename: 'table-node',
        label: 'TableCellElement',
        pluginImports: ['TableCellPlugin'],
        pluginKey: 'TableCellPlugin.key',
        route: getComponentNavItem('table-node').href,
        usage: 'TableCellElement',
      },
      {
        id: 'th',
        filename: 'table-node',
        label: 'TableCellHeaderElement',
        pluginImports: ['TableCellHeaderPlugin'],
        pluginKey: 'TableCellHeaderPlugin.key',
        route: getComponentNavItem('table-node').href,
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
    npmPackage: '@udecode/plate-toc',
    pluginFactory: 'TocPlugin',
    route: getPluginNavItem('toc').href,
  },
  [TogglePlugin.key]: {
    id: TogglePlugin.key,
    badges: [customizerBadges.element],
    components: [
      {
        id: 'toggle-node',
        label: 'ToggleElement',
        pluginKey: 'TogglePlugin.key',
        route: getComponentNavItem('toggle-node').href,
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
    npmPackage: '@udecode/plate',
    pluginFactory: 'TrailingBlockPlugin',
    pluginOptions: [`options: { type: 'p' },`],
    route: getPluginNavItem('trailing-block').href,
  },
  [UnderlinePlugin.key]: {
    id: UnderlinePlugin.key,
    badges: [customizerBadges.leaf],
    label: 'Underline',
    npmPackage: '@udecode/plate-basic-marks',
    pluginFactory: 'UnderlinePlugin',
    reactImport: true,
    route: getPluginNavItem('basic-marks').href,
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
      customizerItems.listClassic,
      customizerItems[MediaEmbedPlugin.key],
      customizerItems.media_placeholder,
      customizerItems[MentionPlugin.key],
      customizerItems[ParagraphPlugin.key],
      customizerItems[TablePlugin.key],
      customizerItems[DatePlugin.key],
      customizerItems[TocPlugin.key],
      customizerItems[EquationPlugin.key],
    ],
    label: 'Nodes',
  },
  {
    id: 'marks',
    children: [
      customizerItems[BoldPlugin.key],
      customizerItems[CodePlugin.key],
      customizerItems[CommentPlugin.key],
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
      customizerItems[ListPlugin.key],
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
      customizerItems['fixed-toolbar'],
      customizerItems['floating-toolbar'],
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
  ListClassicPlugin.key,
  ImagePlugin.key,
  MediaEmbedPlugin.key,
  PlaceholderPlugin.key,
  CaptionPlugin.key,
  MentionPlugin.key,
  TablePlugin.key,
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
  ListPlugin.key,
  LineHeightPlugin.key,

  // Functionality
  AutoformatPlugin.key,
  BlockSelectionPlugin.key,
  DndPlugin.key,
  EmojiPlugin.key,
  ExitBreakPlugin.key,
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
  CommentPlugin.key,

  // Deserialization
  DocxPlugin.key,
  CsvPlugin.key,
  MarkdownPlugin.key,
  JuicePlugin.key,
];

import { EquationPlugin } from '@udecode/plate-math/react';
import { uniqBy } from 'lodash';

export const allPlugins = customizerList.flatMap((group) => group.children);

export const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => {
    return plugin.components ?? [];
  }),
  'id'
);
