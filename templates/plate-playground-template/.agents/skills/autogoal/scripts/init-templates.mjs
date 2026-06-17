#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: CLI scripts write command output. */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.dirname(SCRIPT_DIR);
const BUILTIN_TEMPLATES_DIR = path.join(SKILL_DIR, 'assets', 'templates');
const TEMPLATE_FILES = [
  'goal.md',
  'task.md',
  'docs.md',
  'major-task.md',
  'goal-repair.md',
  'packs/agent-native.md',
  'packs/browser.md',
  'packs/docs.md',
  'packs/package-api.md',
];

if (isMainModule()) {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const root = findRepoRoot(process.cwd());
  const result = await initProjectTemplates(root, {
    force: args.force,
    silent: false,
  });

  if (result.created.length === 0 && result.updated.length === 0) {
    console.log('autogoal templates already initialized');
  }
}

export async function initProjectTemplates(root, options = {}) {
  const force = options.force === true;
  const silent = options.silent === true;
  const created = [];
  const skipped = [];
  const updated = [];

  for (const relativePath of TEMPLATE_FILES) {
    const sourcePath = path.join(BUILTIN_TEMPLATES_DIR, relativePath);
    const targetPath = path.join(
      root,
      'docs',
      'plans',
      'templates',
      relativePath
    );

    if (!existsSync(sourcePath)) {
      throw new Error(`missing built-in autogoal template: ${sourcePath}`);
    }

    const targetExists = existsSync(targetPath);

    if (!force && targetExists) {
      skipped.push(path.relative(root, targetPath));
      continue;
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, await readFile(sourcePath, 'utf8'));

    if (targetExists) {
      updated.push(path.relative(root, targetPath));
    } else {
      created.push(path.relative(root, targetPath));
    }
  }

  if (!silent) {
    for (const file of created) {
      console.log(`created ${file}`);
    }

    for (const file of updated) {
      console.log(`updated ${file}`);
    }

    for (const file of skipped) {
      console.log(`kept ${file}`);
    }
  }

  return { created, skipped, updated };
}

function parseArgs(argv) {
  const parsed = {};

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--force') {
      parsed.force = true;
      continue;
    }

    throw new Error(`unsupported argument: ${arg}`);
  }

  return parsed;
}

function findRepoRoot(start) {
  let current = path.resolve(start);

  while (true) {
    const marker = path.join(current, 'AGENTS.md');

    if (existsSync(marker)) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      throw new Error('could not find repo root containing AGENTS.md');
    }

    current = parent;
  }
}

function isMainModule() {
  return fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '');
}

function printHelp() {
  console.log(`Usage:
  node .agents/skills/autogoal/scripts/init-templates.mjs [--force]

Seeds generic autogoal templates into docs/plans/templates/.
Existing files are kept unless --force is passed.
Project-specific templates stay in docs/plans/templates/ and are never moved.`);
}
