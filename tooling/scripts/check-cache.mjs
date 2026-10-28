import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  copyIndex,
  isSplit,
  newPrivateFiles,
  objectIds,
  privateGit,
  trackedFiles,
  withList,
} from './private-files.mjs';

const VERSION = 'v2';
const UPSTREAM = 'refs/remotes/origin/next';
const KEEP_DAYS = 14;
const KEEP_PER_KEY = 64;
const NEAR = 8;
const FLUSH_SECONDS = 120;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
// How long a writer may hold a temp file or an empty key directory.
const WRITE_GRACE = HOUR;
const RESULT_ENV =
  /^(?:CI|TZ|LANG|LC_ALL|LC_COLLATE|NODE_ENV|NODE_OPTIONS|BUN_OPTIONS|FAST_CHECK_SEED|BENCH_MEASURE|LIFT_LIST|TURBO_ENV_MODE|COMPONENTS_BASE_URL|https_proxy|(?:PLATE|PLITE|FILL_LAW|AUTOFORMAT_RULES|AUTHORED_ORDER|NEXT_PUBLIC|PLAYWRIGHT|STRESS|TEST_LOAD_TRACE)_\w+)$/u;

/**
 * @typedef {{ public: string, private: string | null }} Trees
 *   Tree ids of the udecode/plate and plate-private halves; private is null
 *   where the checkout has no private half on disk.
 * @typedef {{ public: string[], private: string[] | null }} Membership
 *   Per half, each path the index lists differently from the working files:
 *   `?path` for a file the index lacks, `-path` for an indexed file gone
 *   from disk.
 * @typedef {{ work: Trees, head: Trees, index: Membership }} State
 *   What git sees of the checkout: the working files, untracked ones included
 *   and ignored ones left out, HEAD, and which of the files the index tracks.
 * @typedef {{ name: string, command: string, key?: ('date' | 'refs')[], filesOnly?: boolean, tests?: string[] }} Scope
 *   One check. Without `key` it never reuses or records a pass; `'date'` adds
 *   the UTC day and `'refs'` origin/next and origin/main to its key. A
 *   `filesOnly` check reads the working files and neither HEAD nor the
 *   index, so a commit that changes no file keeps its pass. A run of only
 *   `tests` is a check of its own, so it never covers the whole command.
 * @typedef {{ kind: 'exact' | 'pass' | 'merge-base', files: string[], retargeted: string[], label: string }} Base
 *   Evidence that a check passed: the files changed since, and where it passed.
 */

/** Whether this run ignores recorded passes and records none. */
export const freshRun = (env) =>
  !['', '0', 'false', undefined].includes(env.TURBO_FORCE) ||
  env.FAST_CHECK_SEED === 'random';

const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const entries = (text) => text.split('\0').filter(Boolean);
const lines = (text) => text.trim().split('\n');
const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const SYMLINK = '120000';

const RAW_DIFF = /^:(?<oldMode>\d+) (?<newMode>\d+) \S+ \S+ (?<status>[A-Z])/u;
const retargets = ({ newMode, oldMode, status }) =>
  status !== 'M' || [oldMode, newMode].includes(SYMLINK);
const rawChanges = (text) => {
  const fields = entries(text);
  const changes = [];
  for (let at = 0; at < fields.length; at += 2) {
    changes.push({
      file: fields[at + 1],
      retargeted: retargets(RAW_DIFF.exec(fields[at]).groups),
    });
  }
  return changes;
};

// Both halves read the checkout's own .gitprivate, so each file lands in
// exactly one of them even where the clone's config names another copy.
const gitIn = (root, half) =>
  half === 'private'
    ? (args, options) => privateGit(root, args, options)
    : (args, { env, input } = {}) =>
        spawnSync('git', [...(isSplit(root) ? withList(root) : []), ...args], {
          cwd: root,
          encoding: 'utf-8',
          env: { ...process.env, ...env },
          input,
          maxBuffer: 1024 * 1024 * 256,
        });
const must = (git, args, options) => {
  const result = git(args, options);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
};

const indexedTree = (git, index, steps) => {
  const scratch = mkdtempSync(path.join(tmpdir(), 'check-cache-'));
  try {
    const env = { GIT_INDEX_FILE: path.join(scratch, 'index') };
    if (existsSync(index)) {
      copyIndex(index, env.GIT_INDEX_FILE);
    } else {
      must(git, ['read-tree', 'HEAD'], { env });
    }
    for (const { args, input } of steps) must(git, args, { env, input });
    return must(git, ['write-tree'], { env }).trim();
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
};

const headOf = (git) => {
  const [index, head] = lines(
    must(git, [
      'rev-parse',
      '--path-format=absolute',
      '--git-path',
      'index',
      'HEAD^{tree}',
    ])
  );
  return { head, index };
};
const statusOf = (git, untracked) => {
  const fields = entries(
    must(git, [
      '--no-optional-locks',
      'status',
      '--porcelain',
      '-z',
      `--untracked-files=${untracked}`,
    ])
  );
  const index = [];
  for (let at = 0; at < fields.length; at += 1) {
    const [x, y] = fields[at];
    if (x === '?') index.push(`?${fields[at].slice(3)}`);
    else if (y === 'D') index.push(`-${fields[at].slice(3)}`);
    // A rename or copy names its source in the next field.
    if ('RC'.includes(x) || 'RC'.includes(y)) at += 1;
  }
  return { clean: fields.length === 0, index: index.sort(byCodeUnit) };
};

const snapshot = (root) => {
  const pub = gitIn(root, 'public');
  const publicHalf = headOf(pub);
  const publicStatus = statusOf(pub, 'all');
  const work = {
    private: null,
    public: publicStatus.clean
      ? publicHalf.head
      : indexedTree(pub, publicHalf.index, [{ args: ['add', '-A'] }]),
  };
  const head = { private: null, public: publicHalf.head };
  const index = { private: null, public: publicStatus.index };
  if (!isSplit(root)) return { head, index, work };
  const side = gitIn(root, 'private');
  const privateHalf = headOf(side);
  const added = newPrivateFiles(root);
  const privateStatus = statusOf(side, 'no');
  work.private =
    added.length === 0 && privateStatus.clean
      ? privateHalf.head
      : indexedTree(side, privateHalf.index, [
          { args: ['add', '-u'] },
          ...(added.length === 0
            ? []
            : [
                {
                  args: [
                    '--literal-pathspecs',
                    'add',
                    '-f',
                    '--pathspec-from-file=-',
                    '--pathspec-file-nul',
                  ],
                  input: added.join('\0'),
                },
              ]),
        ]);
  head.private = privateHalf.head;
  index.private = [
    ...privateStatus.index,
    ...added.map((file) => `?${file}`),
  ].sort(byCodeUnit);
  return { head, index, work };
};

const statLine = (root, file) => {
  const stat = lstatSync(path.join(root, file), {
    bigint: true,
    throwIfNoEntry: false,
  });
  return stat
    ? `${stat.ino} ${stat.size} ${stat.mtimeNs} ${stat.ctimeNs}`
    : 'missing';
};

// A write moves a file's ctime even when it puts the same bytes back, which
// the trees cannot show.
const stamp = (root) =>
  new Map(
    trackedFiles(root, { untracked: true }).map((file) => [
      file,
      statLine(root, file),
    ])
  );

const stateId = ({ head, index, work }, filesOnly) =>
  sha256(
    JSON.stringify(
      filesOnly
        ? [work.public, work.private]
        : [work.public, work.private, head.public, head.private, index]
    )
  ).slice(0, 40);

const mergeBaseState = (root) => {
  const baseTree = (git) => {
    const base = git(['merge-base', 'HEAD', UPSTREAM]);
    if (base.status !== 0) return null;
    return must(git, ['rev-parse', `${base.stdout.trim()}^{tree}`]).trim();
  };
  const trees = { private: null, public: baseTree(gitIn(root, 'public')) };
  if (trees.public === null) {
    throw new Error(
      'no merge base with origin/next; run git fetch origin next.'
    );
  }
  if (isSplit(root)) {
    trees.private = baseTree(gitIn(root, 'private'));
    if (trees.private === null) return null;
  }
  const index = { private: trees.private === null ? null : [], public: [] };
  return { head: trees, index, work: trees };
};

let bunVersion;
const installed = new Map();

// Bun and Next.js load these from the directory they run in, and git ignores
// them, so no tree holds them.
const dotenv = (root) =>
  sha256(
    JSON.stringify(
      [
        root,
        ...['apps', 'packages'].flatMap((parent) =>
          list(path.join(root, parent)).map((name) =>
            path.join(root, parent, name)
          )
        ),
      ].flatMap((dir) =>
        list(dir)
          .filter(
            (name) =>
              name.startsWith('.env') &&
              statSync(path.join(dir, name), {
                throwIfNoEntry: false,
              })?.isFile()
          )
          .sort(byCodeUnit)
          .map((name) => [
            path.relative(root, path.join(dir, name)),
            readFileSync(path.join(dir, name), 'utf-8'),
          ])
      )
    )
  );

const globalPart = (root, env) => {
  bunVersion ??= (() => {
    const result = spawnSync('bun', ['--version'], { encoding: 'utf-8' });
    return result.status === 0 ? result.stdout.trim() : 'none';
  })();
  if (!installed.has(root)) {
    const lock = path.join(root, 'node_modules/.pnpm/lock.yaml');
    installed.set(root, existsSync(lock) ? sha256(readFileSync(lock)) : 'none');
  }
  const baseline = env.PLATE_BASELINE_BASE;
  const manifest = path.join(root, 'package.json');
  return {
    baseline: baseline
      ? (objectIds(root, [`${baseline}^{commit}`]).get(
          `${baseline}^{commit}`
        ) ?? `unresolved ${baseline}`)
      : null,
    bun: bunVersion,
    dotenv: dotenv(root),
    env: Object.entries(env)
      .filter(([name]) => RESULT_ENV.test(name))
      .sort(([a], [b]) => byCodeUnit(a, b)),
    lock: installed.get(root),
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    pnpm:
      /\bpnpm\/(\S+)/u.exec(env.npm_config_user_agent ?? '')?.[1] ??
      /^pnpm@([^+]+)/u.exec(
        existsSync(manifest)
          ? (JSON.parse(readFileSync(manifest, 'utf-8')).packageManager ?? '')
          : ''
      )?.[1] ??
      'none',
  };
};

const refsPart = (root) => {
  const refs = ['refs/remotes/origin/next', 'refs/remotes/origin/main'];
  const ids = objectIds(root, refs);
  return {
    private: isSplit(root)
      ? (objectIds(root, [UPSTREAM], { side: true }).get(UPSTREAM) ?? 'none')
      : null,
    public: refs.map((ref) => ids.get(ref) ?? 'none'),
  };
};

const readRecord = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch (error) {
    // A power loss can leave an empty file behind the rename.
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return null;
    throw error;
  }
};
const list = (dir) => {
  try {
    return readdirSync(dir);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return [];
    throw error;
  }
};
const mtime = (file) => statSync(file, { throwIfNoEntry: false })?.mtimeMs;

const ago = (at) => {
  const minutes = Math.round((Date.now() - Date.parse(at)) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 120) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} days ago`;
};

const writeAtomically = (file, text) => {
  const dir = path.dirname(file);
  const temp = path.join(
    dir,
    `.${path.basename(file)}.${process.pid}.${randomBytes(6).toString('hex')}`
  );
  mkdirSync(dir, { recursive: true });
  writeFileSync(temp, text);
  renameSync(temp, file);
};

const sweep = (store) => {
  const mark = path.join(store, '.swept');
  if (Date.now() - (mtime(mark) ?? 0) < DAY) return;
  writeFileSync(mark, '');
  const versions = path.dirname(store);
  for (const version of list(versions)) {
    if (version !== VERSION) {
      rmSync(path.join(versions, version), { force: true, recursive: true });
    }
  }
  const now = Date.now();
  for (const key of list(store)) {
    const dir = path.join(store, key);
    const dirTime = mtime(dir);
    if (key.startsWith('.') || dirTime === undefined) continue;
    const files = list(dir)
      .map((name) => {
        const file = path.join(dir, name);
        return { file, temp: name.startsWith('.'), time: mtime(file) };
      })
      .filter(({ time }) => time !== undefined)
      .sort((a, b) => b.time - a.time);
    let records = 0;
    let left = 0;
    for (const { file, temp, time } of files) {
      const stale = temp
        ? now - time > WRITE_GRACE
        : now - time > KEEP_DAYS * DAY || records >= KEEP_PER_KEY;
      if (stale) {
        rmSync(file, { force: true });
        continue;
      }
      left += 1;
      if (!temp) records += 1;
    }
    if (left === 0 && now - dirTime > WRITE_GRACE) {
      try {
        rmdirSync(dir);
      } catch (error) {
        if (error.code !== 'ENOTEMPTY' && error.code !== 'ENOENT') throw error;
      }
    }
  }
};

/**
 * The checkout's pass records: it takes the checkout's state once, says which
 * passes cover a check, and publishes this run's passes only while the
 * checkout still has the state they ran on.
 * @param {string} root the checkout's top-level directory
 * @param {{ fresh?: boolean }} [options] fresh ignores every recorded pass and records none
 */
export function openCache(root, { fresh = false } = {}) {
  let state;
  let marked;
  // Whether every file held the snapshot's bytes at the last mark.
  let faithful = true;
  const skipped = [];
  let store;
  let global;
  let date;
  let refs;
  const mergeBases = new Map();
  let queue = [];
  let queued = 0;
  let dropped = null;
  const diffs = new Map();

  const current = () => {
    state ??= snapshot(root);
    return state;
  };
  const sameWork = () => {
    const { work } = snapshot(root);
    return (
      work.public === current().work.public &&
      work.private === current().work.private
    );
  };
  // A run whose checks all have recorded passes never stamps. The snapshot
  // after the stamp tells whether a write before it changed the files.
  const watch = () => {
    if (fresh || marked) return;
    current();
    marked = stamp(root);
    faithful = sameWork();
  };
  // Closes the span since the last mark, which holds the check that just
  // passed and any failed check before it, and says why that pass cannot
  // stand on the state the cache opened on, or null when it can.
  const markStep = (name) => {
    if (!marked) {
      return `the cache was not watching the files while ${name} ran`;
    }
    const startedFaithful = faithful;
    const now = new Map();
    let written;
    for (const [file, line] of marked) {
      now.set(file, statLine(root, file));
      if (written === undefined && now.get(file) !== line) written = file;
    }
    marked = now;
    if (written !== undefined) {
      faithful = sameWork();
      return `${written} was written while ${name} ran`;
    }
    return startedFaithful
      ? null
      : `${name} ran on files that changed after the cache opened`;
  };
  const storeDir = () => {
    store ??= path.join(
      must(gitIn(root, 'public'), [
        'rev-parse',
        '--path-format=absolute',
        '--git-common-dir',
      ]).trim(),
      'plate-check',
      VERSION
    );
    return store;
  };
  const keyOf = (scope) => {
    global ??= globalPart(root, process.env);
    const parts = {
      command: scope.command,
      global,
      name: scope.name,
      tests: scope.tests,
      v: VERSION,
    };
    if (scope.key.includes('date')) {
      date ??= new Date().toISOString().slice(0, 10);
      parts.date = date;
    }
    if (scope.key.includes('refs')) {
      refs ??= refsPart(root);
      parts.refs = refs;
    }
    return sha256(JSON.stringify(parts)).slice(0, 32);
  };
  const diffTrees = (half, a, b) => {
    const pair = `${half} ${a} ${b}`;
    if (!diffs.has(pair)) {
      // diff-tree fails on a tree that gc pruned, so a pruned record gives no evidence.
      const result = gitIn(
        root,
        half
      )(['diff-tree', '-r', '-z', '--raw', '--no-renames', a, b]);
      diffs.set(pair, result.status === 0 ? rawChanges(result.stdout) : null);
    }
    return diffs.get(pair);
  };
  const changedBetween = (from, to, filesOnly) => {
    if ((from.work.private === null) !== (to.work.private === null)) {
      return null;
    }
    const files = new Set();
    const retargeted = new Set();
    for (const side of filesOnly ? ['work'] : ['work', 'head']) {
      for (const half of ['public', 'private']) {
        const [a, b] = [from[side][half], to[side][half]];
        if (a === b) continue;
        const changed = diffTrees(half, a, b);
        if (changed === null) return null;
        for (const change of changed) {
          files.add(change.file);
          if (side === 'work' && change.retargeted) {
            retargeted.add(change.file);
          }
        }
      }
    }
    if (!filesOnly) {
      for (const half of ['public', 'private']) {
        const indexed = new Set(from.index[half]).symmetricDifference(
          new Set(to.index[half])
        );
        for (const entry of indexed) files.add(entry.slice(1));
      }
    }
    return {
      files: [...files].sort(byCodeUnit),
      retargeted: [...retargeted].sort(byCodeUnit),
    };
  };
  const flush = () => {
    const notRecorded = () =>
      skipped.length === 0
        ? null
        : `${skipped.join('; ')}, so ${
            skipped.length === 1 ? 'that pass is' : 'those passes are'
          } not recorded`;
    if (dropped) return { dropped, written: 0 };
    if (queue.length === 0) return { dropped: notRecorded(), written: 0 };
    const passes = queue;
    queue = [];
    queued = 0;
    const id = stateId(current());
    if (stateId(snapshot(root)) !== id) {
      dropped =
        'the checkout changed while the checks ran, so this run records no passes';
      return { dropped, written: 0 };
    }
    for (const { at, key, record } of passes) {
      writeAtomically(
        path.join(storeDir(), key, at),
        `${JSON.stringify(record)}\n`
      );
    }
    sweep(storeDir());
    return { dropped: notRecorded(), written: passes.length };
  };

  return {
    /**
     * The checkout's state, taken once on first use.
     * @returns {State} the state every lookup and record of this cache uses
     */
    get state() {
      return current();
    },
    /**
     * Evidence that `scope` passed: a pass on exactly this state alone when
     * there is one, else, with `near`, the newest recorded passes, then, with
     * `mergeBase`, the files changed since each half's merge base with
     * origin/next.
     * @param {Scope} scope the check to find passes for
     * @param {{ mergeBase?: boolean, near?: boolean }} [options] near adds recent passes on other states, and mergeBase origin/next's merge base
     * @returns {Base[]} each pass with the files changed since it, newest first and the merge base last
     */
    bases(scope, { mergeBase = false, near = false } = {}) {
      const found = [];
      if (!fresh && scope.key) {
        const dir = path.join(storeDir(), keyOf(scope));
        const exact = readRecord(
          path.join(dir, stateId(current(), scope.filesOnly))
        );
        if (exact) {
          return [
            {
              files: [],
              kind: 'exact',
              retargeted: [],
              label: `passed at this tree (${exact.worktree}, ${ago(
                exact.at
              )})`,
            },
          ];
        }
        const newest = (near ? list(dir) : [])
          .filter((name) => !name.startsWith('.'))
          .map((name) => ({
            file: path.join(dir, name),
            time: mtime(path.join(dir, name)),
          }))
          .filter(({ time }) => time !== undefined)
          .sort((a, b) => b.time - a.time)
          .slice(0, NEAR);
        for (const { file } of newest) {
          const record = readRecord(file);
          const changed =
            record && changedBetween(record.state, current(), scope.filesOnly);
          if (changed) {
            found.push({
              ...changed,
              kind: 'pass',
              label: `passed ${ago(record.at)} in ${record.worktree}`,
            });
          }
        }
      }
      if (mergeBase) {
        const filesOnly = Boolean(scope.filesOnly);
        if (!mergeBases.has(filesOnly)) {
          const base = mergeBaseState(root);
          const changed = base && changedBetween(base, current(), filesOnly);
          mergeBases.set(
            filesOnly,
            changed && {
              ...changed,
              kind: 'merge-base',
              label: 'passed at the merge base with origin/next',
            }
          );
        }
        if (mergeBases.get(filesOnly)) found.push(mergeBases.get(filesOnly));
      }
      return found;
    },
    /**
     * Stamps every file of both halves, once, so `record` can tell which
     * check wrote one. Call it just before the first check runs.
     */
    watch,
    /**
     * Queues `scope` as passed on the state the cache opened on, unless a file
     * of either half was written while it ran, even back to the same bytes, or
     * held other bytes when it started; flushes once FLUSH_SECONDS of passes
     * wait. Call it right after each check that passed.
     * @param {Scope} scope the check that passed
     * @param {number} seconds how long it ran
     */
    record(scope, seconds) {
      if (fresh || dropped) return;
      const reason = markStep(scope.name);
      if (!scope.key) return;
      if (reason) {
        skipped.push(reason);
        return;
      }
      queue.push({
        at: stateId(current(), scope.filesOnly),
        key: keyOf(scope),
        record: {
          at: new Date().toISOString(),
          command: scope.command,
          name: scope.name,
          seconds,
          state: current(),
          v: VERSION,
          worktree: path.basename(root),
        },
      });
      queued += seconds;
      if (queued >= FLUSH_SECONDS) flush();
    },
    /**
     * Publishes the queued passes if the checkout still has the state the
     * cache opened on, and sweeps old records once a day. Once the checkout
     * changed, it records nothing more and keeps returning why.
     * @returns {{ written: number, dropped: string | null }} dropped says why passes went unrecorded
     */
    flush,
  };
}
