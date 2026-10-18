#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/page-stop.mjs beacon <plan.md> [--session <id>]
//        node .agents/pstack/page-stop.mjs stop <plan.md> --own <dir> [--no-db] [--session <id>]
// Prints the Artifact and ArtifactData calls a Claude Code session sends, one
// JSON line each after the tool's name, in the order to send them.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAPABILITIES, COLLECTION, MAX_WRITES, asking, handbackOf, slugOf } from './page-live.mjs';
import { blobFacts, contextOf, gitOrNull, mainCheckout, page, pageUrlOf, parsePlan, planParts, stagesOf } from './plan-page.mjs';

const USAGE = 'Usage: node .agents/pstack/page-stop.mjs beacon <plan.md> [--session <id>] | stop <plan.md> --own <dir> [--no-db] [--session <id>]';
const CODEX = 'Nothing to send: outside Claude Code, such as in Codex, a run saves no notes; render the page locally';
const RUNNING = { now: 'working', waiting: 'waiting', blocked: 'blocked' };
// A printed set may never reach the page, so an unmoved stage is sent again once this long has passed.
const HEARTBEAT = 30 * 60_000;

function currentOf(planPath) {
  const stages = stagesOf(planPath);
  const at = stages.find((stage) => RUNNING[stage.state]);
  if (at) return { stage: at.label, state: RUNNING[at.state] };
  return { stage: stages.findLast((stage) => ['done', 'stopped'].includes(stage.state))?.label ?? null, state: 'done' };
}

const versionsAt = (root, revision, rel) =>
  (gitOrNull(root, 'log', '-n', '20', '--format=', '--raw', '--no-abbrev', revision, '--', rel) ?? '')
    .split('\n')
    .map((line) => line.split(/\s+/u)[3])
    .filter((blob) => blob && !/^0+$/u.test(blob));

function gitFacts(root, paths, branch) {
  return new Map(
    [...blobFacts(root, paths)].map(([path, { blob }]) => {
      const rel = relative(root, path);
      const committed = versionsAt(root, 'HEAD', rel);
      const time = committed[0] === blob ? gitOrNull(root, 'log', '-1', '--format=%cI', 'HEAD', '--', rel) : null;
      return [path, { blob, history: [...new Set(committed)].filter((each) => each !== blob), landed: versionsAt(root, `origin/${branch}`, rel).includes(blob), at: time ? new Date(time).toISOString() : null }];
    })
  );
}

function changedSince(root, branch) {
  const base = gitOrNull(root, 'merge-base', 'HEAD', `origin/${branch}`) ?? 'HEAD';
  const names = [...(gitOrNull(root, 'diff', '--name-only', base, '--') ?? '').split('\n'), ...(gitOrNull(root, 'ls-files', '--others', '--exclude-standard') ?? '').split('\n')];
  return new Set(names.filter(Boolean).map((name) => join(root, name)));
}

// An ArtifactData query with out_dir saves only each document's fields, as <dir>/runs/<id>.json, never its version.
const CREATED = 1;

// A query leaves the files an earlier query saved in its directory, so each directory is read once.
function ownDocs(dir) {
  const marker = join(dir, '.read');
  if (existsSync(marker)) throw new Error(`${dir} was read by an earlier stop; query into a new directory`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(marker, '');
  const folder = join(dir, COLLECTION);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => name.endsWith('.json'))
    .map((name) => ({ id: basename(name, '.json'), version: CREATED, data: JSON.parse(readFileSync(join(folder, name), 'utf-8')) }));
}

const call = (tool, payload) => `${tool} ${JSON.stringify(payload)}`;
const runDir = (root, plansDir, slug) => join(mainCheckout(root), relative(root, plansDir), 'artifacts', slug);

// The stage this session last noted for a plan on one page, and since when it holds; due when it moved or a heartbeat passed.
function noted({ root, plansDir }, slug, session, { url, stage, state }, now) {
  const file = join(runDir(root, plansDir, slug), `page-beacon.${session}.json`);
  const last = existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : null;
  const same = last?.url === url && last.stage === stage && last.state === state && typeof last.since === 'string';
  if (same && now - Date.parse(last.at) < HEARTBEAT) return { due: false, since: last.since };
  const since = same ? last.since : now.toISOString();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify({ url, stage, state, since, at: now.toISOString() })}\n`);
  return { due: true, since };
}

function beacon(planPath, session) {
  const context = contextOf(planPath);
  const { root, subjectPath, repoPath, plan } = context;
  const current = currentOf(planPath);
  const slug = slugOf(repoPath);
  const { url } = pageUrlOf(root, subjectPath ?? planPath);
  if (!url) return ['Nothing to send: the page has no Page: line yet; run a stop, which publishes it'];
  const now = new Date();
  const { due, since } = noted(context, slug, session, { url, ...current }, now);
  if (!due) return [`Nothing to send: ${slug} is still at ${current.stage}, ${current.state}`];
  const doc = `${slug}.b.${session.slice(0, 8)}.${now.getTime()}`;
  const data = { kind: 'beacon', v: 1, plan: repoPath, slug, title: plan.title || slug, session, ...current, since, at: now.toISOString() };
  return [call('ArtifactData', { action: 'set', url, collection: COLLECTION, doc_id: doc, data })];
}

function stop(planPath, { own, db, session }) {
  const context = contextOf(planPath);
  const { root, branch, subjectPath, repoPath } = context;
  const now = new Date();
  const at = now.toISOString();
  const facts = new Map();
  const rendered = page(planPath, {
    now,
    session,
    facts: (_, paths) => {
      for (const [path, fact] of gitFacts(root, paths, branch)) facts.set(path, fact);
      return facts;
    },
  });
  const out = join(dirname(planPath), 'artifacts', `${rendered.name}.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, rendered.html);
  const { url } = pageUrlOf(root, subjectPath ?? planPath);
  const target = url ?? '<the url the publish returns>';
  const slug = slugOf(repoPath);
  const reply = `Reply ${target}#run-${slug}`;
  const docs = ownDocs(own).filter((doc) => doc.data.session === session);
  const mine = session.slice(0, 8);
  const current = currentOf(planPath);
  const { since } = noted(context, slug, session, { url: url ?? '', ...current }, now);
  const record = (path, fields) => handbackOf({ plan: relative(root, path), slug: slugOf(path), ...planParts({ path, plan: parsePlan(readFileSync(path, 'utf-8')) }) }, facts.get(path), { session, ...fields });
  const lead = record(planPath, { at, since, ...current });
  const digest = createHash('sha256').update(JSON.stringify({ ...lead, at: null, since: null })).digest('hex').slice(0, 12);
  // Another shown plan this checkout changed, or one that asks, gets a record too, so a checkout that lacks it cannot drop it; a committed copy dates from its commit.
  const changed = changedSince(root, branch);
  const others = [...facts.keys()]
    .filter((path) => path !== planPath)
    .map((path) => ({ path, data: record(path, { at: facts.get(path).at ?? at, ...currentOf(path) }) }))
    .filter(({ path, data }) => changed.has(path) || asking(data))
    .map(({ path, data }) => ({ id: `${slugOf(path)}.h.${mine}.${facts.get(path).blob.slice(0, 12)}`, data }));
  const records = [{ id: `${slug}.s.${mine}.${digest}`, data: { ...lead, stop: digest } }, ...others];
  const ids = new Set(records.map((each) => each.id));
  const plans = new Set(records.map((each) => each.data.plan));
  const creates = records.filter((each) => !docs.some((doc) => doc.id === each.id));
  if (creates.length > MAX_WRITES) throw new Error(`this stop saves ${creates.length} records, more than one batch's ${MAX_WRITES}`);
  const stale = docs.filter((doc) => plans.has(doc.data.plan) && !ids.has(doc.id)).sort((a, b) => String(a.data.at).localeCompare(String(b.data.at)));
  const writes = [
    ...creates.map(({ id, data }) => ({ op: 'set', collection: COLLECTION, doc_id: id, data })),
    ...stale.slice(0, MAX_WRITES - creates.length).map((doc) => ({ op: 'delete', collection: COLLECTION, doc_id: doc.id, if_version: doc.version })),
  ];
  const batch = writes.length ? [call('ArtifactData', { action: 'batch', url: target, writes })] : [];
  // The database takes writes only once a published version declares it.
  if (db && url) return [...batch, call('Artifact', { action: 'publish', url, file_path: out }), reply];
  const publish = call('Artifact', { action: 'publish', ...(url ? { url } : {}), file_path: out, capabilities: CAPABILITIES });
  const after = 'Keep in the publish any other capability the read header names, then send the batch once the publish returns. If the publish is refused, read the page again: when its header now names a database, send only the batch; otherwise publish nothing more and say the hand-back is not on the page';
  return [publish, after, ...batch, reply];
}

export function cli(args, env) {
  const [command, target, ...rest] = args;
  const valueOf = (flag) => (rest.includes(flag) ? (rest[rest.indexOf(flag) + 1] ?? '') : null);
  const own = valueOf('--own');
  const known = ['--session', '--own', '--no-db'];
  const flags = rest.filter((arg, index) => !['--session', '--own'].includes(rest[index - 1]));
  const planPath = target && resolve(target);
  if (!['beacon', 'stop'].includes(command) || !planPath || !existsSync(planPath) || flags.some((arg) => !known.includes(arg)) || (command === 'stop' ? !own : own !== null || flags.includes('--no-db'))) {
    return { code: 2, error: USAGE };
  }
  if (env.CLAUDECODE !== '1') return { code: 0, lines: [CODEX] };
  const session = valueOf('--session') || env.CLAUDE_CODE_SESSION_ID;
  if (!session) return { code: 2, error: 'page-stop needs a session id: pass --session <id>, or run it in Claude Code, which sets CLAUDE_CODE_SESSION_ID' };
  return { code: 0, lines: command === 'beacon' ? beacon(planPath, session) : stop(planPath, { own: resolve(own), db: !flags.includes('--no-db'), session }) };
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
