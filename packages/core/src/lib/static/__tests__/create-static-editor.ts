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
import { type Value, PlateStaticLeaf } from '@udecode/plate-common';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-font';
import {
  BaseHeadingPlugin,
  HEADING_KEYS,
  HEADING_LEVELS,
} from '@udecode/plate-heading';
import { BaseHighlightPlugin } from '@udecode/plate-highlight';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
import { BaseKbdPlugin } from '@udecode/plate-kbd';
import { BaseLineHeightPlugin } from '@udecode/plate-line-height';
import { BaseLinkPlugin } from '@udecode/plate-link';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '@udecode/plate-media';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@udecode/plate-table';
import { BaseTogglePlugin } from '@udecode/plate-toggle';
import { BlockquoteElementStatic } from 'www/src/registry/default/plate-ui/blockquote-element-static';
import { CodeBlockElementStatic } from 'www/src/registry/default/plate-ui/code-block-element-static';
import { CodeLeafStatic } from 'www/src/registry/default/plate-ui/code-leaf-static';
import { CodeLineElementStatic } from 'www/src/registry/default/plate-ui/code-line-element-static';
import { CodeSyntaxLeafStatic } from 'www/src/registry/default/plate-ui/code-syntax-leaf-static';
import { HeadingElementStatic } from 'www/src/registry/default/plate-ui/heading-element-static';
import { HrElementStatic } from 'www/src/registry/default/plate-ui/hr-element-static';
import { ImageElementStatic } from 'www/src/registry/default/plate-ui/image-element-static';
import {
  TodoLiStatic,
  TodoMarkerStatic,
} from 'www/src/registry/default/plate-ui/indent-todo-marker-static';
import { KbdLeafStatic } from 'www/src/registry/default/plate-ui/kbd-leaf-static';
import { LinkElementStatic } from 'www/src/registry/default/plate-ui/link-element-static';
import { MediaAudioElementStatic } from 'www/src/registry/default/plate-ui/media-audio-element-static';
import { MediaFileElementStatic } from 'www/src/registry/default/plate-ui/media-file-element-static';
import { MediaVideoElementStatic } from 'www/src/registry/default/plate-ui/media-video-element-static';
import { ParagraphElementStatic } from 'www/src/registry/default/plate-ui/paragraph-element-static';
import {
  TableCellElementStatic,
  TableCellHeaderStaticElement,
} from 'www/src/registry/default/plate-ui/table-cell-element-static';
import { TableElementStatic } from 'www/src/registry/default/plate-ui/table-element-static';
import { TableRowElementStatic } from 'www/src/registry/default/plate-ui/table-row-element-static';

import { BaseParagraphPlugin } from '../..';
import { createSlateEditor } from '../../editor';

export const createStaticEditor = (value: Value) => {
  return createSlateEditor({
    plugins: [
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
      BaseCodeBlockPlugin,
      BaseIndentPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
          ],
        },
      }),
      BaseIndentListPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            ...HEADING_LEVELS,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
            BaseTogglePlugin.key,
          ],
        },
        options: {
          listStyleTypes: {
            // fire: {
            //   liComponent: FireLiComponent,
            //   markerComponent: FireMarker,
            //   type: 'fire',
            // },
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
            BaseMediaEmbedPlugin.key,
            ...HEADING_LEVELS,
            BaseImagePlugin.key,
          ],
        },
      }),
      BaseLineHeightPlugin,
      BaseHighlightPlugin,
      BaseFilePlugin,
      BaseImagePlugin,
    ],
    value,
  });
};

export const staticComponents = {
  [BaseAudioPlugin.key]: MediaAudioElementStatic,
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(PlateStaticLeaf, { as: 'strong' }),
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseFilePlugin.key]: MediaFileElementStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseImagePlugin.key]: ImageElementStatic,
  [BaseItalicPlugin.key]: withProps(PlateStaticLeaf, { as: 'em' }),
  [BaseKbdPlugin.key]: KbdLeafStatic,
  [BaseLinkPlugin.key]: LinkElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(PlateStaticLeaf, { as: 'del' }),
  [BaseSubscriptPlugin.key]: withProps(PlateStaticLeaf, { as: 'sub' }),
  [BaseSuperscriptPlugin.key]: withProps(PlateStaticLeaf, { as: 'sup' }),
  [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
  [BaseTableCellPlugin.key]: TableCellElementStatic,
  [BaseTablePlugin.key]: TableElementStatic,
  [BaseTableRowPlugin.key]: TableRowElementStatic,
  [BaseUnderlinePlugin.key]: withProps(PlateStaticLeaf, { as: 'u' }),
  [BaseVideoPlugin.key]: MediaVideoElementStatic,
  [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),
  [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
  [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
  [HEADING_KEYS.h4]: withProps(HeadingElementStatic, { variant: 'h4' }),
  [HEADING_KEYS.h5]: withProps(HeadingElementStatic, { variant: 'h5' }),
  [HEADING_KEYS.h6]: withProps(HeadingElementStatic, { variant: 'h6' }),
};
