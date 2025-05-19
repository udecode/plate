'use client';

import type { Value } from '@udecode/plate';

import { withProps } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
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
import { CalloutPlugin } from '@udecode/plate-callout/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { EmojiInputPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  MentionInputPlugin,
  MentionPlugin,
} from '@udecode/plate-mention/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import {
  type CreatePlateEditorOptions,
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate/react';

import { copilotPlugins } from '@/registry/components/editor/plugins/copilot-plugins';
import { editorPlugins } from '@/registry/components/editor/plugins/editor-plugins';
import { FixedToolbarPlugin } from '@/registry/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/registry/components/editor/plugins/floating-toolbar-plugin';
import { AILeaf } from '@/registry/ui/ai-node';
import { withPlaceholders } from '@/registry/ui/block-placeholder';
import { BlockquoteElement } from '@/registry/ui/blockquote-node';
import { CalloutElement } from '@/registry/ui/callout-node';
import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '@/registry/ui/code-block-node';
import { CodeLeaf } from '@/registry/ui/code-node';
import { ColumnElement, ColumnGroupElement } from '@/registry/ui/column-node';
import { CommentLeaf } from '@/registry/ui/comment-node';
import { DateElement } from '@/registry/ui/date-node';
import { EmojiInputElement } from '@/registry/ui/emoji-input-node';
import {
  EquationElement,
  InlineEquationElement,
} from '@/registry/ui/equation-node';
import { ExcalidrawElement } from '@/registry/ui/excalidraw-node';
import { HeadingElement } from '@/registry/ui/heading-node';
import { HighlightLeaf } from '@/registry/ui/highlight-node';
import { HrElement } from '@/registry/ui/hr-node';
import { KbdLeaf } from '@/registry/ui/kbd-node';
import { LinkElement } from '@/registry/ui/link-node';
import { AudioElement } from '@/registry/ui/media-audio-node';
import { MediaEmbedElement } from '@/registry/ui/media-embed-node';
import { FileElement } from '@/registry/ui/media-file-node';
import { ImageElement } from '@/registry/ui/media-image-node';
import { MediaPlaceholderElement } from '@/registry/ui/media-placeholder-node';
import { VideoElement } from '@/registry/ui/media-video-node';
import { MentionInputElement } from '@/registry/ui/mention-input-node';
import { MentionElement } from '@/registry/ui/mention-node';
import { ParagraphElement } from '@/registry/ui/paragraph-node';
import { SlashInputElement } from '@/registry/ui/slash-input-node';
import { SuggestionLeaf } from '@/registry/ui/suggestion-node';
import {
  TableCellElement,
  TableCellHeaderElement,
  TableElement,
  TableRowElement,
} from '@/registry/ui/table-node';
import { TocElement } from '@/registry/ui/toc-node';
import { ToggleElement } from '@/registry/ui/toggle-node';

export const viewComponents = {
  [AudioPlugin.key]: AudioElement,
  [BlockquotePlugin.key]: BlockquoteElement,
  [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
  [CalloutPlugin.key]: CalloutElement,
  [CodeBlockPlugin.key]: CodeBlockElement,
  [CodeLinePlugin.key]: CodeLineElement,
  [CodePlugin.key]: CodeLeaf,
  [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
  [ColumnItemPlugin.key]: ColumnElement,
  [ColumnPlugin.key]: ColumnGroupElement,
  [CommentsPlugin.key]: CommentLeaf,
  [DatePlugin.key]: DateElement,
  [EquationPlugin.key]: EquationElement,
  [ExcalidrawPlugin.key]: ExcalidrawElement,
  [FilePlugin.key]: FileElement,
  h1: withProps(HeadingElement, { variant: 'h1' }),
  h2: withProps(HeadingElement, { variant: 'h2' }),
  h3: withProps(HeadingElement, { variant: 'h3' }),
  h4: withProps(HeadingElement, { variant: 'h4' }),
  h5: withProps(HeadingElement, { variant: 'h5' }),
  h6: withProps(HeadingElement, { variant: 'h6' }),
  [HighlightPlugin.key]: HighlightLeaf,
  [HorizontalRulePlugin.key]: HrElement,
  [ImagePlugin.key]: ImageElement,
  [InlineEquationPlugin.key]: InlineEquationElement,
  [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
  [KbdPlugin.key]: KbdLeaf,
  [LinkPlugin.key]: LinkElement,
  [MediaEmbedPlugin.key]: MediaEmbedElement,
  [MentionPlugin.key]: MentionElement,
  [ParagraphPlugin.key]: ParagraphElement,
  [PlaceholderPlugin.key]: MediaPlaceholderElement,
  [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
  [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
  [SuggestionPlugin.key]: SuggestionLeaf,
  [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
  [TableCellHeaderPlugin.key]: TableCellHeaderElement,
  [TableCellPlugin.key]: TableCellElement,
  [TablePlugin.key]: TableElement,
  [TableRowPlugin.key]: TableRowElement,
  [TocPlugin.key]: TocElement,
  [TogglePlugin.key]: ToggleElement,
  [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
  [VideoPlugin.key]: VideoElement,
};

export const editorComponents = {
  ...viewComponents,
  [AIPlugin.key]: AILeaf,
  [EmojiInputPlugin.key]: EmojiInputElement,
  [MentionInputPlugin.key]: MentionInputElement,
  [SlashInputPlugin.key]: SlashInputElement,
};

export const useCreateEditor = (
  {
    components,
    override,
    placeholders,
    readOnly,
    ...options
  }: {
    components?: Record<string, any>;
    placeholders?: boolean;
    plugins?: any[];
    readOnly?: boolean;
  } & Omit<CreatePlateEditorOptions, 'plugins'> = {},
  deps: any[] = []
) => {
  return usePlateEditor<Value, (typeof editorPlugins)[number]>(
    {
      override: {
        components: {
          ...(readOnly
            ? viewComponents
            : placeholders
              ? withPlaceholders(editorComponents)
              : editorComponents),
          ...components,
        },
        ...override,
      },
      plugins: [
        ...copilotPlugins,
        ...editorPlugins,
        FixedToolbarPlugin,
        FloatingToolbarPlugin,
      ],
      value: [
        {
          children: [{ text: 'Playground' }],
          type: 'h1',
        },
        {
          children: [
            { text: 'A rich-text editor with AI capabilities. Try the ' },
            { bold: true, text: 'AI commands' },
            { text: ' or use ' },
            { kbd: true, text: 'Cmd+J' },
            { text: ' to open the AI menu.' },
          ],
          type: 'p',
        },
      ],
      ...options,
    },
    deps
  );
};
