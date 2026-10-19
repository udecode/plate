// Run from the repository root:
// bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-29-static-document-rendering/projected-reads.ts
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BaseHeadingPlugin,
  BaseParagraphPlugin,
  createEditor,
  createEditorView,
} from 'platejs';
import { EditorStatic, renderStaticHtml } from 'platejs/static';
import { BaseTocPlugin } from 'platejs/toc';

const heading = (text: string) => ({
  type: 'heading',
  level: 1,
  children: [{ text }],
});
const document = {
  children: [
    { type: 'toc', children: [{ text: '' }] },
    heading('PROJECTED'),
  ],
};
const editor = createEditor({
  plugins: [
    BaseParagraphPlugin,
    BaseHeadingPlugin,
    BaseTocPlugin.configure({
      component: ({ editor: rendered }) =>
        React.createElement(
          'aside',
          null,
          rendered.plugin(BaseTocPlugin).read.headings().map((item) => item.title).join(',')
        ),
    }),
  ],
  initialValue: [heading('SOURCE')],
});
const before = JSON.stringify(editor.read.value());
const beforeCommit = editor.read.lastCommit();
const view = createEditorView(editor, { document });
const projectedHeadings = view.plugin(BaseTocPlugin).read.headings().map((item) => item.title);
const html = renderToStaticMarkup(React.createElement(EditorStatic, { editor, document }));
const exported = (await renderStaticHtml(editor, { document })).data;
const checks = {
  directReadUsesDocument: JSON.stringify(view.read.children()) === JSON.stringify(document.children),
  pluginReadUsesDocument: JSON.stringify(projectedHeadings) === JSON.stringify(['PROJECTED']),
  componentTocUsesDocument: html.includes('<aside>PROJECTED</aside>'),
  exportTocUsesDocument: exported.includes('<aside>PROJECTED</aside>'),
  sourceUnchanged: before === JSON.stringify(editor.read.value()) && beforeCommit === editor.read.lastCommit(),
};
const sources = [
  'packages/platejs/src/static/internal/staticDocumentView.ts',
  'packages/platejs/src/static/components/PlateStatic.tsx',
  'packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx',
  'packages/platejs/src/features/toc/lib/BaseTocPlugin.ts',
  'packages/plitejs/src/editor-runtime-view.ts',
  'packages/plitejs/src/core/public-state.ts',
];
console.log(JSON.stringify({
  checks,
  observed: { projectedHeadings, html, exported },
  sources: Object.fromEntries(sources.map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')])),
}, null, 2));
if (Object.values(checks).some((passed) => !passed)) process.exitCode = 1;
