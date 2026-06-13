#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: CLI scripts write command output. */
import { existsSync } from 'node:fs';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initProjectTemplates } from './init-templates.mjs';

const ALLOWED_FLAGS = new Set([
  'date',
  'force',
  'help',
  'path',
  'slug',
  'template',
  'ticket',
  'title',
  'with',
]);

const LIST_FLAGS = new Set(['with']);
const NEWLINE_PATTERN = /\r?\n/;
const LEADING_NEWLINES_PATTERN = /^\n+/;
const PACK_SECTION_NAMES = [
  'Start Gates',
  'Work Checklist',
  'Completion Gates',
];
const PRIMARY_TEMPLATE_SECTION_PATTERN = /^Primary template:\s*$/m;
const TABLE_GATE_HEADER_PATTERN = /^gate$/i;
const SECTION_START_PATTERN = /^[A-Z][A-Za-z /-]+:\s*$/;
const HEADING_PATTERN = /^#{1,6}\s+\S/;
const TABLE_MARKDOWN_SEPARATOR_CELL_PATTERN = /^:?-+:?$/;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.dirname(SCRIPT_DIR);
const BUILTIN_TEMPLATES_DIR = path.join(SKILL_DIR, 'assets', 'templates');

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.title) {
  const root = findRepoRoot(process.cwd());
  await initProjectTemplates(root, { silent: true });
  const templatePath = resolveTemplatePath(root, args.template);
  const packs = resolvePackPaths(root, args.with ?? []);
  const date = args.date ?? new Date().toISOString().slice(0, 10);
  const slug = args.slug ?? slugify(args.title);
  const fileName = args.ticket
    ? `${args.ticket}-${slug}.md`
    : `${date}-${slug}.md`;
  const scratchpadPath = args.path
    ? path.resolve(root, args.path)
    : path.join(root, 'docs', 'plans', fileName);
  const taskSourceLink = await resolveTaskSourceLink(root, args.ticket);
  let content = await renderTemplate(templatePath, {
    createdAt: new Date().toISOString(),
    planPath: path.relative(root, scratchpadPath),
    taskSourceLink,
    title: args.title,
    templatePath: path.relative(root, templatePath),
  });
  const renderedPacks = await Promise.all(
    packs.map(async (pack) => ({
      ...pack,
      content: await renderTemplate(pack.path, {
        createdAt: new Date().toISOString(),
        packName: pack.name,
        planPath: path.relative(root, scratchpadPath),
        taskSourceLink,
        templatePath: path.relative(root, templatePath),
        title: args.title,
      }),
    }))
  );

  content = insertCompositionMetadata(content, {
    packs: renderedPacks,
    root,
    templatePath,
  });
  content = mergePackSections(content, renderedPacks);

  await mkdir(path.dirname(scratchpadPath), { recursive: true });

  if (!args.force && (await exists(scratchpadPath))) {
    throw new Error(
      `scratchpad already exists: ${path.relative(root, scratchpadPath)} (use --force to overwrite)`
    );
  }

  await writeFile(scratchpadPath, content);
  console.log(path.relative(root, scratchpadPath));
} else {
  printHelp();
  process.exitCode = 1;
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

    if (!arg.startsWith('--')) {
      throw new Error(`unexpected positional argument: ${arg}`);
    }

    const rawFlag = arg.slice(2);
    const equalsIndex = rawFlag.indexOf('=');
    const key = equalsIndex === -1 ? rawFlag : rawFlag.slice(0, equalsIndex);

    if (!ALLOWED_FLAGS.has(key)) {
      throw new Error(
        `unsupported flag --${key}. Generate the static template first, then write goal content into the file.`
      );
    }

    const value =
      equalsIndex === -1 ? argv[index + 1] : rawFlag.slice(equalsIndex + 1);

    if (equalsIndex === -1) {
      index += 1;
    }

    if (!value || value.startsWith('--')) {
      throw new Error(`missing value for --${key}`);
    }

    const parsedKey = toCamelCase(key);

    if (LIST_FLAGS.has(key)) {
      parsed[parsedKey] = [
        ...(parsed[parsedKey] ?? []),
        ...parseListValue(value),
      ];
    } else {
      parsed[parsedKey] = value;
    }
  }

  return parsed;
}

async function renderTemplate(templatePath, values) {
  const template = await readFile(templatePath, 'utf8');

  return template
    .replaceAll('{{TITLE}}', values.title)
    .replaceAll('{{PLAN_PATH}}', values.planPath)
    .replaceAll('{{PACK_NAME}}', values.packName ?? '')
    .replaceAll('{{TASK_SOURCE_LINK}}', values.taskSourceLink ?? 'pending')
    .replaceAll('{{CREATED_AT}}', values.createdAt)
    .replaceAll('{{TEMPLATE_PATH}}', values.templatePath);
}

async function resolveTaskSourceLink(root, ticket) {
  if (!ticket) {
    return 'pending';
  }

  if (/^https?:\/\//i.test(ticket)) {
    return ticket;
  }

  const linearWorkspaceSlug = await findLinearWorkspaceSlug(root);

  if (linearWorkspaceSlug) {
    return `[${ticket}](https://linear.app/${linearWorkspaceSlug}/issue/${ticket})`;
  }

  return ticket;
}

async function findLinearWorkspaceSlug(root) {
  for (const relativePath of [
    'docs/plans/templates/task.md',
    '.agents/AGENTS.md',
    'README.md',
  ]) {
    const slug = await readLinearWorkspaceSlug(path.join(root, relativePath));

    if (slug) {
      return slug;
    }
  }

  return findLinearWorkspaceSlugInDocs(path.join(root, 'docs', 'plans'));
}

async function findLinearWorkspaceSlugInDocs(dir, state = { readCount: 0 }) {
  if (state.readCount >= 200) {
    return '';
  }

  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return '';
  }

  for (const entry of entries) {
    if (state.readCount >= 200) {
      return '';
    }

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const slug = await findLinearWorkspaceSlugInDocs(entryPath, state);

      if (slug) {
        return slug;
      }

      continue;
    }

    if (!entry.name.endsWith('.md')) {
      continue;
    }

    state.readCount += 1;
    const slug = await readLinearWorkspaceSlug(entryPath);

    if (slug) {
      return slug;
    }
  }

  return '';
}

async function readLinearWorkspaceSlug(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const match = content.match(/https:\/\/linear\.app\/([^/\s)]+)\/issue\//);
    return match?.[1] ?? '';
  } catch {
    return '';
  }
}

function findRepoRoot(start) {
  let current = path.resolve(start);

  while (true) {
    if (path.basename(current) !== '.tmp') {
      const marker = path.join(current, 'AGENTS.md');

      if (existsSync(marker)) {
        return current;
      }
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

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return slug || 'goal';
}

function resolveTemplatePath(root, template) {
  if (!template) {
    return resolveExistingTemplate(root, 'goal');
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
    `could not resolve goal template "${template}". Tried: ${candidates
      .map((candidate) => path.relative(root, candidate))
      .join(', ')}`
  );
}

function resolveExistingTemplate(root, template) {
  return resolveTemplatePath(root, template);
}

function resolvePackPaths(root, packNames) {
  const uniquePackNames = [...new Set(packNames.filter(Boolean))];

  return uniquePackNames.map((packName) => {
    const candidates =
      packName.includes('/') ||
      packName.includes('\\') ||
      packName.endsWith('.md')
        ? [path.resolve(root, packName)]
        : [
            path.join(
              root,
              'docs',
              'plans',
              'templates',
              'packs',
              `${packName}.md`
            ),
            path.join(BUILTIN_TEMPLATES_DIR, 'packs', `${packName}.md`),
          ];
    const found = candidates.find((candidate) => existsSync(candidate));

    if (found) {
      return {
        name: path.basename(packName, '.md'),
        path: found,
      };
    }

    throw new Error(
      `could not resolve goal pack "${packName}". Tried: ${candidates
        .map((candidate) => path.relative(root, candidate))
        .join(', ')}`
    );
  });
}

function insertCompositionMetadata(content, { packs, root, templatePath }) {
  if (PRIMARY_TEMPLATE_SECTION_PATTERN.test(content)) {
    return content;
  }

  const primaryTemplate = path.relative(root, templatePath);
  const appliedPacks =
    packs.length === 0
      ? '- none'
      : packs
          .map((pack) => `- ${pack.name} (${path.relative(root, pack.path)})`)
          .join('\n');
  const metadata = `Primary template:
${primaryTemplate}

Applied packs:
${appliedPacks}`;

  return insertAfterSection(content, 'Template', metadata);
}

function mergePackSections(content, packs) {
  let merged = content;

  for (const sectionName of PACK_SECTION_NAMES) {
    const entries = packs.flatMap((pack) =>
      getPackEntries(pack.content, sectionName)
    );

    if (entries.length > 0) {
      merged = appendSectionEntries(merged, sectionName, entries);
    }
  }

  return merged;
}

function getPackEntries(packContent, sectionName) {
  const block = getSectionBlock(packContent, sectionName);

  if (!block) {
    return [];
  }

  if (sectionName === 'Work Checklist') {
    return getChecklistEntries(block);
  }

  return block.split(NEWLINE_PATTERN).filter((line) => {
    const trimmed = line.trim();

    if (!trimmed.startsWith('|')) {
      return false;
    }

    const cells = getTableCells(trimmed);

    return (
      cells.length > 0 &&
      !isTableSeparatorRow(cells) &&
      !isTableHeaderRow(cells)
    );
  });
}

function getChecklistEntries(block) {
  const lines = block.split(NEWLINE_PATTERN);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.startsWith('- [') && !line.startsWith('- [x]')) {
      continue;
    }

    entries.push(line);

    for (let next = index + 1; next < lines.length; next += 1) {
      const continuation = lines[next];

      if (continuation.startsWith('  ') || continuation.startsWith('      ')) {
        entries.push(continuation);
        index = next;
      } else {
        break;
      }
    }
  }

  return entries;
}

function appendSectionEntries(content, sectionName, entries) {
  const section = findSectionRange(content, sectionName);

  if (!section) {
    return `${content.trimEnd()}

${sectionName}:
${entries.join('\n')}
`;
  }

  const lines = content.split(NEWLINE_PATTERN);
  const before = lines.slice(0, section.end).join('\n').trimEnd();
  const after = lines
    .slice(section.end)
    .join('\n')
    .replace(LEADING_NEWLINES_PATTERN, '');

  return `${before}
${entries.join('\n')}

${after}`;
}

function insertAfterSection(content, sectionName, insertion) {
  const section = findSectionRange(content, sectionName);

  if (!section) {
    return `${content.trimEnd()}

${insertion}
`;
  }

  const lines = content.split(NEWLINE_PATTERN);
  const before = lines.slice(0, section.end).join('\n').trimEnd();
  const after = lines
    .slice(section.end)
    .join('\n')
    .replace(LEADING_NEWLINES_PATTERN, '');

  return `${before}

${insertion}

${after}`;
}

function findSectionRange(content, sectionName) {
  const lines = content.split(NEWLINE_PATTERN);
  const start = lines.findIndex((line) => line.trim() === `${sectionName}:`);

  if (start === -1) {
    return null;
  }

  let end = lines.length;

  for (let index = start + 1; index < lines.length; index += 1) {
    if (isSectionStart(lines[index])) {
      end = index;
      break;
    }
  }

  return { end, start };
}

function getSectionBlock(content, sectionName) {
  const range = findSectionRange(content, sectionName);

  if (!range) {
    return '';
  }

  return content
    .split(NEWLINE_PATTERN)
    .slice(range.start + 1, range.end)
    .join('\n')
    .trim();
}

function isSectionStart(line) {
  return HEADING_PATTERN.test(line) || SECTION_START_PATTERN.test(line.trim());
}

function getTableCells(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function isTableSeparatorRow(cells) {
  return cells.every((cell) =>
    TABLE_MARKDOWN_SEPARATOR_CELL_PATTERN.test(cell)
  );
}

function isTableHeaderRow(cells) {
  return cells.some((cell) => TABLE_GATE_HEADER_PATTERN.test(cell));
}

function parseListValue(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function printHelp() {
  console.log(`Usage:
  node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \\
    --title "Short goal title" \\
    [--slug short-slug] \\
    [--template "skill-name or template path"] \\
    [--with "pack-name"] \\
    [--ticket "4510"] \\
    [--date YYYY-MM-DD] \\
    [--path docs/plans/custom.md] \\
    [--force]

Creates docs/plans/YYYY-MM-DD-<slug>.md, or docs/plans/<ticket>-<slug>.md when --ticket is provided.

This command only creates the static plan shell. Do not pass objective,
threshold, verification, constraints, boundaries, or blocked condition through
the CLI. After creation, edit the generated docs/plans file and fill the
template fields there.

Before creating a plan, missing generic templates are initialized under
docs/plans/templates/. Use --template task to resolve project templates first,
then built-in templates under .agents/skills/autogoal/assets/templates/.
Use --with docs --with browser to materialize pack rows from project packs
first, then built-in packs. Runtime goal plans live under docs/plans/.`);
}
