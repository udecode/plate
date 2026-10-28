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

const findPairs = (root, shas) => {
  const found = new Map();
  const pending = new Set(shas);
  for (const args of [
    ['rev-parse', 'HEAD'],
    ['merge-base', 'HEAD', UPSTREAM],
    ['rev-parse', UPSTREAM],
  ]) {
    if (pending.size === 0) return found;
    const sha = run(root, args).stdout.trim();
    if (pending.delete(sha)) {
      found.set(sha, privateGit(root, args).stdout.trim());
    }
  }
  if (pending.size === 0) return found;
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
 * origin/next, else the commit on plate-private's next whose Lands-With line
 * names the rev or its nearest first-parent ancestor. A rev with no match is
 * absent from the map.
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

/** `git show <rev>:<file>` from whichever repository tracks the file. */
export const showAt = (root, rev, file) => {
  if (!privatePaths(root, [file]).has(file)) {
    return run(root, ['show', `${rev}:${file}`]);
  }
  const paired = pairedCommit(root, rev);
  if (!paired) return run(root, ['show', `${rev}:${file}`]);
  return privateGit(root, ['show', `${paired}:${file}`]);
};

/**
 * The `{ rev, file }` pairs whose file exists at rev, each read from
 * whichever repository tracks the file, as `${rev}:${file}` keys.
 */
export const existingAt = (root, pairs) => {
  const hidden = privatePaths(root, [
    ...new Set(pairs.map(({ file }) => file)),
  ]);
  const paired = pairedCommits(
    root,
    pairs.filter(({ file }) => hidden.has(file)).map(({ rev }) => rev)
  );
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

export const existsAt = (root, rev, file) =>
  existingAt(root, [{ rev, file }]).has(`${rev}:${file}`);

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
export const changedSince = (root, rev) => {
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
  const paired = presplit ? rev : pairedCommit(root, rev);
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

/** Whether a commit after `from` up to `to`, two udecode/plate revs, changed any of the files, or null when git cannot tell. */
export const movedBetween = (root, from, to, files) => {
  const hidden = isSplit(root) ? privatePaths(root, files) : new Set();
  const changed = (git, range, paths) => {
    if (paths.length === 0) return false;
    const log = git(['log', '--format=%H', '-1', range, '--', ...paths]);
    return log.status === 0 ? log.stdout.trim() !== '' : null;
  };
  const shown = changed(
    (args) => run(root, args),
    `${from}..${to}`,
    files.filter((file) => !hidden.has(file))
  );
  if (shown !== false || hidden.size === 0) return shown;
  const [start, end] = [pairedCommit(root, from), pairedCommit(root, to)];
  if (!start || !end) return null;
  return changed((args) => privateGit(root, args), `${start}..${end}`, [
    ...hidden,
  ]);
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
export const filesAt = (root, rev, pathspecs = []) => {
  const list = (result) => entries(result.stdout);
  const files = list(
    run(root, ['ls-tree', '-r', '-z', '--name-only', rev, '--', ...pathspecs])
  );
  const paired = pairedCommit(root, rev);
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
