import { KEYS, type Value } from '@udecode/plate';

import { withProps } from '@udecode/cn';
import { BaseAlignPlugin } from '@udecode/plate-alignment';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
} from '@udecode/plate-basic-marks';
import { BaseItalicPlugin } from '@udecode/plate-basic-marks';
import {
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@udecode/plate-code-block';
import { BaseCommentsPlugin } from '@udecode/plate-comments';
import { BaseDatePlugin } from '@udecode/plate-date';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-font';
import {
  BaseHeadingPlugin,
  BaseTocPlugin,
  HEADING_LEVELS,
} from '@udecode/plate-heading';
import { BaseHighlightPlugin } from '@udecode/plate-highlight';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseListPlugin } from '@udecode/plate-list';
import { BaseKbdPlugin } from '@udecode/plate-kbd';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLineHeightPlugin } from '@udecode/plate-line-height';
import { BaseLinkPlugin } from '@udecode/plate-link';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from '@udecode/plate-math';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '@udecode/plate-media';
import { BaseMentionPlugin } from '@udecode/plate-mention';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@udecode/plate-table';
import { BaseTogglePlugin } from '@udecode/plate-toggle';
import { BlockquoteElementStatic } from 'www/src/registry/ui/blockquote-node-static';
import {
  CodeBlockElementStatic,
  CodeLineElementStatic,
  CodeSyntaxLeafStatic,
} from 'www/src/registry/ui/code-block-node-static';
import { CodeLeafStatic } from 'www/src/registry/ui/code-node-static';
import {
  ColumnElementStatic,
  ColumnGroupElementStatic,
} from 'www/src/registry/ui/column-node-static';
import { CommentLeafStatic } from 'www/src/registry/ui/comment-node-static';
import { DateElementStatic } from 'www/src/registry/ui/date-node-static';
import {
  EquationElementStatic,
  InlineEquationElementStatic,
} from 'www/src/registry/ui/equation-node-static';
import { HeadingElementStatic } from 'www/src/registry/ui/heading-node-static';
import { HrElementStatic } from 'www/src/registry/ui/hr-node-static';
import { ImageElementStatic } from 'www/src/registry/ui/media-image-node-static';
import { FireLiComponent, FireMarker } from 'www/src/registry/ui/list-emoji';
import {
  TodoLiStatic,
  TodoMarkerStatic,
} from 'www/src/registry/ui/list-todo-static';
import { KbdLeafStatic } from 'www/src/registry/ui/kbd-node-static';
import { LinkElementStatic } from 'www/src/registry/ui/link-node-static';
import { AudioElementStatic } from 'www/src/registry/ui/media-audio-node-static';
import { FileElementStatic } from 'www/src/registry/ui/media-file-node-static';
import { VideoElementStatic } from 'www/src/registry/ui/media-video-node-static';
import { MentionElementStatic } from 'www/src/registry/ui/mention-node-static';
import { ParagraphElementStatic } from 'www/src/registry/ui/paragraph-node-static';
import {
  TableElementStatic,
  TableRowElementStatic,
  TableCellElementStatic,
  TableCellHeaderStaticElement,
} from 'www/src/registry/ui/table-node-static';
import { TocElementStatic } from 'www/src/registry/ui/toc-node-static';
import { ToggleElementStatic } from 'www/src/registry/ui/toggle-node-static';

import { BaseParagraphPlugin, SlateLeaf } from '../..';
import { createSlateEditor, CreateSlateEditorOptions } from '../../editor';

export const createStaticEditor = (
  value: Value,
  options?: Partial<CreateSlateEditorOptions>
) => {
  return createSlateEditor({
    ...options,
    plugins: [
      BaseColumnPlugin,
      BaseColumnItemPlugin,
      BaseTocPlugin,
      BaseVideoPlugin,
      BaseAudioPlugin,
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseMediaEmbedPlugin,
      BaseBoldPlugin,
      BaseCodePlugin,
      BaseItalicPlugin,
      BaseStrikethroughPlugin,
      BaseSubscriptPlugin,
      BaseSuperscriptPlugin,
      BaseUnderlinePlugin,
      BaseBlockquotePlugin,
      BaseDatePlugin,
      BaseCodeBlockPlugin,
      BaseIndentPlugin.extend({
        inject: {
          targetPlugins: [
            KEYS.p,
            ...KEYS.heading,
            KEYS.blockquote,
            KEYS.codeBlock,
            KEYS.toggle,
          ],
        },
      }),
      BaseListPlugin.extend({
        inject: {
          targetPlugins: [
            KEYS.p,
            ...KEYS.heading,
            KEYS.blockquote,
            KEYS.codeBlock,
            KEYS.toggle,
          ],
        },
        options: {
          listStyleTypes: {
            fire: {
              liComponent: FireLiComponent,
              markerComponent: FireMarker,
              type: 'fire',
            },
            todo: {
              liComponent: TodoLiStatic,
              markerComponent: TodoMarkerStatic,
              type: 'todo',
            },
          },
        },
      }),
      BaseLinkPlugin,
      BaseTableRowPlugin,
      BaseTablePlugin,
      BaseTableCellPlugin,
      BaseHorizontalRulePlugin,
      BaseFontColorPlugin,
      BaseFontBackgroundColorPlugin,
      BaseFontSizePlugin,
      BaseKbdPlugin,
      BaseAlignPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            ...HEADING_LEVELS,
            BaseImagePlugin.key,
            BaseMediaEmbedPlugin.key,
          ],
        },
      }),
      BaseLineHeightPlugin,
      BaseHighlightPlugin,
      BaseFilePlugin,
      BaseImagePlugin,
      BaseMentionPlugin,
      BaseCommentsPlugin,
      BaseTogglePlugin,
      BaseEquationPlugin,
      BaseInlineEquationPlugin,
    ],
    value,
  });
};

export const components = {
  [BaseAudioPlugin.key]: AudioElementStatic,
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: 'strong' }),
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseColumnItemPlugin.key]: ColumnElementStatic,
  [BaseColumnPlugin.key]: ColumnGroupElementStatic,
  [BaseCommentsPlugin.key]: CommentLeafStatic,
  [BaseDatePlugin.key]: DateElementStatic,
  [BaseEquationPlugin.key]: EquationElementStatic,
  [BaseFilePlugin.key]: FileElementStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseImagePlugin.key]: ImageElementStatic,
  [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: 'em' }),
  [BaseKbdPlugin.key]: KbdLeafStatic,
  [BaseLinkPlugin.key]: LinkElementStatic,
  // [BaseMediaEmbedPlugin.key]: MediaEmbedElementStatic,
  [BaseMentionPlugin.key]: MentionElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: 'del' }),
  [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: 'sub' }),
  [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: 'sup' }),
  [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
  [BaseTableCellPlugin.key]: TableCellElementStatic,
  [BaseTablePlugin.key]: TableElementStatic,
  [BaseTableRowPlugin.key]: TableRowElementStatic,
  [BaseTocPlugin.key]: TocElementStatic,
  [BaseTogglePlugin.key]: ToggleElementStatic,
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: 'u' }),
  [BaseVideoPlugin.key]: VideoElementStatic,
  [KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),
  [KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
  [KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
  [KEYS.h4]: withProps(HeadingElementStatic, { variant: 'h4' }),
  [KEYS.h5]: withProps(HeadingElementStatic, { variant: 'h5' }),
  [KEYS.h6]: withProps(HeadingElementStatic, { variant: 'h6' }),
};
