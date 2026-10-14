// Lists each file that a mutation spec in <run-dir> mutates whose bytes at <rev> no spec there ran
// on, the way a mutation check cited for a review round can predate a rename of the lines it
// mutates. Usage:
//   node tooling/scripts/stale-mutations.mjs --dir <run-dir> --head <rev>
// A spec is a JSON file with `commit` and `mutations: [{ file }]`, as `.agents/pstack/mutate.mjs`
// reads it.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const git = (cwd, args) => {
  const result = spawnSync('git', args, { cwd, encoding: 'utf-8' });
  return result.status === 0 ? result.stdout.trim() : null;
};

const jsonFiles = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => join(entry.parentPath, entry.name));

const specOf = (path) => {
  try {
    const value = JSON.parse(readFileSync(path, 'utf-8'));
    if (typeof value?.commit !== 'string' || !Array.isArray(value.mutations)) {
      return null;
    }
    const files = value.mutations
      .map((mutation) => mutation?.file)
      .filter((file) => typeof file === 'string');
    return files.length > 0 ? { commit: value.commit, files } : null;
  } catch {
    return null;
  }
};

export const staleMutations = ({ cwd = process.cwd(), dir, head }) => {
  if (!git(cwd, ['rev-parse', '--verify', '--quiet', `${head}^{commit}`])) {
    throw new Error(`${head} names no commit`);
  }
  const blob = (rev, file) =>
    git(cwd, ['rev-parse', '--verify', '--quiet', `${rev}:${file}`]);
  const runs = new Map();
  for (const path of jsonFiles(dir)) {
    const spec = specOf(path);
    if (!spec) continue;
    for (const file of new Set(spec.files)) {
      if (!runs.has(file)) runs.set(file, []);
      runs.get(file).push({ commit: spec.commit, spec: relative(cwd, path) });
    }
  }
  const hits = [];
  for (const [file, specs] of runs) {
    const frozen = blob(head, file);
    if (specs.some(({ commit }) => blob(commit, file) === frozen)) continue;
    hits.push({ file, specs });
  }
  return hits;
};

const describe = ({ file, specs }) =>
  `${file}: no mutation spec ran on these bytes; ${specs
    .map(({ commit, spec }) => `${spec} ran on ${commit.slice(0, 10)}`)
    .join(', ')}`;

// The hook sees the command before the shell expands it, so a `--dir $R` resolves only through an
// `R=...` assignment in the same command.
const runDirOf = (command, cwd) => {
  const raw = /freeze\.mjs\b.*--dir\s+(\S+)/.exec(command)?.[1];
  if (!raw) return { raw: null };
  const assignments = Object.fromEntries(
    [...command.matchAll(/(?:^|[\s;&(])([A-Za-z_]\w*)=([^\s;&|)]+)/g)].map(
      ([, name, value]) => [name, value.replace(/^["']|["']$/g, '')]
    )
  );
  const expanded = raw
    .replace(/^["']|["']$/g, '')
    .replace(
      /\$\{?([A-Za-z_]\w*)\}?/g,
      (_, name) => assignments[name] ?? `$${name}`
    );
  const dir = resolve(cwd, expanded);
  return { dir: !expanded.includes('$') && existsSync(dir) ? dir : null, raw };
};

/**
 * Claude Code's PostToolUse hook: after `freeze.mjs --dir <run-dir>` freezes a review round's tree
 * and prints it, it adds each stale file to Claude's context, or names a run directory it cannot
 * resolve. It never blocks, and stays silent otherwise.
 */
export const hookOutput = (input) => {
  const cwd = input.cwd ?? process.cwd();
  const frozen = [
    ...String(input.tool_response?.stdout ?? '').matchAll(/\b[0-9a-f]{40}\b/g),
  ].at(-1)?.[0];
  if (!frozen) return null;
  const context = (lines) => ({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: lines.join('\n'),
    },
  });
  const { dir, raw } = runDirOf(input.tool_input?.command ?? '', cwd);
  if (!dir) {
    return raw
      ? context([
          `stale-mutations: could not resolve the run directory ${raw}. Before citing a mutation check for ${frozen}, run node tooling/scripts/stale-mutations.mjs --dir <run-dir> --head ${frozen}.`,
        ])
      : null;
  }
  let hits;
  try {
    hits = staleMutations({ cwd, dir, head: frozen });
  } catch {
    return null;
  }
  if (hits.length === 0) return null;
  return context([
    `stale-mutations: this round's tree (${frozen}) changed files that no mutation spec in ${relative(cwd, dir)} ran on. Before citing a mutation check for this tree, rerun .agents/pstack/mutate.mjs on a commit that holds these bytes.`,
    ...hits.map(describe),
  ]);
};

const main = () => {
  const args = process.argv.slice(2);
  if (args.includes('--hook')) {
    let input;
    try {
      input = JSON.parse(readFileSync(0, 'utf-8'));
    } catch {
      return 0;
    }
    const output = hookOutput(input);
    if (output) console.log(JSON.stringify(output));
    return 0;
  }
  const option = (name) => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
  };
  const dir = option('--dir');
  const head = option('--head');
  if (!dir || !head) {
    console.error('[stale-mutations] pass --dir <run-dir> and --head <rev>.');
    return 2;
  }
  let hits;
  try {
    hits = staleMutations({ dir, head });
  } catch (error) {
    console.error(
      `[stale-mutations] ${error.message}; pass a head this checkout holds.`
    );
    return 2;
  }
  for (const hit of hits) console.error(describe(hit));
  if (hits.length > 0) {
    console.error(
      '[stale-mutations] Each file above changed after every mutation run that covers it. Rerun mutate.mjs on a commit that holds these bytes before citing it.'
    );
    return 1;
  }
  return 0;
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main();
}
