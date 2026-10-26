import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { generatedPrefixes, releaseNotePrefixes } from './teaching-sweep.mjs';

const manifestPath = 'apps/www/src/generated/api-reference-manifest.json';
const notAfterScopeOrPath = '(^|[^@A-Za-z0-9_./-])';
const notBeforeLongerPath = '($|[^A-Za-z0-9_/-])';
const memberPattern = /^\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*[(:<]/gmu;
const wordPattern = /[A-Za-z_$][\w$]*/gu;

const teachingPaths = [
  '.agents/playbooks',
  '.agents/rules',
  'AGENTS.md',
  'CODING_STANDARDS.md',
  'README.md',
  'VISION.md',
  'apps',
  'content/docs',
  'docs/development',
  'docs/editor-behavior',
  'docs/plans/topics',
  'docs/research/sources',
  'docs/vision',
  'packages',
];
const pathspecs = [
  ...teachingPaths,
  ...[...generatedPrefixes, ...releaseNotePrefixes].map(
    (prefix) => `:(exclude)${prefix}`
  ),
  ':(exclude,glob)**/CHANGELOG.md',
];
const intentionalMentionsOfCutMembers = [
  'apps',
  'content/docs/migration',
  'docs/plans/topics',
];
const memberPathspecs = [
  ...pathspecs,
  ...intentionalMentionsOfCutMembers.map((path) => `:(exclude)${path}`),
];
const isProseHit = (hit) => /^[^:]+\.(md|mdc|mdx):/u.test(hit);
const isCompoundName = (name) => /[a-z0-9][A-Z]|_/u.test(name);
const sourcePathspecs = [
  'apps',
  'packages',
  ...generatedPrefixes.map((prefix) => `:(exclude)${prefix}`),
  ':(exclude,glob)**/*.md',
  ':(exclude,glob)**/*.mdx',
];

export const findRemovedApiTeaching = ({ base, cwd = process.cwd() }) => {
  const git = (args) =>
    spawnSync('git', args, {
      cwd,
      encoding: 'utf-8',
      maxBuffer: 256 * 1024 * 1024,
    });
  const root = git(['rev-parse', '--show-toplevel']).stdout.trim();
  const commit = git([
    'rev-parse',
    '--verify',
    '--quiet',
    `${base}^{commit}`,
  ]).stdout.trim();
  if (!commit) throw new Error(`cannot resolve the base commit ${base}`);

  const readBase = (path) => {
    const result = git(['show', `${commit}:${path}`]);
    return result.status === 0 ? result.stdout : null;
  };
  const readHead = (path) => {
    try {
      return readFileSync(join(root, path), 'utf-8');
    } catch {
      return null;
    }
  };
  const baseManifest = readBase(manifestPath);
  const headManifest = readHead(manifestPath);
  if (baseManifest === null || headManifest === null) {
    throw new Error(
      `${manifestPath} is missing ${baseManifest === null ? `at ${base}` : 'from the working tree'}`
    );
  }

  const publicNames = (manifest) => {
    const symbols = Object.values(JSON.parse(manifest).packages).flatMap(
      (entry) => Object.values(entry.symbols)
    );
    return {
      exports: new Set(symbols.map(({ name }) => name)),
      members: new Set(
        symbols.flatMap(({ signature = '' }) =>
          [...signature.matchAll(memberPattern)].map(([, member]) => member)
        )
      ),
      mentionedWords: new Set(
        symbols.flatMap(({ name, signature = '' }) => [
          name,
          ...(signature.match(wordPattern) ?? []),
        ])
      ),
    };
  };
  const entrypoints = (read, directories) =>
    new Set(
      directories.flatMap((directory) => {
        const manifest = read(`packages/${directory}/package.json`);
        if (manifest === null) return [];
        const { exports = {}, name } = JSON.parse(manifest);
        return Object.keys(exports)
          .filter(
            (key) =>
              key.startsWith('./') &&
              !key.includes('*') &&
              key !== './package.json'
          )
          .map((key) => `${name}/${key.slice(2)}`);
      })
    );
  const baseDirectories = git([
    'ls-tree',
    '-d',
    '--name-only',
    commit,
    'packages/',
  ])
    .stdout.split('\n')
    .filter(Boolean)
    .map((path) => path.slice('packages/'.length));
  const headDirectories = readdirSync(join(root, 'packages'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const baseNames = publicNames(baseManifest);
  const headNames = publicNames(headManifest);
  const headEntrypoints = entrypoints(readHead, headDirectories);
  const specifiers = [...entrypoints(readBase, baseDirectories)]
    .filter((specifier) => !headEntrypoints.has(specifier))
    .sort((left, right) => left.localeCompare(right));

  const grep = (flags, patterns, specs) => {
    if (patterns.length === 0) return [];
    const result = git([
      'grep',
      '--untracked',
      '-I',
      '--no-color',
      ...flags,
      ...patterns.flatMap((pattern) => ['-e', pattern]),
      '--',
      ...specs,
    ]);
    if (result.status !== 0 && result.status !== 1) {
      throw new Error(
        result.stderr.trim() || `git grep exited ${result.status}`
      );
    }
    return result.stdout.split('\n').filter(Boolean);
  };
  const lines = ['-n', '--full-name'];
  const exports = [...baseNames.exports].filter(
    (name) => !headNames.exports.has(name)
  );
  const membersGoneFromApi = [...baseNames.members].filter(
    (name) => isCompoundName(name) && !headNames.mentionedWords.has(name)
  );
  const stillInSource = new Set(
    grep(['-o', '-h', '-w', '-F'], membersGoneFromApi, sourcePathspecs)
  );
  const members = membersGoneFromApi.filter((name) => !stillInSource.has(name));
  const names = [...new Set([...exports, ...members])].sort((left, right) =>
    left.localeCompare(right)
  );
  const hits = [
    ...grep([...lines, '-w', '-F'], exports, pathspecs),
    ...grep([...lines, '-w', '-F'], members, memberPathspecs).filter(
      isProseHit
    ),
    ...grep(
      [...lines, '-E'],
      specifiers.map(
        (specifier) =>
          `${notAfterScopeOrPath}${specifier.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')}${notBeforeLongerPath}`
      ),
      pathspecs
    ),
  ];
  return { hits: [...new Set(hits)].sort(), names, specifiers };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const base = process.env.PLATE_BASELINE_BASE || 'HEAD';
  let found;
  try {
    found = findRemovedApiTeaching({ base });
  } catch (error) {
    console.error(`[removed-api-teaching] ${error.message}`);
    process.exit(2);
  }
  const removed = [...found.names, ...found.specifiers];
  if (found.hits.length > 0) {
    console.error(
      `[removed-api-teaching] ${found.hits.length} lines still name an export or type member removed since ${base} (${removed.join(', ')}). Teach what replaced it, or delete the line:`
    );
    for (const hit of found.hits) console.error(`  ${hit.slice(0, 200)}`);
    process.exit(1);
  }
  console.info(
    `[removed-api-teaching] no teaching file names the ${removed.length} exports and type members removed since ${base}.`
  );
}
