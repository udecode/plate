import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { writeFileSync } from 'node:fs';
import { createTestEditor } from '../../../../apps/www/src/__tests__/package-integration/ai-chat-streaming/__tests__/createTestEditor';
import { BaseEditorRenderers } from '../../../../apps/www/src/registry/components/editor/plugins-static';
import { PlateStatic } from '../../../../packages/platejs/src/static';
import { createMarkdownStream } from '../../../../packages/platejs/src/markdown/lib/internal/createMarkdownStream';

const rows = [];
for (const bytes of process.env.AI_RENDER_BYTES ? [Number(process.env.AI_RENDER_BYTES)] : [1024, 10240, 102400]) {
  const source = 'Some **bold** text.\n\n'.repeat(Math.ceil(bytes / 20)).slice(0, bytes);
  const { editor } = createTestEditor({ children: [{ type: 'paragraph', children: [{ text: '' }] }] });
  const parser = createMarkdownStream(editor);
  const prefix = parser.update(source.slice(0, -128));
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host);
  flushSync(() => root.render(<PlateStatic editor={editor} value={{ children: prefix }} renderers={BaseEditorRenderers} />));
  const samples = [];
  for (let run = 0; run < 14; run++) {
    const input = source + ' more text'.repeat(run);
    const start = performance.now();
    const value = parser.update(input);
    const parsed = performance.now();
    flushSync(() => root.render(<PlateStatic editor={editor} value={{ children: value }} renderers={BaseEditorRenderers} />));
    const end = performance.now();
    samples.push({run, bytes: input.length, parse: parsed-start, render: end-parsed, total: end-start});
  }
  rows.push({ bytes, nodes: parser.value.length, cold: samples[0], warm: samples.slice(4), p95: samples.slice(4).map(s=>s.total).toSorted((a,b)=>a-b)[9], canonicalText: editor.read.text.string([]) });
  flushSync(() => root.unmount()); host.remove();
}
console.log(JSON.stringify(rows));
writeFileSync('docs/plans/artifacts/ai-streaming/render-probe.json', JSON.stringify({ scope: 'Production React HappyDOM mounted render diagnosis (one cold, three warmups, ten warm samples), not Browser timing or acceptance evidence', rows }, null, 2));
