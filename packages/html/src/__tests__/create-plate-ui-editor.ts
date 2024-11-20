import type { AnyPluginConfig, Value } from '@udecode/plate-common';

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
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  createPlateEditor,
} from '@udecode/plate-common/react';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { PlateElement, PlateLeaf } from '@udecode/plate-common/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { FindReplacePlugin } from '@udecode/plate-find-replace';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { MentionInputPlugin } from '@udecode/plate-mention/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
// @ts-nocheck
import { AILeaf } from 'www/src/registry/default/plate-ui/ai-leaf';
// @ts-nocheck
import { BlockquoteElement } from 'www/src/registry/default/plate-ui/blockquote-element';
// @ts-nocheck
import { CodeBlockElement } from 'www/src/registry/default/plate-ui/code-block-element';
// @ts-nocheck
import { CodeLeaf } from 'www/src/registry/default/plate-ui/code-leaf';
// @ts-nocheck
import { CodeLineElement } from 'www/src/registry/default/plate-ui/code-line-element';
// @ts-nocheck
import { CodeSyntaxLeaf } from 'www/src/registry/default/plate-ui/code-syntax-leaf';
// @ts-nocheck
import { ColumnElement } from 'www/src/registry/default/plate-ui/column-element';
// @ts-nocheck
import { ColumnGroupElement } from 'www/src/registry/default/plate-ui/column-group-element';
// @ts-nocheck
import { CommentLeaf } from 'www/src/registry/default/plate-ui/comment-leaf';
// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import { ExcalidrawElement } from 'www/src/registry/default/plate-ui/excalidraw-element';
// @ts-nocheck
import { HeadingElement } from 'www/src/registry/default/plate-ui/heading-element';
// @ts-nocheck
import { HighlightLeaf } from 'www/src/registry/default/plate-ui/highlight-leaf';
// @ts-nocheck
import { HrElement } from 'www/src/registry/default/plate-ui/hr-element';
// @ts-nocheck
import { ImageElement } from 'www/src/registry/default/plate-ui/image-element';
// @ts-nocheck
import { KbdLeaf } from 'www/src/registry/default/plate-ui/kbd-leaf';
// @ts-nocheck
import { LinkElement } from 'www/src/registry/default/plate-ui/link-element';
// @ts-nocheck
import { ListElement } from 'www/src/registry/default/plate-ui/list-element';
// @ts-nocheck
import { MediaAudioElement } from 'www/src/registry/default/plate-ui/media-audio-element';
// @ts-nocheck
import { MediaEmbedElement } from 'www/src/registry/default/plate-ui/media-embed-element';
// @ts-nocheck
import { MediaFileElement } from 'www/src/registry/default/plate-ui/media-file-element';
// @ts-nocheck
// @ts-nocheck
import { MediaVideoElement } from 'www/src/registry/default/plate-ui/media-video-element';
// @ts-nocheck
// @ts-nocheck
import { MentionInputElement } from 'www/src/registry/default/plate-ui/mention-input-element';
// @ts-nocheck
import { ParagraphElement } from 'www/src/registry/default/plate-ui/paragraph-element';
// @ts-nocheck
import { SearchHighlightLeaf } from 'www/src/registry/default/plate-ui/search-highlight-leaf';
// @ts-nocheck
// @ts-nocheck
import {
  TableCellElement,
  TableCellHeaderElement,
} from 'www/src/registry/default/plate-ui/table-cell-element';
// @ts-nocheck
import { TableElement } from 'www/src/registry/default/plate-ui/table-element';
// @ts-nocheck
import { TableRowElement } from 'www/src/registry/default/plate-ui/table-row-element';
// @ts-nocheck
// @ts-nocheck
import { TodoListElement } from 'www/src/registry/default/plate-ui/todo-list-element';
// @ts-nocheck

/** Create a plate editor with default UI. */
export const createPlateUIEditor = <
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>({ override, ...options }: CreatePlateEditorOptions<V, P> = {}) =>
  createPlateEditor<V, P>({
    ...options,
    override: {
      components: {
        [AIPlugin.key]: AILeaf,
        [AudioPlugin.key]: MediaAudioElement,
        [BlockquotePlugin.key]: BlockquoteElement,
        [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
        [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
        [CodeBlockPlugin.key]: CodeBlockElement,
        [CodeLinePlugin.key]: CodeLineElement,
        [CodePlugin.key]: CodeLeaf,
        [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
        [ColumnItemPlugin.key]: ColumnElement,
        [ColumnPlugin.key]: ColumnGroupElement,
        [CommentsPlugin.key]: CommentLeaf,
        // [DatePlugin.key]: DateElement,
        // [EmojiInputPlugin.key]: EmojiInputElement,
        [ExcalidrawPlugin.key]: ExcalidrawElement,
        [FilePlugin.key]: MediaFileElement,
        [FindReplacePlugin.key]: SearchHighlightLeaf,
        [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
        [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
        [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
        [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
        [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
        [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
        [HighlightPlugin.key]: HighlightLeaf,
        [HorizontalRulePlugin.key]: HrElement,
        [ImagePlugin.key]: ImageElement,
        [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
        [KbdPlugin.key]: KbdLeaf,
        [LinkPlugin.key]: LinkElement,
        [ListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
        [MediaEmbedPlugin.key]: MediaEmbedElement,
        [MentionInputPlugin.key]: MentionInputElement,
        // [MentionPlugin.key]: MentionElement,
        [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
        [ParagraphPlugin.key]: ParagraphElement,
        // [PlaceholderPlugin.key]: MediaPlaceholderElement,
        // [SlashInputPlugin.key]: SlashInputElement,
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
        [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
        [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
        [TableCellHeaderPlugin.key]: TableCellHeaderElement,
        [TableCellPlugin.key]: TableCellElement,
        [TablePlugin.key]: TableElement,
        [TableRowPlugin.key]: TableRowElement,
        // [TocPlugin.key]: TocElement,
        [TodoListPlugin.key]: TodoListElement,
        // [TogglePlugin.key]: ToggleElement,
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
        [VideoPlugin.key]: MediaVideoElement,
        ...override?.components,
      },
    },
  });
