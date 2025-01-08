'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

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
import { BaseCommentsPlugin } from '@udecode/plate-comments';
import {
  BaseParagraphPlugin,
  SlateLeaf,
  createSlateEditor,
  serializeHtml,
} from '@udecode/plate-common';
import { toDOMNode, useEditorRef } from '@udecode/plate-common/react';
import { BaseDatePlugin } from '@udecode/plate-date';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-font';
import {
  BaseHeadingPlugin,
  BaseTocPlugin,
  HEADING_KEYS,
  HEADING_LEVELS,
} from '@udecode/plate-heading';
import { BaseHighlightPlugin } from '@udecode/plate-highlight';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
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
import { ArrowDownToLineIcon } from 'lucide-react';
import Prism from 'prismjs';

import { BlockquoteElementStatic } from '@/components/plate-ui/blockquote-element-static';
import { CodeBlockElementStatic } from '@/components/plate-ui/code-block-element-static';
import { CodeLeafStatic } from '@/components/plate-ui/code-leaf-static';
import { CodeLineElementStatic } from '@/components/plate-ui/code-line-element-static';
import { CodeSyntaxLeafStatic } from '@/components/plate-ui/code-syntax-leaf-static';
import { ColumnElementStatic } from '@/components/plate-ui/column-element-static';
import { ColumnGroupElementStatic } from '@/components/plate-ui/column-group-element-static';
import { CommentLeafStatic } from '@/components/plate-ui/comment-leaf-static';
import { DateElementStatic } from '@/components/plate-ui/date-element-static';
import { HeadingElementStatic } from '@/components/plate-ui/heading-element-static';
import { HighlightLeafStatic } from '@/components/plate-ui/highlight-leaf-static';
import { HrElementStatic } from '@/components/plate-ui/hr-element-static';
import { ImageElementStatic } from '@/components/plate-ui/image-element-static';
import {
  FireLiComponent,
  FireMarker,
} from '@/components/plate-ui/indent-fire-marker';
import {
  TodoLiStatic,
  TodoMarkerStatic,
} from '@/components/plate-ui/indent-todo-marker-static';
import { KbdLeafStatic } from '@/components/plate-ui/kbd-leaf-static';
import { LinkElementStatic } from '@/components/plate-ui/link-element-static';
import { MediaAudioElementStatic } from '@/components/plate-ui/media-audio-element-static';
import { MediaFileElementStatic } from '@/components/plate-ui/media-file-element-static';
import { MediaVideoElementStatic } from '@/components/plate-ui/media-video-element-static';
import { MentionElementStatic } from '@/components/plate-ui/mention-element-static';
import { ParagraphElementStatic } from '@/components/plate-ui/paragraph-element-static';
import {
  TableCellElementStatic,
  TableCellHeaderStaticElement,
} from '@/components/plate-ui/table-cell-element-static';
import { TableElementStatic } from '@/components/plate-ui/table-element-static';
import { TableRowElementStatic } from '@/components/plate-ui/table-row-element-static';
import { TocElementStatic } from '@/components/plate-ui/toc-element-static';
import { ToggleElementStatic } from '@/components/plate-ui/toggle-element-static';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { EditorStatic } from './editor-static';
import { EquationElementStatic } from './equation-element-static';
import { InlineEquationElementStatic } from './inline-equation-element-static';
import { ToolbarButton } from './toolbar';

const siteUrl = 'https://platejs.org';

export function ExportToolbarButton({ children, ...props }: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const getCanvas = async () => {
    const { default: html2canvas } = await import('html2canvas');

    const style = document.createElement('style');
    document.head.append(style);
    style.sheet?.insertRule(
      'body > div:last-child img { display: inline-block !important; }'
    );

    const canvas = await html2canvas(toDOMNode(editor, editor)!);
    style.remove();

    return canvas;
  };

  const downloadFile = ({
    content,
    filename,
    isHtml = false,
  }: {
    content: string;
    filename: string;
    isHtml?: boolean;
  }) => {
    const element = document.createElement('a');
    const href = isHtml
      ? `data:text/html;charset=utf-8,${encodeURIComponent(content)}`
      : content;
    element.setAttribute('href', href);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.append(element);
    element.click();
    element.remove();
  };

  const exportToPdf = async () => {
    const canvas = await getCanvas();

    const PDFLib = await import('pdf-lib');
    const pdfDoc = await PDFLib.PDFDocument.create();
    const page = pdfDoc.addPage([canvas.width, canvas.height]);
    const imageEmbed = await pdfDoc.embedPng(canvas.toDataURL('PNG'));
    const { height, width } = imageEmbed.scale(1);
    page.drawImage(imageEmbed, {
      height,
      width,
      x: 0,
      y: 0,
    });
    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });

    downloadFile({ content: pdfBase64, filename: 'plate.pdf' });
  };

  const exportToImage = async () => {
    const canvas = await getCanvas();
    downloadFile({
      content: canvas.toDataURL('image/png'),
      filename: 'plate.png',
    });
  };

  const exportToHtml = async () => {
    const components = {
      [BaseAudioPlugin.key]: MediaAudioElementStatic,
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
      [BaseFilePlugin.key]: MediaFileElementStatic,
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
      [BaseVideoPlugin.key]: MediaVideoElementStatic,
      [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),
      [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
      [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
      [HEADING_KEYS.h4]: withProps(HeadingElementStatic, { variant: 'h4' }),
      [HEADING_KEYS.h5]: withProps(HeadingElementStatic, { variant: 'h5' }),
      [HEADING_KEYS.h6]: withProps(HeadingElementStatic, { variant: 'h6' }),
    };

    const editorStatic = createSlateEditor({
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
        BaseEquationPlugin,
        BaseInlineEquationPlugin,
        BaseCodeBlockPlugin.configure({
          options: {
            prism: Prism,
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
        BaseMentionPlugin,
        BaseCommentsPlugin,
        BaseTogglePlugin,
      ],
      value: editor.children,
    });

    const editorHtml = await serializeHtml(editorStatic, {
      components,
      editorComponent: EditorStatic,
      props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
    });

    const prismCss = `<link rel="stylesheet" href="${siteUrl}/prism.css">`;
    const tailwindCss = `<link rel="stylesheet" href="${siteUrl}/tailwind.css">`;
    const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`;

    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap"
          rel="stylesheet"
        />
        ${tailwindCss}
        ${prismCss}
        ${katexCss}
        <style>
          :root {
            --font-sans: 'Inter', 'Inter Fallback';
            --font-mono: 'JetBrains Mono', 'JetBrains Mono Fallback';
          }
        </style>
      </head>
      <body>
        ${editorHtml}
      </body>
    </html>`;

    downloadFile({ content: html, filename: 'plate.html', isHtml: true });
  };

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Export" isDropdown>
          <ArrowDownToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={exportToHtml}>
            Export as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportToPdf}>
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportToImage}>
            Export as Image
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
