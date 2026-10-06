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

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export const readBaseline = (file) => {
  try {
    return JSON.parse(readFileSync(path.join(repoRoot, file), 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
};

/** The identity of a finding on `line` (1-based) of `text`. */
export const lineIdentity = (text, line) =>
  text.split('\n')[line - 1]?.trim() ?? '';

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

const multisetDifference = (from = [], minus = []) => {
  const left = [...minus];
  return from.filter((identity) => {
    const index = left.indexOf(identity);
    if (index === -1) return true;
    left.splice(index, 1);
    return false;
  });
};

const multisetIntersection = (a, b) =>
  multisetDifference(a, multisetDifference(a, b));

const differences = (from, minus) =>
  Object.entries(from).flatMap(([rule, files]) =>
    Object.entries(files).flatMap(([file, identities]) =>
      multisetDifference(identities, minus[rule]?.[file]).map(
        (identity) => `${rule} ${file}: ${JSON.stringify(identity)}`
      )
    )
  );

/**
 * Compares `found` with the baseline at `file` and returns the exit code.
 *
 * `check` fails on any difference. `lower` fails on a finding the baseline
 * does not list and otherwise drops the entries the tree no longer holds.
 * `init` seeds every rule the file lacks.
 */
export function enforceBaseline({
  file,
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
  const atBase = spawnSync('git', ['show', `${base}:${file}`], {
    cwd: repoRoot,
    encoding: 'utf-8',
  });
  if (atBase.status === 0) {
    const bound = JSON.parse(atBase.stdout);
    const raised = differences(
      Object.fromEntries(
        Object.keys(bound).map((rule) => [rule, old[rule] ?? {}])
      ),
      bound
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
    const seeded = Object.fromEntries(
      rules.map((rule) => [
        rule,
        Object.hasOwn(old, rule) ? old[rule] : (found[rule] ?? {}),
      ])
    );
    writeFileSync(
      path.join(repoRoot, file),
      `${JSON.stringify(sortKeys(seeded), null, 2)}\n`
    );
    console.info(`Seeded ${added.length} rules in ${file}.`);
    return 0;
  }

  const increases = differences(found, old);
  const decreases = differences(old, found);

  if (increases.length > 0) {
    console.error(increases.join('\n'));
    console.error(newFindingsHelp);
    return 1;
  }
  if (mode === 'check') {
    if (decreases.length > 0) {
      console.error(decreases.join('\n'));
      console.error(
        `${file} lists findings the tree no longer holds. Run ${lowerCommand} to drop them.`
      );
      return 1;
    }
    console.info(`${file} matches the tree.`);
    return 0;
  }
  const lowered = Object.fromEntries(
    Object.entries(old).map(([rule, files]) => [
      rule,
      Object.fromEntries(
        Object.entries(files)
          .map(([source, identities]) => [
            source,
            multisetIntersection(identities, found[rule]?.[source]),
          ])
          .filter(([, identities]) => identities.length > 0)
      ),
    ])
  );
  writeFileSync(
    path.join(repoRoot, file),
    `${JSON.stringify(sortKeys(lowered), null, 2)}\n`
  );
  console.info(`Dropped ${decreases.length} entries from ${file}.`);
  return 0;
}
