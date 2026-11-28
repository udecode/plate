// `ultracite fix` formats before its lint autofix, which can leave code
// `oxfmt --check` rejects, so `oxfmt` runs again. The check calls `oxfmt
// --check` itself, because `ultracite check` fails when oxfmt ignores every
// path, as it ignores the donor specs that oxlint still lints. `land.mjs`
// passes `--allow-ignored`, because a docs-only commit has nothing to lint and
// must still land.
import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { delimiter, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { freshRun, openCache } from './check-cache.mjs';
import { isProse } from './check.mjs';

const CODE_FILE_RE = /\.[cm]?[jt]sx?$/u;
const COMMENT_SLOP_RE =
  /^\s*\/\/\s*(?:(?:workaround|hack|temporary)\b|fix\s+for\s+#\d+|={5,}|-{5,})/iu;

export function findCommentSlopInText(file, content) {
  const findings = [];
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (COMMENT_SLOP_RE.test(line)) {
      findings.push({ file, line: index + 1, text: line.trim() });
    }
  }
  return findings;
}

export function findCommentSlopInDiff(diffText) {
  const findings = [];
  let file = '';
  let lineNumber = 0;

  for (const rawLine of diffText.split('\n')) {
    if (rawLine.startsWith('+++ b/')) {
      file = rawLine.slice('+++ b/'.length);
      continue;
    }
    const hunk = rawLine.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/u);
    if (hunk) {
      lineNumber = Number(hunk[1]);
      continue;
    }
    if (!file || !CODE_FILE_RE.test(file)) continue;
    if (rawLine.startsWith('+') && !rawLine.startsWith('+++')) {
      const added = rawLine.slice(1);
      if (COMMENT_SLOP_RE.test(added)) {
        findings.push({ file, line: lineNumber, text: added.trim() });
      }
      lineNumber += 1;
    } else if (!rawLine.startsWith('-') && !rawLine.startsWith('\\')) {
      lineNumber += 1;
    }
  }

  return findings;
}

export function checkAddedCommentSlop(repoRoot, filePaths) {
  const codePaths = filePaths
    .map((filePath) => relative(repoRoot, resolve(repoRoot, filePath)))
    .filter((relPath) => CODE_FILE_RE.test(relPath));
  if (codePaths.length === 0) return [];

  const mergeBase = spawnSync('git', ['merge-base', 'HEAD', 'origin/next'], {
    cwd: repoRoot,
    encoding: 'utf-8',
  });
  const baseRef =
    mergeBase.status === 0 && mergeBase.stdout.trim()
      ? mergeBase.stdout.trim()
      : 'HEAD';

  const diff = spawnSync(
    'git',
    ['diff', '--unified=0', '--no-color', baseRef, '--', ...codePaths],
    { cwd: repoRoot, encoding: 'utf-8' }
  );
  const findings = diff.status === 0 ? findCommentSlopInDiff(diff.stdout) : [];

  const untracked = spawnSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', '--', ...codePaths],
    { cwd: repoRoot, encoding: 'utf-8' }
  );
  if (untracked.status === 0) {
    for (const relPath of untracked.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)) {
      if (!CODE_FILE_RE.test(relPath)) continue;
      const content = readFileSync(join(repoRoot, relPath), 'utf-8');
      findings.push(...findCommentSlopInText(relPath, content));
    }
  }

  return findings;
}

function main() {
  const root = process.cwd();
  const BIN = join(root, 'node_modules', '.bin');

  const allowIgnored = process.argv.includes('--allow-ignored');
  const paths = process.argv
    .slice(2)
    .filter((arg) => arg !== '--allow-ignored');
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

  // Type-aware rules read every file a linted file imports, so a pass covers
  // only this tree, or one that differs in prose outside these paths.
  const cache = openCache(root, { fresh: freshRun(process.env) });
  const scope = {
    command: process.argv.slice(2).toSorted().join('\n'),
    filesOnly: true,
    key: ['date'],
    name: 'lint-task',
  };
  const own = paths.map((path) => relative(root, resolve(path)));
  const outside = (file) =>
    own.every(
      (path) => path !== '' && path !== file && !file.startsWith(`${path}/`)
    );
  const cover = cache
    .bases(scope, { near: true })
    .find((base) => base.files.every((file) => isProse(file) && outside(file)));
  if (cover) {
    console.info(`Lint ${cover.label}, so it did not run again.`);
    process.exit(0);
  }
  cache.watch();
  cache.begin(scope.name);
  const started = Date.now();

  const run = (args) => {
    const result = spawnSync(args[0], args.slice(1), {
      encoding: 'utf-8',
      // ultracite starts oxlint and oxfmt by name, as under `pnpm exec`.
      env: { ...process.env, PATH: `${BIN}${delimiter}${process.env.PATH}` },
    });
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
    const check = run([
      'oxfmt',
      '--check',
      '--no-error-on-unmatched-pattern',
      ...files,
    ]);
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
    const slopFindings = checkAddedCommentSlop(root, files);
    if (slopFindings.length > 0) {
      console.error('Added comment slop found:');
      for (const finding of slopFindings) {
        console.error(`  ${finding.file}:${finding.line}: ${finding.text}`);
      }
    }
    clean =
      check.status === 0 && typed.status === 0 && slopFindings.length === 0;
  }

  if (linted > 0 && !clean) process.exit(1);
  if (linted === 0 && !allowIgnored) {
    console.error(
      `Lint ignores all ${paths.length} paths, so none of them is lint-clean.`
    );
    process.exit(2);
  }
  if (linted === 0) {
    console.info(
      `Lint ignores all ${paths.length} paths, so there is nothing to lint.`
    );
  } else if (linted < paths.length) {
    console.info(
      `Lint ignores ${paths.length - linted} of the ${paths.length} paths; a lint-clean claim covers only the other ${linted}.`
    );
  }
  cache.record(
    scope,
    Math.round((Date.now() - started) / 1000),
    cache.end(scope.name)
  );
  cache.flush();
  process.exit(0);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
