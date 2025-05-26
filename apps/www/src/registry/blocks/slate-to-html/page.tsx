import * as React from 'react';

import {
  type Value,
  BaseParagraphPlugin,
  createSlateEditor,
  KEYS,
  serializeHtml,
} from '@udecode/plate';
import { BaseAlignPlugin } from '@udecode/plate-alignment';
import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
} from '@udecode/plate-basic-elements';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
import { BaseCommentPlugin } from '@udecode/plate-comments';
import { BaseDatePlugin } from '@udecode/plate-date';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-font';
import { BaseIndentPlugin } from '@udecode/plate-indent';
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
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@udecode/plate-table';
import { BaseTocPlugin } from '@udecode/plate-toc';
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
import { indentValue } from '@/registry/examples/values/indent-value';
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
import {
  H1ElementStatic,
  H2ElementStatic,
  H3ElementStatic,
} from '@/registry/ui/heading-node-static';
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
    [KEYS.audio]: AudioElementStatic,
    [KEYS.blockquote]: BlockquoteElementStatic,
    [KEYS.code]: CodeLeafStatic,
    [KEYS.codeBlock]: CodeBlockElementStatic,
    [KEYS.codeLine]: CodeLineElementStatic,
    [KEYS.codeSyntax]: CodeSyntaxLeafStatic,
    [KEYS.column]: ColumnElementStatic,
    [KEYS.columnGroup]: ColumnGroupElementStatic,
    [KEYS.comment]: CommentLeafStatic,
    [KEYS.date]: DateElementStatic,
    [KEYS.equation]: EquationElementStatic,
    [KEYS.file]: FileElementStatic,
    [KEYS.h1]: H1ElementStatic,
    [KEYS.h2]: H2ElementStatic,
    [KEYS.h3]: H3ElementStatic,
    [KEYS.highlight]: HighlightLeafStatic,
    [KEYS.hr]: HrElementStatic,
    [KEYS.img]: ImageElementStatic,
    [KEYS.inlineEquation]: InlineEquationElementStatic,
    [KEYS.kbd]: KbdLeafStatic,
    [KEYS.link]: LinkElementStatic,
    // [KEYS.mediaEmbed]: MediaEmbedElementStatic,
    [KEYS.mention]: MentionElementStatic,
    [KEYS.p]: ParagraphElementStatic,
    [KEYS.table]: TableElementStatic,
    [KEYS.td]: TableCellElementStatic,
    [KEYS.th]: TableCellHeaderStaticElement,
    [KEYS.toc]: TocElementStatic,
    [KEYS.toggle]: ToggleElementStatic,
    [KEYS.tr]: TableRowElementStatic,
    [KEYS.video]: VideoElementStatic,
  };

  const createValue = (): Value => [
    ...basicElementsValue,
    ...basicMarksValue,
    ...tocPlaygroundValue,
    ...linkValue,
    ...tableValue,
    ...equationValue,
    ...columnValue,
    ...mentionValue,
    ...dateValue,
    ...fontValue,
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
          targetPlugins: [KEYS.p, KEYS.blockquote, KEYS.codeBlock],
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
          targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.img, KEYS.mediaEmbed],
        },
      }),
      BaseLineHeightPlugin,
      BaseHighlightPlugin,
      BaseFilePlugin,
      BaseImagePlugin,
      BaseMentionPlugin,
      BaseCommentPlugin,
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
