#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: CLI scripts write command output. */
import { existsSync } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initProjectTemplates } from './init-templates.mjs';

const SAFE_SKILL_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.dirname(SCRIPT_DIR);
const BUILTIN_TEMPLATES_DIR = path.join(SKILL_DIR, 'assets', 'templates');

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const root = findRepoRoot(process.cwd());
const targetPath = resolveTargetPath(root, args);

if (!targetPath && !args.print) {
  printHelp();
  process.exitCode = 1;
} else if (args.print) {
  const sourcePath = resolveSourceTemplate(root, args.from);
  const content = await readFile(sourcePath, 'utf8');

  process.stdout.write(content);
} else {
  await initProjectTemplates(root, { silent: true });
  const sourcePath = resolveSourceTemplate(root, args.from);
  const content = await readFile(sourcePath, 'utf8');

  await mkdir(path.dirname(targetPath), { recursive: true });

  if (!args.force && (await exists(targetPath))) {
    throw new Error(
      `goal template already exists: ${path.relative(root, targetPath)} (use --force to overwrite)`
    );
  }

  await writeFile(targetPath, content);
  console.log(path.relative(root, targetPath));
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--force') {
      parsed.force = true;
      continue;
    }

    if (arg === '--print') {
      parsed.print = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new Error(`unexpected positional argument: ${arg}`);
    }

    const rawFlag = arg.slice(2);
    const equalsIndex = rawFlag.indexOf('=');
    const key = equalsIndex === -1 ? rawFlag : rawFlag.slice(0, equalsIndex);
    const value =
      equalsIndex === -1 ? argv[index + 1] : rawFlag.slice(equalsIndex + 1);

    if (equalsIndex === -1) {
      index += 1;
    }

    if (!value || value.startsWith('--')) {
      throw new Error(`missing value for --${key}`);
    }

    parsed[toCamelCase(key)] = value;
  }

  return parsed;
}

function resolveTargetPath(root, args) {
  if (args.path) {
    return path.resolve(root, args.path);
  }

  if (args.skill) {
    assertSafeSkillName(args.skill);

    return path.join(root, 'docs', 'plans', 'templates', `${args.skill}.md`);
  }

  return;
}

function resolveSourceTemplate(root, template) {
  if (!template) {
    return resolveSourceTemplate(root, 'goal');
  }

  const candidates = [];

  if (
    template.includes('/') ||
    template.includes('\\') ||
    template.endsWith('.md')
  ) {
    candidates.push(path.resolve(root, template));
  } else {
    candidates.push(
      path.join(root, 'docs', 'plans', 'templates', `${template}.md`),
      path.join(root, 'docs', 'plans', 'templates', template, 'goal.md'),
      path.join(BUILTIN_TEMPLATES_DIR, `${template}.md`),
      path.join(BUILTIN_TEMPLATES_DIR, template, 'goal.md')
    );
  }

  const found = candidates.find((candidate) => existsSync(candidate));

  if (found) {
    return found;
  }

  throw new Error(
    `could not resolve source template "${template}". Tried: ${candidates
      .map((candidate) => path.relative(root, candidate))
      .join(', ')}`
  );
}

function assertSafeSkillName(skill) {
  if (!SAFE_SKILL_NAME_PATTERN.test(skill)) {
    throw new Error(`unsafe skill name: ${skill}`);
  }
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

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function printHelp() {
  console.log(`Usage:
  node .agents/skills/autogoal/scripts/create-goal-template.mjs \\
    --skill package-release-audit \\
    [--from goal] \\
    [--force]

  node .agents/skills/autogoal/scripts/create-goal-template.mjs \\
    --path docs/plans/templates/custom.md

Creates a project-owned reusable goal template under docs/plans/templates/.
Before writing, missing generic templates are initialized under docs/plans/templates/.
Source templates resolve from project templates first, then built-in autogoal assets.
Runtime goal plans still go in docs/plans via create-goal-scratchpad.mjs.`);
}
