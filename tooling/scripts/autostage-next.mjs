#!/usr/bin/env node
// Stages every changed path matching tooling/autostage-next.txt, only on the
// `next` branch, so the unstaged view holds source edits awaiting review.
// Unmerged paths are skipped: staging them would mark conflicts resolved.
// `--dry-run` prints the paths it would stage.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

const git = (args, { env, input } = {}) =>
  execFileSync('git', args, {
    cwd: root,
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    input,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

const splitNul = (output) => output.split('\0').filter(Boolean);

try {
  if (git(['branch', '--show-current']).trim() !== 'next') process.exit(0);

  const pathspecs = readFileSync(
    path.join(root, 'tooling/autostage-next.txt'),
    'utf-8'
  )
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((pattern) =>
      pattern.startsWith('!')
        ? `:(exclude,glob)${pattern.slice(1)}`
        : `:(glob)${pattern}`
    );

  const unmerged = new Set(
    splitNul(git(['diff', '--name-only', '--diff-filter=U', '-z']))
  );
  const files = [
    ...new Set(
      splitNul(
        git([
          'ls-files',
          '-z',
          '--modified',
          '--deleted',
          '--others',
          '--exclude-standard',
          '--',
          ...pathspecs,
        ])
      )
    ),
  ].filter((file) => !unmerged.has(file));

  if (process.argv.includes('--dry-run')) {
    process.stdout.write(files.map((file) => `${file}\n`).join(''));
  } else if (files.length > 0) {
    git(['add', '-A', '--pathspec-from-file=-', '--pathspec-file-nul'], {
      env: { GIT_LITERAL_PATHSPECS: '1' },
      input: files.join('\0'),
    });
  }
} catch (error) {
  process.stderr.write(
    `autostage-next: ${error.stderr?.toString().trim() || error.message}\n`
  );
  process.exit(1);
}
