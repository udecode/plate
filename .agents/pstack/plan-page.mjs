#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/plan-page.mjs <plan.md> [--folded] [--check]
//        node .agents/pstack/plan-page.mjs --index

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { SEATS, SEVERITIES, STATES, reopened, stateOf } from './status.mjs';

const PAGE_HEAD = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
:root {
  --ground: #f6f7f8; --paper: #ffffff; --ink: #1b2026; --muted: #5b6672; --rule: #dde2e7;
  --accent: #2c5b8f; --accent-soft: #e6eef7; --amber: #9a5b00; --amber-soft: #fbf1df; --green: #2f6b3f; --green-soft: #e5f2e8; --red: #a3352b; --red-soft: #f8e6e3; --code: #eef1f4;
  --kw: #8a3f9e; --str: #3d6b21; --fn: #2c5b8f; --num: #a24d12;
  --sans: "Schibsted Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --ground: #121518; --paper: #1a1e23; --ink: #e4e8ec; --muted: #9aa5b1; --rule: #2c333b;
  --accent: #8db6e6; --accent-soft: #1f2d3d; --amber: #f0b45c; --amber-soft: #33270f; --green: #8fcf9f; --green-soft: #18291d; --red: #f0968c; --red-soft: #3a1c19; --code: #232931; --kw: #d7a1e6; --str: #a8d48a; --fn: #8db6e6; --num: #f0a66e; color-scheme: dark;
} }
:root[data-theme="dark"] {
  --ground: #121518; --paper: #1a1e23; --ink: #e4e8ec; --muted: #9aa5b1; --rule: #2c333b;
  --accent: #8db6e6; --accent-soft: #1f2d3d; --amber: #f0b45c; --amber-soft: #33270f; --green: #8fcf9f; --green-soft: #18291d; --red: #f0968c; --red-soft: #3a1c19; --code: #232931; --kw: #d7a1e6; --str: #a8d48a; --fn: #8db6e6; --num: #f0a66e; color-scheme: dark;
}
body { background: var(--ground); color: var(--ink); font: 15px/1.6 var(--sans); padding: 0 16px; }
main { max-width: 760px; margin: 0 auto; padding-block: 32px 64px; display: grid; gap: 28px; }
header { display: grid; gap: 8px; }
h1 { font-size: 1.75rem; line-height: 1.2; margin: 0; text-wrap: balance; font-weight: 700; }
h2 { font-size: 1.15rem; margin: 0 0 8px; text-wrap: balance; }
h3, h4, h5 { font-size: 1rem; margin: 16px 0 4px; }
.meta { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; color: var(--muted); font-size: 0.85rem; }
.pill { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 10px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); }
.pill.done { background: var(--green-soft); color: var(--green); }
.pill.held, .pill.planning { background: var(--amber-soft); color: var(--amber); }
.pill.unknown { background: var(--code); color: var(--muted); }
.panel { background: var(--paper); border: 1px solid var(--rule); border-radius: 10px; padding: 16px 18px; min-width: 0; }
.panel.needs { border: 2px solid var(--amber); display: grid; gap: 14px; }
.panel.needs > h2 { margin: 0; padding-bottom: 8px; border-bottom: 2px solid var(--amber); color: var(--amber); }
.go-strip { display: grid; gap: 8px; padding: 12px 14px; border-radius: 8px; border: 2px solid var(--green); }
.go-strip > strong { color: var(--green); font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; }
.go-strip ol { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.go-chip { display: inline-flex; flex-wrap: wrap; gap: 6px; align-items: baseline; background: var(--green); color: var(--paper); border-radius: 999px; padding: 4px 12px; font-weight: 600; font-size: 0.88rem; overflow-wrap: anywhere; }
.go-chip span { font-weight: 500; }
.go-chip.open { background: var(--amber); }
.panel h2 { display: flex; gap: 10px; align-items: baseline; }
.count { font-size: 0.8rem; color: var(--muted); font-weight: 500; }
.quiet { color: var(--muted); margin: 0; }
.chip { font: 600 0.72rem var(--sans); letter-spacing: 0.04em; text-transform: uppercase; color: var(--amber); background: var(--amber-soft); border-radius: 999px; padding: 2px 8px; }
.how { margin: 0; color: var(--muted); font-size: 0.9rem; }
.how strong { color: var(--ink); }
.ask { display: grid; gap: 12px; min-width: 0; border-left: 4px solid var(--amber); padding-left: 14px; }
.ask + .ask { border-top: 1px solid var(--rule); padding-top: 18px; }
.ask h3 { margin: 0; font-size: 1.05rem; line-height: 1.4; text-wrap: balance; }
.eyebrow { justify-self: start; font: 700 0.72rem var(--sans); letter-spacing: 0.06em; text-transform: uppercase; color: var(--paper); background: var(--accent); border-radius: 999px; padding: 2px 10px; }
.why { margin: 0; color: var(--muted); font-size: 0.92rem; }
.facts { margin: 0; padding-left: 1.2em; display: grid; gap: 2px; }
.opts { display: grid; gap: 8px; }
.opt { border: 1px solid var(--rule); border-radius: 8px; padding: 10px 12px; display: grid; gap: 4px; min-width: 0; }
.opt.picked { border: 2px solid var(--green); }
.opt.picked .opt-head { color: var(--green); }
.opt-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; font-weight: 600; overflow-wrap: anywhere; }
.pick { font: 700 0.68rem var(--sans); letter-spacing: 0.05em; text-transform: uppercase; color: var(--paper); background: var(--green); border-radius: 999px; padding: 1px 8px; }
.kv { display: grid; grid-template-columns: 7.5em minmax(0, 1fr); gap: 2px 10px; margin: 0; font-size: 0.9rem; }
.kv dt { color: var(--accent); font-weight: 600; }
.kv dt.cost { color: var(--amber); }
.kv dd { margin: 0; min-width: 0; }
.go { margin: 0; justify-self: start; font-size: 0.93rem; border: 1px solid var(--green); border-radius: 999px; padding: 4px 12px; }
.go strong { color: var(--green); }
@media (max-width: 520px) { .kv { grid-template-columns: minmax(0, 1fr); } .kv dd + dt { margin-top: 4px; } }
.from { color: var(--muted); font-weight: 400; font-size: 0.85rem; }
.topics { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
.topic { display: grid; gap: 4px; min-width: 0; }
.topic-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; font-weight: 600; }
.topic-lead { margin: 0; color: var(--ink); }
.topic-meta { margin: 0; color: var(--muted); font-size: 0.85rem; font-variant-numeric: tabular-nums; }
button { font: 500 0.85rem var(--sans); color: var(--accent); background: var(--accent-soft); border: 1px solid transparent; border-radius: 8px; padding: 7px 14px; cursor: pointer; }
button:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
section.plan { display: grid; gap: 4px; min-width: 0; }
section.plan + section.plan { border-top: 1px solid var(--rule); padding-top: 20px; }
p { margin: 0 0 10px; max-width: 68ch; }
ul, ol { margin: 0 0 10px; padding-left: 1.4em; }
li { margin: 3px 0; }
li > ul, li > ol { margin: 4px 0; }
code { font: 0.86em var(--mono); background: var(--code); padding: 1px 5px; border-radius: 4px; }
pre { margin: 0; padding: 12px 14px; background: var(--code); border-radius: 8px; }
pre code { padding: 0; background: none; }
.scroll { overflow-x: auto; margin: 0 0 12px; }
table { border-collapse: collapse; font-size: 0.9rem; min-width: 100%; }
th, td { text-align: left; vertical-align: top; padding: 7px 10px; border-bottom: 1px solid var(--rule); }
th { font-weight: 600; color: var(--muted); font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; }
blockquote { margin: 0 0 10px; padding-left: 12px; border-left: 3px solid var(--rule); color: var(--muted); }
a { color: var(--accent); }
.box { display: inline-block; width: 0.85em; height: 0.85em; border: 1.5px solid var(--muted); border-radius: 3px; margin-right: 8px; vertical-align: -0.08em; }
.box.done { background: var(--green); border-color: var(--green); }
.compare { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin: 6px 0 14px; }
.pane { min-width: 0; border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; background: var(--code); }
.pane-head { display: flex; justify-content: space-between; align-items: center; padding: 5px 12px; border-bottom: 1px solid var(--rule); }
.tally { font: 600 0.78rem var(--mono); }
.tally.del, .diff .del .sign { color: var(--red, #a3352b); }
.tally.add, .diff .add .sign { color: var(--green); }
.pane-body { overflow-x: auto; }
.diff { display: grid; min-width: 100%; width: max-content; padding: 6px 0; font: 0.86em/1.6 var(--mono); }
.diff .row { display: grid; grid-template-columns: 4ch 2.5ch 1fr; }
.diff .row code { font: inherit; background: none; padding: 0 14px 0 0; border-radius: 0; white-space: pre; }
.diff .num { color: var(--muted); text-align: right; padding-right: 1ch; opacity: 0.7; user-select: none; }
.diff .sign { text-align: center; user-select: none; }
.diff .del { background: color-mix(in srgb, var(--red, #a3352b) 15%, transparent); }
.diff .add { background: color-mix(in srgb, var(--green) 15%, transparent); }
.diff .filler { display: none; }
.side { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
@media (min-width: 1280px) {
  main > :has(.compare) { --wide: min(1200px, calc(100vw - 64px)); box-sizing: border-box; width: var(--wide); margin-inline: calc((100% - var(--wide)) / 2); }
  main > :has(.compare) > :not(.compare) { margin-inline: calc((var(--wide) - 760px) / 2); }
  .compare { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .diff .filler { display: grid; background: repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--rule) 45%, transparent) 6px 7px); }
}
.details { border-top: 1px solid var(--rule); padding-top: 14px; display: grid; gap: 20px; }
.details > summary { cursor: pointer; color: var(--muted); font-size: 0.9rem; }
.mark { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 1px 7px; border-radius: 999px; white-space: nowrap; }
.mark.added { background: var(--green-soft); color: var(--green); }
.mark.changed { background: var(--amber-soft); color: var(--amber); }
.mark.removed { background: var(--red-soft); color: var(--red); }
.mark.was { color: var(--muted); }
tr.was td, tr.removed td:not(:first-child) { color: var(--muted); text-decoration: line-through; }
tr.was td:first-child { text-decoration: none; }
details.current { margin-top: 6px; }
details.current > summary, details.unchanged > summary { cursor: pointer; color: var(--muted); }
details.unchanged > summary { font-weight: 600; }
details.unchanged[open] > summary { margin-bottom: 8px; }
.iteration { margin: 8px 0; }
details.iteration > summary { cursor: pointer; }
details.iteration[open] > summary { margin-bottom: 6px; }
.hljs-keyword, .hljs-built_in, .hljs-type { color: var(--kw); }
.hljs-string, .hljs-regexp { color: var(--str); }
.hljs-title, .hljs-title.function_, .hljs-title.class_ { color: var(--fn); }
.hljs-number, .hljs-literal { color: var(--num); }
.hljs-attr, .hljs-property, .hljs-params { color: var(--ink); }
.hljs-comment { color: var(--muted); font-style: italic; }
.brief { display: grid; gap: 16px; }
.qa { display: grid; gap: 4px; min-width: 0; }
.qa > h2 { font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin: 0; }
.qa > p:last-of-type { margin-bottom: 0; }
details.fold { border-top: 1px solid var(--rule); padding-top: 10px; }
details.fold > summary { cursor: pointer; color: var(--muted); font-weight: 600; }
details.fold[open] > summary { margin-bottom: 12px; }
</style>`;

// The owner reads the top of the page and rarely opens the details.
const ROLES = [
  [/^brief$/i, 'brief'],
  [/^open questions$/i, 'needs'],
  [/^public api$/i, 'api'],
  [/^main changes$/i, 'main'],
  [/^defaults$/i, 'picked'],
  [/^close$/i, 'close'],
  [/^(scope|steps|evidence|proof|claims|asks|verification|notes)$/i, 'details'],
];
const roleOf = (section, lead) =>
  lead.includes(section.title.toLowerCase())
    ? 'lead'
    : (ROLES.find(([pattern]) => pattern.test(section.title))?.[1] ?? 'idea');

const listOf = (meta, key) => (meta[key] ?? '').split(',').map((entry) => entry.trim()).filter(Boolean);

function pageConfig(root) {
  const path = join(root, '.agents/pstack.json');
  const config = existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : {};
  const legacy = ['pageLead', 'pagePairs'].filter((key) => key in config);
  if (config.pageTopic?.require) legacy.push('pageTopic.require');
  if (legacy.length > 0) {
    throw new Error(
      `.agents/pstack.json still sets ${legacy.join(', ')}; move each list into the frontmatter of the playbook whose plans write those sections, as page-lead, page-pairs or page-require`
    );
  }
  const dir = join(root, '.agents/playbooks');
  const playbooks = existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => name.endsWith('.md'))
        .sort()
        .map((name) => {
          const { meta } = parsePlan(readFileSync(join(dir, name), 'utf-8'));
          return {
            name: basename(name, '.md'),
            lead: listOf(meta, 'page-lead'),
            pairs: listOf(meta, 'page-pairs'),
            require: listOf(meta, 'page-require'),
          };
        })
    : [];
  return { playbooks, plans: config.plans ?? 'docs/plans', topic: config.pageTopic ?? {} };
}

function pageSections(playbooks, name, where) {
  const named = name ? playbooks.find((entry) => entry.name === name) : null;
  if (name && !named) throw new Error(`${where} names playbook ${name}, but .agents/playbooks/${name}.md does not exist`);
  const union = (key, list) => [...new Set(list.flatMap((entry) => entry[key]))];
  const lower = (list) => list.map((title) => title.toLowerCase());
  return {
    lead: lower(union('lead', named ? [named, ...playbooks.filter((entry) => entry !== named)] : playbooks)),
    pairs: ['public api', ...lower(union('pairs', playbooks))],
    require: named ? named.require : union('require', playbooks),
  };
}

function subjectOf(plan, topic) {
  if (plan.fields.topic) return plan.fields.topic;
  return topic.field ? (plan.lists[topic.field.toLowerCase()]?.[0] ?? null) : null;
}

// Newest first by the date a plan's name starts with; a name without one sorts as the oldest.
// Two iterations from one date order by their logs' latest rows, so the one closed last leads the page whichever plan renders it.
const latestLogStamp = (path) => {
  const log = path.replace(/\.md$/u, '.decisions.tsv');
  const stamp = existsSync(log) ? readFileSync(log, 'utf-8').trim().split('\n').at(-1).split('\t')[0] : '';
  return /^\d{4}-/u.test(stamp) ? stamp : '';
};
const planOrder = (path) => `${basename(path).match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '0000-00-00'} ${latestLogStamp(path)} ${basename(path)}`;

function iterationsOf(plansDir, subject, topic) {
  return readdirSync(plansDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ path: join(plansDir, name), plan: parsePlan(readFileSync(join(plansDir, name), 'utf-8')) }))
    .filter(({ plan }) => subjectOf(plan, topic) === subject)
    .sort((a, b) => planOrder(b.path).localeCompare(planOrder(a.path)));
}

function fencePairs(lines) {
  const pairs = [];
  const unpaired = [];
  let index = 0;
  while (index < lines.length) {
    if (!isFence(lines[index])) {
      index += 1;
      continue;
    }
    const pair = readFencePair(lines, index);
    index = pair.next;
    if (pair.after) pairs.push(pair);
    else if (pair.first.tag) unpaired.push(pair.first);
  }
  return { pairs, unpaired };
}

function assertPairs(sections, paired, where) {
  for (const section of sections.filter((entry) => paired.includes(entry.title.toLowerCase()))) {
    const { pairs, unpaired } = fencePairs(section.lines);
    if (pairs.length === 0 || unpaired.length > 0) {
      throw new Error(
        `${where}: ${section.title} needs each before fence followed directly by its after fence, at least once; remove the section when nothing in it changes`
      );
    }
  }
}

function assertNoPairs(sections, paired, where) {
  for (const section of sections.filter((entry) => paired.includes(entry.title.toLowerCase()))) {
    if (fencesOf(section.lines).some((fence) => fence.tag)) {
      throw new Error(
        `${section.title} in ${where} holds the current state as plain fences; put each before and after pair in the plan that changes it`
      );
    }
  }
}

const DELTA = ['added', 'changed', 'removed'];
const sameText = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();
const sameRow = (a, b) => a.length === b.length && a.every((cell, index) => sameText(cell) === sameText(b[index]));
const sameContent = (text) => text.replace(/\s+/g, ' ').trim();
const sameCells = (a, b) => a.length === b.length && a.every((cell, index) => sameContent(cell) === sameContent(b[index]));
const sectionNamed = (doc, title) =>
  doc.sections.find((section) => section.title.toLowerCase() === title.toLowerCase());

function fencesOf(lines) {
  const fences = [];
  for (let index = 0; index < lines.length; ) {
    if (!isFence(lines[index])) {
      index += 1;
      continue;
    }
    const fence = readFence(lines, index);
    fences.push(fence);
    index = fence.next;
  }
  return fences;
}

function tablesOf(lines) {
  const tables = [];
  for (let index = 0; index < lines.length; ) {
    if (isFence(lines[index])) {
      index = readFence(lines, index).next;
      continue;
    }
    if (!/^\s*\|/.test(lines[index]) || !TABLE_RULE.test(lines[index + 1] ?? '')) {
      index += 1;
      continue;
    }
    const head = splitRow(lines[index]);
    const rows = [];
    for (index += 2; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) {
      rows.push(splitRow(lines[index]));
    }
    tables.push({ head, rows });
  }
  return tables;
}

function rowsByKey(lines, head) {
  const rows = new Map();
  for (const table of tablesOf(lines).filter((entry) => sameRow(entry.head, head))) {
    for (const row of table.rows) rows.set(sameText(row[0] ?? ''), row);
  }
  return rows;
}

const isDelta = (head) => sameText(head[0]) === 'delta';

const codeLines = (body) => body.split('\n').map((line) => line.trim()).filter((line) => /[A-Za-z0-9]/.test(line));
const blockLines = (body) => body.split('\n').map((line) => line.trimEnd()).filter((line) => line.trim());
const sameBlock = (a, b) => a.length === b.length && a.every((line, index) => line === b[index]);
const holds = (lines, block) => block.length > 0 && lines.some((_, start) => block.every((line, offset) => lines[start + offset] === line));

const deltaKeys = (source) =>
  source.sections.flatMap((section) =>
    tablesOf(section.lines)
      .filter((table) => isDelta(table.head))
      .flatMap((table) => table.rows.map((row) => `${sameText(section.title)}\n${sameText(row[1] ?? '')}`))
  );

// A later iteration may rewrite a call this plan folded, so a line another iteration's before fence holds is not checked.
function assertFolded(plan, doc, { isChange, others, paired, where }) {
  const fail = (what) => {
    throw new Error(`${where} ${what}; fold the plan's delta into it before its Status says executed`);
  };
  const touched = new Set(others.flatMap(deltaKeys));
  for (const section of plan.sections.filter(isChange)) {
    const current = sectionNamed(doc, section.title);
    const keys = new Set(current ? tablesOf(current.lines).flatMap((table) => table.rows.map((row) => sameText(row[0] ?? ''))) : []);
    for (const table of tablesOf(section.lines).filter((entry) => isDelta(entry.head))) {
      const shown = current ? rowsByKey(current.lines, table.head.slice(1)) : new Map();
      for (const [cell, ...row] of table.rows) {
        const key = sameText(row[0] ?? '');
        if (touched.has(`${sameText(section.title)}\n${key}`)) continue;
        const mark = sameText(cell);
        if (mark === 'removed' && keys.has(key)) fail(`still shows the removed row "${row[0]}" of ## ${section.title}`);
        if (mark !== 'removed' && !sameCells(shown.get(key) ?? [], row)) fail(`does not show the ${mark} row "${row[0]}" of ## ${section.title}`);
      }
    }
  }
  for (const section of plan.sections.filter((entry) => paired.includes(entry.title.toLowerCase()))) {
    const linesOf = (sources, side, read = codeLines) =>
      new Set(
        sources.flatMap((source) => {
          const match = sectionNamed(source, section.title);
          return match ? fencePairs(match.lines).pairs.flatMap((pair) => read(pair[side].body)) : [];
        })
      );
    const rewritten = linesOf(others, 'first');
    const kept = linesOf([plan, ...others], 'after');
    const current = sectionNamed(doc, section.title);
    const shown = new Set(current ? fencesOf(current.lines).flatMap((fence) => codeLines(fence.body)) : []);
    const blocks = current ? fencesOf(current.lines).map((fence) => blockLines(fence.body)) : [];
    const rewrittenExact = linesOf(others, 'first', blockLines);
    for (const { first, after } of fencePairs(section.lines).pairs) {
      const missing = codeLines(after.body).find((line) => !rewritten.has(line) && !shown.has(line));
      if (missing) fail(`does not show the after line "${missing.slice(0, 60)}" in ## ${section.title}`);
      const stale = codeLines(first.body).find((line) => !kept.has(line) && shown.has(line));
      if (stale) fail(`still shows the before line "${stale.slice(0, 60)}" in ## ${section.title}`);
      const next = blockLines(after.body);
      if (next.length > 0 && !next.some((line) => rewrittenExact.has(line)) && !blocks.some((lines) => holds(lines, next))) {
        fail(`does not show the after block of a ## ${section.title} pair in order`);
      }
    }
  }
}

// Lines and rows another iteration also changes may match by coincidence, so only this plan's own delta is checked.
function assertUnfolded(plan, doc, { name, others, paired, where }) {
  const fail = (what, hint = '') => {
    throw new Error(
      `${where} ${what} from ${name}, which is still open. Keep the subject at its state before the plan until execution ends${hint}, or start the plan's Status with "reopened" when it reopened after its fold`
    );
  };
  const touched = new Set(others.flatMap(deltaKeys));
  for (const section of plan.sections) {
    const current = sectionNamed(doc, section.title)?.lines ?? [];
    const keys = new Set(tablesOf(current).flatMap((table) => table.rows.map((row) => sameText(row[0] ?? ''))));
    for (const table of tablesOf(section.lines).filter((entry) => isDelta(entry.head))) {
      const shown = rowsByKey(current, table.head.slice(1));
      for (const [cell, ...row] of table.rows) {
        const key = sameText(row[0] ?? '');
        const mark = sameText(cell);
        if (!DELTA.includes(mark) || touched.has(`${sameText(section.title)}\n${key}`)) continue;
        if (mark === 'removed' && !keys.has(key)) fail(`has no row "${row[0]}" in ## ${section.title} for the removed row`, '; when the key is mistyped, fix it');
        if (mark !== 'removed' && shown.has(key) && sameCells(shown.get(key), row)) fail(`already shows the ${mark} row "${row[0]}" of ## ${section.title}`);
      }
    }
  }
  for (const section of plan.sections.filter((entry) => paired.includes(entry.title.toLowerCase()))) {
    const fences = (source) => fencesOf(sectionNamed(source, section.title)?.lines ?? []).map((fence) => blockLines(fence.body));
    const shown = fences(doc);
    const held = new Set(others.flatMap(fences).flat());
    for (const { first, after } of fencePairs(section.lines).pairs) {
      const before = blockLines(first.body);
      const next = blockLines(after.body);
      // A deleted call proves nothing: the subject may never have listed it.
      if (next.length === 0 || sameBlock(before, next)) continue;
      const changed = [...next.filter((line) => !before.includes(line)), ...before.filter((line) => !next.includes(line))];
      if (changed.length > 0 && changed.every((line) => held.has(line))) continue;
      const beforeShown = before.length > 0 && !holds(next, before) && shown.some((lines) => holds(lines, before));
      if (shown.some((lines) => holds(lines, next)) && !beforeShown) {
        fail(`already shows the after side of a ## ${section.title} pair`, '; when the before call is a current call site the subject does not list, add it to the subject');
      }
    }
  }
}

const DEFAULTS_HEAD = ['decision', 'pick', 'alternative', 'word'];
const headCell = (cell) => sameText(cell.replace(/[*_`]/g, ''));

function assertDefaults(plan, where) {
  const section = sectionNamed(plan, 'Defaults');
  if (!section?.lines.some((line) => line.trim())) return;
  if (!tablesOf(section.lines).some((table) => DEFAULTS_HEAD.every((cell, index) => headCell(table.head[index] ?? '') === cell))) {
    throw new Error(`## Defaults in ${where} needs a table whose columns start with Decision, Pick, Alternative and Word, one row per call made for the owner`);
  }
}

const BRIEF = ['What did you find?', 'What will change?', 'What do you need from me?', 'What happens if I say go?', 'What could go wrong?'];
const BRIEF_WORDS = 40;

function briefOf(plan) {
  const section = sectionNamed(plan, 'Brief');
  if (!section) return null;
  const answers = [];
  for (const line of section.lines) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading) answers.push({ question: heading[1].trim(), lines: [] });
    else answers.at(-1)?.lines.push(line);
  }
  return answers;
}

function assertBrief(plan, where) {
  const shape = `a ## Brief with these ### questions in order, each answered in at most ${BRIEF_WORDS} words: ${BRIEF.join(' ')}`;
  const answers = briefOf(plan);
  if (!answers) throw new Error(`${where} leads its page while open, so it needs ${shape}`);
  const asked = answers.map((answer) => answer.question);
  if (asked.length !== BRIEF.length || asked.some((question, index) => sameText(question) !== sameText(BRIEF[index]))) {
    throw new Error(`## Brief in ${where} asks ${asked.join(' ') || 'nothing'}, but it needs ${shape}`);
  }
  for (const { question, lines } of answers) {
    const words = lines.join(' ').split(/\s+/).filter(Boolean).length;
    if (words === 0) throw new Error(`## Brief in ${where} leaves "${question}" unanswered`);
    if (words > BRIEF_WORDS) throw new Error(`## Brief in ${where} answers "${question}" in ${words} words; keep each answer to ${BRIEF_WORDS}`);
  }
}

const escapeHtml = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

function inline(text) {
  const codes = [];
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, (_, code) => `\uE000${codes.push(code) - 1}\uE000`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) =>
      /^https?:\/\//.test(href) ? `<a href="${href}">${label}</a>` : label
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(
      /\uE000(\d+)\uE000/g,
      (_, index) => `<code>${codes[index]}</code>`
    );
}

function parseFence(line) {
  const match = line.match(/^\s*(```|~~~)(.*)$/);
  if (!match || (match[1] === '```' && match[2].includes('`'))) return null;
  const words = match[2].trim().split(/\s+/).filter(Boolean);
  const tag = ['before', 'after'].includes(words.at(-1)) ? words.pop() : undefined;
  return { marker: match[1], lang: words[0] ?? '', tag };
}
const isFence = (line) => parseFence(line) !== null;

function readFence(lines, start) {
  const { marker, lang, tag } = parseFence(lines[start]);
  const body = [];
  let index = start + 1;
  for (
    ;
    index < lines.length && !lines[index].trim().startsWith(marker);
    index += 1
  ) {
    body.push(lines[index]);
  }
  return { lang, tag, body: body.join('\n'), next: index + 1 };
}

function readFencePair(lines, start) {
  const first = readFence(lines, start);
  let index = first.next;
  while (index < lines.length && !lines[index].trim()) index += 1;
  const second =
    first.tag === 'before' && isFence(lines[index] ?? '')
      ? readFence(lines, index)
      : null;
  return second?.tag === 'after'
    ? { first, after: second, next: second.next }
    : { first, after: null, next: first.next };
}

const codeHtml = ({ lang, body }) =>
  `<div class="scroll"><pre><code${lang ? ` class="language-${lang}"` : ''}>${escapeHtml(body)}</code></pre></div>`;

function lineDiff(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const common = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      common[i][j] = a[i] === b[j] ? common[i + 1][j + 1] + 1 : Math.max(common[i + 1][j], common[i][j + 1]);
    }
  }
  const rows = [];
  let removed = [];
  let added = [];
  const flush = () => {
    for (let k = 0; k < Math.max(removed.length, added.length); k += 1) {
      rows.push([removed[k] ?? null, added[k] ?? null]);
    }
    removed = [];
    added = [];
  };
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      flush();
      rows.push([{ kind: 'same', n: i + 1, text: a[i] }, { kind: 'same', n: j + 1, text: b[j] }]);
      i += 1;
      j += 1;
    } else if (j < b.length && (i === a.length || common[i][j + 1] >= common[i + 1][j])) {
      added.push({ kind: 'add', n: j + 1, text: b[j] });
      j += 1;
    } else {
      removed.push({ kind: 'del', n: i + 1, text: a[i] });
      i += 1;
    }
  }
  flush();
  return rows;
}

function diffHtml(before, after) {
  const rows = lineDiff(before.body, after.body);
  const lang = after.lang || before.lang;
  const line = (cell, sign) =>
    cell
      ? `<div class="row ${cell.kind}"><span class="num">${cell.n}</span><span class="sign">${cell.kind === 'same' ? '' : sign}</span><code${lang ? ` class="language-${lang}"` : ''}>${escapeHtml(cell.text) || ' '}</code></div>`
      : '<div class="row filler"><span class="num"></span><span class="sign"></span><code> </code></div>';
  const pane = (index, label, sign, kind) =>
    `<div class="pane"><div class="pane-head"><span class="side">${label}</span><span class="tally ${kind}">${sign}${rows.filter((row) => row[index]?.kind === kind).length}</span></div><div class="pane-body"><div class="diff">${rows.map((row) => line(row[index], sign)).join('')}</div></div></div>`;
  return `<div class="compare">${pane(0, 'Before', '\u2212', 'del')}${pane(1, 'After', '+', 'add')}</div>`;
}

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

function splitRow(row) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

const tds = (row) => row.map((cell) => `<td>${inline(cell)}</td>`).join('');
const markedRow = (mark, row) => `<tr class="${mark}"><td><span class="mark ${mark}">${mark}</span></td>${tds(row)}</tr>`;

function deltaRow([cell, ...row], prior, marks) {
  const mark = sameText(cell);
  const of = marks.name ? ` of ${marks.name}` : '';
  if (!DELTA.includes(mark)) {
    throw new Error(`A Delta cell in ## ${marks.title}${of} is added, changed or removed, not "${cell}"`);
  }
  const old = prior.get(sameText(row[0] ?? ''));
  const folded = old ? sameCells(old, row) : mark === 'removed';
  if (!folded && (mark === 'added') === Boolean(old)) {
    throw new Error(
      `## ${marks.title}${of} marks "${row[0]}" ${mark}, but ${marks.where} ${old ? 'already has that row' : 'has no such row'}`
    );
  }
  return { mark, old, folded, row };
}

function assertDelta(plan, doc, { name, where }) {
  for (const section of plan.sections) {
    const current = sectionNamed(doc, section.title)?.lines ?? [];
    for (const table of tablesOf(section.lines).filter((entry) => isDelta(entry.head))) {
      const prior = rowsByKey(current, table.head.slice(1));
      for (const row of table.rows) deltaRow(row, prior, { name, title: section.title, where });
    }
  }
}

function deltaRowHtml(cells, prior, marks) {
  const { mark, old, folded, row } = deltaRow(cells, prior, marks);
  if (mark === 'removed') return markedRow(mark, old ?? row);
  return markedRow(mark, row) + (old && !folded ? markedRow('was', old) : '');
}

function tableHtml(head, rows, marks) {
  const prior = marks && isDelta(head) ? rowsByKey(marks.current?.lines ?? [], head.slice(1)) : null;
  const body = rows
    .map((row) => (prior ? deltaRowHtml(row, prior, marks) : `<tr>${tds(row)}</tr>`))
    .join('');
  return `<div class="scroll"><table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function itemHtml(text) {
  const task = text.match(/^(?:[-*+]\s+)?\[( |x|X)\]\s+([\s\S]*)$/);
  if (!task) return inline(text);
  const done = task[1] !== ' ';
  return `<span class="box${done ? ' done' : ''}" aria-label="${done ? 'done' : 'open'}"></span>${inline(task[2])}`;
}

function listHtml(items, start) {
  const { indent, ordered } = items[start];
  let html = '';
  let index = start;
  while (index < items.length && items[index].indent >= indent) {
    let body = itemHtml(items[index].text);
    index += 1;
    if (index < items.length && items[index].indent > indent) {
      const nested = listHtml(items, index);
      body += nested.html;
      index = nested.next;
    }
    html += `<li>${body}</li>`;
  }
  return {
    html: ordered ? `<ol>${html}</ol>` : `<ul>${html}</ul>`,
    next: index,
  };
}

function blocksHtml(lines, marks = null) {
  const html = [];
  let index = 0;
  const startsBlock = (line) =>
    isFence(line) ||
    /^#{1,6}\s/.test(line) ||
    LIST_ITEM.test(line) ||
    /^\s*>/.test(line) ||
    /^\s*\|/.test(line);
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (isFence(line)) {
      const pair = readFencePair(lines, index);
      index = pair.next;
      html.push(
        pair.after
          ? diffHtml(pair.first, pair.after)
          : codeHtml(pair.first)
      );
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.max(3, Math.min(heading[1].length + 1, 5));
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }
    if (/^\s*\|/.test(line) && TABLE_RULE.test(lines[index + 1] ?? '')) {
      const head = splitRow(line);
      const rows = [];
      for (
        index += 2;
        index < lines.length && /^\s*\|/.test(lines[index]);
        index += 1
      ) {
        rows.push(splitRow(lines[index]));
      }
      html.push(tableHtml(head, rows, marks));
      continue;
    }
    if (LIST_ITEM.test(line)) {
      const items = [];
      while (index < lines.length) {
        const current = lines[index];
        const item = current.match(LIST_ITEM);
        if (item) {
          items.push({
            indent: item[1].length,
            ordered: /\d/.test(item[2]),
            text: item[3],
          });
        } else if (
          current.trim() &&
          (/^\s/.test(current) || !startsBlock(current))
        ) {
          items.at(-1).text += ` ${current.trim()}`;
        } else if (
          !current.trim() &&
          /^\s+\S|^\s*([-*+]|\d+[.)])\s/.test(lines[index + 1] ?? '')
        ) {
          // A blank line between items keeps the list going.
        } else {
          break;
        }
        index += 1;
      }
      html.push(listHtml(items, 0).html);
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote = [];
      for (; index < lines.length && /^\s*>/.test(lines[index]); index += 1) {
        quote.push(lines[index].replace(/^\s*>\s?/, ''));
      }
      html.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }
    const paragraph = [line.trim()];
    for (
      index += 1;
      index < lines.length && lines[index].trim() && !startsBlock(lines[index]);
      index += 1
    ) {
      paragraph.push(lines[index].trim());
    }
    html.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return html.join('\n');
}

const OPTION = /^\s*[-*+]\s+\*\*(.+?)\*\*(\s*\(recommended\))?\s*(?::\s*(.*))?$/i;
const ASK_FIELDS = [
  ['why', /^why it needs you:\s*/i],
  ['reason', /^why i pick it:\s*/i],
  ['go', /^if you say go:\s*/i],
];

const splitCost = (text) => {
  const at = text.search(/\bCost:\s*/);
  return at < 0 ? [text.trim(), ''] : [text.slice(0, at).trim(), text.slice(at).replace(/^Cost:\s*/, '').trim()];
};

function questionGroups(lines, older = []) {
  const intro = [];
  const groups = [];
  for (const line of lines) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading) groups.push({ header: heading[1].trim(), lines: [], from: null });
    else (groups.at(-1)?.lines ?? intro).push(line);
  }
  for (const { lines: olderLines, from } of older) {
    let own = null;
    for (const line of olderLines) {
      const heading = line.match(/^###\s+(.*)$/);
      if (heading) groups.push((own = { header: heading[1].trim(), lines: [], from }));
      else own?.lines.push(line);
    }
  }
  return { intro, groups };
}

function askOf({ header, lines, from }) {
  const ask = { header, from, lines, question: [], why: '', facts: [], options: [], reason: '', go: '', rest: [] };
  let last = null;
  for (const line of lines) {
    const text = line.trim();
    if (!text) {
      last = null;
      continue;
    }
    const field = ASK_FIELDS.find(([, pattern]) => pattern.test(text));
    const option = line.match(OPTION);
    if (field) {
      ask[field[0]] = text.replace(field[1], '');
      last = field[0];
    } else if (option) {
      const [does, cost] = splitCost((option[3] ?? '').replace(/\s*\(recommended\)$/i, ''));
      last = { label: option[1].trim(), recommended: Boolean(option[2]) || /\(recommended\)$/i.test(option[3] ?? ''), does, cost };
      ask.options.push(last);
    } else if (last && /^\s+\S/.test(line)) {
      if (last === 'fact') ask.facts[ask.facts.length - 1] += ` ${text}`;
      else if (typeof last === 'string') ask[last] += ` ${text}`;
      else [last.does, last.cost] = splitCost(`${last.does}${last.cost ? ` Cost: ${last.cost}` : ''} ${text}`);
    } else if (/^[-*+]\s/.test(text) && ask.options.length === 0) {
      ask.facts.push(text.replace(/^[-*+]\s+/, ''));
      last = 'fact';
    } else if (ask.options.length === 0 && !ask.why && ask.facts.length === 0) {
      ask.question.push(text);
    } else {
      ask.rest.push(line);
      last = null;
    }
  }
  return ask;
}

function missingParts(ask) {
  const picks = ask.options.filter((option) => option.recommended).length;
  return [
    !ask.question.join(' ').trim().endsWith('?') && 'a question line ending in ?',
    !ask.why && 'Why it needs you:',
    ask.options.length < 2 && 'two or more options',
    ask.options.some((option) => !option.cost) && 'a Cost: on every option',
    picks > 1 && 'at most one (recommended) option',
    picks === 1 && !ask.reason && 'Why I pick it:',
    !ask.go && 'If you say go:',
  ].filter(Boolean);
}

function assertAsks(plan, where) {
  const section = sectionNamed(plan, 'Open questions');
  if (!section) return;
  for (const group of questionGroups(section.lines).groups) {
    const missing = missingParts(askOf(group));
    if (missing.length === 0) continue;
    const list = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing.at(-1)}` : missing[0];
    throw new Error(`"${group.header}" in ${where} needs ${list}; write it as the decision memo in the plan-page skill's references/shape.md`);
  }
}

function askHtml(ask, index, count) {
  const eyebrow = `<span class="eyebrow">Decision ${index + 1} of ${count}: ${inline(ask.header)}</span>`;
  if (ask.options.length === 0) return `<article class="ask">${eyebrow}${blocksHtml(ask.lines)}${ask.from ? `<p class="from">from ${inline(ask.from)}</p>` : ''}</article>`;
  const ordered = [...ask.options.filter((option) => option.recommended), ...ask.options.filter((option) => !option.recommended)];
  const options = ordered
    .map((option) => {
      const rows = [
        option.does && `<dt>What happens</dt><dd>${inline(option.does)}</dd>`,
        option.cost && `<dt class="cost">Cost</dt><dd>${inline(option.cost)}</dd>`,
        option.recommended && ask.reason && `<dt>Why I pick it</dt><dd>${inline(ask.reason)}</dd>`,
      ].filter(Boolean);
      return `<div class="opt${option.recommended ? ' picked' : ''}"><div class="opt-head">${inline(option.label)}${option.recommended ? '<span class="pick">My pick</span>' : ''}</div>${rows.length ? `<dl class="kv">${rows.join('')}</dl>` : ''}</div>`;
    })
    .join('');
  return `<article class="ask">${eyebrow}<h3>${inline(ask.question.join(' '))}${ask.from ? ` <span class="from">from ${inline(ask.from)}</span>` : ''}</h3>${ask.why ? `<p class="why">${inline(ask.why)}</p>` : ''}${ask.facts.length ? `<ul class="facts">${ask.facts.map((fact) => `<li>${inline(fact)}</li>`).join('')}</ul>` : ''}${options ? `<div class="opts">${options}</div>` : ''}${blocksHtml(ask.rest)}${ask.go ? `<p class="go"><strong>If you say go:</strong> ${inline(ask.go)}</p>` : ''}</article>`;
}

function needsSection(lines, older = []) {
  const { intro, groups } = questionGroups(lines, older);
  if (groups.length === 0) return `<section class="panel needs"><h2>Needs you</h2>${blocksHtml([...lines, ...older.flatMap((source) => source.lines)])}</section>`;
  const asks = groups.map(askOf);
  const picks = asks.some((ask) => ask.options.some((option) => option.recommended));
  const how = `<p class="how">Answer in your own words.${picks ? ' <strong>go</strong> takes my pick on every decision that has one.' : ''}</p>`;
  const chips = asks.map((ask, index) => {
    const pick = ask.options.find((option) => option.recommended);
    return `<li class="go-chip${pick ? '' : ' open'}"><span>${index + 1}. ${inline(ask.header)}</span>${pick ? inline(pick.label) : 'needs your answer'}</li>`;
  });
  const strip = `<div class="go-strip"><strong>Say go and I will</strong><ol>${chips.join('')}</ol></div>`;
  return `<section class="panel needs"><h2>Needs you <span class="count">${asks.length} ${asks.length === 1 ? 'decision' : 'decisions'}</span></h2>${strip}${how}${blocksHtml(intro)}${asks.map((ask, index) => askHtml(ask, index, asks.length)).join('')}</section>`;
}

function parsePlan(source) {
  const meta = {};
  const fields = {};
  const lists = {};
  let lines = source.split('\n');
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    let key = null;
    for (const line of lines.slice(1, end)) {
      const pair = line.match(/^([\w-]+):\s*(.*)$/);
      const item = line.match(/^\s+-\s+(.*)$/);
      if (pair) {
        key = pair[1].toLowerCase();
        meta[key] = pair[2].replace(/^["']|["']$/g, '');
        const inline = pair[2].match(/^\[(.*)\]$/);
        lists[key] = inline ? inline[1].split(',').map((entry) => entry.trim()).filter(Boolean) : [];
      } else if (item && key) {
        lists[key].push(item[1].trim());
      }
    }
    lines = lines.slice(end + 1);
  }
  let title = '';
  const lead = [];
  const sections = [];
  for (const line of lines) {
    const field = line.match(/^(Status|Page|Topic|Playbook):\s*(.*)$/);
    if (field && sections.length === 0) {
      meta[field[1].toLowerCase()] = field[2].trim();
      fields[field[1].toLowerCase()] = field[2].trim();
      continue;
    }
    if (!title && /^#\s+/.test(line)) {
      title = line.replace(/^#\s+/, '').trim();
      continue;
    }
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) sections.push({ title: heading[1].trim(), lines: [] });
    else (sections.at(-1)?.lines ?? lead).push(line);
  }
  return { meta, fields, lists, title, lead, sections };
}

const severity = (row) => {
  const rank = SEVERITIES.indexOf(row.decision.split(/\s/u)[0]);
  return rank < 0 ? SEVERITIES.length : rank;
};

function reviewRows(planPath) {
  const log = planPath.replace(/\.md$/, '.decisions.tsv');
  if (!existsSync(log)) return [];
  let round = 0;
  return readFileSync(log, 'utf-8')
    .split('\n')
    .slice(1)
    .map((row) => row.split('\t'))
    .flatMap(([, phase = '', decision = '', , , result = '']) => {
      if (phase === 'panel') {
        if (SEATS.test(decision)) round += 1;
        return [{ kind: 'panel', round, decision, result }];
      }
      return /^review/iu.test(phase) ? [{ kind: 'hand-off', decision, result }] : [];
    });
}

function reviewRounds(rows) {
  const rounds = Map.groupBy(rows, (row) => (row.kind === 'panel' ? row.round : row.kind));
  return [...rounds.values()].map((list) => ({
    kind: list[0].kind,
    round: list[0].round,
    seats: list.find((row) => SEATS.test(row.decision))?.decision.replace(SEATS, '') ?? '',
    findings: list.filter((row) => !SEATS.test(row.decision)).sort((a, b) => severity(a) - severity(b)),
  }));
}

const finished = (status) => stateOf(status) === 'done';

const statusTone = (status) => stateOf(status) ?? 'unknown';

function page(planPath, { folded = false } = {}) {
  const plan = parsePlan(readFileSync(planPath, 'utf-8'));
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: dirname(planPath),
    encoding: 'utf-8',
  }).trim();
  const repoPath = relative(root, planPath);
  const status = plan.meta.status ?? 'unknown';
  const { playbooks, topic } = pageConfig(root);
  const plansDir = dirname(planPath);
  let subject = subjectOf(plan, topic);
  const missing = subject && !existsSync(join(plansDir, 'topics', `${subject}.md`));
  if (missing) {
    const hint = `create ${relative(root, join(plansDir, 'topics', `${subject}.md`))} with a # title and its ## Main changes; the first publish adds its Page: line`;
    if (plan.fields.topic) throw new Error(`${repoPath} belongs to topic ${subject}; ${hint}`);
    console.error(`${repoPath} renders its own page until its subject has a file: ${hint}`);
    subject = null;
  }
  const subjectPath = subject && join(plansDir, 'topics', `${subject}.md`);
  const doc = subjectPath ? parsePlan(readFileSync(subjectPath, 'utf-8')) : plan;
  const iterations = subject ? iterationsOf(plansDir, subject, topic) : [];
  const subjectWhere = subjectPath && relative(root, subjectPath);
  for (const entry of iterations) {
    if (!stateOf(entry.plan.meta.status ?? '')) {
      throw new Error(
        `${relative(root, entry.path)} needs a Status: line that starts with a state word, such as ${STATES.planning[0]}, ${STATES.active[0]} or ${STATES.done[4]}, because its subject page reads it`
      );
    }
  }
  const isOpen = (entry) => !finished(entry.plan.meta.status ?? '');
  // The newest open iteration leads its subject page whichever plan is rendered, so sessions publishing one URL agree.
  const focusEntry = doc === plan ? null : (iterations.find(isOpen) ?? null);
  const pageEntry = doc === plan ? null : (focusEntry ?? iterations[0]);
  const focus = focusEntry?.plan;
  const delta = Boolean(focusEntry);
  const leader = pageEntry ?? { path: planPath, plan };
  const leaderPlaybook = leader.plan.meta.playbook;
  // An executed plan stays as written, so a playbook renamed since then falls back to every playbook's sections.
  const known = !leaderPlaybook || !finished(leader.plan.meta.status ?? '') || playbooks.some((entry) => entry.name === leaderPlaybook);
  const { lead, pairs, require } = pageSections(playbooks, known ? leaderPlaybook : null, relative(root, leader.path));
  const isChange = (section) => {
    const role = roleOf(section, lead);
    return ['api', 'lead', 'main'].includes(role) || (role === 'idea' && Boolean(sectionNamed(doc, section.title)));
  };
  const owesBrief = (entry) => Boolean(briefOf(entry.plan)) || (entry.path === leader.path && Boolean(stateOf(entry.plan.meta.status ?? '')));
  // Open iterations meet their own rules whichever plan is passed; executed ones stay as written.
  for (const entry of doc === plan ? [{ path: planPath, plan }] : iterations.filter(isOpen)) {
    const where = relative(root, entry.path);
    pageSections(playbooks, entry.plan.meta.playbook, where);
    assertPairs(entry.plan.sections, pairs, where);
    if (!finished(entry.plan.meta.status ?? '')) assertDefaults(entry.plan, where);
    if (!finished(entry.plan.meta.status ?? '') && owesBrief(entry)) assertBrief(entry.plan, where);
    if (stateOf(entry.plan.meta.status ?? '') && !finished(entry.plan.meta.status ?? '')) assertAsks(entry.plan, where);
    if (doc !== plan && isOpen(entry)) assertDelta(entry.plan, doc, { name: where, where: subjectWhere });
  }
  if (folded && doc === plan) throw new Error(`${repoPath} has no subject file to fold into`);
  if (folded && !plan.sections.some((section) => /^close$/i.test(section.title) && section.lines.some((line) => line.trim()))) {
    throw new Error(`${repoPath} needs a ## Close before --folded: what landed, the proof and its limits, the counts, reversals first and open work with owners`);
  }
  if (doc !== plan) {
    assertNoPairs(doc.sections, pairs, subjectWhere);
    // Hand edits to the subject and plans that close without folding, such as superseded ones, leave older iterations unmatched, so only the close that just folded asks for the check.
    if (folded) {
      const others = iterations.filter((entry) => entry.path !== planPath).map((entry) => entry.plan);
      assertFolded(plan, doc, { isChange, others, paired: pairs, where: subjectWhere });
    }
    for (const entry of iterations.filter(isOpen)) {
      if ((folded && entry.path === planPath) || reopened(entry.plan.meta.status ?? '')) continue;
      const others = iterations.filter((other) => other !== entry).map((other) => other.plan);
      assertUnfolded(entry.plan, doc, { name: relative(root, entry.path), others, paired: pairs, where: subjectWhere });
    }
  }
  const hasContent = (section) => section?.lines.some((line) => line.trim());
  const byRole = (role, source = doc) =>
    source.sections.filter(
      (section) => roleOf(section, lead) === role && hasContent(section)
    );
  const sectionHtml = (section, className = 'plan') =>
    `<section class="${className}"><h2>${inline(section.title)}</h2>${blocksHtml(section.lines)}</section>`;
  const unchangedHtml = (section) =>
    `<details class="panel unchanged"><summary>${inline(section.title)} <span class="count">unchanged</span></summary>${blocksHtml(section.lines)}</details>`;
  const deltaHtml = (title) => {
    const change = byRole(roleOf({ title }, lead), focus).find((section) => sameText(section.title) === sameText(title));
    const current = byRole(roleOf({ title }, lead)).find((section) => sameText(section.title) === sameText(title));
    if (!change) return unchangedHtml(current);
    return `<section class="panel"><h2>${inline(change.title)} <span class="count">this plan</span></h2>${blocksHtml(change.lines, {
      current,
      title: change.title,
      where: subjectWhere,
    })}${current ? `<details class="current"><summary>Current state</summary>${blocksHtml(current.lines)}</details>` : ''}</section>`;
  };
  const ordered = (role) => {
    const seen = new Map();
    for (const section of [...byRole(role, focus), ...byRole(role)]) {
      if (!seen.has(sameText(section.title))) seen.set(sameText(section.title), section.title);
    }
    return [...seen.values()].sort((a, b) => lead.indexOf(a.toLowerCase()) - lead.indexOf(b.toLowerCase()));
  };
  const changeHtml = (role) =>
    delta
      ? ordered(role).map(deltaHtml).join('\n  ')
      : byRole(role)
          .sort((a, b) => lead.indexOf(a.title.toLowerCase()) - lead.indexOf(b.title.toLowerCase()))
          .map((section) => sectionHtml(section, 'panel'))
          .join('\n  ');
  const [needs] = byRole('needs', leader.plan);
  const olderNeeds = iterations
    .filter((entry) => entry.path !== leader.path)
    .map((entry) => ({ lines: byRole('needs', entry.plan)[0]?.lines, from: entry.plan.title || basename(entry.path, '.md') }))
    .filter((source) => source.lines);
  const [close] = byRole('close', leader.plan);
  const iterationHtml = ({ path, plan: iteration }) => {
    const iterationStatus = iteration.meta.status ?? 'unknown';
    const open = !finished(iterationStatus) && path !== focusEntry?.path;
    const shown = iteration.sections.filter(
      (section) =>
        hasContent(section) &&
        (/^main changes$/i.test(section.title) ||
          (open && /^(open questions|defaults)$/i.test(section.title)))
    );
    const head = `<span class="pill ${statusTone(iterationStatus)}">${escapeHtml(iterationStatus)}</span> <strong>${inline(iteration.title || basename(path, '.md'))}</strong> <code>${escapeHtml(relative(root, path))}</code>`;
    const body =
      path === focusEntry?.path
        ? ''
        : shown.map((section) => `<h3>${inline(section.title)}</h3>${blocksHtml(section.lines)}`).join('');
    return body
      ? `<details class="iteration"${open ? ' open' : ''}><summary>${head}</summary>${body}</details>`
      : `<p class="iteration">${head}</p>`;
  };
  const iterationList = iterations.length
    ? `<section class="plan"><h2>${delta ? 'Iterations' : 'History'} <span class="count">${iterations.length}</span></h2>${iterations.map(iterationHtml).join('')}</section>`
    : '';
  const own = delta ? focus : doc === plan ? plan : null;
  const details = own ? byRole('details', own) : [];
  if (delta) details.push(...byRole('idea', focus).filter((section) => !sectionNamed(doc, section.title)));
  const hubPath = subject && topic.hub ? topic.hub.replaceAll('{topic}', subject) : null;
  const hub = hubPath && existsSync(join(root, hubPath)) ? hubPath : null;
  if (hub) {
    for (const required of require) {
      if (![doc, focus].some((source) => source && hasContent(sectionNamed(source, required)))) {
        throw new Error(`${subject} needs ## ${required} in ${relative(root, subjectPath)} or its open plan, because its hub exists and the leading plan's playbook requires it`);
      }
    }
  }
  const reviewed = (doc === plan ? [{ path: planPath, plan }] : iterations)
    .map((entry) => ({ entry, rounds: reviewRounds(reviewRows(entry.path)) }))
    .filter(({ rounds }) => rounds.length);
  const paneled = reviewed.filter(({ rounds }) => rounds.some((entry) => entry.kind === 'panel'));
  const tagged = paneled.find(({ entry }) => entry.path === (pageEntry ?? { path: planPath }).path) ?? paneled[0];
  const latest = tagged?.rounds.findLast((entry) => entry.kind === 'panel');
  const taggedTitle = doc !== plan && tagged && tagged.entry.path !== pageEntry?.path ? ` for ${inline(tagged.entry.plan.title || basename(tagged.entry.path, '.md'))}` : '';
  const reviewTag = latest
    ? `<span>Review round <strong>${latest.round}</strong>${taggedTitle}${latest.seats ? ` <code>${escapeHtml(latest.seats)}</code>` : ''}</span>`
    : '';
  const roundsHtml = (rounds, heading) =>
    rounds
      .map(
        (entry) =>
          `<${heading}>${entry.kind === 'panel' ? `Round ${entry.round}` : 'Hand-off review'}${entry.seats ? ` <span class="count">${escapeHtml(entry.seats)}</span>` : ''}</${heading}><ul>${entry.findings
            .map((row) => `<li>${inline(row.decision)}${row.result ? ` <span class="count">${inline(row.result)}</span>` : ''}</li>`)
            .join('')}</ul>`
      )
      .join('');
  const reviewRoundsHtml = reviewed.length
    ? doc === plan
      ? roundsHtml(reviewed[0].rounds, 'h3')
      : reviewed
          .map(({ entry, rounds }) => `<h3>${inline(entry.plan.title || basename(entry.path, '.md'))}</h3>${roundsHtml(rounds, 'h4')}`)
          .join('')
    : '';
  const reviewHistory = reviewed.length ? `<section class="plan"><h2>Review history</h2>${reviewRoundsHtml}</section>` : '';
  const updated = new Date(
    Math.max(...[planPath, ...iterations.map((entry) => entry.path), subjectPath].filter(Boolean).map((path) => statSync(path).mtimeMs))
  )
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
  const shownStatus = pageEntry?.plan.meta.status ?? status;
  const title = escapeHtml(doc.title || basename(planPath, '.md'));
  const where = subjectPath ? relative(root, subjectPath) : repoPath;
  const brief = briefOf(leader.plan);
  const briefMain = () => {
    const round = reviewed.find(({ entry }) => entry.path === leader.path)?.rounds.findLast((entry) => entry.kind === 'panel');
    const roundTag = round ? `<span>Review round <strong>${round.round}</strong>${round.seats ? ` <code>${escapeHtml(round.seats)}</code>` : ''}</span>` : '';
    const asking = needs || olderNeeds.length ? needsSection(needs?.lines ?? [], olderNeeds) : '';
    const answers = brief.map((answer) => `<div class="qa"><h2>${inline(answer.question)}</h2>${blocksHtml(answer.lines)}</div>`).join('');
    const fold = (label, body) => (body.trim() ? `<details class="fold"><summary>${label}</summary>${body}</details>` : '');
    const count = (label, n) => `${label} <span class="count">${n}</span>`;
    const leadTitles = delta ? ordered('lead') : byRole('lead').map((section) => section.title);
    const apiChanged = !delta || byRole('api', focus).length > 0;
    const picked = own ? byRole('picked', own) : [];
    const state = [
      doc.lead.some((line) => line.trim()) ? `<section class="plan">${blocksHtml(doc.lead)}</section>` : '',
      ...byRole('idea').map((section) => (delta ? deltaHtml(section.title) : sectionHtml(section))),
    ].join('');
    return `<main>
  <header>
    <h1>${title}</h1>
    <div class="meta"><span class="pill ${statusTone(shownStatus)}">${escapeHtml(shownStatus)}</span>${delta ? `<span>Plan <strong>${inline(focus.title || basename(focusEntry.path, '.md'))}</strong></span>` : ''}${roundTag}<span>Updated ${updated} UTC</span></div>
  </header>
  <section class="panel brief">${answers}</section>${asking}
  ${apiChanged ? changeHtml('api') : ''}
  <div>
  ${fold('Close', close ? blocksHtml(close.lines) : '')}
  ${apiChanged ? '' : fold('Public API', byRole('api').map((section) => blocksHtml(section.lines)).join(''))}
  ${fold('Plan', delta && focus.lead.some((line) => line.trim()) ? blocksHtml(focus.lead) : '')}
  ${fold(escapeHtml(leadTitles.join(', ')), changeHtml('lead'))}
  ${fold('Main changes', changeHtml('main'))}
  ${fold(count('Picked for you', tablesOf(picked.flatMap((section) => section.lines)).reduce((sum, table) => sum + table.rows.length, 0)), picked.map((section) => blocksHtml(section.lines)).join(''))}
  ${fold(doc === plan ? 'More' : `${title} today`, state)}
  ${fold(count(delta ? 'Iterations' : 'History', iterations.length), iterations.map(iterationHtml).join(''))}
  ${fold(escapeHtml(details.map((section) => section.title).join(', ')), details.map((section) => sectionHtml(section)).join(''))}
  ${fold('Review history', reviewRoundsHtml)}
  </div>
</main>`;
  };

  const html = `<title>${title}</title>
${PAGE_HEAD}
${brief ? briefMain() : `<main>
  <header>
    <h1>${title}</h1>
    <div class="meta"><span class="pill ${statusTone(shownStatus)}">${escapeHtml(shownStatus)}</span><code>${escapeHtml(where)}</code>${delta ? `<span>Plan <strong>${inline(focus.title || basename(focusEntry.path, '.md'))}</strong> <code>${escapeHtml(relative(root, focusEntry.path))}</code></span>` : ''}${hub ? `<span>History <code>${escapeHtml(hub)}</code></span>` : ''}${reviewTag}<span>Updated ${updated} UTC</span></div>
  </header>
  ${needs || olderNeeds.length ? needsSection(needs?.lines ?? [], olderNeeds) : ''}${close ? sectionHtml(close, 'panel') : ''}
  ${delta && focus.lead.some((line) => line.trim()) ? `<section class="plan">${blocksHtml(focus.lead)}</section>` : ''}
  ${changeHtml('api')}
  ${changeHtml('lead')}
  ${changeHtml('main')}
  ${own
    ? byRole('picked', own)
        .map((section) => sectionHtml({ ...section, title: 'Picked for you' }))
        .join('\n  ')
    : ''}
  ${doc.lead.some((line) => line.trim()) ? `<section class="plan">${blocksHtml(doc.lead)}</section>` : ''}
  ${byRole('idea')
    .map((section) => (delta ? deltaHtml(section.title) : sectionHtml(section)))
    .join('\n  ')}
  ${iterationList}
  ${
    details.length
      ? `<details class="details"><summary>Details: ${details
          .map((section) => escapeHtml(section.title.toLowerCase()))
          .join(', ')}</summary>${details.map((section) => sectionHtml(section)).join('')}</details>`
      : ''
  }
  ${reviewHistory}
</main>`}
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>
window.hljs?.highlightAll();
document.querySelectorAll('.diff code').forEach((element) => window.hljs?.highlightElement(element));
</script>
`;
  return { html, name: subject ? join('topics', subject) : basename(planPath, '.md') };
}

const firstParagraph = (lines) => {
  const start = lines.findIndex((line) => line.trim());
  if (start < 0) return '';
  const end = lines.findIndex((line, index) => index > start && !line.trim());
  const text = lines.slice(start, end < 0 ? undefined : end).join(' ').trim();
  return text.length > 220 ? `${text.slice(0, 220).replace(/\s+\S*$/u, '')}…` : text;
};

function hubsWithoutSubject(root, hub, names) {
  if (!hub?.includes('{topic}')) return [];
  const [head, tail] = hub.split('{topic}');
  const dir = join(root, head.slice(0, head.lastIndexOf('/') + 1));
  const prefix = head.slice(head.lastIndexOf('/') + 1);
  const nameOf = (file) => file.slice(prefix.length, file.length - tail.length);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(tail) && !names.includes(nameOf(file)))
    .map((file) => ({ title: parsePlan(readFileSync(join(dir, file), 'utf-8')).title || nameOf(file) }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function topicIndex(root) {
  const { plans, topic } = pageConfig(root);
  const plansDir = join(root, plans);
  const topicsDir = join(plansDir, 'topics');
  mkdirSync(join(plansDir, 'artifacts', 'topics'), { recursive: true });
  const names = existsSync(topicsDir)
    ? readdirSync(topicsDir)
        .filter((name) => name.endsWith('.md') && name !== 'README.md')
        .map((name) => basename(name, '.md'))
    : [];
  const hubPath = (name) => (topic.hub ? topic.hub.replaceAll('{topic}', name) : null);
  const asks = (plan) => plan.sections.some((section) => /^open questions$/i.test(section.title) && section.lines.some((line) => /^###\s/.test(line)));
  const subjects = names.map((name) => {
    const doc = parsePlan(readFileSync(join(topicsDir, `${name}.md`), 'utf-8'));
    const iterations = iterationsOf(plansDir, name, topic);
    const open = iterations.find((entry) => !finished(entry.plan.meta.status ?? ''));
    const hub = hubPath(name);
    let local = null;
    let refused = null;
    if (iterations[0]) {
      try {
        const rendered = page(iterations[0].path);
        writeFileSync(join(plansDir, 'artifacts', `${rendered.name}.html`), rendered.html);
        local = `${basename(rendered.name)}.html`;
      } catch (error) {
        refused = error.message;
      }
    }
    return {
      title: doc.title || name,
      page: doc.fields.page ?? null,
      local,
      refused,
      lead: firstParagraph(doc.lead),
      status: (open ?? iterations[0])?.plan.meta.status ?? null,
      asks: iterations.some((entry) => asks(entry.plan)),
      open: Boolean(open),
      count: iterations.length,
      newest: iterations[0] ? (basename(iterations[0].path).match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '') : '',
      feature: Boolean(hub && existsSync(join(root, hub))),
    };
  });
  subjects.sort((a, b) => Number(b.asks) - Number(a.asks) || Number(b.open) - Number(a.open) || b.newest.localeCompare(a.newest) || a.title.localeCompare(b.title));
  const unpaged = hubsWithoutSubject(root, topic.hub, names);
  const rowHtml = (row) => {
    const name = row.local ? `<a href="${escapeHtml(row.local)}">${inline(row.title)}</a>` : `<span>${inline(row.title)}</span>`;
    const state = row.status
      ? `<span class="pill ${statusTone(row.status)}">${escapeHtml(row.status.length > 90 ? `${row.status.slice(0, 90).replace(/\s+\S*$/u, '')}…` : row.status)}</span>`
      : `<span class="pill done">current</span>`;
    const meta = [
      `${row.count} iteration${row.count === 1 ? '' : 's'}`,
      row.newest && `newest ${row.newest}`,
      row.page && `<a href="${escapeHtml(row.page)}">last published on claude.ai</a>`,
    ]
      .filter(Boolean)
      .join(' · ');
    const refusal = row.refused ? `<p class="topic-meta"><span class="pill unknown">refused</span> ${escapeHtml(row.refused)}</p>` : '';
    return `<li class="topic"><div class="topic-head">${name}${state}${row.asks ? '<span class="chip">waits on you</span>' : ''}</div>${row.lead ? `<p class="topic-lead">${inline(row.lead)}</p>` : ''}<p class="topic-meta">${meta}</p>${refusal}</li>`;
  };
  const unpagedHtml = (row) => `<li class="topic"><div class="topic-head"><span>${inline(row.title)}</span><span class="pill unknown">no page yet</span></div></li>`;
  const group = (heading, rows, html) =>
    rows.length ? `<section class="panel"><h2>${heading} <span class="count">${rows.length}</span></h2><ul class="topics">${rows.map(html).join('')}</ul></section>` : '';
  const features = topic.hub ? subjects.filter((row) => row.feature) : subjects;
  const others = topic.hub ? subjects.filter((row) => !row.feature) : [];
  const title = `${basename(root)} topics`;
  const waiting = subjects.filter((row) => row.asks).length;
  const pageCount = subjects.filter((row) => row.local).length;
  const refusedCount = subjects.filter((row) => row.refused).length;
  const html = `<title>${escapeHtml(title)}</title>
${PAGE_HEAD}
<main>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta"><span>${pageCount} page${pageCount === 1 ? '' : 's'}</span>${refusedCount ? `<span>${refusedCount} refused</span>` : ''}${unpaged.length ? `<span>${unpaged.length} with no page yet</span>` : ''}${waiting ? `<span>${waiting} wait on you</span>` : ''}<code>${escapeHtml(relative(root, topicsDir))}</code></div>
  </header>
  ${group(topic.hub ? 'Feature topics' : 'Subjects', features, rowHtml)}
  ${group('Other subjects', others, rowHtml)}
  ${group('No page yet', unpaged, unpagedHtml)}
</main>
`;
  return { html, out: join(plansDir, 'artifacts', 'topics', 'index.html') };
}

const args = process.argv.slice(2);
if (args.includes('--index')) {
  if (args.length !== 1) {
    console.error('Usage: node .agents/pstack/plan-page.mjs --index');
    process.exit(2);
  }
  try {
    const { html, out } = topicIndex(execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf-8' }).trim());
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.info(out);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  process.exit(0);
}
const target = args.find((arg) => !arg.startsWith('--'));
const planPath = target && resolve(target);
if (!planPath || !existsSync(planPath) || args.some((arg) => arg.startsWith('--') && !['--folded', '--check'].includes(arg))) {
  console.error('Usage: node .agents/pstack/plan-page.mjs <plan.md> [--folded] [--check] | --index');
  process.exit(2);
}
let rendered;
try {
  rendered = page(planPath, { folded: args.includes('--folded') });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
if (args.includes('--check')) process.exit(0);
const out = join(dirname(planPath), 'artifacts', `${rendered.name}.html`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, rendered.html);
console.info(out);
