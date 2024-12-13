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
import { BaseImagePlugin, BaseMediaEmbedPlugin } from '@udecode/plate-media';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@udecode/plate-table';
import { BaseTogglePlugin } from '@udecode/plate-toggle';
import { BlockquoteStaticElement } from 'www/src/registry/default/plate-static-ui/blockquote-element';
import { CodeBlockElementStatic } from 'www/src/registry/default/plate-static-ui/code-block-element';
import { CodeStaticLeaf } from 'www/src/registry/default/plate-static-ui/code-leaf';
import { CodeLineStaticElement } from 'www/src/registry/default/plate-static-ui/code-line-element';
import { CodeSyntaxStaticLeaf } from 'www/src/registry/default/plate-static-ui/code-syntax-leaf';
import { HeadingStaticElement } from 'www/src/registry/default/plate-static-ui/heading-element';
import { HrStaticElement } from 'www/src/registry/default/plate-static-ui/hr-element';
import {
  TodoLi,
  TodoMarker,
} from 'www/src/registry/default/plate-static-ui/indent-todo-marker';
import { KbdStaticLeaf } from 'www/src/registry/default/plate-static-ui/kbd-leaf';
import { LinkStaticElement } from 'www/src/registry/default/plate-static-ui/link-element';
import { ParagraphStaticElement } from 'www/src/registry/default/plate-static-ui/paragraph-element';
import {
  TableCellHeaderStaticElement,
  TableCellStaticElement,
} from 'www/src/registry/default/plate-static-ui/table-cell-element';
import { TableStaticElement } from 'www/src/registry/default/plate-static-ui/table-element';
import { TableRowStaticElement } from 'www/src/registry/default/plate-static-ui/table-row-element';

import { BaseParagraphPlugin } from '../..';
import { createSlateEditor } from '../../editor';

export const createStaticEditor = (value: Value) => {
  return createSlateEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseHeadingPlugin,
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
              liComponent: TodoLi,
              markerComponent: TodoMarker,
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
    ],
    value,
  });
};

export const staticComponents = {
  [BaseBlockquotePlugin.key]: BlockquoteStaticElement,
  [BaseBoldPlugin.key]: withProps(PlateStaticLeaf, { as: 'strong' }),
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineStaticElement,
  [BaseCodePlugin.key]: CodeStaticLeaf,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxStaticLeaf,
  [BaseHorizontalRulePlugin.key]: HrStaticElement,
  [BaseItalicPlugin.key]: withProps(PlateStaticLeaf, { as: 'em' }),
  [BaseKbdPlugin.key]: KbdStaticLeaf,
  [BaseLinkPlugin.key]: LinkStaticElement,
  [BaseParagraphPlugin.key]: ParagraphStaticElement,
  [BaseStrikethroughPlugin.key]: withProps(PlateStaticLeaf, { as: 'del' }),
  [BaseSubscriptPlugin.key]: withProps(PlateStaticLeaf, { as: 'sub' }),
  [BaseSuperscriptPlugin.key]: withProps(PlateStaticLeaf, { as: 'sup' }),
  [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
  [BaseTableCellPlugin.key]: TableCellStaticElement,
  [BaseTablePlugin.key]: TableStaticElement,
  [BaseTableRowPlugin.key]: TableRowStaticElement,
  [BaseUnderlinePlugin.key]: withProps(PlateStaticLeaf, { as: 'u' }),
  [HEADING_KEYS.h1]: withProps(HeadingStaticElement, { variant: 'h1' }),
  [HEADING_KEYS.h2]: withProps(HeadingStaticElement, { variant: 'h2' }),
  [HEADING_KEYS.h3]: withProps(HeadingStaticElement, { variant: 'h3' }),
  [HEADING_KEYS.h4]: withProps(HeadingStaticElement, { variant: 'h4' }),
  [HEADING_KEYS.h5]: withProps(HeadingStaticElement, { variant: 'h5' }),
  [HEADING_KEYS.h6]: withProps(HeadingStaticElement, { variant: 'h6' }),
};
