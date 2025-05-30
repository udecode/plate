'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { createSlateEditor, KEYS, serializeHtml } from '@udecode/plate';
import { BaseTextAlignPlugin } from '@udecode/plate-basic-styles';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-nodes';
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
import { BaseCommentPlugin } from '@udecode/plate-comments';
import { BaseDatePlugin } from '@udecode/plate-date';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-basic-styles';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLineHeightPlugin } from '@udecode/plate-basic-styles';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { BaseListPlugin } from '@udecode/plate-list';
import { MarkdownPlugin } from '@udecode/plate-markdown';
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
import { useEditorRef } from '@udecode/plate/react';
import { all, createLowlight } from 'lowlight';
import { ArrowDownToLineIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import { EditorStatic } from './editor-static';
import {
  EquationElementStatic,
  InlineEquationElementStatic,
} from './equation-node-static';
import { ToolbarButton } from './toolbar';

const siteUrl = 'https://platejs.org';
const lowlight = createLowlight(all);

export function ExportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const getCanvas = async () => {
    const { default: html2canvas } = await import('html2canvas-pro');

    const style = document.createElement('style');
    document.head.append(style);

    const canvas = await html2canvas(editor.api.toDOMNode(editor)!, {
      onclone: (document: Document) => {
        const editorElement = document.querySelector(
          '[contenteditable="true"]'
        );
        if (editorElement) {
          Array.from(editorElement.querySelectorAll('*')).forEach((element) => {
            const existingStyle = element.getAttribute('style') || '';
            element.setAttribute(
              'style',
              `${existingStyle}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important`
            );
          });
        }
      },
    });
    style.remove();

    return canvas;
  };

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
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

    await downloadFile(pdfBase64, 'plate.pdf');
  };

  const exportToImage = async () => {
    const canvas = await getCanvas();
    await downloadFile(canvas.toDataURL('image/png'), 'plate.png');
  };

  const exportToHtml = async () => {
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

    const editorStatic = createSlateEditor({
      plugins: [
        BaseColumnPlugin,
        BaseColumnItemPlugin,
        BaseTocPlugin,
        BaseVideoPlugin,
        BaseAudioPlugin,
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
        BaseTextAlignPlugin.extend({
          inject: {
            targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.img, KEYS.video],
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
      value: editor.children,
    });

    const editorHtml = await serializeHtml(editorStatic, {
      components,
      editorComponent: EditorStatic,
      props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
    });

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

    const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

    await downloadFile(url, 'plate.html');
  };

  const exportToMarkdown = async () => {
    const md = editor.getApi(MarkdownPlugin).markdown.serialize();
    const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`;
    await downloadFile(url, 'plate.md');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Export" isDropdown>
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
          <DropdownMenuItem onSelect={exportToMarkdown}>
            Export as Markdown
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
