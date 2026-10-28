// udecode/plate-private tracks the tests, plans and research that
// .gitprivate lists, in the same folder as udecode/plate, through the git
// directory .git-private. These readers see both repositories; package tasks
// import them, so the lifecycle CLI, git-private.mjs, stays out of their
// cache keys.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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
const withList = (root) => [
  '-c',
  `core.excludesFile=${path.join(root, PRIVATE_LIST)}`,
];
export const lacksList = (root, commit) =>
  Boolean(commit) &&
  !NULL_COMMIT.test(commit) &&
  run(root, ['cat-file', '-e', `${commit}:${PRIVATE_LIST}`]).status !== 0;

/** Private files on disk that neither repository tracks yet. */
export const newPrivateFiles = (root) => {
  if (!existsSync(path.join(root, PRIVATE_LIST))) return [];
  // The private repository's own view skips what .gitignore and the user's
  // global excludes skip, and lists every public file as untracked, so those
  // go first. It does not read the public .git/info/exclude, which
  // check-ignore also matches, so a path the clone ignores there is dropped
  // rather than called private.
  const args = ['ls-files', '-z', '--others', '--exclude-standard'];
  const split = isSplit(root);
  const tracked = split && new Set(entries(must(root, ['ls-files', '-z'])));
  const candidates = entries(
    split ? privateMust(root, args) : must(root, args)
  ).filter((file) => !tracked || !tracked.has(file));
  if (candidates.length === 0) return [];
  const ignoredHere = new Set(ignoredPaths(root, devNull, candidates));
  return ignoredPaths(root, path.join(root, PRIVATE_LIST), candidates)
    .filter((file) => !ignoredHere.has(file))
    .sort(byCodeUnit);
};

export const listedPublic = (root) =>
  entries(
    must(root, [
      ...withList(root),
      'ls-files',
      '-z',
      '--cached',
      '--ignored',
      '--exclude-standard',
    ])
  );

/** The files each repository tracks, or would track once split. */
export const repoFiles = (root, { untracked = false } = {}) => {
  const listed = entries(must(root, ['ls-files', '-z']));
  const newPublic = untracked
    ? entries(
        must(root, [
          ...withList(root),
          'ls-files',
          '-z',
          '--others',
          '--exclude-standard',
        ])
      )
    : [];
  const newPrivate = untracked ? newPrivateFiles(root) : [];
  if (isSplit(root)) {
    return {
      private: [
        ...entries(privateMust(root, ['ls-files', '-z'])),
        ...newPrivate,
      ],
      public: [...listed, ...newPublic],
    };
  }
  if (!existsSync(path.join(root, PRIVATE_LIST))) {
    return { private: newPrivate, public: [...listed, ...newPublic] };
  }
  const hidden = new Set(listedPublic(root));
  return {
    private: [...hidden, ...newPrivate],
    public: [...listed.filter((file) => !hidden.has(file)), ...newPublic],
  };
};

export const trackedFiles = (root, options) => {
  const files = repoFiles(root, options);
  return [...files.public, ...files.private].sort(byCodeUnit);
};

/** Paths changed since each repository's merge base with origin/next. */
export const changedFiles = (root) => {
  const changed = (git) => {
    const base = git(['merge-base', UPSTREAM, 'HEAD']);
    if (base.status !== 0) return null;
    return entries(
      git(['diff', '-z', '--name-only', base.stdout.trim()]).stdout
    );
  };
  const files = changed((args) => run(root, args));
  if (files === null) {
    throw new Error(
      `no merge base with origin/${BRANCH}; run git fetch origin ${BRANCH}.`
    );
  }
  files.push(
    ...entries(must(root, ['ls-files', '-z', '--others', '--exclude-standard']))
  );
  if (isSplit(root)) {
    files.push(
      ...(changed((args) => privateGit(root, args)) ?? []),
      ...newPrivateFiles(root)
    );
  }
  return [...new Set(files)];
};

/** `git grep -l` over both repositories' tracked files. */
export const grepFiles = (root, args) => {
  const found = (result) => entries(result.stdout);
  const files = found(run(root, ['grep', '-z', '-l', ...args]));
  if (isSplit(root)) {
    files.push(...found(privateGit(root, ['grep', '-z', '-l', ...args])));
  }
  return [...new Set(files)].sort(byCodeUnit);
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
const pairs = new Map();

const findPair = (root, sha) => {
  const own = (args) => run(root, args).stdout.trim();
  const side = (args) => privateGit(root, args).stdout.trim();
  if (sha === own(['rev-parse', 'HEAD'])) return side(['rev-parse', 'HEAD']);
  if (sha === own(['merge-base', 'HEAD', UPSTREAM])) {
    return side(['merge-base', 'HEAD', UPSTREAM]);
  }
  if (sha === own(['rev-parse', UPSTREAM])) {
    return side(['rev-parse', UPSTREAM]);
  }
  // Only landed history: a commit whose push failed, which an autosave ref
  // keeps reachable, names a public commit it never landed with.
  const landedRef = side(['rev-parse', '--verify', '--quiet', UPSTREAM])
    ? UPSTREAM
    : `refs/heads/${BRANCH}`;
  const landed = new Map();
  for (const line of side([
    'log',
    landedRef,
    '--format=%H %(trailers:key=Lands-With,valueonly,separator=%x20)',
  ]).split('\n')) {
    const [commit, publicSha] = line.split(' ');
    if (publicSha && !landed.has(publicSha)) landed.set(publicSha, commit);
  }
  const ancestors = own([
    'rev-list',
    '--first-parent',
    `--max-count=${PAIRED_DEPTH}`,
    sha,
  ]).split('\n');
  for (const ancestor of ancestors) {
    if (landed.has(ancestor)) return landed.get(ancestor);
  }
  return null;
};

/**
 * The plate-private commit that matches a udecode/plate rev, or null: the
 * private counterpart when the rev is this checkout's HEAD, merge base or
 * origin/next, else the commit on plate-private's next whose Lands-With line
 * names the rev or its nearest first-parent ancestor.
 */
export const pairedCommit = (root, rev) => {
  if (!isSplit(root)) return null;
  const sha = run(root, [
    'rev-parse',
    '--verify',
    '--quiet',
    `${rev}^{commit}`,
  ]).stdout.trim();
  if (!sha) return null;
  const key = `${root}\0${sha}`;
  if (!pairs.has(key)) pairs.set(key, findPair(root, sha));
  return pairs.get(key);
};

/** `git show <rev>:<file>` from whichever repository tracks the file. */
export const showAt = (root, rev, file) => {
  if (!privatePaths(root, [file]).has(file)) {
    return run(root, ['show', `${rev}:${file}`]);
  }
  const paired = pairedCommit(root, rev);
  if (!paired) return run(root, ['show', `${rev}:${file}`]);
  return privateGit(root, ['show', `${paired}:${file}`]);
};

export const existsAt = (root, rev, file) => {
  if (!privatePaths(root, [file]).has(file)) {
    return run(root, ['cat-file', '-e', `${rev}:${file}`]).status === 0;
  }
  const paired = pairedCommit(root, rev);
  return paired
    ? privateGit(root, ['cat-file', '-e', `${paired}:${file}`]).status === 0
    : run(root, ['cat-file', '-e', `${rev}:${file}`]).status === 0;
};

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

/** Whether either repository's history holds a path. */
export const inHistory = (root, file) =>
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

/** Whether the private files are on disk, so `pnpm check` can run every step. */
export const hasPrivateHalf = (root) =>
  isSplit(root) ||
  !existsSync(path.join(root, PRIVATE_LIST)) ||
  listedPublic(root).length > 0;
