#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const adaptationsPath = 'docs/development/pstack-adaptations.json';
const patchPath = 'docs/development/pstack-adaptations.patch';
const recordPath = 'docs/development/pstack-source.json';
const ownerRoots = ['.agents/playbooks', '.agents/rules'];
const lineReference = /:\d+(?:-\d+)?$/;
const trailingPunctuation = /[.:/]+$/;
const placeholderChar = /[*<>{}$[]/;
const skillFile = /^\.agents\/skills\/[^/]+\/SKILL\.md$/;
const fileHeader = /^diff --git /gm;
const markdownFile = /\.(md|mdc)$/;
const codeSpan = /`([^`\n]+)`/g;
const codeWord = /[A-Za-z_$][\w$-]*/g;
const dottedName = /^[A-Za-z_$][\w$]*(?:\.[\w$]+)+$/;
const innerCapital = /^[A-Za-z_$][a-z0-9_$]*[A-Z][\w$]*$/;
const upperSnake = /^[A-Z][A-Z0-9]*_[A-Z0-9_]+$/;
const dataAttribute = /(data-[a-z][a-z0-9-]*)/;
const packageSpecifier = /^(?:@platejs\/[\w-]+|platejs)(?:\/[\w-]+)*$/;
const callParens = /\(\)$/;
const fileExtension =
  /^(?:c?js|mjs|jsx?|tsx?|mdx?|mdc|json|jsonc|ya?ml|html|css|txt|log|tsv|sh|lock)$/;
const identifierOf = (span) => {
  const text = span.replace(callParens, '');
  if (packageSpecifier.test(text)) return text;
  const attribute = text.match(dataAttribute);
  if (attribute) return attribute[1];
  if (dottedName.test(text)) {
    const last = text.split('.').at(-1);
    return fileExtension.test(last) ? undefined : last;
  }
  if (innerCapital.test(text) || upperSnake.test(text)) return text;
};
const usage = `Usage: node tooling/scripts/sync-workflow-source.mjs <mode> [--source <checkout>]
  --write [--commit <sha>]  lay down the source commit plus the adaptations
  --record                  save local owner edits as the adaptations patch
  --check                   fail when owners differ from the record
  --report                  list adapted lines that still need review`;

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const mode = ['--write', '--record', '--check', '--report'].find((name) =>
  args.includes(name)
);
if (!mode) {
  console.error(usage);
  process.exit(2);
}

const adaptations = JSON.parse(
  readFileSync(join(root, adaptationsPath), 'utf8')
);
const record = JSON.parse(readFileSync(join(root, recordPath), 'utf8'));
const source = resolve(
  root,
  option('--source') ?? `../${adaptations.checkout}`
);
const sourceGit = (...gitArgs) =>
  execFileSync('git', ['-C', source, ...gitArgs], {
    encoding: 'buffer',
    maxBuffer: 256 * 1024 * 1024,
  });
const commit =
  mode === '--write'
    ? (option('--commit') ?? sourceGit('rev-parse', 'HEAD').toString().trim())
    : record.commit;
const listSource = (...paths) =>
  paths.length === 0
    ? []
    : sourceGit('ls-tree', '-r', '--name-only', commit, '--', ...paths)
        .toString()
        .split('\n')
        .filter(Boolean);
const show = (path) => sourceGit('show', `${commit}:${path}`);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fail = (lines) => {
  console.error(lines.join('\n'));
  process.exit(1);
};

const sourceLock = JSON.parse(show('skills-lock.json').toString());
const installedDirs = Object.keys(sourceLock.skills).map(
  (name) => `.agents/skills/${name}`
);
const localLock = JSON.parse(
  readFileSync(join(root, 'skills-lock.json'), 'utf8')
);
const scannedDirs = [
  ...new Set([
    ...installedDirs,
    ...Object.keys(localLock.skills).map((name) => `.agents/skills/${name}`),
  ]),
];
const installedPaths = listSource(...installedDirs);
const toolingPaths = listSource(...adaptations.tooling);
const sourcePaths = [
  ...listSource(...ownerRoots),
  ...toolingPaths,
  ...installedPaths,
  'skills-lock.json',
];
const omitted = new Set(Object.keys(adaptations.omit));
const notInSource = [
  ...[...omitted]
    .filter((path) => !sourcePaths.includes(path))
    .map((path) => `${path}: omitted file is not in the source`),
  ...adaptations.tooling
    .filter((path) => !toolingPaths.includes(path))
    .map((path) => `${path}: tooling file is not in the source`),
];
if (notInSource.length > 0) fail(notInSource);
const kept = sourcePaths.filter((path) => !omitted.has(path));
const edited = kept.filter(
  (path) => !installedPaths.includes(path) && path !== 'skills-lock.json'
);

const expected = mkdtempSync(join(tmpdir(), 'workflow-source-'));
process.on('exit', () => rmSync(expected, { force: true, recursive: true }));
const isolatedGit = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
};
const expectedGit = (...gitArgs) =>
  execFileSync('git', ['-C', expected, ...gitArgs], {
    encoding: 'utf8',
    env: isolatedGit,
    maxBuffer: 256 * 1024 * 1024,
  });
expectedGit('init', '-q');
for (const path of kept) {
  mkdirSync(dirname(join(expected, path)), { recursive: true });
  writeFileSync(join(expected, path), show(path));
}
expectedGit('add', '-A');

if (mode === '--record') {
  const missing = edited.filter((path) => !existsSync(join(root, path)));
  if (missing.length > 0) {
    fail(
      missing.map(
        (path) => `${path}: deleted locally; add it to "omit" with its reason`
      )
    );
  }
  for (const path of edited) cpSync(join(root, path), join(expected, path));
  const patch = expectedGit(
    'diff',
    '--no-color',
    '--no-ext-diff',
    '--no-textconv',
    '--binary',
    '--src-prefix=a/',
    '--dst-prefix=b/'
  );
  writeFileSync(join(root, patchPath), patch);
  console.info(
    `Recorded ${patch.match(fileHeader)?.length ?? 0} adapted files in ${patchPath}.`
  );
  process.exit(0);
}

let rejects = [];
if (
  existsSync(join(root, patchPath)) &&
  readFileSync(join(root, patchPath)).length > 0
) {
  const applied = spawnSync(
    'git',
    [
      '-C',
      expected,
      'apply',
      '--whitespace=nowarn',
      ...(mode === '--write' ? ['--reject'] : []),
      join(root, patchPath),
    ],
    { encoding: 'utf8', env: isolatedGit }
  );
  if (applied.status !== 0) {
    rejects = expectedGit('ls-files', '--others', '--', '*.rej')
      .split('\n')
      .filter(Boolean);
    if (rejects.length === 0) {
      fail([
        `${patchPath} does not apply to ${adaptations.checkout} ${commit}:`,
        applied.stderr.trim(),
      ]);
    }
  }
}

const localPaths = execFileSync(
  'git',
  [
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    ...ownerRoots,
    ...scannedDirs,
  ],
  { cwd: root, encoding: 'utf8' }
)
  .split('\n')
  .filter((path) => path && existsSync(join(root, path)));
const keptSet = new Set(kept);
const stale = localPaths.filter((path) => !keptSet.has(path));

if (mode === '--report') {
  const markers = new RegExp(adaptations.markers.join('|'), 'i');
  const scripts = new Set(
    Object.keys(
      JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts
    )
  );
  const builtins = new Set(adaptations.pnpmBuiltins);
  const manifests = new Map(
    execFileSync(
      'git',
      [
        'ls-files',
        '--',
        'apps/*/package.json',
        'packages/*/package.json',
        'packages/*/*/package.json',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      }
    )
      .split('\n')
      .filter(Boolean)
      .map((path) => JSON.parse(readFileSync(join(root, path), 'utf8')))
      .map((manifest) => [manifest.name, manifest])
  );
  const workspaceScripts = new Map(
    [...manifests].map(([name, manifest]) => [
      name,
      new Set(Object.keys(manifest.scripts ?? {})),
    ])
  );
  const repoFiles = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  )
    .split('\n')
    .filter((path) => path && existsSync(join(root, path)));
  const repoEntries = new Set(
    repoFiles.flatMap((path) =>
      path
        .split('/')
        .map((_, index, parts) => parts.slice(0, index + 1).join('/'))
    )
  );
  const knownEnv = new Set(
    execFileSync(
      'git',
      [
        'grep',
        '-h',
        '-o',
        '-E',
        'PLATE_[A-Z0-9_]+',
        '--',
        ':!.agents',
        ':!docs',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      }
    ).split('\n')
  );
  const anyWorkspaceScript = (name) =>
    [...workspaceScripts.values()].some((names) => names.has(name));
  const accepted = adaptations.accept.map(({ file, hit }) => ({
    file: file && new RegExp(file),
    hit: new RegExp(hit),
  }));
  const isAccepted = (path, hit) =>
    accepted.some(
      (rule) => (!rule.file || rule.file.test(path)) && rule.hit.test(hit)
    );
  const identifiers = new Map();
  for (const path of edited) {
    if (!markdownFile.test(path)) continue;
    for (const [, span] of readFileSync(join(root, path), 'utf8').matchAll(
      codeSpan
    )) {
      const name = identifierOf(span);
      if (name) identifiers.set(span, name);
    }
  }
  const knownIdentifiers = new Set();
  for (const path of repoFiles) {
    if (
      path.startsWith('.agents/') ||
      (path.startsWith('docs/') && !path.endsWith('.json')) ||
      !lstatSync(join(root, path)).isFile()
    ) {
      continue;
    }
    const bytes = readFileSync(join(root, path));
    if (bytes.includes(0)) continue;
    for (const [word] of bytes.toString('utf8').matchAll(codeWord)) {
      knownIdentifiers.add(word);
    }
  }
  const specifierExists = (specifier) => {
    const parts = specifier.split('/');
    const name = specifier.startsWith('@')
      ? parts.slice(0, 2).join('/')
      : parts[0];
    const subpath = specifier.slice(name.length);
    const manifest = manifests.get(name);
    if (!manifest) return false;
    if (!subpath) return true;
    return Object.hasOwn(manifest.exports ?? {}, `.${subpath}`);
  };
  const repoPath =
    /(?:^|[\s`'"(])((?:packages|apps|tooling|docs|content|templates|config|benchmarks|\.agents|\.claude|\.codex)\/[^\s`'"()|,;]*)/g;
  const pnpmScript = /\bpnpm (?:run )?([a-z][\w:.-]*)(\*?)/g;
  const filteredScript =
    /\bpnpm (?:--filter|-F) ([@\w/.-]+) (?:run )?([a-z][\w:.-]*)/g;
  const envName = /\bPLATE_[A-Z0-9_]+/g;
  let count = 0;
  for (const path of edited) {
    if (!markdownFile.test(path)) continue;
    readFileSync(join(root, path), 'utf8')
      .split('\n')
      .forEach((line, index) => {
        const hits = [];
        const marker = line.match(markers);
        if (marker) hits.push(`engine ${marker[0].toLowerCase()}`);
        for (const [, raw] of line.matchAll(repoPath)) {
          const target = raw
            .split('#')[0]
            .replace(lineReference, '')
            .replace(trailingPunctuation, '');
          if (!placeholderChar.test(target) && !repoEntries.has(target)) {
            hits.push(`path ${target}`);
          }
        }
        for (const [, span] of line.matchAll(codeSpan)) {
          const name = identifiers.get(span);
          if (!name) continue;
          const known =
            name.startsWith('@') || name.startsWith('platejs')
              ? specifierExists(name)
              : knownIdentifiers.has(name);
          if (!known) hits.push(`identifier ${name}`);
        }
        for (const [, name, glob] of line.matchAll(pnpmScript)) {
          if (
            !glob &&
            !scripts.has(name) &&
            !builtins.has(name) &&
            !anyWorkspaceScript(name)
          ) {
            hits.push(`script ${name}`);
          }
        }
        for (const [, pkg, name] of line.matchAll(filteredScript)) {
          if (!workspaceScripts.has(pkg)) hits.push(`package ${pkg}`);
          else if (
            !workspaceScripts.get(pkg).has(name) &&
            !builtins.has(name)
          ) {
            hits.push(`script ${pkg} ${name}`);
          }
        }
        for (const [name] of line.matchAll(envName)) {
          if (!knownEnv.has(name)) hits.push(`env ${name}`);
        }
        const open = hits.filter((hit) => !isAccepted(path, hit));
        if (open.length === 0) return;
        count += 1;
        console.log(`${path}:${index + 1}: ${open.join(', ')}: ${line.trim()}`);
      });
  }
  console.log(`${count} lines to review`);
  process.exit(0);
}

const changed = kept.filter((path) => {
  const target = join(root, path);
  return (
    !existsSync(target) ||
    !readFileSync(target).equals(readFileSync(join(expected, path)))
  );
});

if (mode === '--check') {
  const drift = [...changed, ...stale.map((path) => `${path} (not in source)`)];
  if (drift.length > 0) {
    fail([
      `Workflow owners differ from ${adaptations.checkout} ${commit} plus the adaptations:`,
      ...drift,
    ]);
  }
  console.info(
    `Workflow owners match ${adaptations.checkout} ${commit} plus the adaptations.`
  );
  process.exit(0);
}

for (const path of changed) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  cpSync(join(expected, path), join(root, path));
}
for (const path of stale) rmSync(join(root, path));
const skillNames = listSource('.agents/skills')
  .filter((path) => skillFile.test(path))
  .map((path) => path.split('/')[2])
  .sort();
writeFileSync(
  join(root, recordPath),
  `${JSON.stringify(
    {
      repository: record.repository,
      checkout: adaptations.checkout,
      commit,
      skillNames,
      sourceFiles: Object.fromEntries(
        sourcePaths.map((path) => [path, sha256(show(path))])
      ),
      removedSkills: record.removedSkills,
    },
    null,
    2
  )}\n`
);
console.info(
  `Wrote ${changed.length} and removed ${stale.length} files from ${adaptations.checkout} ${commit}; ${omitted.size} source files omitted.`
);
if (rejects.length > 0) {
  fail([
    `${rejects.length} adapted files have hunks that no longer apply. Re-apply them by hand, then run --record:`,
    ...rejects.map((path) => readFileSync(join(expected, path), 'utf8')),
  ]);
}
