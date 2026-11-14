#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const USAGE =
  'usage: sweep-pass.mjs rows --pages [--only <route prefix>] [--base <url>] --out <file> | collect --dir <run dir>';
const BETA = 'https://beta.platejs.org';
const SESSION_BUDGET = 10;
const DEPLOY_LOOKBACK_DAYS = 7;
const ISO_TIME = /^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d+)?)?(Z|[+-]\d\d:\d\d)$/;
const VIDEO = /\.(mp4|webm)$/i;

const isText = (value) => typeof value === 'string' && value.trim() !== '';

const TYPES = {
  flag: [(value) => typeof value === 'boolean', 'true or false'],
  list: [Array.isArray, 'a list'],
  minutes: [
    (value) => Number.isFinite(value) && value > 0,
    'a positive number of minutes',
  ],
  text: [isText, 'a non-empty string'],
  texts: [
    (value) => Array.isArray(value) && value.every(isText),
    'a list of non-empty strings',
  ],
  time: [
    (value) =>
      typeof value === 'string' &&
      ISO_TIME.test(value) &&
      !Number.isNaN(Date.parse(value)),
    'a time such as 2026-11-14T09:30:00Z',
  ],
  url: [
    (value) =>
      isText(value) && /^https?:\/\//.test(value) && URL.canParse(value),
    'an http or https address',
  ],
};

const SHAPES = {
  session: {
    id: 'text',
    kind: 'text',
    url: 'url',
    reference: 'url?',
    budget: 'minutes',
    context: 'texts?',
  },
  recheck: {
    id: 'text',
    kind: 'text',
    url: 'url',
    issue: 'text',
    expect: 'text',
    budget: 'minutes',
    context: 'texts?',
  },
  record: {
    id: 'text',
    result: 'text',
    start: 'time',
    end: 'time',
    steps: 'texts',
    finds: 'list',
    notes: 'texts?',
    dark: 'text?',
    hand: 'texts?',
  },
  find: {
    title: 'text',
    repro: 'texts',
    expected: 'text',
    actual: 'text',
    reference: 'text?',
    cause: 'text?',
    clips: 'texts',
    replayOnly: 'flag?',
  },
};

const NEEDS = {
  'a find': (record) => record.finds.length > 0,
  'no finds': (record) => record.finds.length === 0,
  notes: (record) => record.notes?.length > 0,
};

const RESULTS = {
  session: {
    clean: 'no finds',
    found: 'a find',
    blocked: 'notes',
    untested: 'notes',
  },
  recheck: {
    fixed: null,
    still: 'a find',
    changed: 'a find',
    blocked: 'notes',
    untested: 'notes',
  },
};

function shapeProblems(value, shape, where) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [`${where}: not an object`];
  }
  const fields = SHAPES[shape];
  const problems = Object.keys(value)
    .filter((key) => !Object.hasOwn(fields, key))
    .map((key) => `${where}: unknown field "${key}"`);
  for (const [key, spec] of Object.entries(fields)) {
    const [valid, description] = TYPES[spec.replace('?', '')];
    if (value[key] === undefined) {
      if (!spec.endsWith('?')) problems.push(`${where}: missing "${key}"`);
    } else if (!valid(value[key])) {
      problems.push(`${where}: "${key}" must be ${description}`);
    }
  }
  return problems;
}

function readJson(file, where, problems) {
  let value;
  try {
    value = JSON.parse(readFileSync(file, 'utf-8'));
  } catch (error) {
    problems.push(`${where}: ${error.message}`);
  }
  return value;
}

function readRows(dir, problems) {
  const rows = readJson(path.join(dir, 'rows.json'), 'rows.json', problems);
  if (rows === undefined) return [];
  if (!Array.isArray(rows) || rows.length === 0) {
    problems.push('rows.json: needs a list of one or more rows');
    return [];
  }
  const ids = new Set();
  return rows.filter((row, index) => {
    const where = `rows.json row ${index + 1}`;
    if (!Object.hasOwn(RESULTS, row?.kind)) {
      problems.push(`${where}: "kind" must be session or recheck`);
      return false;
    }
    const found = shapeProblems(row, row.kind, where);
    if (ids.has(row.id)) found.push(`${where}: a second row "${row.id}"`);
    ids.add(row.id);
    problems.push(...found);
    return found.length === 0;
  });
}

function recordProblems(record, kind, dir, where) {
  const problems = [];
  const words = RESULTS[kind];
  if (!Object.hasOwn(words, record.result)) {
    problems.push(
      `${where}: result "${record.result}" is not one of ${Object.keys(words).join(', ')} for a ${kind} row`
    );
  } else {
    const need = words[record.result];
    if (need && !NEEDS[need](record)) {
      problems.push(`${where}: result "${record.result}" needs ${need}`);
    }
  }
  if (Date.parse(record.end) < Date.parse(record.start)) {
    problems.push(
      `${where}: ends at ${record.end}, before it starts at ${record.start}`
    );
  }
  record.finds.forEach((find, index) => {
    const at = `${where} find ${index + 1}`;
    const found = shapeProblems(find, 'find', at);
    if (found.length > 0) {
      problems.push(...found);
      return;
    }
    for (const clip of find.clips) {
      const file = path.resolve(dir, clip);
      if (path.isAbsolute(clip) || path.relative(dir, file).startsWith('..')) {
        problems.push(
          `${at}: clip "${clip}" must be a path inside the run directory, relative to it`
        );
      } else if (!existsSync(file)) {
        problems.push(`${at}: clip "${clip}" does not exist`);
      }
    }
    if (!find.clips.some((clip) => VIDEO.test(clip))) {
      problems.push(`${at}: needs a .webm or .mp4 clip that shows it`);
    }
  });
  return problems;
}

function readRecords(dir, rows, problems) {
  const folder = path.join(dir, 'records');
  const kinds = new Map(rows.map((row) => [row.id, row.kind]));
  const records = new Map();
  const files = existsSync(folder)
    ? readdirSync(folder)
        .filter((file) => file.endsWith('.json'))
        .sort()
    : [];
  const seen = new Map();
  for (const file of files) {
    const where = `records/${file}`;
    const record = readJson(path.join(folder, file), where, problems);
    if (record === undefined) continue;
    const found = shapeProblems(record, 'record', where);
    if (found.length > 0) {
      problems.push(...found);
      continue;
    }
    const kind = kinds.get(record.id);
    if (!kind) {
      problems.push(`${where}: rows.json has no row "${record.id}"`);
    } else if (seen.has(record.id)) {
      problems.push(
        `${where}: a second record for "${record.id}", after ${seen.get(record.id)}`
      );
    } else {
      seen.set(record.id, where);
      problems.push(...recordProblems(record, kind, dir, where));
      records.set(record.id, record);
    }
  }
  for (const row of rows) {
    if (!seen.has(row.id)) problems.push(`no record for row "${row.id}"`);
  }
  return records;
}

function successfulDeploys(since) {
  const from = new Date(since - DEPLOY_LOOKBACK_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const runs = JSON.parse(
    execFileSync(
      'gh',
      [
        'run',
        'list',
        '--repo',
        'udecode/plate',
        '--workflow',
        'Deploy',
        '--created',
        `>=${from}`,
        '--limit',
        '1000',
        '--json',
        'conclusion,databaseId,headSha,updatedAt',
      ],
      { encoding: 'utf-8' }
    )
  );
  const live = runs
    .filter((run) => run.conclusion === 'success')
    .map((run) => ({
      sha: run.headSha,
      run: run.databaseId,
      live: run.updatedAt,
    }))
    .sort((a, b) => Date.parse(a.live) - Date.parse(b.live));
  if (live.length === 0 || Date.parse(live[0].live) > since) {
    throw new Error(
      `no successful Deploy run of udecode/plate finished between ${from} and ${new Date(since).toISOString()}, so the build beta served then is unknown`
    );
  }
  return live;
}

function buildsSeen(live, start, end) {
  const served = live.findLast((deploy) => Date.parse(deploy.live) <= start);
  return [
    served,
    ...live.filter(
      (deploy) =>
        Date.parse(deploy.live) > start && Date.parse(deploy.live) <= end
    ),
  ];
}

function markdown(results) {
  const finds = results.flatMap((row) => row.finds);
  const counts = Object.entries(Object.groupBy(results, (row) => row.result))
    .map(([result, rows]) => `${rows.length} ${result}`)
    .join(', ');
  const lines = [
    '# Sweep pass results',
    '',
    `${results.length} rows: ${counts}. ${finds.length} finds, ${finds.filter((find) => find.replayOnly).length} of them seen only in a replay.`,
  ];
  for (const row of results) {
    lines.push(
      '',
      `## ${row.id}: ${row.result}`,
      '',
      `- Page: ${row.url}`,
      row.kind === 'recheck'
        ? `- Recheck of ${row.issue}: ${row.expect}`
        : `- Reference: ${row.reference ?? 'none, beta only'}`,
      `- Time: ${row.start} to ${row.end}, ${row.spent} min of ${row.budget}`,
      `- Beta builds: ${row.builds.map((build) => `${build.sha.slice(0, 10)} (Deploy ${build.run})`).join(', ')}`,
      `- Steps: ${row.steps.join('; ')}`
    );
    if (row.notes) lines.push(`- Notes: ${row.notes.join('; ')}`);
    if (row.dark) lines.push(`- Dark mode: ${row.dark}`);
    if (row.hand) lines.push(`- Left for a person: ${row.hand.join('; ')}`);
    row.finds.forEach((find, index) => {
      lines.push(
        '',
        `### ${index + 1}. ${find.title}${find.replayOnly ? ' (seen only in a replay; a person confirms it)' : ''}`,
        '',
        ...find.repro.map((step, at) => `${at + 1}. ${step}`),
        '',
        `- Expected: ${find.expected}`,
        `- Actual: ${find.actual}`
      );
      if (find.reference) lines.push(`- Reference page: ${find.reference}`);
      if (find.cause) lines.push(`- Likely cause: ${find.cause}`);
      lines.push(
        `- Clips: ${find.clips.map((clip) => `[${path.basename(clip)}](${clip})`).join(', ')}`
      );
    });
  }
  return `${lines.join('\n')}\n`;
}

function collect(dir) {
  const problems = [];
  const rows = readRows(dir, problems);
  const records = readRecords(dir, rows, problems);
  if (problems.length > 0) return problems;
  const live = successfulDeploys(
    Math.min(...[...records.values()].map((record) => Date.parse(record.start)))
  );
  const results = rows.map((row) => {
    const record = records.get(row.id);
    const start = Date.parse(record.start);
    const end = Date.parse(record.end);
    return {
      ...row,
      ...record,
      spent: Math.ceil((end - start) / 60_000),
      builds: buildsSeen(live, start, end),
    };
  });
  writeFileSync(
    path.join(dir, 'results.json'),
    `${JSON.stringify({ rows: results }, null, 2)}\n`
  );
  writeFileSync(path.join(dir, 'results.md'), markdown(results));
  console.log(
    `${results.length} rows, ${results.flatMap((row) => row.finds).length} finds: ${path.join(dir, 'results.json')} and results.md`
  );
  return [];
}

async function writeRows({ base = BETA, only = '/', out }) {
  const { sessionPages } = await import('./page-health.mjs');
  const pages = await sessionPages(ROOT);
  const rows = pages
    .filter(({ page }) => page.startsWith(only))
    .map(({ note, page, reference }) => ({
      id: page,
      kind: 'session',
      url: `${base}${page}`,
      ...(reference && { reference }),
      budget: SESSION_BUDGET,
      ...(note && { context: [`The reference page is unresolved: ${note}`] }),
    }));
  writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`${rows.length} rows in ${out}`);
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const value = () => {
      index += 1;
      if (argv[index] === undefined) throw new Error(USAGE);
      return argv[index];
    };
    if (arg === '--pages') options.pages = true;
    else if (arg === '--only') options.only = value();
    else if (arg === '--base') options.base = value().replace(/\/$/, '');
    else if (arg === '--out') options.out = path.resolve(value());
    else if (arg === '--dir') options.dir = path.resolve(value());
    else throw new Error(USAGE);
  }
  return options;
}

async function main([command, ...argv]) {
  const options = parseArgs(argv);
  if (command === 'rows' && options.pages && options.out) {
    await writeRows(options);
    return 0;
  }
  if (command === 'collect' && options.dir) {
    const problems = collect(options.dir);
    for (const problem of problems) console.error(problem);
    if (problems.length === 0) return 0;
    console.error(
      `collect: ${problems.length} problems, nothing written. Fix the records and run collect again.`
    );
    return 1;
  }
  throw new Error(USAGE);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error.message);
      process.exitCode = 2;
    }
  );
}
