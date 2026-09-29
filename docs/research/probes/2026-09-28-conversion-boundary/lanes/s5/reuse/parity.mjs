// Final-output parity from S5_SAVE_TEXT dumps: per composition and arm, the
// distinct text and HTML hashes, and data-editor-ai-end markers in AI HTML.
// Dump files are `${composition}-${arm}-${ms}.{txt,html}` in run order, so
// they map to cells by the order the matrix ran them.
// Usage: node parity.mjs <dump-dir> <matrix-dir> [out.json]
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , dumpDir, matrixDir, out] = process.argv;
const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);
const dumps = readdirSync(dumpDir)
  .filter((f) => f.endsWith('.txt'))
  .map((f) => {
    const [composition, arm, ms] = f.replace('.txt', '').split('-');
    const text = readFileSync(path.join(dumpDir, f), 'utf8');
    const html = readFileSync(path.join(dumpDir, f.replace('.txt', '.html')), 'utf8');
    return {
      arm,
      composition,
      aiEnd: (html.match(/data-editor-ai-end/g) ?? []).length,
      htmlSha: sha(html),
      ms: Number(ms),
      textSha: sha(text),
    };
  })
  .sort((a, b) => a.ms - b.ms);
const cells = readdirSync(matrixDir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
  .map((f) => JSON.parse(readFileSync(path.join(matrixDir, f), 'utf8')))
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
// Each cell's streams save in order; attribute dumps to the cell whose
// started time precedes them.
const rows = cells.map((cell, index) => {
  const from = Date.parse(cell.startedAt);
  const to = index + 1 < cells.length ? Date.parse(cells[index + 1].startedAt) : Infinity;
  const mine = dumps.filter((d) => d.ms >= from && d.ms < to);
  const group = (arm, key) => [...new Set(mine.filter((d) => d.arm === arm).map((d) => d[key]))];
  const textShas = { baseline: group('baseline', 'textSha'), candidate: group('candidate', 'textSha') };
  const htmlShas = { baseline: group('baseline', 'htmlSha'), candidate: group('candidate', 'htmlSha') };
  return {
    cell: cell.cell,
    streams: mine.length,
    textMatch: textShas.baseline.length === 1 && textShas.candidate.length === 1 && textShas.baseline[0] === textShas.candidate[0],
    htmlMatch: htmlShas.baseline.length === 1 && htmlShas.candidate.length === 1 && htmlShas.baseline[0] === htmlShas.candidate[0],
    textShas,
    htmlShas,
    aiEndMarkers: {
      baseline: group('baseline', 'aiEnd'),
      candidate: group('candidate', 'aiEnd'),
    },
  };
});
if (out) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
for (const r of rows) {
  console.log(`${r.cell}: ${r.streams} streams, text ${r.textMatch ? 'match' : 'DIFFER'}, html ${r.htmlMatch ? 'match' : 'DIFFER'}, ai-end markers base ${r.aiEndMarkers.baseline} cand ${r.aiEndMarkers.candidate} | text ${JSON.stringify(r.textShas)} html ${JSON.stringify(r.htmlShas)}`);
}
