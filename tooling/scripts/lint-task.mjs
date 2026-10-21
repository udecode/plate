// `ultracite fix` formats before its lint autofix, which can leave code
// `oxfmt --check` rejects, so `oxfmt` runs again. `oxlint.config.ts` turns
// type-aware rules off for `ultracite check`, and that command's file count
// includes Markdown, so the type-aware oxlint run supplies both the typed rules
// and the count of files lint read. `land.mjs` passes `--allow-ignored`,
// because a docs-only commit has nothing to lint and must still land.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const allowIgnored = process.argv.includes('--allow-ignored');
const files = process.argv.slice(2).filter((arg) => arg !== '--allow-ignored');
if (files.length === 0) {
  console.error('Usage: pnpm lint:task [--allow-ignored] <file> [...]');
  process.exit(2);
}
const missing = files.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error(`No such file: ${missing.join(', ')}`);
  process.exit(2);
}

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
const linted = Number(count);

if (linted === 0 && allowIgnored) {
  console.info(
    `Lint ignores all ${files.length} paths, so there is nothing to lint.`
  );
  process.exit(0);
}
if (linted === 0) {
  console.error(
    `Lint ignores all ${files.length} paths, so none of them is lint-clean.`
  );
  process.exit(2);
}
if (linted < files.length) {
  console.info(
    `Lint ignores ${files.length - linted} of the ${files.length} paths; a lint-clean claim covers only the other ${linted}.`
  );
}
process.exit(check.status === 0 && typed.status === 0 ? 0 : 1);
