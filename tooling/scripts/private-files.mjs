// udecode/plate-private tracks the tests, plans and research that
// .gitprivate lists, in the same folder as udecode/plate, through the git
// directory .git-private. These readers see both repositories; package tasks
// import them, so the lifecycle CLI, git-private.mjs, stays out of their
// cache keys.
import { spawnSync } from 'node:child_process';
import {
  constants,
  copyFileSync,
  existsSync,
  statSync,
  utimesSync,
} from 'node:fs';
import { devNull } from 'node:os';
import path from 'node:path';

export const PRIVATE_DIR = '.git-private';
export const PRIVATE_LIST = '.gitprivate';
export const BRANCH = 'next';
export const UPSTREAM = `refs/remotes/origin/${BRANCH}`;
export const NULL_COMMIT = /^0+$/u;

// git check-ignore dies on literal pathspec magic, so no call inherits
// GIT_LITERAL_PATHSPECS.
const { GIT_LITERAL_PATHSPECS: _literal, ...inherited } = process.env;
export { inherited };
export const run = (cwd, args, { env, input } = {}) =>
  spawnSync('git', args, {
    cwd,
    encoding: 'utf-8',
    env: { ...inherited, ...env },
    input,
    maxBuffer: 1024 * 1024 * 256,
  });
export const must = (cwd, args, options) => {
  const result = run(cwd, args, options);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
};
export const entries = (text) => text.split('\0').filter(Boolean);
export const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/** The paths in `files` that the exclude file `list` matches. */
export const ignoredPaths = (cwd, list, files, { index = true } = {}) => {
  const result = run(
    cwd,
    [
      '-c',
      `core.excludesFile=${list}`,
      'check-ignore',
      '-z',
      ...(index ? [] : ['--no-index']),
      '--stdin',
    ],
    { input: files.join('\0') }
  );
  if (result.status > 1) {
    throw new Error(`git check-ignore failed: ${result.stderr.trim()}`);
  }
  return entries(result.stdout);
};

export const isSplit = (root) => existsSync(path.join(root, PRIVATE_DIR));
export const privateGit = (root, args, options) =>
  run(
    root,
    [
      `--git-dir=${path.join(root, PRIVATE_DIR)}`,
      `--work-tree=${root}`,
      ...args,
    ],
    options
  );
export const privateMust = (root, args, options) => {
  const result = privateGit(root, args, options);
  if (result.status !== 0) {
    throw new Error(
      `private git ${args.join(' ')} failed: ${result.stderr.trim()}`
    );
  }
  return result.stdout;
};
export const withList = (root) => [
  '-c',
  `core.excludesFile=${path.join(root, PRIVATE_LIST)}`,
];
export const lacksList = (root, commit) =>
  Boolean(commit) &&
  !NULL_COMMIT.test(commit) &&
  run(root, ['cat-file', '-e', `${commit}:${PRIVATE_LIST}`]).status !== 0;

/** Private files on disk that neither repository tracks yet. */
export const newPrivateFiles = (root, pathspecs = []) => {
  if (!existsSync(path.join(root, PRIVATE_LIST))) return [];
  // The private repository's own view skips what .gitignore and the user's
  // global excludes skip, and lists every public file as untracked, so those
  // go first. It does not read the public .git/info/exclude, which
  // check-ignore also matches, so a path the clone ignores there is dropped
  // rather than called private.
  const args = [
    'ls-files',
    '-z',
    '--others',
    '--exclude-standard',
    '--',
    ...pathspecs,
  ];
  const split = isSplit(root);
  const tracked =
    split &&
    new Set(entries(must(root, ['ls-files', '-z', '--', ...pathspecs])));
  const candidates = entries(
    split ? privateMust(root, args) : must(root, args)
  ).filter((file) => !tracked || !tracked.has(file));
  if (candidates.length === 0) return [];
  const listed = ignoredPaths(root, path.join(root, PRIVATE_LIST), candidates);
  if (listed.length === 0) return [];
  const ignoredHere = new Set(ignoredPaths(root, devNull, listed));
  return listed.filter((file) => !ignoredHere.has(file)).sort(byCodeUnit);
};

export const copyIndex = (from, to) => {
  // git rechecks the content of an entry no older than the index file. A copy
  // with a newer mtime would trust the stat data of a same-size edit made in
  // the second the index was written, and miss it.
  const { atime, mtime } = statSync(from);
  copyFileSync(from, to, constants.COPYFILE_FICLONE);
  utimesSync(to, atime, mtime);
};

export const listedPublic = (root, pathspecs = []) =>
  entries(
    must(root, [
      ...withList(root),
      'ls-files',
      '-z',
      '--cached',
      '--ignored',
      '--exclude-standard',
      '--',
      ...pathspecs,
    ])
  );

const newPublicFiles = (root, pathspecs = []) =>
  entries(
    must(root, [
      ...withList(root),
      'ls-files',
      '-z',
      '--others',
      '--exclude-standard',
      '--',
      ...pathspecs,
    ])
  );

/** The files on disk that `pathspecs` match and neither repository tracks or ignores. */
export const untrackedFiles = (root, pathspecs = []) => [
  ...newPublicFiles(root, pathspecs),
  ...newPrivateFiles(root, pathspecs),
];

/**
 * The files each repository tracks, or would track once split, that
 * `pathspecs` match; with `untracked`, also the files on disk that neither
 * tracks yet and neither ignores.
 */
export const repoFiles = (root, { pathspecs = [], untracked = false } = {}) => {
  const scope = ['--', ...pathspecs];
  const listed = entries(must(root, ['ls-files', '-z', ...scope]));
  const newPublic = untracked ? newPublicFiles(root, pathspecs) : [];
  const newPrivate = untracked ? newPrivateFiles(root, pathspecs) : [];
  if (isSplit(root)) {
    return {
      private: [
        ...entries(privateMust(root, ['ls-files', '-z', ...scope])),
        ...newPrivate,
      ],
      public: [...listed, ...newPublic],
    };
  }
  if (!existsSync(path.join(root, PRIVATE_LIST))) {
    return { private: newPrivate, public: [...listed, ...newPublic] };
  }
  const hidden = new Set(listedPublic(root, pathspecs));
  return {
    private: [...hidden, ...newPrivate],
    public: [...listed.filter((file) => !hidden.has(file)), ...newPublic],
  };
};

export const trackedFiles = (root, options) => {
  const files = repoFiles(root, options);
  return [...files.public, ...files.private].sort(byCodeUnit);
};

/** Whether .gitprivate gives each path to plate-private. */
export const privatePaths = (root, files) => {
  if (files.length === 0 || !existsSync(path.join(root, PRIVATE_LIST))) {
    return new Set();
  }
  return new Set(
    ignoredPaths(root, path.join(root, PRIVATE_LIST), files, { index: false })
  );
};

const PAIRED_DEPTH = 500;
const OBJECT_ID = /^[0-9a-f]{40,64}$/u;
const knownPairs = new Map();

/** The id of each object name that resolves in one repository, read in one process. */
export const objectIds = (root, names, { side = false } = {}) => {
  const unique = [...new Set(names)];
  const ids = new Map();
  if (unique.length === 0) return ids;
  const args = ['cat-file', '--batch-check=%(objectname)'];
  const input = `${unique.join('\n')}\n`;
  const result = side
    ? privateGit(root, args, { input })
    : run(root, args, { input });
  if (result.status !== 0) {
    throw new Error(
      `git cat-file --batch-check failed: ${result.stderr.trim()}`
    );
  }
  const lines = result.stdout.split('\n');
  unique.forEach((name, i) => {
    if (OBJECT_ID.test(lines[i])) ids.set(name, lines[i]);
  });
  return ids;
};

const firstParents = (root, tips) => {
  const parents = new Map();
  for (const line of run(
    root,
    ['rev-list', '--first-parent', '--parents', '--stdin'],
    { input: `${tips.join('\n')}\n` }
  ).stdout.split('\n')) {
    const [commit, parent] = line.split(' ');
    if (commit) parents.set(commit, parent);
  }
  return parents;
};

const privateHalfLags = (root, commit, landedWith) =>
  Boolean(landedWith) &&
  commit !== landedWith &&
  privateGit(root, ['merge-base', '--is-ancestor', commit, landedWith])
    .status === 0;

const findPairs = (root, shas) => {
  const found = new Map();
  const pending = new Set(shas);
  // Only landed history: a commit whose push failed, which an autosave ref
  // keeps reachable, names a public commit it never landed with.
  const landedRef = privateGit(root, [
    'rev-parse',
    '--verify',
    '--quiet',
    UPSTREAM,
  ]).stdout.trim()
    ? UPSTREAM
    : `refs/heads/${BRANCH}`;
  const landed = new Map();
  for (const line of privateGit(root, [
    'log',
    landedRef,
    '--format=%H %(trailers:key=Lands-With,valueonly,separator=%x20)',
  ]).stdout.split('\n')) {
    const [commit, publicSha] = line.split(' ');
    if (publicSha && !landed.has(publicSha)) landed.set(publicSha, commit);
  }
  for (const args of [
    ['rev-parse', 'HEAD'],
    ['merge-base', 'HEAD', UPSTREAM],
    ['rev-parse', UPSTREAM],
  ]) {
    if (pending.size === 0) return found;
    const sha = run(root, args).stdout.trim();
    if (!pending.has(sha)) continue;
    const commit = privateGit(root, args).stdout.trim();
    if (privateHalfLags(root, commit, landed.get(sha))) continue;
    pending.delete(sha);
    found.set(sha, commit);
  }
  if (pending.size === 0) return found;
  const firstParent = firstParents(root, [...pending]);
  for (const sha of pending) {
    let ancestor = sha;
    for (let depth = 0; ancestor && depth < PAIRED_DEPTH; depth += 1) {
      if (landed.has(ancestor)) {
        found.set(sha, landed.get(ancestor));
        break;
      }
      ancestor = firstParent.get(ancestor);
    }
  }
  return found;
};

/**
 * The plate-private commit that matches each udecode/plate rev: the private
 * counterpart when the rev is this checkout's HEAD, merge base or
 * origin/next and no newer private commit landed with it, else the commit
 * on plate-private's next whose Lands-With line names the rev or its nearest
 * first-parent ancestor. A rev with no match is absent from the map.
 */
export const pairedCommits = (root, revs) => {
  const paired = new Map();
  if (!isSplit(root)) return paired;
  const shas = objectIds(
    root,
    revs.map((rev) => `${rev}^{commit}`)
  );
  const key = (sha) => `${root}\0${sha}`;
  const unknown = [...new Set(shas.values())].filter(
    (sha) => !knownPairs.has(key(sha))
  );
  const found = findPairs(root, unknown);
  for (const sha of unknown) knownPairs.set(key(sha), found.get(sha) ?? null);
  for (const rev of new Set(revs)) {
    const sha = shas.get(`${rev}^{commit}`);
    const commit = sha && knownPairs.get(key(sha));
    if (commit) paired.set(rev, commit);
  }
  return paired;
};

export const pairedCommit = (root, rev) =>
  pairedCommits(root, [rev]).get(rev) ?? null;

/**
 * The plate-private commit that a landing onto `base`, a udecode/plate rev,
 * compares against.
 */
export const landingPair = (root, base) => {
  const meets = ['merge-base', 'HEAD', UPSTREAM];
  const name = `${base}^{commit}`;
  const landed =
    isSplit(root) &&
    objectIds(root, [name]).get(name) === run(root, meets).stdout.trim() &&
    privateGit(root, meets).stdout.trim();
  return landed || pairedCommit(root, base);
};

/** `git show <rev>:<file>` from whichever repository tracks the file. */
export const showAt = (root, rev, file, { pair = pairedCommit } = {}) => {
  if (!privatePaths(root, [file]).has(file)) {
    return run(root, ['show', `${rev}:${file}`]);
  }
  const paired = pair(root, rev);
  if (!paired) return run(root, ['show', `${rev}:${file}`]);
  return privateGit(root, ['show', `${paired}:${file}`]);
};

/**
 * The `{ rev, file }` pairs whose file exists at rev, each read from
 * whichever repository tracks the file, as `${rev}:${file}` keys.
 */
export const existingAt = (root, pairs, { pair } = {}) => {
  const hidden = privatePaths(root, [
    ...new Set(pairs.map(({ file }) => file)),
  ]);
  const revs = pairs
    .filter(({ file }) => hidden.has(file))
    .map(({ rev }) => rev);
  const paired = pair
    ? new Map([...new Set(revs)].map((rev) => [rev, pair(root, rev)]))
    : pairedCommits(root, revs);
  const own = [];
  const side = [];
  for (const { rev, file } of pairs) {
    const commit = hidden.has(file) ? paired.get(rev) : null;
    (commit ? side : own).push([`${rev}:${file}`, `${commit ?? rev}:${file}`]);
  }
  const found = new Set();
  for (const [queries, options] of [
    [own, {}],
    [side, { side: true }],
  ]) {
    const ids = objectIds(
      root,
      queries.map(([, name]) => name),
      options
    );
    for (const [key, name] of queries) if (ids.has(name)) found.add(key);
  }
  return found;
};

export const existsAt = (root, rev, file, options) =>
  existingAt(root, [{ rev, file }], options).has(`${rev}:${file}`);

export const publicObjects = (root) =>
  path.join(
    must(root, [
      'rev-parse',
      '--path-format=absolute',
      '--git-common-dir',
    ]).trim(),
    'objects'
  );

/**
 * Paths whose content differs between a udecode/plate rev and this checkout,
 * in both repositories. A rev from before the split still tracks the private
 * files, so plate-private compares them against its tree through this
 * repository's objects.
 */
export const changedSince = (root, rev, { pair = pairedCommit } = {}) => {
  const diff = ['diff', '--name-only', '--no-renames', rev, '--'];
  const listed = run(root, diff);
  if (listed.status !== 0) return null;
  let files = listed.stdout.split('\n').filter(Boolean);
  if (!isSplit(root)) return files;
  const presplit = lacksList(root, rev);
  if (presplit) {
    const hidden = privatePaths(root, files);
    files = files.filter((file) => !hidden.has(file));
  }
  const paired = presplit ? rev : pair(root, rev);
  if (!paired) return files;
  const side = privateGit(root, [...diff.slice(0, -2), paired, '--'], {
    env: presplit
      ? { GIT_ALTERNATE_OBJECT_DIRECTORIES: publicObjects(root) }
      : undefined,
  });
  const changed = side.stdout.split('\n').filter(Boolean);
  const own = presplit ? privatePaths(root, changed) : null;
  return [
    ...new Set([...files, ...changed.filter((file) => !own || own.has(file))]),
  ];
};

// A cited line usually heads the statement its claim rests on, so an edit
// within this many lines of it counts as an edit to it.
const CITED_REACH = 3;

const citation = (ref) => {
  const match = /^(.*):(\d+)(?:-(\d+))?$/u.exec(ref);
  if (!match) return { file: ref, reach: null };
  return {
    file: match[1],
    reach: [
      Number(match[2]) - CITED_REACH,
      Number(match[3] ?? match[2]) + CITED_REACH,
    ],
  };
};

// git writes a pure insertion's old range as `-N,0`, where N is the line it
// follows, so its span is the two lines around the gap.
const editedSpans = (diff) => {
  const spans = new Map();
  let file = null;
  let header = false;
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      header = true;
      file = null;
    } else if (header && line.startsWith('--- ')) {
      file = line === '--- /dev/null' ? null : line.slice(6);
    } else if (header && line.startsWith('+++ ')) {
      file ??= line.slice(6);
    } else {
      const hunk = /^@@ -(\d+)(?:,(\d+))? /u.exec(line);
      if (!hunk) continue;
      header = false;
      const start = Number(hunk[1]);
      const length = hunk[2] === undefined ? 1 : Number(hunk[2]);
      const span =
        length === 0 ? [start, start + 1] : [start, start + length - 1];
      spans.set(file, [...(spans.get(file) ?? []), span]);
    }
  }
  return spans;
};

/** Whether `to` differs from `from`, two udecode/plate revs, within `CITED_REACH` lines of a ref's cited lines as numbered at `from`, or anywhere in a file a ref names without lines, or null when git cannot tell. A ref is a file, `file:line` or `file:start-end`. */
export const citedEditedBetween = (root, from, to, refs) => {
  const cited = refs.map(citation);
  const hidden = isSplit(root)
    ? privatePaths(
        root,
        cited.map(({ file }) => file)
      )
    : new Set();
  const edited = (git, range, wanted) => {
    if (wanted.length === 0) return false;
    const diff = git([
      '-c',
      'core.quotePath=false',
      'diff',
      '-U0',
      '--no-color',
      '--no-ext-diff',
      '--no-renames',
      '--src-prefix=a/',
      '--dst-prefix=b/',
      range,
      '--',
      ...new Set(wanted.map(({ file }) => file)),
    ]);
    if (diff.status !== 0) return null;
    const spans = editedSpans(diff.stdout);
    return wanted.some(({ file, reach }) =>
      (spans.get(file) ?? []).some(
        ([start, end]) => !reach || (end >= reach[0] && start <= reach[1])
      )
    );
  };
  const shown = edited(
    (args) => run(root, args),
    `${from}..${to}`,
    cited.filter(({ file }) => !hidden.has(file))
  );
  if (shown !== false || hidden.size === 0) return shown;
  const [start, end] = [pairedCommit(root, from), pairedCommit(root, to)];
  if (!start || !end) return null;
  return edited(
    (args) => privateGit(root, args),
    `${start}..${end}`,
    cited.filter(({ file }) => hidden.has(file))
  );
};

const logged = (root, file) =>
  Boolean(
    run(root, ['log', '--all', '-1', '--format=%H', '--', file]).stdout.trim()
  ) ||
  (isSplit(root) &&
    Boolean(
      privateGit(root, [
        'log',
        '--all',
        '-1',
        '--format=%H',
        '--',
        file,
      ]).stdout.trim()
    ));

const histories = new Map();

// One walk per repository lists every path its history touched, where a walk
// per missing path costs as much each.
const historyOf = (root) => {
  if (!histories.has(root)) {
    const paths = new Set();
    const log = [
      'log',
      '--all',
      '--format=',
      '--name-only',
      '--no-renames',
      '-z',
    ];
    for (const result of [
      run(root, log),
      ...(isSplit(root) ? [privateGit(root, log)] : []),
    ]) {
      for (const file of entries(result.stdout)) {
        for (
          let end = file.length;
          end > 0;
          end = file.lastIndexOf('/', end - 1)
        ) {
          paths.add(file.slice(0, end));
        }
      }
    }
    histories.set(root, paths);
  }
  return histories.get(root);
};

/** Whether either repository's history holds a path. */
export const inHistory = (root, file) =>
  /[*?[]/u.test(file)
    ? logged(root, file)
    : historyOf(root).has(file.replace(/\/+$/u, ''));

/** The files both repositories track at a udecode/plate rev, sorted. */
export const filesAt = (
  root,
  rev,
  pathspecs = [],
  { pair = pairedCommit } = {}
) => {
  const list = (result) => entries(result.stdout);
  const files = list(
    run(root, ['ls-tree', '-r', '-z', '--name-only', rev, '--', ...pathspecs])
  );
  const paired = pair(root, rev);
  if (paired) {
    files.push(
      ...list(
        privateGit(root, [
          'ls-tree',
          '-r',
          '-z',
          '--name-only',
          paired,
          '--',
          ...pathspecs,
        ])
      )
    );
  }
  return [...new Set(files)].sort(byCodeUnit);
};

/**
 * `git grep` with `args`, its options and patterns, over the files both
 * repositories hold that `pathspecs` match: at a udecode/plate rev and its
 * paired plate-private commit, or else in the working tree, untracked files
 * included. Each output line loses its `<rev>:` prefix, so both halves print
 * alike. No match prints nothing.
 */
export const grepFiles = (root, args, pathspecs = [], { rev } = {}) => {
  const grep = (git, options, at, specs) => {
    const result = git([
      '-c',
      'core.quotePath=false',
      'grep',
      ...options,
      ...args,
      ...(at ? [at] : []),
      '--',
      ...specs,
    ]);
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== 1) {
      throw new Error(
        result.stderr.trim() || `git grep exited ${result.status}`
      );
    }
    if (!at) return result.stdout;
    const prefix = `${at}:`;
    return result.stdout
      .split('\n')
      .map((line) =>
        line.startsWith(prefix) ? line.slice(prefix.length) : line
      )
      .join('\n');
  };
  const own = (gitArgs) => run(root, gitArgs);
  const side = (gitArgs) => privateGit(root, gitArgs);
  if (rev) {
    const paired = pairedCommit(root, rev);
    return [
      grep(own, [], rev, pathspecs),
      paired ? grep(side, [], paired, pathspecs) : '',
    ].join('');
  }
  if (!isSplit(root)) return grep(own, ['--untracked'], null, pathspecs);
  // plate-private's own --untracked would search every public file too, so it
  // searches its new files by name.
  const added = newPrivateFiles(root, pathspecs);
  return [
    grep(own, ['--untracked'], null, pathspecs),
    grep(side, [], null, pathspecs),
    added.length > 0
      ? grep(
          side,
          ['--untracked'],
          null,
          added.map((file) => `:(literal)${file}`)
        )
      : '',
  ].join('');
};

/** Whether the private files are on disk, so `pnpm check` can run every step. */
export const hasPrivateHalf = (root) =>
  isSplit(root) ||
  !existsSync(path.join(root, PRIVATE_LIST)) ||
  listedPublic(root).length > 0;
