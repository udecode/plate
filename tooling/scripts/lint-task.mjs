// `ultracite fix` formats before its lint autofix, which can leave code
// `oxfmt --check` rejects, so `oxfmt` runs again. `oxlint.config.ts` turns
// type-aware rules off for `ultracite check`, and that command's file count
// includes Markdown, so the type-aware oxlint run supplies both the typed rules
// and the count of files lint read. `land.mjs` passes `--allow-ignored`,
// because a docs-only commit has nothing to lint and must still land.
import { spawnSync } from 'node:child_process';
import { lstatSync } from 'node:fs';

const allowIgnored = process.argv.includes('--allow-ignored');
const paths = process.argv.slice(2).filter((arg) => arg !== '--allow-ignored');
if (paths.length === 0) {
  console.error('Usage: pnpm lint:task [--allow-ignored] <file> [...]');
  process.exit(2);
}
const missing = paths.filter(
  (path) => !lstatSync(path, { throwIfNoEntry: false })
);
if (missing.length > 0) {
  console.error(`No such file: ${missing.join(', ')}`);
  process.exit(2);
}
// A symlink's tracked content is its target path, so lint skips it like an
// ignored path; a link into an ignored directory dangles in a worktree.
const files = paths.filter((path) => !lstatSync(path).isSymbolicLink());

const run = (args) => {
  const result = spawnSync('pnpm', ['exec', ...args], { encoding: 'utf-8' });
  const output = `${result.stdout}${result.stderr}`
    .split('\n')
    .filter(
      (line) =>
        !/MODULE_TYPELESS_PACKAGE_JSON|Reparsing as ES module|To eliminate this warning|--trace-warnings/u.test(
          line
        )
    )
    .join('\n')
    .trim();
  if (output) console.info(output);
  return { output, status: result.status };
};

let linted = 0;
let clean = true;
if (files.length > 0) {
  run(['ultracite', 'fix', ...files]);
  run(['oxfmt', ...files]);
  const check = run(['ultracite', 'check', ...files]);
  const typed = run([
    'oxlint',
    '--type-aware',
    '--report-unused-disable-directives-severity=error',
    '--format=default',
    ...files,
  ]);
  const count = typed.output.match(/on (\d+) files? with/u)?.[1];
  if (count === undefined) {
    console.error(
      'oxlint did not report how many files it read, so lint did not run.'
    );
    process.exit(2);
  }
  linted = Number(count);
  clean = check.status === 0 && typed.status === 0;
}

if (linted === 0 && allowIgnored) {
  console.info(
    `Lint ignores all ${paths.length} paths, so there is nothing to lint.`
  );
  process.exit(0);
}
if (linted === 0) {
  console.error(
    `Lint ignores all ${paths.length} paths, so none of them is lint-clean.`
  );
  process.exit(2);
}
if (linted < paths.length) {
  console.info(
    `Lint ignores ${paths.length - linted} of the ${paths.length} paths; a lint-clean claim covers only the other ${linted}.`
  );
}
process.exit(clean ? 0 : 1);
