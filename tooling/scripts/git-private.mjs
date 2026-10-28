import { spawnSync } from 'node:child_process';
import {
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

import {
  hookPayload,
  sessionCheckout,
} from '../../.agents/pstack/checkout.mjs';
import {
  BRANCH,
  copyIndex,
  entries,
  ignoredPaths,
  inherited,
  isSplit,
  lacksList,
  listedPublic,
  must,
  newPrivateFiles,
  NULL_COMMIT,
  pairedCommit,
  PRIVATE_DIR,
  PRIVATE_LIST,
  privateGit,
  privateMust,
  publicObjects,
  repoFiles,
  run,
  UPSTREAM,
} from './private-files.mjs';

const REMOTE = 'https://github.com/udecode/plate-private.git';
const AUTOSAVE = 'refs/git-private/autosave/';
const HOOKS = ['post-checkout', 'post-merge', 'post-rewrite'];
const HOOK_MARK = 'tooling/scripts/git-private.mjs hook';
const PROBED = 'git-private.unreadable';
const DAY = 24 * 60 * 60 * 1000;

const checkoutRoot = (cwd = process.cwd()) =>
  must(cwd, ['rev-parse', '--show-toplevel']).trim();
const mainCheckout = (root) =>
  path.dirname(
    must(root, [
      'rev-parse',
      '--path-format=absolute',
      '--git-common-dir',
    ]).trim()
  );
// init points core.excludesFile at .gitprivate only once .git-private exists,
// so the setting marks a team clone.
const isTeamClone = (root) =>
  run(root, ['config', '--get', 'core.excludesFile'])
    .stdout.trim()
    .endsWith(`/${PRIVATE_LIST}`);

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
    if (existsSync(live)) copyIndex(live, current.GIT_INDEX_FILE);
    else privateMust(root, ['read-tree', 'HEAD'], { env: current });
    const changed = (command, ...rest) =>
      entries(
        privateMust(
          root,
          [command, '-z', '--name-only', '--diff-filter=d', ...rest],
          { env: current }
        )
      );
    const staged = head ? changed('diff-index', '--cached', head) : [];
    const files = [
      ...new Set([
        ...changed('diff-files'),
        ...staged.filter((file) => existsSync(path.join(root, file))),
        ...newPrivateFiles(root),
      ]),
    ];
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
  const merged = privateGit(root, [
    'merge',
    '--ff',
    '--quiet',
    '--no-edit',
    UPSTREAM,
  ]);
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

// A session hook runs this in contributors' clones too, so a missing grant
// must fail fast instead of prompting for credentials.
const readable = (root, remote) =>
  run(root, ['ls-remote', '--exit-code', remote, BRANCH], {
    env: { GCM_INTERACTIVE: 'never', GIT_TERMINAL_PROMPT: '0' },
  }).status === 0;

/** Sets up a team clone's private half. */
export const init = (root, { remote = REMOTE } = {}) => {
  if (mainCheckout(root) !== root) return attach(root);
  if (!existsSync(path.join(root, PRIVATE_LIST))) {
    return `${PRIVATE_LIST} is missing, so this checkout is not split yet`;
  }
  if (!isSplit(root)) {
    if (!readable(root, remote)) {
      return `${remote} has no ${BRANCH} you can read`;
    }
    must(root, ['init', '--quiet', '--bare', PRIVATE_DIR]);
    // isSplit means set up, so a failed setup leaves no folder and the next
    // start retries it.
    try {
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
    } catch (error) {
      rmSync(path.join(root, PRIVATE_DIR), { force: true, recursive: true });
      throw error;
    }
  }
  must(root, ['config', 'core.excludesFile', path.join(root, PRIVATE_LIST)]);
  const skipped = installHooks(root);
  restore(root);
  return skipped.length > 0
    ? `left these hooks alone; call node ${HOOK_MARK} <name> "$@" from each: ${skipped.join(', ')}`
    : null;
};

/**
 * The session hook's step: sets up the clone once it can read plate-private,
 * then gives this worktree its private half. A contributor's clone stays as it
 * is.
 */
export const start = (root, { remote = REMOTE } = {}) => {
  if (!existsSync(path.join(root, PRIVATE_LIST))) return null;
  const main = mainCheckout(root);
  if (!isSplit(main)) {
    if (!existsSync(path.join(main, PRIVATE_LIST))) {
      return `${main} predates the split; fast-forward its ${BRANCH}, then start a session again`;
    }
    // A contributor's clone never reads plate-private, so it probes once a day.
    const probed = Date.parse(
      run(main, ['config', '--get', PROBED]).stdout.trim()
    );
    if (Date.now() - probed < DAY) return null;
    if (!readable(main, remote)) {
      must(main, ['config', PROBED, new Date().toISOString()]);
      return null;
    }
    const note = init(main, { remote });
    if (note) return note;
  }
  return main === root ? null : attach(root);
};

/** Gives a worktree its private half, a linked worktree of the clone's. */
export const attach = (root) => {
  // A file missing from an attached worktree can be a deletion still to land.
  if (isSplit(root)) return null;
  const main = mainCheckout(root);
  const folder = path.join(main, PRIVATE_DIR);
  if (main === root || !existsSync(folder)) {
    return 'the main checkout has no private repository; run node tooling/scripts/git-private.mjs init there';
  }
  const shared = (args, options) =>
    run(main, [`--git-dir=${folder}`, ...args], options);
  shared(['fetch', '--quiet', 'origin']);
  const base =
    pairedCommit(main, must(root, ['rev-parse', 'HEAD']).trim()) ??
    (shared(['rev-parse', '--verify', '--quiet', UPSTREAM]).status === 0
      ? UPSTREAM
      : BRANCH);
  const branch = must(root, ['branch', '--show-current']).trim();
  const scratch = mkdtempSync(path.join(tmpdir(), 'git-private-'));
  try {
    const target = path.join(scratch, path.basename(root));
    const known =
      branch &&
      shared(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`])
        .status === 0;
    // Public git keeps one worktree per branch, so a linked private record that
    // holds the branch is stale: its worktree went without detach. The main
    // checkout's private branch does not follow its public one, so it still
    // refuses.
    const mainBranch = shared([
      'symbolic-ref',
      '--quiet',
      '--short',
      'HEAD',
    ]).stdout.trim();
    const added = shared([
      'worktree',
      'add',
      ...(branch === mainBranch ? [] : ['--force']),
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
// git apply records a blob it finds through the public objects without copying
// it, so the private commit would name an object plate-private lacks.
const copyBorrowedBlobs = (root, paths) => {
  if (paths.length === 0) return;
  const gitDir = `--git-dir=${path.join(root, PRIVATE_DIR)}`;
  const staged = entries(
    must(root, [
      gitDir,
      'ls-files',
      '-z',
      '--stage',
      '--',
      ...paths.map((file) => `:(literal)${file}`),
    ])
  ).map((entry) => entry.split(' ')[1]);
  const borrowed = [...new Set(staged)].filter(
    (sha) => privateGit(root, ['cat-file', '-e', sha]).status !== 0
  );
  if (borrowed.length === 0) return;
  const pack = spawnSync('git', [gitDir, 'pack-objects', '--stdout'], {
    cwd: root,
    env: {
      ...inherited,
      GIT_ALTERNATE_OBJECT_DIRECTORIES: publicObjects(root),
    },
    input: `${borrowed.join('\n')}\n`,
    maxBuffer: 1024 * 1024 * 256,
  });
  if (pack.status !== 0) {
    throw new Error(
      `git pack-objects failed: ${pack.stderr.toString().trim()}`
    );
  }
  must(root, [gitDir, 'unpack-objects', '-q'], { input: pack.stdout });
};

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
    copyBorrowedBlobs(root, [...hidden]);
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

/**
 * Public code files, all or those in `only`, that import a private file or a
 * test runner. A scan of all of them keeps what it learned in the clone's git
 * directory, so the next one parses and resolves only what changed.
 */
export const crossingImports = async (root, only) => {
  if (!existsSync(path.join(root, PRIVATE_LIST))) return [];
  const graph = await import('./import-graph.mjs');
  const files = repoFiles(root, { untracked: true });
  const hidden = new Set(files.private);
  const real = realpathSync(root);
  const { moduleSpecifiers, resolveImport, save } = only
    ? { ...graph, save: () => {} }
    : graph.storedGraph(
        path.join(
          must(root, [
            'rev-parse',
            '--path-format=absolute',
            '--git-common-dir',
          ]).trim(),
          'plate-imports'
        ),
        real
      );
  const crossings = [];
  for (const file of files.public) {
    if (only && !only.has(file)) continue;
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
  save();
  return crossings;
};

/** What `pnpm check`'s private step refuses; its private-imports step runs crossingImports. */
export const problems = (root) => {
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
  return found;
};

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
  start     the session hook's step: init where plate-private is readable,
            then attach this worktree (--remote as for init; --hook works
            on the checkout the hook payload's cwd names)
  attach   give this worktree its private half
  detach    remove this worktree's private record; its commits stay
  migrate   move a worktree cut before the split onto both repositories
  sync      merge plate-private's ${BRANCH} into the private branch
  restore   put back private files missing from disk
  autosave  save unsaved private work to ${AUTOSAVE}<branch>
            (--hook as for start)
  status    both repositories' changes and new private files
  check     what pnpm check refuses, apart from imports
  imports   public code files that import a private file or a test runner
            (names files to scan only those)
  <git>     any other git command, run against ${PRIVATE_DIR}`;

const main = async (argv) => {
  const [command, ...rest] = argv;
  if (!command || command === '--help') {
    console.info(USAGE);
    return command ? 0 : 1;
  }
  const root = checkoutRoot();
  const sessionRoot = () =>
    rest.includes('--hook') ? sessionCheckout(hookPayload().cwd).root : root;
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
    case 'start': {
      const at = rest.indexOf('--remote');
      return report(
        start(sessionRoot(), at === -1 ? undefined : { remote: rest[at + 1] })
      );
    }
    case 'attach': {
      return report(attach(root));
    }
    case 'detach': {
      return report(detach(root));
    }
    case 'migrate': {
      const note = migrate(root);
      report(note);
      return note.includes('with conflicts to resolve') ? 1 : 0;
    }
    case 'sync': {
      return report(sync(root));
    }
    case 'restore': {
      return report(`restored ${restore(root)} files`);
    }
    case 'autosave': {
      const saved = autosave(sessionRoot());
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
    case 'check':
    case 'imports': {
      const found =
        command === 'check'
          ? problems(root)
          : await crossingImports(
              root,
              rest.length > 0 ? new Set(rest) : undefined
            );
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
