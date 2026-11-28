// A finding baseline lists the known findings of a check by rule, file and
// identity, the trimmed text of the line each one flags, and only shrinks. A
// finding it does not list fails, so a new finding cannot replace a fixed one
// in the same file unless their lines read the same. Under check, a listed
// finding the tree no longer holds fails, so a fixed finding cannot come back.
// When the base commit holds the file, its copy bounds each rule it lists, so
// adding an entry by hand cannot green a new finding of that rule. CI passes
// the push or pull request base as PLATE_BASELINE_BASE.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { showAt } from './private-files.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export const readBaseline = (file) => {
  try {
    return JSON.parse(readFileSync(path.join(repoRoot, file), 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
};

/** One baseline holding every rule's files from each of `baselines`. */
export const mergeBaselines = (baselines) => {
  const merged = {};
  for (const baseline of baselines) {
    for (const [rule, files] of Object.entries(baseline)) {
      merged[rule] = { ...merged[rule], ...files };
    }
  }
  return merged;
};

/** The identity of a finding on `line` (1-based) of `text`. */
export const lineIdentity = (text, line) =>
  text.split('\n')[line - 1]?.trim() ?? '';

// oxfmt owns the committed layout, so a write that skipped it would fail the
// format check that the next lint runs.
const writeBaseline = (file, baseline) => {
  const target = path.join(repoRoot, file);
  writeFileSync(target, `${JSON.stringify(sortKeys(baseline), null, 2)}\n`);
  spawnSync(path.join(repoRoot, 'node_modules/.bin/oxfmt'), [target], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
};

const sortKeys = (object) =>
  Object.fromEntries(
    Object.entries(object).sort(([a], [b]) => a.localeCompare(b))
  );

/**
 * Groups `{ rule, file, identity }` findings as
 * `{ [rule]: { [file]: identities } }`.
 */
export const groupFindings = (findings) => {
  const grouped = {};
  for (const { file, identity, rule } of findings) {
    grouped[rule] ??= {};
    (grouped[rule][file] ??= []).push(identity);
  }
  return sortKeys(
    Object.fromEntries(
      Object.entries(grouped).map(([rule, files]) => [
        rule,
        sortKeys(
          Object.fromEntries(
            Object.entries(files).map(([file, identities]) => [
              file,
              identities.sort((a, b) => a.localeCompare(b)),
            ])
          )
        ),
      ])
    )
  );
};

const matchMultiset = (from, minus, covererFor) => {
  const remainingMinus = [...(minus ?? [])];
  const unmatchedFrom = [];
  const kept = [];
  for (const identity of from ?? []) {
    const index = remainingMinus.indexOf(identity);
    if (index === -1) {
      unmatchedFrom.push(identity);
    } else {
      remainingMinus.splice(index, 1);
      kept.push(identity);
    }
  }
  if (!covererFor) {
    return {
      downgraded: 0,
      kept,
      unmatchedFrom,
      unmatchedMinus: remainingMinus,
    };
  }
  const stillUnmatched = [];
  let downgraded = 0;
  for (const identity of unmatchedFrom) {
    const coverer = covererFor(identity, remainingMinus);
    const index =
      coverer && coverer !== identity ? remainingMinus.indexOf(coverer) : -1;
    if (index === -1) {
      stillUnmatched.push(identity);
    } else {
      remainingMinus.splice(index, 1);
      kept.push(identity);
      downgraded += 1;
    }
  }
  return {
    downgraded,
    kept,
    unmatchedFrom: stillUnmatched,
    unmatchedMinus: remainingMinus,
  };
};

/**
 * The grouped findings in `from` that `minus` does not list, counting
 * repeats, as `<rule> <file>: "<identity>"` lines. When `coveredBy` names a
 * strictly more severe identity for a finding, one unmatched copy of that
 * stricter identity in `minus` covers one copy of the finding.
 *
 * @param {Record<string, Record<string, readonly string[]>>} from Grouped findings to check.
 * @param {Record<string, Record<string, readonly string[]>>} minus Grouped baseline findings to subtract.
 * @param {(rule: string, identity: string, candidates?: readonly string[]) => string | undefined} [coveredBy] Maps a downgraded finding to a strictly more severe baseline identity.
 */
export const differences = (from, minus, coveredBy) =>
  Object.entries(from).flatMap(([rule, files]) => {
    const covererFor = coveredBy
      ? (identity, candidates) => coveredBy(rule, identity, candidates)
      : undefined;
    return Object.entries(files).flatMap(([file, identities]) =>
      matchMultiset(
        identities,
        minus[rule]?.[file],
        covererFor
      ).unmatchedFrom.map(
        (identity) => `${rule} ${file}: ${JSON.stringify(identity)}`
      )
    );
  });

/**
 * Compares `found` with the baseline at `file` and returns the exit code.
 *
 * `check` fails on any difference. `light` fails only on a finding the
 * baseline does not list, for a run whose cases are a subset of the gate's,
 * which reaches only some of the listed findings. `lower` fails on a finding
 * the baseline does not list and otherwise drops the entries the tree no
 * longer holds, downgrading entries covered by `coveredBy`.
 * `init` fails when the file already lists every rule, or on a finding the
 * file does not list under a rule it lists, and otherwise seeds every rule
 * the file lacks. `describe` turns a new finding's baseline key into the line
 * the caller prints for it. `coveredBy` optionally maps `(rule, identity)` to
 * a strictly more severe baseline identity that covers `identity` 1-to-1.
 * The base commit's copies of `boundFiles`, `file` alone by default, together
 * bound the baseline's growth.
 *
 * @param {{
 *   boundFiles?: readonly string[];
 *   coveredBy?: (rule: string, identity: string, candidates?: readonly string[]) => string | undefined;
 *   describe?: (key: string) => string;
 *   file: string;
 *   found: Record<string, Record<string, readonly string[]>>;
 *   lowerCommand: string;
 *   mode: string;
 *   newFindingsHelp: string;
 *   rules: readonly string[];
 * }} options Baseline comparison options.
 */
export function enforceBaseline({
  coveredBy,
  describe = (key) => key,
  file,
  boundFiles = [file],
  found,
  lowerCommand,
  mode,
  newFindingsHelp,
  rules,
}) {
  const old = readBaseline(file);
  const base = process.env.PLATE_BASELINE_BASE || 'HEAD';
  const resolved = spawnSync(
    'git',
    ['rev-parse', '--verify', '--quiet', `${base}^{commit}`],
    { cwd: repoRoot }
  );
  if (resolved.status !== 0) {
    console.error(
      `[baseline] Cannot resolve the base commit ${base}, so growth of ${file} cannot be checked. Pass a base this checkout holds.`
    );
    return 1;
  }
  const copies = boundFiles
    .map((bounding) => showAt(repoRoot, base, bounding))
    .filter((copy) => copy.status === 0);
  if (copies.length > 0) {
    const bound = mergeBaselines(copies.map((copy) => JSON.parse(copy.stdout)));
    const raised = differences(
      Object.fromEntries(
        Object.keys(bound).map((rule) => [rule, old[rule] ?? {}])
      ),
      bound,
      coveredBy
    );
    if (raised.length > 0) {
      console.error(raised.join('\n'));
      console.error(
        `${file} lists findings its copy at ${base} does not. The baseline never grows: fix each new finding, including what a widened rule newly finds.`
      );
      return 1;
    }
  } else {
    console.warn(
      `[baseline] ${base} has no ${file}, so growth against the base is not checked.`
    );
  }

  if (mode === 'init') {
    const added = rules.filter((rule) => !Object.hasOwn(old, rule));
    if (added.length === 0) {
      console.error(
        `Every rule already has entries in ${file}; init only seeds new rules.`
      );
      return 1;
    }
    const raised = differences(
      Object.fromEntries(
        Object.keys(old).map((rule) => [rule, found[rule] ?? {}])
      ),
      old,
      coveredBy
    );
    if (raised.length > 0) {
      console.error(raised.map(describe).join('\n'));
      console.error(newFindingsHelp);
      return 1;
    }
    const seeded = Object.fromEntries(
      rules.map((rule) => [
        rule,
        Object.hasOwn(old, rule) ? old[rule] : (found[rule] ?? {}),
      ])
    );
    writeBaseline(file, seeded);
    console.info(`Seeded ${added.length} rules in ${file}.`);
    return 0;
  }

  const increases = differences(found, old, coveredBy);
  const decreases = differences(old, found);

  if (increases.length > 0) {
    console.error(increases.map(describe).join('\n'));
    console.error(newFindingsHelp);
    if (mode === 'check' && decreases.length > 0) {
      console.error(
        `${file} also lists ${decreases.length} findings the tree no longer holds. Once the new findings are fixed, run ${lowerCommand} to drop them.`
      );
    }
    return 1;
  }
  if (mode === 'light') {
    console.info(
      `${file} lists every finding of the light bound; the gate run checks the ${decreases.length} listed findings it does not reach.`
    );
    return 0;
  }
  if (mode === 'check') {
    if (decreases.length > 0) {
      console.error(
        `${file} lists ${decreases.length} findings the tree no longer holds. Run ${lowerCommand} to drop them:`
      );
      console.error(decreases.join('\n'));
      return 1;
    }
    console.info(`${file} matches the tree.`);
    return 0;
  }
  let dropped = 0;
  let downgraded = 0;
  const lowered = Object.fromEntries(
    Object.entries(old).map(([rule, files]) => {
      const covererFor = coveredBy
        ? (identity, candidates) => coveredBy(rule, identity, candidates)
        : undefined;
      return [
        rule,
        Object.fromEntries(
          Object.entries(files)
            .map(([source, identities]) => {
              const match = matchMultiset(
                found[rule]?.[source],
                identities,
                covererFor
              );
              dropped += match.unmatchedMinus.length;
              downgraded += match.downgraded;
              return [source, match.kept.sort((a, b) => a.localeCompare(b))];
            })
            .filter(([, identities]) => identities.length > 0)
        ),
      ];
    })
  );
  writeBaseline(file, lowered);
  console.info(
    downgraded > 0
      ? `Dropped ${dropped} entries and downgraded ${downgraded} entries in ${file}.`
      : `Dropped ${dropped} entries from ${file}.`
  );
  return 0;
}
