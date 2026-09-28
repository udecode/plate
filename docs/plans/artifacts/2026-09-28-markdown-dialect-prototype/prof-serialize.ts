import { readFileSync } from 'node:fs';

const root = process.env.ROOT!;
const { createTestEditor } = await import(
  `${root}/packages/platejs/src/markdown/lib/__tests__/createTestEditor`
);
const editor = createTestEditor();
const md = editor.api.markdown;
const { unit } = JSON.parse(readFileSync(process.env.CORPUS!, 'utf8'));
const source = Array.from({ length: 100 }, () => unit).join('\n\n');
const parsed = md.parse(source, { lossPolicy: 'allow' });
if (!parsed.ok) throw new Error('parse failed');
const serialize = () =>
  process.env.MODE === 'baseline'
    ? md.serialize({ document: parsed.document, lossPolicy: 'allow' } as never)
    : md.serialize({ document: parsed.document, lossPolicy: 'allow' });
for (let i = 0; i < 3; i++) serialize();
const t = performance.now();
for (let i = 0; i < 15; i++) serialize();
console.log(process.env.MODE, 'serialize avg ms', ((performance.now() - t) / 15).toFixed(1));
