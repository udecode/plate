import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { stateOf } from '../../.agents/pstack/status.mjs';
import { existsAt, grepFiles, showAt } from './private-files.mjs';
import { planLabels } from './review-ledger.mjs';

export const generatedPrefixes = [
  '.agents/skills/',
  '.claude/skills/',
  'apps/www/public/r/',
  'apps/www/src/__registry__/',
  'apps/www/src/generated/',
];
export const releaseNotePrefixes = [
  '.changeset/',
  'apps/www/src/registry/changelog/',
];
const upToOneWordBetween = '([^a-z0-9]+[a-z0-9]+)?[^a-z0-9]*';
const wholeRepository = ':/';

export const termPattern = (term) => {
  if (/\P{ASCII}/u.test(term) || !/[A-Za-z0-9]/.test(term)) {
    throw new Error(`"${term}" is not an ASCII API name`);
  }
  return term
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
    .join(upToOneWordBetween);
};

const twinOf = (path) =>
  path.startsWith('content/docs/') &&
  path.endsWith('.mdx') &&
  !path.endsWith('.cn.mdx')
    ? path.replace(/\.mdx$/, '.cn.mdx')
    : null;

export const sweep = ({ cwd = process.cwd(), rev, terms }) => {
  const patterns = terms.flatMap((term) => ['-e', termPattern(term)]);
  const git = (args) =>
    spawnSync('git', args, {
      cwd,
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
    });
  const root = git(['rev-parse', '--show-toplevel']).stdout.trim();
  const found = grepFiles(
    root,
    [
      '-z',
      '-n',
      '--no-column',
      '--no-color',
      '-I',
      '-i',
      '-E',
      '--full-name',
      ...patterns,
    ],
    [wholeRepository],
    { rev }
  );

  const exists = (path) =>
    rev ? existsAt(root, rev, path) : existsSync(join(root, path));
  const read = (path) =>
    rev
      ? showAt(root, rev, path).stdout
      : readFileSync(join(root, path), 'utf-8');
  const closedPlans = new Map();
  const isClosedPlan = (path) => {
    if (!closedPlans.has(path)) {
      const labels = planLabels(read(path));
      closedPlans.set(
        path,
        labels.length > 0 && labels.every((label) => stateOf(label) === 'done')
      );
    }
    return closedPlans.get(path);
  };
  const classify = (path) => {
    if (generatedPrefixes.some((prefix) => path.startsWith(prefix))) {
      return 'generated';
    }
    if (releaseNotePrefixes.some((prefix) => path.startsWith(prefix))) {
      return 'release notes';
    }
    if (
      path.startsWith('docs/research/review-records/') ||
      path.endsWith('.decisions.tsv') ||
      path.endsWith('CHANGELOG.md') ||
      (path.startsWith('docs/plans/') &&
        !path.startsWith('docs/plans/topics/') &&
        path.endsWith('.md') &&
        isClosedPlan(path))
    ) {
      return 'history';
    }
    return 'live';
  };

  /** @type {Record<string, string[]>} */
  const groups = { live: [], generated: [], 'release notes': [], history: [] };
  const livePaths = new Set();
  let parsed = 0;
  for (const [record, path, number, text] of found.matchAll(
    /([^\0]*)\0(\d+)\0([^\n]*)\n/g
  )) {
    parsed += record.length;
    const group = classify(path);
    if (group === 'live') livePaths.add(path);
    groups[group].push(`${path}:${number}: ${text.trim().slice(0, 160)}`);
  }
  if (parsed !== found.length) {
    throw new Error('git grep printed records this sweep cannot parse');
  }
  const twins = [...livePaths]
    .flatMap((path) => {
      const twin = twinOf(path);
      return twin && exists(twin) ? [twin] : [];
    })
    .sort((left, right) => left.localeCompare(right));

  return { groups, twins };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const args = process.argv.slice(2);
  const revIndex = args.indexOf('--rev');
  const rev = revIndex === -1 ? undefined : args[revIndex + 1];
  const terms =
    revIndex === -1
      ? args
      : args.filter((_, index) => index !== revIndex && index !== revIndex + 1);
  const usage =
    'Usage: node tooling/scripts/teaching-sweep.mjs [--rev <commit>] <ASCII API name> [...]';
  if (terms.length === 0 || (revIndex !== -1 && !rev)) {
    console.error(usage);
    process.exit(2);
  }
  let found;
  try {
    found = sweep({ rev, terms });
  } catch (error) {
    console.error(`${error.message}\n${usage}`);
    process.exit(2);
  }
  for (const [name, lines] of Object.entries(found.groups)) {
    console.info(`${name} (${lines.length})`);
    for (const line of lines) console.info(`  ${line}`);
  }
  console.info(`Chinese twins to read (${found.twins.length})`);
  for (const twin of found.twins) console.info(`  ${twin}`);
}
