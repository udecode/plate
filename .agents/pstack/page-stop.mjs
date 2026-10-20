#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/page-stop.mjs stage|stop <plan.md> [--base <file>] [--new] [--session <id>]
// Prints the Artifact publish that adds or updates this run's part of its
// subject page, and the files to read in full before sending it. --base names
// the page as the Artifact tool last returned it, such as the source a refused
// publish saved; without it the helper starts from this checkout's last
// publish. --new makes a new page for a subject whose page no longer opens.

import { copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CODE_VERSION, contextOf, pageFile, pageUrlOf, parsePageFile, runBody, runHeader, slugOf, viewerCode } from './plan-page.mjs';
import { stageOfRow } from './status.mjs';

const USAGE = 'Usage: node .agents/pstack/page-stop.mjs stage|stop <plan.md> [--base <file>] [--new] [--session <id>]';
const CODEX = 'Nothing to send: outside Claude Code, such as in Codex, a run publishes nothing; render the page locally';
const DUE = ['occurrence', 'state', 'status', 'title', 'asks', 'picks'];

const readJson = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null);
const same = (a, b, fields) => fields.every((field) => JSON.stringify(a[field]) === JSON.stringify(b[field]));

// A stage counts from its first row in the decisions log, so a stage the run returns to starts a new occurrence.
function occurrenceOf(planPath, stage) {
  const log = planPath.replace(/\.md$/u, '.decisions.tsv');
  const rows = existsSync(log)
    ? readFileSync(log, 'utf8')
        .split('\n')
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => line.split('\t'))
    : [];
  const phases = rows.map(([, phase]) => phase);
  const stages = phases.map((_, index) => stageOfRow(phases, index));
  let first = stages.findLastIndex((each) => each === stage);
  if (first < 0) return { occurrence: String(stage), since: null };
  for (let index = first - 1; index >= 0 && (stages[index] === stage || stages[index] === undefined); index -= 1) if (stages[index] === stage) first = index;
  const at = Date.parse(rows[first][0]);
  return { occurrence: `${stage}@${rows[first][0]}`, since: Number.isNaN(at) ? null : new Date(at).toISOString() };
}

function baseOf(path) {
  if (!path || !existsSync(path)) return { runs: [], list: [], code: 0, note: null };
  const parsed = parsePageFile(readFileSync(path, 'utf8'));
  if (!parsed.ok) return { runs: [], list: [], code: 0, note: `The base lists no runs (${parsed.reason}); this publish lists only this run until the others publish again` };
  return { runs: parsed.data.runs, list: parsed.list, code: parsed.data.code ?? 0, note: null };
}

function publish(command, planPath, { session, base: baseFile, fresh }) {
  const { root, plansDir, subject, subjectPath, doc } = contextOf(planPath);
  const name = subject ?? slugOf(planPath);
  const out = join(plansDir, 'artifacts', 'pages', name);
  const url = fresh ? null : pageUrlOf(root, subjectPath ?? planPath).url;
  const base = baseOf(fresh ? null : baseFile ? resolve(baseFile) : join(out, 'index.html'));
  const now = new Date().toISOString();
  const header = runHeader(planPath, { session, at: now });
  const previous = readJson(join(out, 'runs', `${header.key}.json`));
  const listed = base.runs.find((entry) => entry.key === header.key);
  // The page shows the previous header only when the base lists the entry that publish wrote.
  const shown = previous && listed && listed.at === previous.at ? previous : null;
  const { occurrence, since } = occurrenceOf(planPath, header.stage);
  header.occurrence = occurrence;
  header.since = since ?? (shown?.occurrence === occurrence ? shown.since : now);
  const highest = Math.max(0, ...base.runs.map((entry) => (Number.isInteger(entry.handback) ? entry.handback : 0)));
  header.handback = command === 'stop' ? highest + 1 : (listed?.handback ?? null);
  if (command === 'stage' && shown && same(header, shown, DUE)) return ['Nothing to send: the page already shows this stage'];

  const entry = { key: header.key, session, plan: header.plan, slug: header.slug, title: header.title, added: listed?.added ?? now, at: now, handback: header.handback, done: header.state === 'done' };
  const stages = Object.fromEntries(base.list.map((item) => [item.slug, item.stage]));
  stages[header.slug] = header.stage ?? header.state;
  const runs = [...base.runs.filter((each) => each.key !== header.key), entry];
  const files = [`runs/${header.key}.json`];
  const write = (path, text) => {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), text);
  };
  write('index.html', pageFile({ title: doc.title || name, subject: name, runs, stages }));
  write(files[0], `${JSON.stringify(header, null, 2)}\n`);
  if (command === 'stop' || !shown || !same(header, shown, ['asks', 'picks'])) {
    const { html, shots } = runBody(planPath, { key: header.key });
    write(`runs/${header.key}.html`, html);
    files.push(`runs/${header.key}.html`);
    for (const shot of shots) {
      mkdirSync(dirname(join(out, shot.path)), { recursive: true });
      copyFileSync(shot.source, join(out, shot.path));
      files.push(shot.path);
    }
  }
  if (base.code < CODE_VERSION) {
    const { version, js, css } = viewerCode();
    write(`code/${version}.js`, js);
    write(`code/${version}.css`, css);
    files.push(`code/${version}.js`, `code/${version}.css`);
  }
  const call = { ...(url ? { url } : { icon: 'plan' }), file_path: join(out, 'index.html'), root: out, files };
  const target = subjectPath ?? planPath;
  return [
    ...(base.note ? [base.note] : []),
    `Read in full, and view each picture, before you send: ${['index.html', ...files].map((path) => join(out, path)).join(' ')}`,
    `Artifact ${JSON.stringify(call)}`,
    url ? null : `This publish makes the page: write its URL as \`Page: <url>\` under the title of ${target}`,
    `If the tool refuses the publish because the page changed, run this command again with --base <the source path the refusal saved> and send what it prints`,
    command === 'stop' ? `Once the publish goes through, reply with 📄 ${url ?? '<url>'}#run-${header.slug}` : null,
  ].filter(Boolean);
}

export function cli(args, env) {
  const [command, target, ...rest] = args;
  const valueOf = (flag) => (rest.includes(flag) ? (rest[rest.indexOf(flag) + 1] ?? '') : null);
  const flags = rest.filter((arg, index) => !['--session', '--base'].includes(rest[index - 1]));
  const planPath = target && resolve(target);
  if (!['stage', 'stop'].includes(command) || !planPath || !existsSync(planPath) || flags.some((arg) => !['--session', '--base', '--new'].includes(arg))) return { code: 2, error: USAGE };
  const base = valueOf('--base');
  if (base !== null && (!base || !existsSync(resolve(base)))) return { code: 2, error: `page-stop: no base file at ${base}` };
  if (env.CLAUDECODE !== '1') return { code: 0, lines: [CODEX] };
  const session = valueOf('--session') || env.CLAUDE_CODE_SESSION_ID;
  if (!session) return { code: 2, error: 'page-stop needs a session id: pass --session <id>, or run it in Claude Code, which sets CLAUDE_CODE_SESSION_ID' };
  return { code: 0, lines: publish(command, planPath, { session, base, fresh: flags.includes('--new') }) };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { code, error, lines } = cli(process.argv.slice(2), process.env);
    if (error) console.error(error);
    if (lines) console.info(lines.join('\n'));
    process.exit(code);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
