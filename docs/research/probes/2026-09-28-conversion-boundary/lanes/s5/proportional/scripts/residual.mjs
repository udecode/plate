// Residual cost per preview commit before the lead's fixes (superseded pp run)
// and after them (pp3), at 10 KB and 50 KB, from the frame breakdowns, the
// source-read split, the snapshot-index callers, the commit phases and the
// render pipeline. All values are ms per preview commit (candidate, median
// streams; frame totals are means over the three measured streams).
// Usage: node residual.mjs <proportional-dir> <scratch-dir>
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [dir, scratch] = process.argv.slice(2);
const read = (file) => readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const byCell = (rows) => new Map(rows.map((row) => [row.cell, row]));
const runs = {
  pp: {
    commits: byCell(json(path.join(dir, 'superseded-pp/chunking/commit-cost.json'))),
    concurrent: (cell) => read(path.join(scratch, `pp-work/uf/uf-${cell}.txt`)),
    sync: (cell) =>
      cell.startsWith('static')
        ? read(path.join(dir, `superseded-pp/chunking/frames/${cell}-sync.txt`))
        : read(path.join(dir, `chunking/before-after/pp-${cell}-sync.txt`)),
    reads: byCell(json(path.join(dir, 'chunking/read-split/pp.json'))),
    index: json(path.join(dir, 'chunking/before-after/snapshot-index.json')).pp,
    pipeline: byCell(json(path.join(dir, 'chunking/before-after/render-pipeline-pp.json'))),
  },
  pp3: {
    commits: byCell(json(path.join(dir, 'chunking/commit-cost.json'))),
    concurrent: (cell) => read(path.join(scratch, `pp-work/uf3/${cell}.txt`)),
    sync: (cell) => read(path.join(dir, `chunking/frames/${cell}-sync.txt`)),
    reads: byCell(json(path.join(dir, 'chunking/read-split/pp3.json'))),
    index: json(path.join(dir, 'chunking/before-after/snapshot-index.json')).pp3,
    pipeline: byCell(json(path.join(dir, 'chunking/render-pipeline.json'))),
  },
};
const frame = (text, name) => {
  const inclusive = text.split('by self')[0];
  const match = new RegExp(`^\\s+([\\d.]+)\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm').exec(inclusive);
  return match ? Number(match[1]) : 0;
};
const r2 = (n) => Math.round(n * 100) / 100;
const cells = ['static-rich', 'static-cjk', 'ai-rich', 'ai-cjk'];
const metrics = {
  'per-block pass (deferred)': (run, cell) => {
    const t = runs[run].concurrent(cell);
    return frame(t, 'Children@') + frame(t, 'updateMemoComponent@') + frame(t, 'bailoutOnAlreadyFinishedWork@');
  },
  '  source reads (deferred)': (run, cell, commits) => runs[run].reads.get(cell).deferredSum * commits,
  '  readBlockInputs visit (deferred)': (run, cell) => frame(runs[run].concurrent(cell), 'visit@1656-'),
  '  memo compares and bailouts (deferred)': (run, cell) => {
    const t = runs[run].concurrent(cell);
    return frame(t, 'updateMemoComponent@') + frame(t, 'bailoutOnAlreadyFinishedWork@');
  },
  'static pass on urgent renders (Children under renderRootSync)': (run, cell) => frame(runs[run].sync(cell), 'Children@'),
  'all urgent renders (renderRootSync)': (run, cell) => Number(/^\S+: ([\d.]+) ms per profile/m.exec(runs[run].sync(cell))[1]),
  'snapshot-index materialization': (run, cell) => runs[run].index[cell],
  'AI forced layout (passive effects)': (run, cell, commits) => runs[run].commits.get(cell).medians.candidate.reactPhasesMs.flushPassiveEffects,
  'deferred render (renderRootConcurrent)': (run, cell) => Number(/^\S+: ([\d.]+) ms per profile/m.exec(runs[run].concurrent(cell))[1]),
  'style, layout and paint (trace)': (run, cell) => runs[run].pipeline.get(cell).candidate.totalMs,
};
const table = {};
const lines = [];
for (const [name, metric] of Object.entries(metrics)) {
  table[name] = {};
  const parts = [];
  for (const cell of cells) {
    const values = {};
    for (const run of ['pp', 'pp3']) {
      for (const size of ['10000', '50000']) {
        const key = `${cell}-${size}`;
        const commits = runs[run].commits.get(key).medians.candidate.previewCommits;
        const total = metric(run, key, commits);
        values[`${run} ${size === '10000' ? '10K' : '50K'}`] = r2(total / commits);
      }
    }
    table[name][cell] = values;
    parts.push(`${cell}: ${values['pp 10K']} > ${values['pp 50K']} | ${values['pp3 10K']} > ${values['pp3 50K']}`);
  }
  lines.push(`${name}\n    ${parts.join('\n    ')}`);
}
writeFileSync(path.join(dir, 'chunking/before-after/residual.json'), `${JSON.stringify(table, null, 2)}\n`);
const text = `ms per preview commit: before the fixes (superseded pp) 10K > 50K | after (pp3) 10K > 50K\n${lines.join('\n')}\n`;
writeFileSync(path.join(dir, 'chunking/before-after/residual.txt'), text);
console.log(text);
