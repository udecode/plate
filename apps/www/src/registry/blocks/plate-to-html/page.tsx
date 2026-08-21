import fs from 'node:fs/promises';
import path from 'node:path';

import { cva } from 'class-variance-authority';
import type { EditorDocumentValue } from 'platejs';
import { createStaticEditor, renderStaticHtml } from 'platejs/static';
import * as React from 'react';

import { EditorStatic } from '@/registry/components/editor/editor-static';
import {
  EditorClient,
  EditorViewClient,
  ExportHtmlButton,
  HtmlIframe,
} from '@/registry/components/editor/plate-to-html';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';
import { alignValue } from '@/registry/examples/values/align-value';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';
import { columnValue } from '@/registry/examples/values/column-value';
import { dateValue } from '@/registry/examples/values/date-value';
import { discussionValue } from '@/registry/examples/values/discussion-value';
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

const getCachedTailwindCss = React.cache(async () => {
  const cssPath = path.join(process.cwd(), 'public', 'tailwind.css');

  return await fs.readFile(cssPath, 'utf8');
});

const createHtmlDocument = ({
  editorHtml,
  katexCDN,
  tailwindCss,
  theme,
}: {
  editorHtml: string;
  tailwindCss: string;
  katexCDN?: string;
  theme?: string;
}) => `<!DOCTYPE html>
<html lang="en"${theme === 'dark' ? ' class="dark"' : ''}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <style>${tailwindCss}</style>
    ${katexCDN}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap"
      rel="stylesheet"
    />
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

export default async function PlateToHtmlBlock() {
  const createValue = (): EditorDocumentValue => ({
    children: [
      ...basicBlocksValue,
      ...basicMarksValue,
      ...tocPlaygroundValue,
      ...linkValue,
      ...tableValue,
      ...equationValue,
      ...columnValue,
      ...mentionValue,
      ...dateValue,
      ...fontValue,
      ...discussionValue,
      ...alignValue,
      ...lineHeightValue,
      ...indentValue,
      ...listValue,
      ...mediaValue.children,
    ],
  });

  const editor = createStaticEditor({
    plugins: BaseEditorKit,
    initialValue: createValue(),
  });

  const tailwindCss = await getCachedTailwindCss();
  const katexCDN = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`;

  // const cookieStore = await cookies();
  // const theme = cookieStore.get('theme')?.value;
  const theme = 'light';

  // Get the editor content HTML using EditorStatic
  const editorHtml = await renderStaticHtml(editor, {
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
        <h3 className={headingVariants()}>EditorView</h3>
        <EditorViewClient value={createValue()} />
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
  'group mt-8 scroll-m-20 font-heading font-semibold text-xl tracking-tight'
);
