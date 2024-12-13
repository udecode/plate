import { withProps } from '@udecode/cn';
import { BaseAlignPlugin } from '@udecode/plate-alignment';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
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
import {
  BaseParagraphPlugin,
  PlateStatic,
  PlateStaticLeaf,
  createSlateEditor,
  serializePlateStatic,
} from '@udecode/plate-common';
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

import { alignValue } from '@/registry/default/example/values/align-value';
import { basicNodesValue } from '@/registry/default/example/values/basic-nodes-value';
import { fontValue } from '@/registry/default/example/values/font-value';
import { highlightValue } from '@/registry/default/example/values/highlight-value';
import { horizontalRuleValue } from '@/registry/default/example/values/horizontal-rule-value';
import { indentListValue } from '@/registry/default/example/values/indent-list-value';
import { indentValue } from '@/registry/default/example/values/indent-value';
import { kbdValue } from '@/registry/default/example/values/kbd-value';
import { lineHeightValue } from '@/registry/default/example/values/line-height-value';
import { linkValue } from '@/registry/default/example/values/link-value';
import { mediaValue } from '@/registry/default/example/values/media-value';
import { tableValue } from '@/registry/default/example/values/table-value';
import { BlockquoteStaticElement } from '@/registry/default/plate-static-ui/blockquote-element';
import { CodeBlockElementStatic } from '@/registry/default/plate-static-ui/code-block-element';
import { CodeStaticLeaf } from '@/registry/default/plate-static-ui/code-leaf';
import { CodeLineStaticElement } from '@/registry/default/plate-static-ui/code-line-element';
import { CodeSyntaxStaticLeaf } from '@/registry/default/plate-static-ui/code-syntax-leaf';
import { HeadingStaticElement } from '@/registry/default/plate-static-ui/heading-element';
import { HrStaticElement } from '@/registry/default/plate-static-ui/hr-element';
import { ImageStaticElement } from '@/registry/default/plate-static-ui/image-element';
import {
  TodoLi,
  TodoMarker,
} from '@/registry/default/plate-static-ui/indent-todo-marker';
import { KbdStaticLeaf } from '@/registry/default/plate-static-ui/kbd-leaf';
import { LinkStaticElement } from '@/registry/default/plate-static-ui/link-element';
import { MediaAudioStaticElement } from '@/registry/default/plate-static-ui/media-audio-element';
import { MediaFileStaticElement } from '@/registry/default/plate-static-ui/media-file-element';
import { MediaVideoStaticElement } from '@/registry/default/plate-static-ui/media-video-element';
import { ParagraphStaticElement } from '@/registry/default/plate-static-ui/paragraph-element';
import {
  TableCellHeaderStaticElement,
  TableCellStaticElement,
} from '@/registry/default/plate-static-ui/table-cell-element';
import { TableStaticElement } from '@/registry/default/plate-static-ui/table-element';
import { TableRowStaticElement } from '@/registry/default/plate-static-ui/table-row-element';

export default async function DevPage() {
  const staticComponents = {
    [BaseAudioPlugin.key]: MediaAudioStaticElement,
    [BaseBlockquotePlugin.key]: BlockquoteStaticElement,
    [BaseBoldPlugin.key]: withProps(PlateStaticLeaf, { as: 'strong' }),
    [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
    [BaseCodeLinePlugin.key]: CodeLineStaticElement,
    [BaseCodePlugin.key]: CodeStaticLeaf,
    [BaseCodeSyntaxPlugin.key]: CodeSyntaxStaticLeaf,
    [BaseFilePlugin.key]: MediaFileStaticElement,
    [BaseHorizontalRulePlugin.key]: HrStaticElement,
    [BaseImagePlugin.key]: ImageStaticElement,
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
    [BaseVideoPlugin.key]: MediaVideoStaticElement,
    [HEADING_KEYS.h1]: withProps(HeadingStaticElement, { variant: 'h1' }),
    [HEADING_KEYS.h2]: withProps(HeadingStaticElement, { variant: 'h2' }),
    [HEADING_KEYS.h3]: withProps(HeadingStaticElement, { variant: 'h3' }),
    [HEADING_KEYS.h4]: withProps(HeadingStaticElement, { variant: 'h4' }),
    [HEADING_KEYS.h5]: withProps(HeadingStaticElement, { variant: 'h5' }),
    [HEADING_KEYS.h6]: withProps(HeadingStaticElement, { variant: 'h6' }),
  };

  const editorStatic = createSlateEditor({
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
      BaseFilePlugin,
      BaseImagePlugin,
    ],
    value: [
      ...basicNodesValue,
      ...linkValue,
      ...tableValue,
      ...horizontalRuleValue,
      ...fontValue,
      ...highlightValue,
      ...kbdValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...indentListValue,
      ...mediaValue,
      ...alignValue,
    ],
  });

  const html = await serializePlateStatic(editorStatic, staticComponents);

  return (
    <div className="mx-auto w-1/2">
      <h1 className="text-xl font-bold text-green-800">Plate Static :</h1>
      <PlateStatic editor={editorStatic} staticComponents={staticComponents} />

      <br />
      <br />
      <h1 className="text-xl font-bold text-green-800">HTML :</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
