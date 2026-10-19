// bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-29-conversion-next-review/html-property-loss.ts
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { BaseParagraphPlugin } from 'platejs';
import { serializeHtml } from 'platejs/html';
import { parseHtml } from 'platejs/html/server';
import { BaseImagePlugin } from 'platejs/media';

const plugins = [BaseParagraphPlugin, BaseImagePlugin];
const input = {
  children: [{
    type: 'image',
    url: 'https://example.test/photo.png',
    alt: 'alt',
    title: 'IMPORTANT TITLE',
    children: [{ text: 'caption' }],
  }],
};
const result = serializeHtml(input, { plugins });
const reparsed = result.ok ? parseHtml(result.data, { plugins }) : null;
const titlePreserved = reparsed?.ok &&
  reparsed.document.children[0].title === input.children[0].title;
const lossReported = result.diagnostics.length > 0;
const sources = [
  'packages/platejs/src/lib/plugins/html/HtmlPlugin.ts',
  'packages/platejs/src/lib/plugins/html/htmlConversion.ts',
  'packages/platejs/src/features/media/lib/image/BaseImagePlugin.ts',
  'packages/platejs/src/html/server/index.ts',
];
console.log(JSON.stringify({
  input,
  result,
  reparsed,
  checks: { titlePreserved, lossReported, preservedOrDiagnosed: titlePreserved || lossReported },
  sources: Object.fromEntries(sources.map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')])),
}, null, 2));
if (!titlePreserved && !lossReported) process.exitCode = 1;
