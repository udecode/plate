'use client';

import { withProps } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
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
import {
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { EmojiInputPlugin } from '@udecode/plate-emoji/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
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
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';

import { AILeaf } from '@/components/potion-ui/ai-leaf';
import { BlockquoteElement } from '@/components/potion-ui/blockquote-element';
import { CalloutElement } from '@/components/potion-ui/callout-element';
import { CodeBlockElement } from '@/components/potion-ui/code-block-element';
import { CodeLeaf } from '@/components/potion-ui/code-leaf';
import { CodeLineElement } from '@/components/potion-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/components/potion-ui/code-syntax-leaf';
import { ColumnElement } from '@/components/potion-ui/column-element';
import { ColumnGroupElement } from '@/components/potion-ui/column-group-element';
import { CommentLeaf } from '@/components/potion-ui/comment-leaf';
import { DateElement } from '@/components/potion-ui/date-element';
import { EmojiInputElement } from '@/components/potion-ui/emoji-input-element';
import { EquationElement } from '@/components/potion-ui/equation-element';
import { HeadingElement } from '@/components/potion-ui/heading-element';
import { HrElement } from '@/components/potion-ui/hr-element';
import { ImageElement } from '@/components/potion-ui/image-element';
import { InlineEquationElement } from '@/components/potion-ui/inline-equation-element';
import { LinkElement } from '@/components/potion-ui/link-element';
import { MediaAudioElement } from '@/components/potion-ui/media-audio-element';
import { MediaEmbedElement } from '@/components/potion-ui/media-embed-element';
import { MediaFileElement } from '@/components/potion-ui/media-file-element';
import { MediaPlaceholderElement } from '@/components/potion-ui/media-placeholder-element';
import { MediaVideoElement } from '@/components/potion-ui/media-video-element';
import { MentionElement } from '@/components/potion-ui/mention-element';
import { MentionInputElement } from '@/components/potion-ui/mention-input-element';
import { ParagraphElement } from '@/components/potion-ui/paragraph-element';
import { withPlaceholders } from '@/components/potion-ui/placeholder';
import { SlashInputElement } from '@/components/potion-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/components/potion-ui/table-cell-element';
import { TableElement } from '@/components/potion-ui/table-element';
import { TableRowElement } from '@/components/potion-ui/table-row-element';
import { TocElement } from '@/components/potion-ui/toc-element';
import { ToggleElement } from '@/components/potion-ui/toggle-element';
import { withDraggables } from '@/components/potion-ui/with-draggables';

import { editorPlugins } from './plugins/editor-plugins';

export const useCreateEditor = ({
  components,
  plugins = editorPlugins,
  value,
}: {
  components?: Record<string, React.ComponentType>;
} & Parameters<typeof usePlateEditor>[0] = {}) => {
  return usePlateEditor({
    override: {
      components: withPlaceholders(
        withDraggables({
          [AIPlugin.key]: AILeaf,
          [AudioPlugin.key]: MediaAudioElement,
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
          [EmojiInputPlugin.key]: EmojiInputElement,
          [EquationPlugin.key]: EquationElement,
          [FilePlugin.key]: MediaFileElement,
          [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
          [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
          [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
          [HorizontalRulePlugin.key]: HrElement,
          [ImagePlugin.key]: ImageElement,
          [InlineEquationPlugin.key]: InlineEquationElement,
          [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
          [LinkPlugin.key]: LinkElement,
          [MediaEmbedPlugin.key]: MediaEmbedElement,
          [MentionInputPlugin.key]: MentionInputElement,
          [MentionPlugin.key]: MentionElement,
          [ParagraphPlugin.key]: ParagraphElement,
          [PlaceholderPlugin.key]: MediaPlaceholderElement,
          [SlashInputPlugin.key]: SlashInputElement,
          [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
          [TableCellHeaderPlugin.key]: TableCellHeaderElement,
          [TableCellPlugin.key]: TableCellElement,
          [TablePlugin.key]: TableElement,
          [TableRowPlugin.key]: TableRowElement,
          [TocPlugin.key]: TocElement,
          [TogglePlugin.key]: ToggleElement,
          [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
          [VideoPlugin.key]: MediaVideoElement,
          ...components,
        })
      ),
    },
    plugins,
    value,
  });
};
