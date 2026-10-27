// udecode/plate-private tracks the tests, plans and research that
// .gitprivate lists, in the same folder as udecode/plate, through the git
// directory .git-private: a folder in a team clone, and a file pointing at a
// linked worktree of the clone's folder in each worktree.
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PRIVATE_DIR = '.git-private';
export const PRIVATE_LIST = '.gitprivate';
const REMOTE = 'https://github.com/udecode/plate-private.git';
const BRANCH = 'next';
const UPSTREAM = `refs/remotes/origin/${BRANCH}`;
const AUTOSAVE = 'refs/git-private/autosave/';
const HOOKS = ['post-checkout', 'post-merge', 'post-rewrite'];
const HOOK_MARK = 'tooling/scripts/git-private.mjs hook';
const NULL_COMMIT = /^0+$/u;

// check-ignore refuses literal pathspecs, so the calls that take paths say
// --literal-pathspecs themselves.
const { GIT_LITERAL_PATHSPECS: _literal, ...inherited } = process.env;
const run = (cwd, args, { env, input } = {}) =>
  spawnSync('git', args, {
    cwd,
    encoding: 'utf-8',
    env: { ...inherited, ...env },
    input,
    maxBuffer: 1024 * 1024 * 256,
  });
const must = (cwd, args, options) => {
  const result = run(cwd, args, options);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
};
const entries = (text) => text.split('\0').filter(Boolean);
const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/** The paths in `files` that the exclude file `list` matches. */
const ignoredPaths = (cwd, list, files, { index = true } = {}) => {
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

export const checkoutRoot = (cwd = process.cwd()) =>
  must(cwd, ['rev-parse', '--show-toplevel']).trim();
export const mainCheckout = (root) =>
  path.dirname(
    must(root, [
      'rev-parse',
      '--path-format=absolute',
      '--git-common-dir',
    ]).trim()
  );
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
const privateMust = (root, args, options) => {
  const result = privateGit(root, args, options);
  if (result.status !== 0) {
    throw new Error(
      `private git ${args.join(' ')} failed: ${result.stderr.trim()}`
    );
  }
  return result.stdout;
};
// init points core.excludesFile at .gitprivate only once .git-private exists,
// so the setting marks a team clone.
export const isTeamClone = (root) =>
  run(root, ['config', '--get', 'core.excludesFile'])
    .stdout.trim()
    .endsWith(`/${PRIVATE_LIST}`);
const withList = (root) => [
  '-c',
  `core.excludesFile=${path.join(root, PRIVATE_LIST)}`,
];
const lacksList = (root, commit) =>
  Boolean(commit) &&
  !NULL_COMMIT.test(commit) &&
  run(root, ['cat-file', '-e', `${commit}:${PRIVATE_LIST}`]).status !== 0;

/** Private files on disk that neither repository tracks yet. */
export const newPrivateFiles = (root) => {
  if (!existsSync(path.join(root, PRIVATE_LIST))) return [];
  // The private repository's own view skips what .gitignore and the user's
  // global excludes skip, and lists every public file as untracked.
  const args = ['ls-files', '-z', '--others', '--exclude-standard'];
  const untracked = isSplit(root) ? privateMust(root, args) : must(root, args);
  if (!untracked) return [];
  return ignoredPaths(
    root,
    path.join(root, PRIVATE_LIST),
    entries(untracked)
  ).sort(byCodeUnit);
};

const listedPublic = (root) =>
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

/**
 * The plate-private commit that matches a udecode/plate rev: the private
 * HEAD or merge base for this checkout's own, else the commit whose
 * Lands-With line names the rev or its nearest first-parent ancestor.
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
  const own = (args) => run(root, args).stdout.trim();
  const side = (args) => privateGit(root, args).stdout.trim();
  if (sha === own(['rev-parse', 'HEAD'])) return side(['rev-parse', 'HEAD']);
  if (sha === own(['merge-base', 'HEAD', UPSTREAM])) {
    return side(['merge-base', 'HEAD', UPSTREAM]);
  }
  if (sha === own(['rev-parse', UPSTREAM])) {
    return side(['rev-parse', UPSTREAM]);
  }
  const landed = new Map();
  for (const line of side([
    'log',
    '--all',
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

const publicObjects = (root) =>
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

export const restore = (root) => {
  if (!isSplit(root)) return 0;
  const missing = privateMust(root, ['ls-files', '-z', '--deleted']);
  if (!missing) return 0;
  privateMust(root, ['checkout-index', '-f', '-u', '-z', '--stdin'], {
    input: missing,
  });
  return entries(missing).length;
};

const autosaveRef = (root) =>
  AUTOSAVE +
  (privateGit(root, [
    'symbolic-ref',
    '--quiet',
    '--short',
    'HEAD',
  ]).stdout.trim() || 'detached');

// A save never records a deletion, and while HEAD stays put each save starts
// from the last one, so git commands that removed private files from disk
// cannot replace the save of their edits.
export const autosave = (root) => {
  if (!isSplit(root)) return null;
  const scratch = mkdtempSync(path.join(tmpdir(), 'git-private-'));
  try {
    const resolve = (rev) =>
      privateGit(root, ['rev-parse', '--verify', '--quiet', rev]).stdout.trim();
    const ref = autosaveRef(root);
    const head = resolve('HEAD');
    const last = resolve(ref);
    const current = { GIT_INDEX_FILE: path.join(scratch, 'current') };
    const live = privateMust(root, ['rev-parse', '--git-path', 'index']).trim();
    if (existsSync(live)) copyFileSync(live, current.GIT_INDEX_FILE);
    else privateMust(root, ['read-tree', 'HEAD'], { env: current });
    const edited = privateMust(
      root,
      ['diff-files', '-z', '--name-only', '--diff-filter=d'],
      { env: current }
    );
    const files = [...entries(edited), ...newPrivateFiles(root)];
    if (files.length === 0) return null;
    let env = current;
    if (last && resolve(`${last}^1`) === head) {
      env = { GIT_INDEX_FILE: path.join(scratch, 'save') };
      privateMust(root, ['read-tree', last], { env });
    }
    privateMust(
      root,
      [
        '--literal-pathspecs',
        'add',
        '-f',
        '--pathspec-from-file=-',
        '--pathspec-file-nul',
      ],
      {
        env,
        input: files.join('\0'),
      }
    );
    const tree = privateMust(root, ['write-tree'], { env }).trim();
    if (last && resolve(`${last}^{tree}`) === tree) return null;
    const parents = [head, last].filter(Boolean);
    const commit = privateMust(root, [
      'commit-tree',
      tree,
      ...parents.flatMap((parent) => ['-p', parent]),
      '-m',
      `autosave ${files.length} files`,
    ]).trim();
    privateMust(root, ['update-ref', ref, commit]);
    return { commit, files, ref };
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
};

const fetchPrivate = (root) =>
  privateGit(root, ['fetch', '--quiet', 'origin']).status === 0;

/** Merges plate-private's next into the private branch after a public pull. */
export const sync = (root) => {
  if (!isSplit(root)) return 'no private repository here';
  fetchPrivate(root);
  const merged = privateGit(root, ['merge', '--quiet', '--no-edit', UPSTREAM]);
  if (merged.status !== 0) {
    privateGit(root, ['merge', '--abort']);
    return `could not merge plate-private's ${BRANCH} into this private branch; the next landing rebases onto it, or run node tooling/scripts/git-private.mjs merge origin/${BRANCH}`;
  }
  restore(root);
  return null;
};

const installHooks = (root) => {
  const folder = must(root, [
    'rev-parse',
    '--path-format=absolute',
    '--git-path',
    'hooks',
  ]).trim();
  const skipped = [];
  for (const name of HOOKS) {
    const file = path.join(folder, name);
    if (existsSync(file) && !readFileSync(file, 'utf-8').includes(HOOK_MARK)) {
      skipped.push(file);
      continue;
    }
    writeFileSync(
      file,
      `#!/bin/sh\n[ -f tooling/scripts/git-private.mjs ] || exit 0\nexec node ${HOOK_MARK} ${name} "$@"\n`,
      { mode: 0o755 }
    );
  }
  return skipped;
};

/** Sets up a team clone's private half. */
export const init = (root, { remote = REMOTE } = {}) => {
  if (mainCheckout(root) !== root) return attach(root);
  if (!existsSync(path.join(root, PRIVATE_LIST))) {
    return `${PRIVATE_LIST} is missing, so this checkout is not split yet`;
  }
  if (!isSplit(root)) {
    if (run(root, ['ls-remote', '--exit-code', remote, BRANCH]).status !== 0) {
      return `${remote} has no ${BRANCH} you can read`;
    }
    must(root, ['init', '--quiet', '--bare', PRIVATE_DIR]);
    for (const [key, value] of [
      ['core.bare', 'false'],
      ['status.showUntrackedFiles', 'no'],
    ]) {
      privateMust(root, ['config', key, value]);
    }
    privateMust(root, ['remote', 'add', 'origin', remote]);
    privateMust(root, ['fetch', '--quiet', 'origin']);
    privateMust(root, ['update-ref', `refs/heads/${BRANCH}`, UPSTREAM]);
    privateMust(root, ['symbolic-ref', 'HEAD', `refs/heads/${BRANCH}`]);
    privateMust(root, [
      'branch',
      '--quiet',
      `--set-upstream-to=origin/${BRANCH}`,
    ]);
    // Index only: a teammate's clone can hold unsaved edits to these files.
    privateMust(root, ['reset', '--quiet', '--mixed']);
  }
  must(root, ['config', 'core.excludesFile', path.join(root, PRIVATE_LIST)]);
  const skipped = installHooks(root);
  restore(root);
  return skipped.length > 0
    ? `left these hooks alone; call node ${HOOK_MARK} <name> "$@" from each: ${skipped.join(', ')}`
    : null;
};

/** Gives a worktree its private half, a linked worktree of the clone's. */
export const attach = (root) => {
  if (isSplit(root)) {
    restore(root);
    return null;
  }
  const main = mainCheckout(root);
  const folder = path.join(main, PRIVATE_DIR);
  if (main === root || !existsSync(folder)) {
    return 'the main checkout has no private repository; run node tooling/scripts/git-private.mjs init there';
  }
  const shared = (args, options) =>
    run(main, [`--git-dir=${folder}`, ...args], options);
  shared(['fetch', '--quiet', 'origin']);
  const base =
    shared(['rev-parse', '--verify', '--quiet', UPSTREAM]).status === 0
      ? UPSTREAM
      : BRANCH;
  const branch = must(root, ['branch', '--show-current']).trim();
  const scratch = mkdtempSync(path.join(tmpdir(), 'git-private-'));
  try {
    const target = path.join(scratch, path.basename(root));
    const known =
      branch &&
      shared(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`])
        .status === 0;
    const added = shared([
      'worktree',
      'add',
      '--quiet',
      '--no-checkout',
      ...(!branch
        ? ['--detach', target, base]
        : known
          ? [target, branch]
          : ['-b', branch, target, base]),
    ]);
    if (added.status !== 0) throw new Error(added.stderr.trim());
    const link = readFileSync(path.join(target, '.git'), 'utf-8');
    const record = link.replace(/^gitdir: /u, '').trim();
    writeFileSync(path.join(root, PRIVATE_DIR), link);
    writeFileSync(
      path.join(record, 'gitdir'),
      `${path.join(root, PRIVATE_DIR)}\n`
    );
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
  privateMust(root, ['reset', '--quiet', '--mixed']);
  restore(root);
  return null;
};

/** Removes a worktree's private record; its commits and autosave stay. */
export const detach = (root) => {
  const link = path.join(root, PRIVATE_DIR);
  if (!existsSync(link) || !statSync(link).isFile()) {
    return 'this checkout has no linked private worktree';
  }
  autosave(root);
  const record = readFileSync(link, 'utf-8')
    .replace(/^gitdir: /u, '')
    .trim();
  rmSync(record, { force: true, recursive: true });
  unlinkSync(link);
  return null;
};

/**
 * Moves a worktree whose branch predates the split onto both repositories:
 * its work becomes uncommitted changes on top of origin/next, public and
 * private. A ref and patches under the main checkout's run directory keep
 * every change first.
 */
export const migrate = (root) => {
  const main = mainCheckout(root);
  if (main === root) {
    return 'run migrate in the worktree whose branch predates the split';
  }
  if (!isSplit(main)) {
    return `the main checkout has no ${PRIVATE_DIR}; run node tooling/scripts/git-private.mjs init there`;
  }
  if (isSplit(root)) return `this worktree already has its private half`;
  must(root, [
    'fetch',
    '--quiet',
    'origin',
    `+refs/heads/${BRANCH}:${UPSTREAM}`,
  ]);
  if (!lacksList(root, 'HEAD')) {
    return `this branch already has ${PRIVATE_LIST}`;
  }
  const base = must(root, ['merge-base', 'HEAD', UPSTREAM]).trim();
  const branch = must(root, ['branch', '--show-current']).trim() || 'detached';
  const scratch = mkdtempSync(path.join(tmpdir(), 'git-private-'));
  try {
    const env = { GIT_INDEX_FILE: path.join(scratch, 'index') };
    must(root, ['read-tree', 'HEAD'], { env });
    must(root, ['add', '-A'], { env });
    const tree = must(root, ['write-tree'], { env }).trim();
    const snapshot = must(root, [
      'commit-tree',
      tree,
      '-p',
      'HEAD',
      '-m',
      `${branch} before the split`,
    ]).trim();
    const ref = `refs/git-private/migrate/${branch}`;
    must(root, ['update-ref', ref, snapshot]);
    const dir = path.join(main, 'docs/plans/artifacts/git-private-migrate');
    mkdirSync(dir, { recursive: true });
    const name = path.join(
      dir,
      `${branch.replaceAll('/', '-')}-${Date.now().toString(36)}`
    );
    writeFileSync(
      `${name}.patch`,
      must(root, ['diff', '--binary', base, snapshot])
    );

    // Untracked files stay on disk through the reset, so only tracked changes move.
    const list = path.join(scratch, 'list');
    writeFileSync(list, must(root, ['show', `${UPSTREAM}:${PRIVATE_LIST}`]));
    const files = entries(must(root, ['diff', '-z', '--name-only', base]));
    const hidden = new Set(ignoredPaths(root, list, files, { index: false }));
    const halves = [
      ['public', files.filter((file) => !hidden.has(file))],
      ['private', [...hidden]],
    ].map(([half, paths]) => {
      const patch = `${name}.${half}.patch`;
      writeFileSync(
        patch,
        paths.length > 0
          ? must(root, [
              'diff',
              '--binary',
              base,
              '--',
              ...paths.map((file) => `:(literal)${file}`),
            ])
          : ''
      );
      return [half, patch, paths.length];
    });

    must(root, ['reset', '--quiet', '--hard', UPSTREAM]);
    const note = attach(root);
    if (note) return `${note}; the work is in ${ref} and ${name}.patch`;
    const failed = [];
    for (const [half, patch, count] of halves) {
      if (count === 0) continue;
      const args = ['apply', '--3way', '--index', patch];
      // The private patch's old blobs live in this repository's objects.
      const applied =
        half === 'public'
          ? run(root, args)
          : privateGit(root, args, {
              env: { GIT_ALTERNATE_OBJECT_DIRECTORIES: publicObjects(root) },
            });
      if (applied.status !== 0) {
        failed.push(`${half}: ${applied.stderr.trim()}`);
      }
    }
    const kept = `every change is also in ${ref} and ${name}.patch`;
    return failed.length > 0
      ? `moved onto origin/${BRANCH} with conflicts to resolve; ${kept}\n${failed.join('\n')}`
      : `moved onto origin/${BRANCH} as uncommitted changes; land them with --message. ${kept}`;
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
};

/** Private work that only this folder holds: unsaved edits, new files and unpushed commits. */
export const unsaved = (root) => {
  if (!isSplit(root)) return null;
  const edited = entries(
    privateMust(root, ['diff', '-z', '--name-only', 'HEAD'])
  );
  const added = newPrivateFiles(root);
  const ahead = privateGit(root, ['rev-list', '--count', `${UPSTREAM}..HEAD`]);
  return {
    added,
    edited,
    unpushed: ahead.status === 0 ? Number(ahead.stdout.trim()) : 0,
  };
};

const CODE = /\.[cm]?[jt]sx?$/u;
const UNIT_TEST_RUNNER =
  /^(?:bun:test|node:test|vitest(?:\/.*)?|@vitest\/.+)$/u;
const AGENT_TOOLING = /^\.(?:agents|claude)\//u;

/** Public code files that import a private file or a test runner. */
export const crossingImports = async (root) => {
  const { moduleSpecifiers, resolveImport } =
    await import('./import-graph.mjs');
  const files = repoFiles(root, { untracked: true });
  const hidden = new Set(files.private);
  const real = realpathSync(root);
  const crossings = [];
  for (const file of files.public) {
    if (!CODE.test(file) || !existsSync(path.join(real, file))) continue;
    const absolute = path.join(real, file);
    for (const specifier of moduleSpecifiers(absolute)) {
      if (UNIT_TEST_RUNNER.test(specifier) && !AGENT_TOOLING.test(file)) {
        crossings.push(`${file} imports the test runner ${specifier}`);
        continue;
      }
      const hit = resolveImport(absolute, specifier);
      const target = hit && path.relative(real, hit);
      if (target && hidden.has(target)) {
        crossings.push(`${file} imports ${target}`);
      }
    }
  }
  return crossings;
};

/** What `pnpm check`'s private step refuses. */
export const problems = async (root) => {
  if (!existsSync(path.join(root, PRIVATE_LIST))) return [];
  const found = [];
  if (isSplit(root)) {
    found.push(
      ...listedPublic(root).map(
        (file) =>
          `${file} is tracked by udecode/plate, but ${PRIVATE_LIST} makes it private; run git rm --cached on it`
      )
    );
    const missing = entries(privateMust(root, ['ls-files', '-z', '--deleted']));
    if (missing.length > 0) {
      found.push(
        `${missing.length} private files are missing from disk, such as ${missing[0]}; run node tooling/scripts/git-private.mjs restore`
      );
    }
  } else if (isTeamClone(root)) {
    found.push(
      `this team checkout has no ${PRIVATE_DIR}, so its tests are not on disk; run node tooling/scripts/git-private.mjs attach`
    );
  }
  found.push(...(await crossingImports(root)));
  return found;
};

/** Whether the private files are on disk, so `pnpm check` can run every step. */
export const hasPrivateHalf = (root) =>
  isSplit(root) ||
  !existsSync(path.join(root, PRIVATE_LIST)) ||
  listedPublic(root).length > 0;

const hook = (root, name, args) => {
  if (name === 'post-checkout') {
    const [previous] = args;
    if (
      NULL_COMMIT.test(previous ?? '') &&
      !isSplit(root) &&
      isTeamClone(root) &&
      !lacksList(root, 'HEAD')
    ) {
      return attach(root);
    }
    if (isSplit(root) && lacksList(root, previous)) restore(root);
    return null;
  }
  if (!isSplit(root)) return null;
  const original = run(root, [
    'rev-parse',
    '--verify',
    '--quiet',
    'ORIG_HEAD',
  ]).stdout.trim();
  const note = name === 'post-merge' ? sync(root) : null;
  if (lacksList(root, original)) restore(root);
  return note;
};

const status = (root) => {
  const lines = [
    ...must(root, ['status', '--short'])
      .split('\n')
      .filter(Boolean)
      .map((line) => `public  ${line}`),
  ];
  const work = unsaved(root);
  if (work) {
    lines.push(
      ...privateMust(root, ['status', '--short'])
        .split('\n')
        .filter(Boolean)
        .map((line) => `private ${line}`),
      ...work.added.map((file) => `private ?? ${file}`)
    );
    if (work.unpushed > 0) {
      lines.push(
        `private: ${work.unpushed} commits not on plate-private's ${BRANCH}`
      );
    }
  }
  return lines.join('\n');
};

const USAGE = `Usage: node tooling/scripts/git-private.mjs <command>
  init      set up this team clone's private half and its git hooks
            (--remote <url> reads another plate-private)
  attach    give this worktree its private half
  detach    remove this worktree's private record; its commits stay
  migrate   move a worktree cut before the split onto both repositories
  sync      merge plate-private's ${BRANCH} into the private branch
  restore   put back private files missing from disk
  autosave  save unsaved private work to ${AUTOSAVE}<branch>
  status    both repositories' changes and new private files
  check     what pnpm check refuses
  <git>     any other git command, run against ${PRIVATE_DIR}`;

const main = async (argv) => {
  const [command, ...rest] = argv;
  if (!command || command === '--help') {
    console.info(USAGE);
    return command ? 0 : 1;
  }
  const root = checkoutRoot();
  const report = (note) => {
    if (note) console.info(`[git-private] ${note}`);
    return 0;
  };
  switch (command) {
    case 'init': {
      return report(
        init(root, rest[0] === '--remote' ? { remote: rest[1] } : undefined)
      );
    }
    case 'attach': {
      return report(attach(root));
    }
    case 'detach': {
      return report(detach(root));
    }
    case 'migrate': {
      return report(migrate(root));
    }
    case 'sync': {
      return report(sync(root));
    }
    case 'restore': {
      return report(`restored ${restore(root)} files`);
    }
    case 'autosave': {
      const saved = autosave(root);
      return report(
        saved && `saved ${saved.files.length} files to ${saved.ref}`
      );
    }
    case 'status': {
      const lines = status(root);
      if (lines) console.info(lines);
      return 0;
    }
    case 'hook': {
      try {
        return report(hook(root, rest[0], rest.slice(1)));
      } catch (error) {
        return report(error.message);
      }
    }
    case 'check': {
      const found = await problems(root);
      for (const line of found) console.error(line);
      return found.length > 0 ? 1 : 0;
    }
    default: {
      if (!isSplit(root)) {
        console.error(`[git-private] ${root} has no ${PRIVATE_DIR}`);
        return 1;
      }
      if (command === 'clean') {
        console.error(
          `[git-private] git clean through ${PRIVATE_DIR} deletes every public file, which plate-private does not track`
        );
        return 1;
      }
      const result = spawnSync(
        'git',
        [
          `--git-dir=${path.join(root, PRIVATE_DIR)}`,
          `--work-tree=${root}`,
          command,
          ...rest,
        ],
        { stdio: 'inherit' }
      );
      return result.status ?? 1;
    }
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(await main(process.argv.slice(2)));
}
