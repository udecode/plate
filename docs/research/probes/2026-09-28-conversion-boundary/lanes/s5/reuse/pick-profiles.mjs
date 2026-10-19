// Lists a cell's saved CPU profiles for one arm (measured pairs only by
// default: the warmup is the first stream per arm), by the cell's start time.
// Usage: node pick-profiles.mjs <matrix-dir> <profile-dir> <cell> <arm> [--with-warmup]
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const [matrixDir, profileDir, cellName, arm, flag] = process.argv.slice(2);
const cells = readdirSync(matrixDir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
  .map((f) => JSON.parse(readFileSync(path.join(matrixDir, f), 'utf8')))
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
const index = cells.findIndex((c) => c.cell === cellName);
const from = Date.parse(cells[index].startedAt);
const to = index + 1 < cells.length ? Date.parse(cells[index + 1].startedAt) : Infinity;
const composition = cells[index].composition;
const files = readdirSync(profileDir)
  .filter((f) => f.startsWith(`${composition}-${arm}-`))
  .map((f) => [Number(f.split('-')[2].split('.')[0]), f])
  .filter(([ms]) => ms >= from && ms < to)
  .sort((a, b) => a[0] - b[0])
  .map(([, f]) => path.join(profileDir, f));
console.log((flag === '--with-warmup' ? files : files.slice(1)).join('\n'));
