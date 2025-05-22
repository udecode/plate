import * as React from 'react';

import { withProps } from '@udecode/cn';
import {
  type Value,
  BaseParagraphPlugin,
  createSlateEditor,
  serializeHtml,
  SlateLeaf,
} from '@udecode/plate';
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
import { BaseKbdPlugin } from '@udecode/plate-kbd';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLineHeightPlugin } from '@udecode/plate-line-height';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { BaseListPlugin } from '@udecode/plate-list';
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
import { cva } from 'class-variance-authority';
import { all, createLowlight } from 'lowlight';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  EditorClient,
  ExportHtmlButton,
  HtmlIframe,
} from '@/registry/components/editor/slate-to-html';
import { alignValue } from '@/registry/examples/values/align-value';
import { basicElementsValue } from '@/registry/examples/values/basic-elements-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';
import { columnValue } from '@/registry/examples/values/column-value';
import { commentsValue } from '@/registry/examples/values/comments-value';
import { dateValue } from '@/registry/examples/values/date-value';
import { equationValue } from '@/registry/examples/values/equation-value';
import { fontValue } from '@/registry/examples/values/font-value';
import { highlightValue } from '@/registry/examples/values/highlight-value';
import { horizontalRuleValue } from '@/registry/examples/values/horizontal-rule-value';
import { indentValue } from '@/registry/examples/values/indent-value';
import { kbdValue } from '@/registry/examples/values/kbd-value';
import { lineHeightValue } from '@/registry/examples/values/line-height-value';
import { linkValue } from '@/registry/examples/values/link-value';
import { listValue } from '@/registry/examples/values/list-value';
import { mediaValue } from '@/registry/examples/values/media-value';
import { mentionValue } from '@/registry/examples/values/mention-value';
import { tableValue } from '@/registry/examples/values/table-value';
import { tocPlaygroundValue } from '@/registry/examples/values/toc-value';
import { createHtmlDocument } from '@/registry/lib/create-html-document';
import { BlockquoteElementStatic } from '@/registry/ui/blockquote-node-static';
import {
  CodeBlockElementStatic,
  CodeLineElementStatic,
  CodeSyntaxLeafStatic,
} from '@/registry/ui/code-block-node-static';
import { CodeLeafStatic } from '@/registry/ui/code-node-static';
import {
  ColumnElementStatic,
  ColumnGroupElementStatic,
} from '@/registry/ui/column-node-static';
import { CommentLeafStatic } from '@/registry/ui/comment-node-static';
import { DateElementStatic } from '@/registry/ui/date-node-static';
import { EditorStatic } from '@/registry/ui/editor-static';
import {
  EquationElementStatic,
  InlineEquationElementStatic,
} from '@/registry/ui/equation-node-static';
import { HeadingElementStatic } from '@/registry/ui/heading-node-static';
import { HighlightLeafStatic } from '@/registry/ui/highlight-node-static';
import { HrElementStatic } from '@/registry/ui/hr-node-static';
import { KbdLeafStatic } from '@/registry/ui/kbd-node-static';
import { LinkElementStatic } from '@/registry/ui/link-node-static';
import { TodoLiStatic, TodoMarkerStatic } from '@/registry/ui/list-todo-static';
import { AudioElementStatic } from '@/registry/ui/media-audio-node-static';
import { FileElementStatic } from '@/registry/ui/media-file-node-static';
import { ImageElementStatic } from '@/registry/ui/media-image-node-static';
import { VideoElementStatic } from '@/registry/ui/media-video-node-static';
import { MentionElementStatic } from '@/registry/ui/mention-node-static';
import { ParagraphElementStatic } from '@/registry/ui/paragraph-node-static';
import {
  TableCellElementStatic,
  TableCellHeaderStaticElement,
  TableElementStatic,
  TableRowElementStatic,
} from '@/registry/ui/table-node-static';
import { TocElementStatic } from '@/registry/ui/toc-node-static';
import { ToggleElementStatic } from '@/registry/ui/toggle-node-static';

const getCachedTailwindCss = React.cache(async () => {
  const cssPath = path.join(process.cwd(), 'public', 'tailwind.css');

  return await fs.readFile(cssPath, 'utf8');
});

const lowlight = createLowlight(all);

export default async function SlateToHtmlBlock() {
  const components = {
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
    [BaseHighlightPlugin.key]: HighlightLeafStatic,
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
    h1: withProps(HeadingElementStatic, { variant: 'h1' }),
    h2: withProps(HeadingElementStatic, { variant: 'h2' }),
    h3: withProps(HeadingElementStatic, { variant: 'h3' }),
    h4: withProps(HeadingElementStatic, { variant: 'h4' }),
    h5: withProps(HeadingElementStatic, { variant: 'h5' }),
    h6: withProps(HeadingElementStatic, { variant: 'h6' }),
  };

  const createValue = (): Value => [
    ...basicElementsValue,
    ...basicMarksValue,
    ...tocPlaygroundValue,
    ...linkValue,
    ...horizontalRuleValue,
    ...tableValue,
    ...equationValue,
    ...columnValue,
    ...mentionValue,
    ...dateValue,
    ...fontValue,
    ...highlightValue,
    ...kbdValue,
    ...commentsValue,
    ...alignValue,
    ...lineHeightValue,
    ...indentValue,
    ...listValue,
    ...mediaValue,
  ];

  const editor = createSlateEditor({
    plugins: [
      BaseEquationPlugin,
      BaseInlineEquationPlugin,
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
      BaseCodeBlockPlugin.configure({
        options: {
          lowlight,
        },
      }),
      BaseIndentPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
          ],
        },
      }),
      BaseListPlugin.extend({
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
    ],
    value: createValue(),
  });

  const tailwindCss = await getCachedTailwindCss();
  const katexCDN = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`;

  // const cookieStore = await cookies();
  // const theme = cookieStore.get('theme')?.value;
  const theme = 'light';

  // Get the editor content HTML using EditorStatic
  const editorHtml = await serializeHtml(editor, {
    components,
    editorComponent: EditorStatic,
    props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
  });

  // Create the full HTML document
  const html = createHtmlDocument({
    editorHtml,
    katexCDN,
    tailwindCss,
    theme,
  });

  return (
    <div className="grid grid-cols-3 px-4">
      <div className="p-2">
        <h3 className={headingVariants()}>Editor</h3>
        <EditorClient value={createValue()} />
      </div>

      <div className="p-2">
        <h3 className={headingVariants()}>EditorStatic</h3>
        <EditorStatic components={components} editor={editor} />
      </div>

      <div className="relative p-2">
        <h3 className={headingVariants()}>HTML Iframe</h3>
        <ExportHtmlButton
          className="absolute top-10 right-0"
          html={html}
          serverTheme={theme}
        />
        <HtmlIframe
          className="h-[7500px] w-full"
          html={html}
          serverTheme={theme}
        />
      </div>
    </div>
  );
}

const headingVariants = cva(
  'group mt-8 scroll-m-20 font-heading text-xl font-semibold tracking-tight'
);
