#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/plan-page.mjs <plan.md> [--folded] [--check]
//        node .agents/pstack/plan-page.mjs <plan.md> --pr [--into <body.md>]
//        node .agents/pstack/plan-page.mjs <plan.md> --comment <author sha> [--into <comment.md>] [--against <description.md>]
//        node .agents/pstack/plan-page.mjs --index

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DECK_SCRIPT, MOUNTS, dataBlock, slugOf } from './page-live.mjs';
import { SEATS, SEVERITIES, STAGE_PHASES, STATES, isFence, isHandOffReview, landed, readFence, reopened, splitRow, stageOfRow, stateOf, TABLE_RULE, tablesOf } from './status.mjs';

const PAGE_HEAD = `<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
:root {
  --ground: #ffffff; --paper: #ffffff; --ink: #15181d; --muted: #4a535e; --faint: #626b77; --rule: #e4e7eb;
  --c-red: #c2261c; --c-orange: #b8460b; --c-amber: #946000; --c-lime: #4d7c0f; --c-green: #1f7a3d; --c-teal: #0f766e; --c-cyan: #0e7490; --c-blue: #1d5fc2; --c-indigo: #4338ca; --c-violet: #6d28d9; --c-pink: #c0156b; --c-grey: #5f6874; --badge-ink: #ffffff;
  --cta: var(--c-orange); --cta-ink: var(--badge-ink); --accent: #2c5b8f; --accent-soft: #eaf1f8;
  --amber: #9a5b00; --amber-soft: #fbf1df; --green: #2f6b3f; --green-soft: #e5f2e8; --red: #b3362b; --red-soft: #f8e6e3; --code: #f4f5f7;
  --kw: #8a3f9e; --str: #3d6b21; --fn: #2c5b8f; --num: #a24d12;
  --sans: "Schibsted Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --ground: #111316; --paper: #111316; --ink: #e6e8eb; --muted: #c0c7cf; --faint: #9ea7b2; --rule: #262b31;
  --c-red: #ff6b5e; --c-orange: #ffa45c; --c-amber: #f5c35b; --c-lime: #b5e05a; --c-green: #7fd99a; --c-teal: #5fd4c6; --c-cyan: #67d1ee; --c-blue: #8ab8ff; --c-indigo: #a5a8ff; --c-violet: #c4a6ff; --c-pink: #ff8cc6; --c-grey: #a7b0ba; --badge-ink: #111316;
  --cta: var(--c-orange); --cta-ink: var(--badge-ink); --accent: #8db6e6; --accent-soft: #1f2d3d;
  --amber: #f0b45c; --amber-soft: #33270f; --green: #8fcf9f; --green-soft: #18291d; --red: #f0968c; --red-soft: #3a1c19; --code: #1a1d21;
  --kw: #d7a1e6; --str: #a8d48a; --fn: #8db6e6; --num: #f0a66e; color-scheme: dark;
} }
:root[data-theme="dark"] {
  --ground: #111316; --paper: #111316; --ink: #e6e8eb; --muted: #c0c7cf; --faint: #9ea7b2; --rule: #262b31;
  --c-red: #ff6b5e; --c-orange: #ffa45c; --c-amber: #f5c35b; --c-lime: #b5e05a; --c-green: #7fd99a; --c-teal: #5fd4c6; --c-cyan: #67d1ee; --c-blue: #8ab8ff; --c-indigo: #a5a8ff; --c-violet: #c4a6ff; --c-pink: #ff8cc6; --c-grey: #a7b0ba; --badge-ink: #111316;
  --cta: var(--c-orange); --cta-ink: var(--badge-ink); --accent: #8db6e6; --accent-soft: #1f2d3d;
  --amber: #f0b45c; --amber-soft: #33270f; --green: #8fcf9f; --green-soft: #18291d; --red: #f0968c; --red-soft: #3a1c19; --code: #1a1d21;
  --kw: #d7a1e6; --str: #a8d48a; --fn: #8db6e6; --num: #f0a66e; color-scheme: dark;
}
body { background: var(--ground); color: var(--ink); font: 14.5px/1.5 var(--sans); padding: 0 16px; margin: 0; }
main { max-width: 800px; margin: 0 auto; padding-block: 24px 56px; display: grid; gap: 18px; }
header { display: grid; gap: 4px; }
h1 { font-size: 1.4rem; line-height: 1.25; margin: 0; text-wrap: balance; font-weight: 700; }
h2 { font-size: 0.78rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin: 0 0 6px; text-wrap: balance; }
h3, h4, h5 { font-size: 0.95rem; margin: 10px 0 2px; }
.meta { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; color: var(--faint); font-size: 0.8rem; }
.panel { min-width: 0; }
.count { font-size: 0.78rem; color: var(--faint); font-weight: 500; letter-spacing: 0; text-transform: none; }
.chip { font: 700 0.68rem var(--sans); letter-spacing: 0.05em; text-transform: uppercase; color: var(--cta-ink); background: var(--cta); border-radius: 999px; padding: 1px 7px; }
.needs { display: grid; border: 2px solid var(--frame, var(--c-amber)); border-radius: 12px; padding: 12px 16px 0; min-width: 0; }
.needs:not(:has(.bar)) { padding-bottom: 12px; }
.needs-head { display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: baseline; padding-bottom: 4px; }
.needs-head h2 { margin: 0; color: var(--frame, var(--c-amber)); }
.lg { color: var(--c); font-size: 0.8rem; font-weight: 600; }
.lg::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--c); margin-right: 5px; vertical-align: 1px; }
.q { display: grid; gap: 4px; padding: 12px 0; border-top: 1px solid var(--rule); min-width: 0; }
.q h3 { margin: 0; font-size: 1.02rem; line-height: 1.35; display: flex; gap: 9px; align-items: baseline; text-wrap: balance; }
.n { flex: none; font: 700 0.74rem var(--mono); color: var(--badge-ink); background: var(--c); border-radius: 999px; min-width: 1.65em; text-align: center; padding: 1px 0; }
.ctx { margin: 0 0 2px 2.25em; font-size: 0.86rem; color: var(--muted); }
.fact { color: var(--faint); }
.fact::before { content: "· "; }
.opts { display: grid; grid-template-columns: 1.3em minmax(7.5em, max-content) minmax(0, 1.2fr) minmax(0, 1fr); gap: 0 12px; margin-left: 2.25em; font-size: 0.9rem; }
.hd { font: 700 0.62rem var(--sans); letter-spacing: 0.07em; text-transform: uppercase; color: var(--faint); padding-bottom: 2px; }
.o { display: contents; cursor: pointer; }
.o > * { padding: 4px 0; border-top: 1px solid var(--rule); }
.o input { margin: 7px 0 0; width: 1.05em; height: 1.05em; accent-color: var(--c); }
.o b { font-weight: 650; }
.o .cost { color: var(--muted); }
.o.is-selected b { color: var(--c); }
.o .why { grid-column: 3 / -1; border-top: 0; padding: 0 0 4px; margin-top: -2px; color: var(--muted); font-size: 0.82rem; font-style: italic; }
.why-all, .nopick { margin: 2px 0 0 2.25em; font-size: 0.82rem; color: var(--muted); font-style: italic; }
.nopick { color: var(--c); font-style: normal; font-weight: 600; }
.from { color: var(--faint); font-weight: 400; font-size: 0.8rem; }
.bar { position: sticky; bottom: env(safe-area-inset-bottom, 0px); display: flex; gap: 10px; align-items: center; margin: 4px -16px 0; padding: 9px 16px; background: var(--ground); border-top: 2px solid var(--frame, var(--c-amber)); border-radius: 0 0 10px 10px; }
.bar code { flex: 1 1 auto; min-width: 0; font: 600 0.88rem var(--mono); overflow-wrap: anywhere; padding: 0; }
.bar.is-default code { color: var(--c-green); }
.bar.is-changed code { color: var(--c-amber); }
.bar.is-missing code { color: var(--c-red); }
.bar button { padding: 4px 12px; font-weight: 700; color: var(--frame, var(--c-amber)); border-color: var(--frame, var(--c-amber)); }
.bar button:disabled { opacity: 0.4; cursor: not-allowed; }
@media (max-width: 620px) {
  .opts { grid-template-columns: 1.3em minmax(0, 1fr); margin-left: 0; }
  .hd { display: none; }
  .o > span { grid-column: 2; border-top: 0; padding: 0; }
  .o > .cost { padding-bottom: 6px; }
  .ctx, .why-all, .nopick { margin-left: 0; }
}
.topics { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.topic { display: grid; gap: 2px; min-width: 0; }
.topic-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; font-weight: 600; }
.topic-lead { margin: 0; color: var(--ink); }
.topic-meta { margin: 0; color: var(--faint); font-size: 0.8rem; font-variant-numeric: tabular-nums; }
button { font: 500 0.85rem var(--sans); color: var(--accent); background: none; border: 1px solid var(--rule); border-radius: 8px; padding: 6px 12px; cursor: pointer; }
button:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid var(--cta); outline-offset: 2px; }
section.plan { display: grid; gap: 2px; min-width: 0; }
section.plan + section.plan { border-top: 1px solid var(--rule); padding-top: 14px; }
p { margin: 0 0 8px; max-width: 72ch; }
ul, ol { margin: 0 0 8px; padding-left: 1.3em; }
li { margin: 2px 0; }
.picks .alt { opacity: 0.75; }
li > ul, li > ol { margin: 2px 0; }
code { font: 0.86em var(--mono); padding: 0 2px; color: var(--ink); }
pre { margin: 0; padding: 10px 12px; background: var(--code); border-radius: 6px; }
pre code { padding: 0; }
.scroll { overflow-x: auto; margin: 0 0 10px; }
table { border-collapse: collapse; font-size: 0.86rem; min-width: 100%; }
th, td { text-align: left; vertical-align: top; padding: 5px 8px; border-bottom: 1px solid var(--rule); }
th { font-weight: 600; color: var(--faint); font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; }
blockquote { margin: 0 0 8px; padding-left: 10px; border-left: 3px solid var(--rule); color: var(--muted); }
a { color: var(--accent); }
.box { display: inline-block; width: 0.8em; height: 0.8em; border: 1.5px solid var(--faint); border-radius: 3px; margin-right: 6px; vertical-align: -0.08em; }
.box.done { background: var(--green); border-color: var(--green); }
.compare { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin: 4px 0 12px; }
.pane { min-width: 0; border: 1px solid var(--rule); border-radius: 6px; overflow: hidden; }
.pane-head { display: flex; justify-content: space-between; align-items: center; padding: 3px 10px; border-bottom: 1px solid var(--rule); }
.tally { font: 600 0.75rem var(--mono); }
.tally.del, .diff .del .sign { color: var(--red); }
.tally.add, .diff .add .sign { color: var(--green); }
.pane-body { overflow-x: auto; }
.diff { display: grid; min-width: 100%; width: max-content; padding: 4px 0; font: 0.82em/1.55 var(--mono); }
.diff .row { display: grid; grid-template-columns: 4ch 2.5ch 1fr; }
.diff .row code { font: inherit; padding: 0 14px 0 0; white-space: pre; }
.diff .num { color: var(--faint); text-align: right; padding-right: 1ch; user-select: none; }
.diff .sign { text-align: center; user-select: none; }
.diff .del { background: color-mix(in srgb, var(--red) 12%, transparent); }
.diff .add { background: color-mix(in srgb, var(--green) 12%, transparent); }
.diff .filler { display: none; }
.side { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--faint); }
@media (min-width: 1280px) {
  main > :has(.compare) { --wide: min(1200px, calc(100vw - 64px)); box-sizing: border-box; width: var(--wide); margin-inline: calc((100% - var(--wide)) / 2); }
  main > :has(.compare) > :not(.compare) { margin-inline: calc((var(--wide) - 800px) / 2); }
  .compare { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .diff .filler { display: grid; background: repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--rule) 45%, transparent) 6px 7px); }
}
.details { border-top: 1px solid var(--rule); padding-top: 10px; display: grid; gap: 14px; }
.details > summary { cursor: pointer; color: var(--muted); font-size: 0.86rem; }
.iteration { margin: 6px 0; }
details.iteration > summary { cursor: pointer; }
details.iteration[open] > summary { margin-bottom: 4px; }
.hljs-keyword, .hljs-built_in, .hljs-type { color: var(--kw); }
.hljs-string, .hljs-regexp { color: var(--str); }
.hljs-title, .hljs-title.function_, .hljs-title.class_ { color: var(--fn); }
.hljs-number, .hljs-literal { color: var(--num); }
.hljs-attr, .hljs-property, .hljs-params { color: var(--ink); }
.hljs-comment { color: var(--faint); font-style: italic; }
.source { color: var(--muted); font-size: 0.85rem; margin: 0; }
.hue-red { --hue: var(--c-red); } .hue-orange { --hue: var(--c-orange); } .hue-amber { --hue: var(--c-amber); } .hue-lime { --hue: var(--c-lime); }
.hue-green { --hue: var(--c-green); } .hue-teal { --hue: var(--c-teal); } .hue-cyan { --hue: var(--c-cyan); } .hue-blue { --hue: var(--c-blue); }
.hue-indigo { --hue: var(--c-indigo); } .hue-violet { --hue: var(--c-violet); } .hue-pink { --hue: var(--c-pink); } .hue-grey { --hue: var(--c-grey); }
.pill { font: 700 0.7rem var(--sans); letter-spacing: 0.05em; text-transform: uppercase; color: var(--badge-ink); background: var(--hue, var(--c-grey)); border-radius: 999px; padding: 2px 9px; white-space: nowrap; }
.badge { font: 700 0.66rem var(--sans); letter-spacing: 0.04em; text-transform: uppercase; color: var(--badge-ink); background: var(--hue, var(--c-grey)); border-radius: 999px; padding: 1px 7px; white-space: nowrap; }
.tone { color: var(--hue); font-weight: 600; }
.seats { display: inline-flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.seat { display: inline-flex; gap: 3px; align-items: center; border: 1.5px solid var(--hue); color: var(--hue); border-radius: 999px; padding: 0 8px; font: 600 0.74rem var(--mono); }
.seat.missing { --hue: var(--c-red); }
.round-tag { display: inline-flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.card { border: 1px solid var(--rule); border-top: 3px solid var(--hue, var(--rule)); border-radius: 10px; padding: 10px 14px 12px; min-width: 0; }
.brief.card { display: grid; gap: 0; padding: 2px 14px; border-top: 1px solid var(--rule); }
.brief .qa { display: grid; grid-template-columns: 6.5em minmax(0, 1fr); gap: 0 14px; padding: 7px 0; min-width: 0; }
.brief .qa > p { margin: 0; }
.brief .qa + .qa { border-top: 1px solid var(--rule); }
.brief .qa > h2 { color: var(--hue); font-size: 0.7rem; margin: 2px 0 0; }
.brief .qa > :not(h2) { grid-column: 2; }
.findings { list-style: none; padding: 0; display: grid; gap: 4px; }
.findings li { display: flex; flex-wrap: wrap; gap: 6px; align-items: baseline; }

.effort { color: var(--muted); font: 500 0.7rem var(--sans); margin-left: 2px; }
.status-rest { color: var(--muted); font-size: 0.82rem; }
.status-line { margin: 0; font-weight: 500; }
.flow { margin: 8px 0 4px; }
.fs { --hue: var(--c-blue); }
.fs.done { --hue: var(--c-green); } .fs.now { --hue: var(--c-amber); } .fs.waiting { --hue: var(--c-orange); } .fs.blocked { --hue: var(--c-red); } .fs.skipped, .fs.stopped { --hue: var(--c-grey); }
.flow-rail { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 4px; align-items: center; }
.flow-rail .arrow { color: var(--faint); font-size: 0.8rem; }
.fs { display: inline-flex; gap: 5px; align-items: baseline; border: 1.5px solid var(--hue); color: var(--hue); border-radius: 999px; padding: 2px 10px; font: 600 0.76rem var(--sans); white-space: nowrap; }
.fs.done, .fs.waiting, .fs.blocked { color: var(--badge-ink); background: var(--hue); }
.fs.skipped { border-style: dashed; opacity: 0.75; font-weight: 500; }
.fs.now, .fs.waiting, .fs.blocked { box-shadow: 0 0 0 3px color-mix(in srgb, var(--hue) 25%, transparent); }
.fs-meta { font: 700 0.7rem var(--mono); opacity: 0.9; }
.tool { font: 500 0.68rem var(--mono); border: 1px solid currentColor; border-radius: 4px; padding: 0 4px; opacity: 0.9; }
.demo-steps { display: grid; gap: 1.25rem; padding-left: 1.4rem; }
.demo-steps > li > p { margin: 0 0 0.5rem; }
.shots { display: grid; gap: 1rem; }
.shot { margin: 0; }
.shot img { display: block; width: 100%; height: auto; border: 1px solid var(--rule); border-radius: 8px; cursor: zoom-in; }
.lightbox { padding: 0; border: 0; max-width: 96vw; max-height: 96vh; overflow: auto; background: transparent; }
.lightbox::backdrop { background: rgb(0 0 0 / 0.8); }
.lightbox img { display: block; max-width: none; cursor: zoom-out; }
.shot figcaption { font-size: 0.8rem; opacity: 0.75; margin-top: 0.25rem; }
.shot.missing { border: 1px dashed var(--rule); border-radius: 8px; padding: 0.5rem 0.75rem; }
.live { display: grid; gap: 2px; font-size: 0.85rem; color: var(--muted); }
.live-line { margin: 0; }
.live-line.waiting { color: var(--c-orange); font-weight: 600; }
.others { display: grid; gap: 10px; }
.run .q { border-top: 1px solid var(--rule); padding: 6px 0; }
.changed { display: block; color: var(--c-orange); font-size: 0.8rem; font-weight: 600; }
</style>`;

const ROLES = [
  [/^brief$/i, 'brief'],
  [/^demo$/i, 'demo'],
  [/^open questions$/i, 'needs'],
  [/^public api$/i, 'api'],
  [/^main changes$/i, 'main'],
  [/^defaults$/i, 'picked'],
  [/^teach$/i, 'teach'],
  [/^on top of the pr$/i, 'ontop'],
  [/^close$/i, 'close'],
  [/^(scope|steps|evidence|proof|claims|asks|verification|notes|panel gate)$/i, 'details'],
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
            extends: listOf(meta, 'extends'),
            lead: listOf(meta, 'page-lead'),
            pairs: listOf(meta, 'page-pairs'),
            require: listOf(meta, 'page-require'),
            pr: listOf(meta, 'page-pr'),
          };
        })
    : [];
  return { playbooks, plans: config.plans ?? 'docs/plans', topic: config.pageTopic ?? {}, branch: config.branch ?? 'main' };
}

export const gitOrNull = (root, ...args) => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};

const worktrees = (root) => (gitOrNull(root, 'worktree', 'list', '--porcelain') ?? '').split('\n').filter((line) => line.startsWith('worktree ')).map((line) => line.slice('worktree '.length));

export const mainCheckout = (root) => worktrees(root)[0] ?? root;

export function pageUrlOf(root, file) {
  const rel = relative(root, file);
  const lineOf = (text) => (text === null ? null : (parsePlan(text).fields.page ?? null));
  const own = lineOf(readFileSync(file, 'utf-8'));
  const remote = `origin/${pageConfig(root).branch}`;
  const base = gitOrNull(root, 'merge-base', 'HEAD', remote);
  const forked = base ? lineOf(gitOrNull(root, 'show', `${base}:${rel}`)) : null;
  const landedLine = base ? lineOf(gitOrNull(root, 'show', `${remote}:${rel}`)) : null;
  // A rebind wins only while origin keeps the fork point's line; once origin rebinds too, every checkout follows origin.
  const url = !base || (own !== forked && landedLine === forked) ? own : (landedLine ?? own);
  const others = worktrees(root)
    .filter((tree) => tree !== root && existsSync(join(tree, rel)))
    .map((tree) => ({ tree, url: lineOf(readFileSync(join(tree, rel), 'utf-8')) }))
    .filter((other) => other.url && other.url !== url);
  return { url, others };
}

const PSTACK_PLAYBOOKS = [
  'authoring-a-skill', 'autonomous-run', 'autopilot-full', 'autopilot-stack', 'babysit', 'bug-fix', 'eval', 'feature', 'figure-it-out',
  'hillclimb', 'investigation', 'multi-phase-plan', 'opening-a-pr', 'orchestrate', 'pause-safely', 'perf-issue', 'prototype',
  'refactoring', 'runtime-forensics', 'session-pickup', 'shipping', 'trace-forensics', 'visual-parity', 'worktree-cleanup',
];

function pageSections(playbooks, name, where) {
  const named = name ? playbooks.find((entry) => entry.name === name) : null;
  if (name && !named && !PSTACK_PLAYBOOKS.includes(name)) {
    throw new Error(`${where} names playbook ${name}, which is neither .agents/playbooks/${name}.md nor a pstack playbook such as feature or bug-fix`);
  }
  const union = (key, list) => [...new Set(list.flatMap((entry) => entry[key]))];
  const lower = (list) => list.map((title) => title.toLowerCase());
  for (const entry of playbooks) {
    const stray = entry.pr.find((title) => !lower(entry.lead).includes(title.toLowerCase()));
    if (stray) throw new Error(`.agents/playbooks/${entry.name}.md lists ${stray} on its page-pr line; the PR body shows only page-lead sections, so add it to page-lead or drop it`);
  }
  return {
    lead: lower(union('lead', named ? [named, ...playbooks.filter((entry) => entry !== named)] : playbooks)),
    pairs: ['public api', ...lower(union('pairs', playbooks))],
    require: named ? named.require : union('require', playbooks),
    pr: lower(named ? named.pr : union('pr', playbooks)),
  };
}

function subjectOf(plan, topic) {
  if (plan.fields.topic) return plan.fields.topic;
  return topic.field ? (plan.lists[topic.field.toLowerCase()]?.[0] ?? null) : null;
}

// Newest first by the date a plan's name starts with; a name without one sorts as the oldest.
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
const sectionsNamed = (doc, title) => doc.sections.filter((section) => section.title.toLowerCase() === title.toLowerCase());
const sectionNamed = (doc, title) => sectionsNamed(doc, title)[0];

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
const isDefaultsHead = (head) => DEFAULTS_HEAD.every((cell, index) => headCell(head[index] ?? '') === cell);
const TIERS = new Map([
  ['big', 'Big calls'],
  ['small', 'Small calls'],
  ['detail', 'Details'],
]);
const impactColumn = (head) => head.findIndex((cell) => headCell(cell) === 'impact');

function assertDefaults(plan, where) {
  for (const section of sectionsNamed(plan, 'Defaults')) {
    if (!section.lines.some((line) => line.trim())) continue;
    const tables = tablesOf(section.lines).filter((table) => isDefaultsHead(table.head));
    if (!tables.length) {
      throw new Error(`## Defaults in ${where} needs a table whose columns start with Decision, Pick, Alternative and Word, one row per call made for the owner`);
    }
    for (const { head, rows } of tables) {
      const impact = impactColumn(head);
      const wrong = impact < 0 ? null : rows.find((row) => !TIERS.has(headCell(row[impact] ?? '')));
      if (wrong) throw new Error(`## Defaults in ${where} gives "${wrong[0]}" the impact "${wrong[impact] ?? ''}"; write big, small or detail`);
    }
  }
}

const BRIEF = ['What will change?', 'What could go wrong?'];
const BRIEF_WORDS = 40;
const BRIEF_LABELS = ['Changes', 'Risks'];
const RETIRED_BRIEF = ['What did you find?', 'What do you need from me?', 'What happens if I say go?'];
const wordCount = (text) => text.split(/\s+/).filter(Boolean).length;

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
  const cut = asked.filter((question) => RETIRED_BRIEF.some((old) => sameText(old) === sameText(question)));
  if (cut.length) {
    throw new Error(`## Brief in ${where} asks the older questions; drop ${listed(cut.map((question) => `"${question}"`))}; an ask that is not a decision goes on the Status: line`);
  }
  if (asked.length !== BRIEF.length || asked.some((question, index) => sameText(question) !== sameText(BRIEF[index]))) {
    throw new Error(`## Brief in ${where} asks ${asked.join(' ') || 'nothing'}, but it needs ${shape}`);
  }
  for (const { question, lines } of answers) {
    const words = wordCount(lines.join(' '));
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
const tds = (row) => row.map((cell) => `<td>${inline(cell)}</td>`).join('');

function assertDeltaRow([cell, ...row], prior, context) {
  const mark = sameText(cell);
  const of = context.name ? ` of ${context.name}` : '';
  if (!DELTA.includes(mark)) {
    throw new Error(`A Delta cell in ## ${context.title}${of} is added, changed or removed, not "${cell}"`);
  }
  const old = prior.get(sameText(row[0] ?? ''));
  const folded = old ? sameCells(old, row) : mark === 'removed';
  if (!folded && (mark === 'added') === Boolean(old)) {
    throw new Error(
      `## ${context.title}${of} marks "${row[0]}" ${mark}, but ${context.where} ${old ? 'already has that row' : 'has no such row'}`
    );
  }
}

function assertDelta(plan, doc, { name, where }) {
  for (const section of plan.sections) {
    const current = sectionNamed(doc, section.title)?.lines ?? [];
    for (const table of tablesOf(section.lines).filter((entry) => isDelta(entry.head))) {
      const prior = rowsByKey(current, table.head.slice(1));
      for (const row of table.rows) assertDeltaRow(row, prior, { name, title: section.title, where });
    }
  }
}

function tableHtml(head, rows) {
  const body = rows.map((row) => `<tr>${tds(row)}</tr>`).join('');
  return `<div class="scroll"><table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}

const clause = (text) => text.trim().replace(/[.!?]+$/u, '');

function picksHtml(lines) {
  const out = [];
  let prose = [];
  const flush = () => {
    if (prose.length) out.push(blocksHtml(prose));
    prose = [];
  };
  for (let index = 0; index < lines.length; ) {
    if (isFence(lines[index])) {
      const { next } = readFence(lines, index);
      prose.push(...lines.slice(index, next));
      index = next;
      continue;
    }
    const head = /^\s*\|/.test(lines[index]) && TABLE_RULE.test(lines[index + 1] ?? '') ? splitRow(lines[index]) : null;
    if (!head || !isDefaultsHead(head)) {
      prose.push(lines[index]);
      index += 1;
      continue;
    }
    flush();
    const rows = [];
    for (index += 2; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) rows.push(splitRow(lines[index]));
    const list = (group) =>
      `<ul class="picks">${group
        .map(([decision = '', pick = '', alternative = '', word = '']) => {
          const say = word.replace(/`/g, '').trim();
          const alts = alternative
            .split(';')
            .map(clause)
            .filter(Boolean)
            .map((option, index) => `<li class="alt">${inline(option)} (alt)${index === 0 && say ? ` · say <code>${escapeHtml(say)}</code>` : ''}</li>`);
          return `<li>${inline(clause(decision))}<ul><li><strong>${inline(clause(pick))}</strong></li>${alts.join('')}</ul></li>`;
        })
        .join('')}</ul>`;
    const impact = impactColumn(head);
    if (impact < 0) {
      out.push(list(rows));
      continue;
    }
    const tierOf = (row) => headCell(row[impact] ?? '') || 'unsorted';
    for (const tier of new Set([...TIERS.keys(), ...rows.map(tierOf)])) {
      const group = rows.filter((row) => tierOf(row) === tier);
      if (group.length) out.push(`<h3>${escapeHtml(TIERS.get(tier) ?? tier[0].toUpperCase() + tier.slice(1))}</h3>${list(group)}`);
    }
  }
  flush();
  return out.join('');
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

const SHOT = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
const SHOT_TYPES = { '.gif': 'image/gif', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const DEMO_STEP = /^\d+[.)]\s+(.*)$/;

function demoSteps(lines) {
  const intro = [];
  const steps = [];
  for (const line of lines) {
    const step = line.match(DEMO_STEP);
    if (step) steps.push(step[1]);
    else if (steps.length && line.trim()) steps[steps.length - 1] += ` ${line.trim()}`;
    else if (!steps.length) intro.push(line);
  }
  return { intro, steps };
}

function assertDemo(plan, where) {
  const section = sectionNamed(plan, 'Demo');
  if (section && demoSteps(section.lines).steps.length === 0) {
    throw new Error(`## Demo in ${where} needs numbered steps in the order the owner tries them: where to go, what to do and what they see, with ![before](path) and ![after](path) frames when the UI changed`);
  }
}

function framesOrMainCheckout(base, root, plansDir) {
  const artifacts = `${join(plansDir, 'artifacts')}/`;
  return (path) => {
    const file = resolve(base, path);
    if (existsSync(file) || !file.startsWith(artifacts)) return file;
    const shared = join(mainCheckout(root), relative(root, file));
    return existsSync(shared) ? shared : file;
  };
}

function inlineShotHtml(label, path, locate) {
  const file = locate(path);
  const caption = label ? label[0].toUpperCase() + label.slice(1) : '';
  if (/^https?:\/\//.test(path)) {
    return `<figure class="shot missing"><figcaption>${escapeHtml(caption ? `${caption}: ` : '')}<a href="${escapeHtml(path)}">${escapeHtml(path)}</a></figcaption></figure>`;
  }
  const type = SHOT_TYPES[extname(file).toLowerCase()];
  if (!type || !existsSync(file)) {
    return `<figure class="shot missing"><figcaption>${escapeHtml(caption ? `${caption}: ` : '')}<code>${escapeHtml(path)}</code> ${type ? 'is not on this machine' : 'is not an image'}</figcaption></figure>`;
  }
  return `<figure class="shot"><img src="data:${type};base64,${readFileSync(file).toString('base64')}" alt="${escapeHtml(caption || path)}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
}

const LIGHTBOX = `<dialog class="lightbox"><img alt=""></dialog>
<script>
(() => {
  const viewer = document.querySelector('.lightbox');
  document.addEventListener('click', (event) => {
    const shot = event.target.closest('.shot img');
    if (shot) {
      viewer.querySelector('img').src = shot.src;
      viewer.querySelector('img').alt = shot.alt;
      viewer.showModal();
    } else if (event.target.closest('.lightbox')) viewer.close();
  });
})();
</script>`;

function demoHtml(section, locate) {
  const { intro, steps } = demoSteps(section.lines);
  const items = steps
    .map((step) => {
      const shots = [...step.matchAll(SHOT)].map(([, label, path]) => inlineShotHtml(label, path, locate));
      const text = step.replace(SHOT, '').replace(/\s+/g, ' ').trim();
      return `<li><p>${inline(text)}</p>${shots.length ? `<div class="shots">${shots.join('')}</div>` : ''}</li>`;
    })
    .join('');
  return `<section class="demo card"><h2>Demo</h2>${blocksHtml(intro)}<ol class="demo-steps">${items}</ol></section>`;
}

const TEACH_PARAGRAPHS = 3;
const TEACH_WORDS = 160;

function assertTeach(plan, where) {
  const section = sectionNamed(plan, 'Teach');
  if (!section) return;
  if (section.lines.some((line) => line.match(SHOT) && line.replace(SHOT, '').trim())) {
    throw new Error(`## Teach in ${where} puts a picture inside a sentence; give the pictures a line of their own, as ![before](path) ![after](path)`);
  }
  const paragraphs = section.lines
    .join('\n')
    .split(/\n\s*\n/)
    .map((block) => block.replace(SHOT, '').trim())
    .filter(Boolean);
  const words = wordCount(paragraphs.join(' '));
  if (paragraphs.length > TEACH_PARAGRAPHS || words > TEACH_WORDS) {
    throw new Error(`## Teach in ${where} runs ${paragraphs.length} paragraphs and ${words} words, where ${TEACH_PARAGRAPHS} paragraphs and ${TEACH_WORDS} words are the most; keep what someone new needs and leave the rest to the plan's other sections`);
  }
}

function teachHtml(section, locate) {
  const parts = [];
  let prose = [];
  for (const line of section.lines) {
    const shots = [...line.matchAll(SHOT)];
    if (!shots.length || line.replace(SHOT, '').trim()) {
      prose.push(line);
      continue;
    }
    parts.push(blocksHtml(prose), `<div class="shots">${shots.map(([, label, path]) => inlineShotHtml(label, path, locate)).join('')}</div>`);
    prose = [];
  }
  parts.push(blocksHtml(prose));
  return `<section class="plan"><h2>How it works</h2>${parts.join('')}</section>`;
}

function blocksHtml(lines) {
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
      html.push(tableHtml(head, rows));
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
  ['attention', /^attention:\s*/i],
];
const PICK_ANY = /^pick any\.?$/i;
const ATTENTION = { answer: ['needs you', 'red'], look: ['worth a look', 'amber'], safe: ['safe', 'green'] };
const LEVELS = Object.keys(ATTENTION);
const levelOf = (ask) => (ask.options.some((option) => option.recommended) ? (ATTENTION[ask.attention] ? ask.attention : 'look') : 'answer');

const splitCost = (text) => {
  const at = text.search(/\bCost:\s*/);
  return at < 0 ? [text.trim(), ''] : [text.slice(0, at).trim(), text.slice(at).replace(/^Cost:\s*/, '').trim()];
};

function questionGroups(sections) {
  const intro = [];
  const groups = [];
  const notes = [];
  for (const { lines, from = null, plan = null } of sections) {
    const last = notes.at(-1);
    const note = from && last?.from === from ? last : { from, plan, lines: [] };
    if (note === last) note.lines.push('');
    if (!from && intro.length) intro.push('');
    let own = null;
    for (const line of lines) {
      const heading = line.match(/^###\s+(.*)$/);
      if (heading) groups.push((own = { header: heading[1].trim(), lines: [], from, plan }));
      else (own?.lines ?? (from ? note.lines : intro)).push(line);
    }
    if (from && note !== last && note.lines.some((line) => line.trim())) notes.push(note);
  }
  return { intro, groups, notes };
}

function askOf({ header, lines, from, plan = null }) {
  const ask = { header, from, plan, lines, question: [], why: '', facts: [], options: [], reason: '', go: '', attention: '', multi: false, rest: [] };
  let last = null;
  for (const line of lines) {
    const text = line.trim();
    if (PICK_ANY.test(text)) ask.multi = true;
    if (!text || PICK_ANY.test(text)) {
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
  ask.attention = ask.attention.trim().toLowerCase().replace(/\.$/, '');
  return ask;
}

function missingParts(ask) {
  const picks = ask.options.filter((option) => option.recommended).length;
  return [
    !ask.question.join(' ').trim().endsWith('?') && 'a question line ending in ?',
    !ask.why && 'Why it needs you:',
    ask.options.length < 2 && 'two or more options',
    ask.options.some((option) => !option.cost) && 'a Cost: on every option',
    picks > 1 && !ask.multi && 'at most one (recommended) option, or a Pick any. line',
    picks > 0 && !ask.reason && 'Why I pick it:',
    picks > 0 && !ATTENTION[ask.attention] && 'Attention: safe, look or answer',
    picks === 0 && !ask.go && 'If you say go:',
  ].filter(Boolean);
}

const MEMO_WORDS = 15;
const MEMO_LABEL_WORDS = 3;
const MEMO_FACTS = 2;
function longParts(ask) {
  const parts = [
    ['the question', ask.question.join(' ')],
    ['Why it needs you:', ask.why],
    ...ask.facts.map((fact, index) => [`fact ${index + 1}`, fact]),
    ...ask.options.flatMap((option) => [[`"${option.label}"`, option.does], [`"${option.label}" Cost:`, option.cost]]),
    ['Why I pick it:', ask.reason],
    ['If you say go:', ask.go],
  ];
  return [
    ask.facts.length > MEMO_FACTS && `${ask.facts.length} facts, where ${MEMO_FACTS} is the most`,
    ...ask.options.filter((option) => wordCount(option.label) > MEMO_LABEL_WORDS).map((option) => `the label "${option.label}" at ${wordCount(option.label)} words, where ${MEMO_LABEL_WORDS} is the most`),
    ...parts.filter(([, text]) => wordCount(text) > MEMO_WORDS).map(([name, text]) => `${name} at ${wordCount(text)} words, where ${MEMO_WORDS} is the most`),
  ].filter(Boolean);
}

const PAGE_PARTS = ['Brief', 'Teach', 'Open questions', 'Defaults'];

function assertPlain(plan, where) {
  for (const title of PAGE_PARTS) {
    for (const { lines } of sectionsNamed(plan, title)) {
      const code = lines.find(isFence)?.trim() ?? lines.join('\n').match(/`[^`\n]+`/)?.[0];
      if (code) throw new Error(`## ${title} in ${where} holds code ${code}; the page shows this section, so write it in plain words and keep code in the plan's other sections`);
    }
  }
}

const listed = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0]);

function assertAsks(plan, where) {
  const { groups } = questionGroups(sectionsNamed(plan, 'Open questions'));
  for (const group of groups) {
    const ask = askOf(group);
    const fix = "write it as the decision memo in the plan-page skill's references/shape.md";
    const missing = missingParts(ask);
    if (missing.length) throw new Error(`"${group.header}" in ${where} needs ${listed(missing)}; ${fix}`);
    const long = longParts(ask);
    if (long.length) throw new Error(`"${group.header}" in ${where} runs long: ${listed(long)}; ${fix}`);
  }
}

const WORD_HUES = { waiting: 'orange', awaiting: 'orange', review: 'orange', reviewing: 'orange', reopened: 'pink', rework: 'pink', partial: 'amber' };
const STATE_HUES = { active: 'violet', held: 'red', planning: 'blue' };

function statusLead(status) {
  const text = status.trim();
  const lead = text.match(/^\W*((?:in\s+)?[a-z][a-z-]*)/i)?.[1] ?? '';
  const state = stateOf(text);
  const word = lead.toLowerCase().replace(/^in\s+/, '').replaceAll('-', '');
  const hue = state === 'done' ? (landed(text) ? 'green' : 'grey') : (WORD_HUES[word] ?? STATE_HUES[state] ?? 'grey');
  const rest = text.slice(text.indexOf(lead) + lead.length).replace(/^[\s,:;.]+/, '');
  return { lead, state, hue, rest };
}

function statusHtml(status, limit = Infinity) {
  const { lead, hue, rest } = statusLead(status);
  if (!lead) return `<span class="pill hue-grey">${escapeHtml(status.trim() || 'no status')}</span>`;
  const shown = rest.length > limit ? `${rest.slice(0, limit).replace(/\s+\S*$/u, '')}…` : rest;
  return `<span class="pill hue-${hue}">${escapeHtml(lead)}</span>${shown ? ` <span class="status-rest">${escapeHtml(shown)}</span>` : ''}`;
}

const modelHue = (name) => (/opus|claude|sonnet|haiku|fable/i.test(name) ? 'orange' : /astra/i.test(name) ? 'teal' : /sol\b/i.test(name) ? 'cyan' : /gpt|codex/i.test(name) ? 'blue' : 'indigo');

// Rows written before the seats format wrap the model in labels and notes, so a seat's name is the first word left once they go.
const seatName = (seat) =>
  seat
    .replace(/\([^)]*\)?/g, '')
    .replace(/@\w+/, '')
    .replace(/\bmissing\b/i, '')
    .replace(/^.*:\s+/, '')
    .replace(/^codex:/i, '')
    .trim()
    .split(/\s+/)[0];

const seatList = (seats) =>
  seats
    .split(/,\s*(?![^(]*\))/)
    .map((seat) => ({ name: seatName(seat), effort: seat.match(/@(\w+)/)?.[1] ?? '', missing: /\bmissing\b/i.test(seat) }))
    .filter((seat) => seat.name);

const seatChip = ({ name, effort, missing }, count = 1) =>
  `<span class="seat hue-${modelHue(name)}${missing ? ' missing' : ''}">${escapeHtml(name)}${effort ? ` <span class="effort">${escapeHtml(effort)}</span>` : ''}${missing ? ' <span class="effort">missing</span>' : ''}${count > 1 ? ` <span class="effort">×${count}</span>` : ''}</span>`;

function seatsHtml(seats) {
  return `<span class="seats">${seatList(seats)
    .map((seat) => seatChip(seat))
    .join('')}</span>`;
}

// Each panel round counts toward the lead whose row precedes it in the log, so a rerun shows which session reviewed what.
function leadSeats(entries) {
  const byLead = new Map();
  for (const entry of entries) {
    let lead = '';
    for (const row of logRowsOf(entry.path)) {
      if (row.phase === 'lead') lead = row.decision;
      if (!byLead.has(lead)) byLead.set(lead, new Map());
      if (row.phase !== 'panel' || !SEATS.test(row.decision)) continue;
      const seats = byLead.get(lead);
      for (const seat of seatList(row.decision.replace(SEATS, ''))) {
        const key = `${seat.name}@${seat.effort}${seat.missing ? ' missing' : ''}`;
        seats.set(key, { seat, count: (seats.get(key)?.count ?? 0) + 1 });
      }
    }
  }
  return [...byLead]
    .filter(([lead, seats]) => lead || seats.size)
    .map(([lead, seats]) => ({ lead: lead ? seatList(lead)[0] : null, seats: [...seats.values()] }));
}

const leadSeatsHtml = (entries) =>
  leadSeats(entries)
    .map(
      ({ lead, seats }) =>
        `${lead ? `<span class="round-tag"><span class="badge hue-grey">Lead</span><span class="seats">${seatChip(lead)}</span></span>` : ''}${seats.length ? `<span class="round-tag"><span class="badge hue-indigo">Reviews</span><span class="seats">${seats.map(({ seat, count }) => seatChip(seat, count)).join('')}</span></span>` : ''}`
    )
    .join('');

const roundTagHtml = (round, seats, suffix = '') => `<span class="round-tag"><span class="badge hue-indigo">Review round ${round}</span>${suffix}${seats ? seatsHtml(seats) : ''}</span>`;

const SEVERITY_HUES = { critical: 'red', warning: 'amber', nit: 'blue' };
const RESULT_HUES = { accepted: 'green', applied: 'green', fixed: 'green', verified: 'green', proven: 'green', kept: 'green', dismissed: 'grey', skipped: 'grey', superseded: 'grey', recorded: 'teal', decided: 'teal', corrected: 'teal', reverted: 'pink', deferred: 'amber', partial: 'amber', inconclusive: 'amber', open: 'red', gap: 'red', blocked: 'red' };

function findingHtml(decision, result) {
  const severity = decision.match(/^(\w+)/)?.[1];
  const hue = SEVERITY_HUES[severity];
  const body = hue ? `<span class="badge hue-${hue}">${escapeHtml(severity)}</span> ${inline(decision.slice(severity.length).trim())}` : inline(decision);
  const word = result.match(/^(\w+)/)?.[1]?.toLowerCase();
  const resultHtml = result ? ` <span class="tone hue-${RESULT_HUES[word] ?? 'grey'}">${inline(result)}</span>` : '';
  return `<li>${body}${resultHtml}</li>`;
}

const BRIEF_HUES = ['violet', 'red'];

const stepChecks = (plan) => (sectionNamed(plan, 'Steps')?.lines ?? []).flatMap((line) => line.match(/^\s*(?:\d+\.\s+)?[-*+]\s+\[([ xX])\]/)?.slice(1) ?? []).map((mark) => mark !== ' ');

function logRowsOf(planPath) {
  const log = planPath.replace(/\.md$/, '.decisions.tsv');
  if (!existsSync(log)) return [];
  return readFileSync(log, 'utf-8')
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [, phase = '', decision = '', , , result = ''] = line.split('\t');
      return { phase, decision, result };
    });
}

const STAGE_HINTS = {
  Plan: 'The plan file and its brief; the badges name the playbook poteto-mode picked.',
  Design: 'architect, prototype, arena, how or why explored the design.',
  'Plan review': 'interrogate panel rounds on the plan, before the build.',
  Build: 'Code written; the count is checked Steps.',
  Writing: 'deslop, no-comments and unslop cleanup passes.',
  'Code review': 'interrogate panel rounds on the code.',
  Verify: 'The verify skill or a proof run on the real app.',
  Audit: "show-me-your-work's decision-trail review: another model checks each decision-log claim against the conversation.",
  Ship: 'The work landed.',
  Reflect: 'Lessons saved with reflect.',
};
const WRITING_PASSES = ['deslop', 'no-comments', 'unslop'];
const CAN_BE_CURRENT = ['Design', 'Plan review', 'Build', 'Writing', 'Code review', 'Verify', 'Ship'];
const CURRENT_STATES = ['now', 'waiting', 'blocked'];

function flowOf(entry, status, playbooks) {
  const rows = logRowsOf(entry.path);
  const named = entry.plan.meta.playbook;
  const picked = named ? [...new Set([named, ...(playbooks.find((each) => each.name === named)?.extends ?? [])])] : [];
  const of = (stage) => rows.filter((row) => STAGE_PHASES[stage].includes(row.phase));
  const firstBuild = rows.findIndex((row) => STAGE_PHASES.Build.includes(row.phase));
  const panelRounds = (beforeBuild) => {
    const half = rows.filter((row, index) => STAGE_PHASES.Review.includes(row.phase) && (firstBuild < 0 || index < firstBuild) === beforeBuild);
    return half.filter((row) => SEATS.test(row.decision)).length || (half.length ? 1 : 0);
  };
  const handOffPhases = new Set(rows.filter((row) => isHandOffReview(row.phase)).map((row) => row.phase));
  const steps = stepChecks(entry.plan);
  const stepsDone = steps.filter(Boolean).length;
  const design = [...new Set(of('Design').map((row) => row.phase))];
  const passes = WRITING_PASSES.filter((pass) => of('Writing').some((row) => row.decision.toLowerCase().includes(pass)));
  const { lead, state, hue } = statusLead(status);
  const ended = state === 'done';
  const stages = [
    { label: 'Plan', ran: true, tools: picked },
    { label: 'Design', ran: design.length > 0, tools: design.filter((phase) => phase !== 'design') },
    { label: 'Plan review', rounds: panelRounds(true), tools: ['interrogate'] },
    { label: 'Build', ran: firstBuild >= 0 || stepsDone > 0, meta: steps.length ? `${stepsDone}/${steps.length}` : '' },
    { label: 'Writing', ran: of('Writing').length > 0, tools: passes },
    { label: 'Code review', rounds: panelRounds(false), tools: ['interrogate'] },
    { label: 'Verify', ran: of('Verify').length > 0 },
    { label: 'Audit', rounds: handOffPhases.size || (of('Audit').length ? 1 : 0), tools: ['show-me-your-work'] },
    { label: 'Ship', ran: landed(status) || of('Ship').length > 0 },
    { label: 'Reflect', ran: of('Reflect').length > 0 },
  ].map((stage) => {
    const ran = stage.ran ?? stage.rounds > 0;
    return { ...stage, ran, tools: ran ? (stage.tools ?? []) : [] };
  });
  const furthest = stages.findLastIndex((stage) => stage.ran);
  const phases = rows.map((row) => row.phase);
  const workOf = (index) => {
    const stage = stageOfRow(phases, index);
    const prosePass = stage === 'Writing' && (firstBuild < 0 || index < firstBuild);
    return CAN_BE_CURRENT.includes(stage) && !prosePass ? stage : null;
  };
  const worked = phases.findLastIndex((_, index) => workOf(index));
  const currentStage = worked < 0 ? (stepsDone > 0 ? 'Build' : 'Plan') : workOf(worked);
  const current = stages.findIndex((stage) => stage.label === currentStage);
  for (const [index, stage] of stages.entries()) stage.state = stage.ran ? 'done' : ended || index < current ? 'skipped' : 'left';
  if (ended && !landed(status)) stages.splice(furthest + 1, 0, { label: `${lead.charAt(0).toUpperCase()}${lead.slice(1)}`, state: 'stopped' });
  else if (!ended) stages[current].state = state === 'held' ? 'blocked' : hue === 'orange' ? 'waiting' : 'now';
  return stages;
}

const stageMeta = (stage) => [stage.rounds > 1 ? `×${stage.rounds}` : '', stage.meta ?? ''].filter(Boolean).join(' ');
const toolChips = (stage) => (stage.tools ?? []).map((tool) => `<span class="tool">${escapeHtml(tool)}</span>`).join('');

function flowRailHtml(stages) {
  return `<ol class="flow-rail">${stages
    .map((stage) => `<li class="fs ${stage.state}" title="${escapeHtml(STAGE_HINTS[stage.label] ?? stage.label)}">${escapeHtml(stage.label)}${stageMeta(stage) ? `<span class="fs-meta">${escapeHtml(stageMeta(stage))}</span>` : ''}${toolChips(stage)}</li>`)
    .join('<li class="arrow" aria-hidden="true">→</li>')}</ol>`;
}

// A plan that lists the plans it carries shows their work on its own rail: a stage ran when any of them ran it.
function mergedFlow(entries, status, playbooks) {
  const [leader, ...carried] = entries;
  const base = flowOf(leader, status, playbooks);
  if (!carried.length) return base;
  const flows = carried.map((entry) => flowOf(entry, entry.plan.meta.status ?? 'unknown', playbooks));
  const steps = entries.flatMap((entry) => stepChecks(entry.plan));
  return base.map((stage) => {
    const same = [stage, ...flows.flatMap((flow) => flow.filter((other) => other.label === stage.label))];
    const ran = same.some((other) => other.ran);
    return {
      ...stage,
      ran,
      state: ran && !CURRENT_STATES.includes(stage.state) ? 'done' : stage.state,
      tools: [...new Set(same.flatMap((other) => other.tools ?? []))],
      rounds: same.reduce((sum, other) => sum + (other.rounds ?? 0), 0),
      meta: stage.label === 'Build' && steps.length ? `${steps.filter(Boolean).length}/${steps.length}` : stage.meta,
    };
  });
}

function carriedPlans(entry, root) {
  const paths = listOf(entry.plan.meta, 'plans').map((path) => resolve(dirname(entry.path), path));
  const absent = paths.find((path) => !existsSync(path));
  if (absent) throw new Error(`${relative(root, entry.path)} lists ${relative(root, absent)} on its Plans: line, but that plan does not exist`);
  return paths.map((path) => ({ path, plan: parsePlan(readFileSync(path, 'utf-8')) }));
}

function askHtml(ask, index, anchor = '') {
  const style = `--c: var(--c-${ATTENTION[levelOf(ask)][1]})`;
  const tags = `${ask.plan ? ` data-plan="${escapeHtml(ask.plan)}"` : ''}${anchor}`;
  const head = `<h3><span class="n">${index + 1}</span><span>${ask.options.length ? inline(ask.question.join(' ')) : inline(ask.header)}${ask.from ? ` <span class="from">from ${inline(ask.from)}</span>` : ''}</span></h3>`;
  if (ask.options.length === 0) return `<article class="q" style="${style}"${tags}>${head}${blocksHtml(ask.lines)}</article>`;
  const picks = ask.options.filter((option) => option.recommended).map((option) => option.label);
  const type = ask.multi ? 'checkbox' : 'radio';
  const context = [ask.why && inline(ask.why), ...ask.facts.map((fact) => `<span class="fact">${inline(fact)}</span>`)].filter(Boolean).join(' ');
  const rows = ask.options
    .map((option) => `<label class="o"><input type="${type}" name="q${index}" value="${escapeHtml(option.label)}"${option.recommended ? ' checked' : ''}><b>${inline(option.label)}</b><span>${inline(option.does)}</span><span class="cost">${inline(option.cost)}</span>${option.recommended && ask.reason && !ask.multi ? `<span class="why">${inline(ask.reason)}</span>` : ''}</label>`)
    .join('');
  const after = picks.length === 0 ? `<p class="nopick">${inline(ask.go || 'No pick: choose one.')}</p>` : ask.multi && ask.reason ? `<p class="why-all">${inline(ask.reason)}</p>` : '';
  return `<article class="q" style="${style}"${tags} data-title="${escapeHtml(ask.header)}" data-multi="${ask.multi ? 1 : 0}" data-default="${escapeHtml(JSON.stringify(picks))}">${head}${context ? `<p class="ctx">${context}</p>` : ''}<div class="opts" role="${ask.multi ? 'group' : 'radiogroup'}"><span class="hd"></span><span class="hd"></span><span class="hd">Then</span><span class="hd">Cost</span>${rows}</div>${blocksHtml(ask.rest)}${after}</article>`;
}

const ANSWER_SCRIPT = `<script>
(() => {
  const root = document.querySelector('.needs');
  const bar = root.querySelector('.bar');
  const text = bar.querySelector('code');
  const copy = bar.querySelector('button');
  const update = () => {
    const changed = [];
    const missing = [];
    for (const q of root.querySelectorAll('.q[data-title]')) {
      for (const input of q.querySelectorAll('input')) input.closest('.o').classList.toggle('is-selected', input.checked);
      const chosen = [...q.querySelectorAll('input:checked')].map((input) => input.value);
      const picks = JSON.parse(q.dataset.default);
      if (q.dataset.multi !== '1' && chosen.length === 0) {
        missing.push(q.dataset.title);
        continue;
      }
      if (chosen.length !== picks.length || chosen.some((value) => !picks.includes(value))) changed.push(q.dataset.title + ': ' + (chosen.join(', ') || 'none'));
    }
    bar.className = 'bar ' + (missing.length ? 'is-missing' : changed.length ? 'is-changed' : 'is-default');
    text.textContent = missing.length ? 'Answer ' + missing.join(', ') : changed.length ? 'go, except ' + changed.join('; ') : 'go';
    copy.disabled = missing.length > 0;
    copy.textContent = 'Copy';
  };
  root.addEventListener('change', update);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text.textContent);
      copy.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(text);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      copy.textContent = 'Selected';
    }
  });
  update();
})();
</script>`;

const PICK_LEVEL = /\s*\((look|answer)\)\s*$/iu;

export function planParts(entry) {
  const { plan } = entry;
  const answers = briefOf(plan);
  const answer = (index) => answers?.find(({ question }) => sameText(question) === sameText(BRIEF[index]))?.lines.join(' ').replace(/\s+/gu, ' ').trim() ?? '';
  const { intro, groups } = questionGroups(sectionsNamed(plan, 'Open questions'));
  const unheaded = intro.some((line) => line.trim()) ? [{ header: null, lines: intro, from: null }] : [];
  const asks = [...unheaded, ...groups].map(askOf).map((ask) => ({
    header: ask.header,
    question: ask.question.join(' '),
    why: ask.why,
    facts: ask.facts,
    options: ask.options,
    reason: ask.reason,
    go: ask.go,
    attention: levelOf(ask),
    multi: ask.multi,
    lines: ask.options.length ? [] : ask.lines.map((line) => line.trim()).filter(Boolean),
    rest: ask.rest.map((line) => line.trim()).filter(Boolean),
  }));
  const picks = sectionsNamed(plan, 'Defaults').flatMap((section) =>
    tablesOf(section.lines)
      .filter((table) => isDefaultsHead(table.head))
      .flatMap(({ head, rows }) =>
        rows.flatMap((row) => {
          const [decision = '', pick = '', alternative = '', word = ''] = row;
          const level = pick.match(PICK_LEVEL)?.[1].toLowerCase();
          return level ? [{ decision, pick: pick.replace(PICK_LEVEL, ''), alternative, word, impact: row[impactColumn(head)] ?? '', level }] : [];
        })
      )
  );
  return { title: plan.title || basename(entry.path, '.md'), status: plan.meta.status ?? '', brief: answers ? { changes: answer(0), risks: answer(1) } : null, asks, picks };
}

function needsSection(sections, lead) {
  const { intro, groups, notes } = questionGroups(sections);
  const anchored = new Set([lead]);
  const anchorOnce = (plan) => {
    if (!plan || anchored.has(plan)) return '';
    anchored.add(plan);
    return ` id="run-${escapeHtml(slugOf(plan))}"`;
  };
  const noteHtml = () => notes.map((note) => `<p class="from" data-plan="${escapeHtml(note.plan)}"${anchorOnce(note.plan)}>from ${inline(note.from)}</p>${blocksHtml(note.lines)}`).join('');
  if (groups.length === 0) return `<section class="needs"><div class="needs-head"><h2>Needs you</h2></div>${blocksHtml(intro)}${noteHtml()}</section>`;
  const asks = groups.map(askOf).sort((a, b) => LEVELS.indexOf(levelOf(a)) - LEVELS.indexOf(levelOf(b)));
  const legend = LEVELS.map((level) => [level, asks.filter((ask) => levelOf(ask) === level).length])
    .filter(([, count]) => count)
    .map(([level, count]) => `<span class="lg" style="--c: var(--c-${ATTENTION[level][1]})">${count} ${ATTENTION[level][0]}</span>`)
    .join('');
  const answerable = asks.some((ask) => ask.options.length);
  const items = asks.map((ask, index) => askHtml(ask, index, anchorOnce(ask.plan))).join('');
  const others = noteHtml();
  return `<section class="needs" style="--frame: var(--c-${ATTENTION[levelOf(asks[0])][1]})"><div class="needs-head"><h2>Needs you</h2>${legend}</div>${blocksHtml(intro)}${items}${others}${answerable ? '<div class="bar" aria-live="polite"><code></code><button type="button">Copy</button></div>' : ''}</section>${answerable ? ANSWER_SCRIPT : ''}`;
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
    const field = line.match(/^(Status|Page|Topic|Playbook|Plans):\s*(.*)$/);
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
  let round = 0;
  return logRowsOf(planPath).flatMap(({ phase, decision, result }) => {
    if (phase === 'panel') {
      if (SEATS.test(decision)) round += 1;
      return [{ kind: 'panel', round, decision, result }];
    }
    return isHandOffReview(phase) ? [{ kind: 'hand-off', decision, result }] : [];
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

const isOpen = (entry) => !finished(entry.plan.meta.status ?? '');

function contextOf(planPath) {
  const plan = parsePlan(readFileSync(planPath, 'utf-8'));
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: dirname(planPath),
    encoding: 'utf-8',
  }).trim();
  const repoPath = relative(root, planPath);
  const { playbooks, topic, branch } = pageConfig(root);
  const plansDir = dirname(planPath);
  const named = subjectOf(plan, topic);
  const namedPath = named && join(plansDir, 'topics', `${named}.md`);
  const missingSubject = namedPath && !existsSync(namedPath) ? { subject: named, hint: `create ${relative(root, namedPath)} with a # title and its ## Main changes; the first publish adds its Page: line` } : null;
  const subject = missingSubject ? null : named;
  const subjectPath = subject && namedPath;
  const doc = subjectPath ? parsePlan(readFileSync(subjectPath, 'utf-8')) : plan;
  const iterations = subject ? iterationsOf(plansDir, subject, topic) : [];
  return { plan, root, repoPath, playbooks, topic, branch, plansDir, subject, subjectPath, doc, iterations, missingSubject };
}

function stagesOf(planPath) {
  const { plan, root, playbooks } = contextOf(planPath);
  const self = { path: planPath, plan };
  return mergedFlow([self, ...carriedPlans(self, root)], plan.meta.status ?? 'unknown', playbooks);
}

function rail(planPath) {
  const { plan, root, repoPath, playbooks, subjectPath } = contextOf(planPath);
  const self = { path: planPath, plan };
  const status = plan.meta.status ?? 'unknown';
  let reason = null;
  let entries = [self];
  try {
    page(planPath);
    entries = [self, ...carriedPlans(self, root)];
  } catch (error) {
    reason = error.message;
  }
  const steps = entries.flatMap((entry) => stepChecks(entry.plan));
  return {
    requestedPlan: repoPath,
    page: pageUrlOf(root, subjectPath ?? planPath).url,
    status,
    valid: !reason,
    ...(reason ? { reason } : {}),
    steps: { checked: steps.filter(Boolean).length, total: steps.length },
    stages: mergedFlow(entries, status, playbooks).map(({ label, state, meta, tools, rounds }) => ({
      label,
      state,
      ...(meta ? { meta } : {}),
      ...(tools?.length ? { tools } : {}),
      ...(rounds > 1 ? { rounds } : {}),
    })),
  };
}

// One section order for a page with a brief and for the PR body; each output renders a part its own way or leaves it out.
const BRIEF_ORDER = ['teach', 'ontop', 'demo', 'moved', 'needs', 'picked', 'api', 'lead', 'main', 'idea', 'verification', 'scope', 'plans'];
const isOpenWork = (section) => sameText(section.title) === 'open work';
const isVerification = (section) => sameText(section.title) === 'verification';

export const blobFacts = (root, paths) => {
  const blobs = execFileSync('git', ['hash-object', '--', ...paths], { cwd: root, encoding: 'utf-8' }).trim().split('\n');
  return new Map(paths.map((path, index) => [path, { blob: blobs[index], history: [], landed: false }]));
};

function page(planPath, { folded = false, now = new Date(), session = process.env.CLAUDE_CODE_SESSION_ID ?? null, facts = blobFacts } = {}) {
  const { plan, root, repoPath, playbooks, topic, plansDir, subject, subjectPath, doc, iterations, missingSubject } = contextOf(planPath);
  const frames = framesOrMainCheckout(dirname(planPath), root, plansDir);
  if (missingSubject) {
    if (plan.fields.topic) throw new Error(`${repoPath} belongs to topic ${missingSubject.subject}; ${missingSubject.hint}`);
    console.error(`${repoPath} renders its own page until its subject has a file: ${missingSubject.hint}`);
  }
  const status = plan.meta.status ?? 'unknown';
  const self = { path: planPath, plan };
  const subjectWhere = subjectPath && relative(root, subjectPath);
  for (const entry of iterations) {
    if (!stateOf(entry.plan.meta.status ?? '')) {
      throw new Error(
        `${relative(root, entry.path)} needs a Status: line that starts with a state word, such as ${STATES.planning[0]}, ${STATES.active[0]} or ${STATES.done[4]}, because its subject page reads it`
      );
    }
  }
  // An executed plan stays as written, so a playbook renamed since then falls back to every playbook's sections.
  const known = !plan.meta.playbook || !finished(status) || playbooks.some((entry) => entry.name === plan.meta.playbook);
  const { lead, pairs, require } = pageSections(playbooks, known ? plan.meta.playbook : null, repoPath);
  const isChange = (section) => {
    const role = roleOf(section, lead);
    return ['api', 'lead', 'main'].includes(role) || (role === 'idea' && Boolean(sectionNamed(doc, section.title)));
  };
  const owesBrief = (entry) => Boolean(briefOf(entry.plan)) || (entry.path === planPath && Boolean(stateOf(entry.plan.meta.status ?? '')));
  for (const entry of doc === plan ? [self] : iterations.filter(isOpen)) {
    const where = relative(root, entry.path);
    pageSections(playbooks, entry.plan.meta.playbook, where);
    assertPairs(entry.plan.sections, pairs, where);
    if (!finished(entry.plan.meta.status ?? '')) assertDefaults(entry.plan, where);
    if (!finished(entry.plan.meta.status ?? '') && owesBrief(entry)) assertBrief(entry.plan, where);
    assertDemo(entry.plan, where);
    if (stateOf(entry.plan.meta.status ?? '') && !finished(entry.plan.meta.status ?? '')) {
      assertAsks(entry.plan, where);
      assertPlain(entry.plan, where);
      assertTeach(entry.plan, where);
    }
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
  const sectionHtml = (section, className = 'plan', tag = '') =>
    `<section class="${className}"><h2>${inline(section.title)}${tag ? ` <span class="count">${tag}</span>` : ''}</h2>${blocksHtml(section.lines)}</section>`;
  const pickedHtml = (section) => `<section class="plan"><h2>Picked for you</h2>${picksHtml(section.lines)}</section>`;
  const changeHtml = (role) =>
    byRole(role)
      .sort((a, b) => lead.indexOf(a.title.toLowerCase()) - lead.indexOf(b.title.toLowerCase()))
      .map((section) => sectionHtml(section, 'panel'))
      .join('\n  ');
  // A page with a brief shows no History, and an ask that is not a decision lives only in its plan's Status line.
  const needsOf = (withStatus) => [
    ...byRole('needs', plan).map((section) => ({ ...section, plan: repoPath })),
    ...iterations
      .filter((entry) => entry.path !== planPath)
      .flatMap((entry) => {
        const status = entry.plan.meta.status ?? '';
        const waits = withStatus && !finished(status) ? [[status[0].toUpperCase() + status.slice(1)]] : [];
        return [...waits, ...byRole('needs', entry.plan).map((section) => section.lines)].map((lines) => ({ lines, from: entry.plan.title || basename(entry.path, '.md'), plan: relative(root, entry.path) }));
      }),
  ];
  const needs = needsOf(false);
  const [close] = byRole('close', plan);
  const iterationHtml = ({ path, plan: iteration }) => {
    const iterationStatus = iteration.meta.status ?? 'unknown';
    const open = !finished(iterationStatus);
    const shown = iteration.sections.filter(
      (section) =>
        hasContent(section) &&
        (/^main changes$/i.test(section.title) ||
          (open && /^(open questions|defaults)$/i.test(section.title)))
    );
    const head = `${statusHtml(iterationStatus)} <strong>${inline(iteration.title || basename(path, '.md'))}</strong> <code>${escapeHtml(relative(root, path))}</code>`;
    const body = shown.map((section) => `<h3>${inline(section.title)}</h3>${blocksHtml(section.lines)}`).join('');
    return body
      ? `<details open class="iteration"><summary>${head}</summary>${body}</details>`
      : `<p class="iteration">${head}</p>`;
  };
  const iterationList = iterations.length
    ? `<section class="plan"><h2>History <span class="count">${iterations.length}</span></h2>${iterations.map(iterationHtml).join('')}</section>`
    : '';
  const details = doc === plan ? byRole('details', plan) : [];
  const hubPath = subject && topic.hub ? topic.hub.replaceAll('{topic}', subject) : null;
  const hub = hubPath && existsSync(join(root, hubPath)) ? hubPath : null;
  const brief = briefOf(plan);
  if (hub) {
    const shown = brief ? [subjectPath, planPath] : [subjectPath];
    for (const required of require) {
      if (![doc, brief && plan].some((source) => source && hasContent(sectionNamed(source, required)))) {
        throw new Error(`${subject} needs ## ${required} in ${shown.map((path) => relative(root, path)).join(' or ')}, the sources its page shows, because its hub exists and page-require names it`);
      }
    }
  }
  const reviewed = (doc === plan ? [self] : iterations)
    .map((entry) => ({ entry, rounds: reviewRounds(reviewRows(entry.path)) }))
    .filter(({ rounds }) => rounds.length);
  const paneled = reviewed.filter(({ rounds }) => rounds.some((entry) => entry.kind === 'panel'));
  const tagged = paneled.find(({ entry }) => entry.path === planPath) ?? paneled[0];
  const latest = tagged?.rounds.findLast((entry) => entry.kind === 'panel');
  // The header's seats cover the leading plan, so only a round on another iteration keeps its own tag.
  const reviewTag = latest && tagged.entry.path !== planPath
    ? roundTagHtml(latest.round, latest.seats, ` for ${inline(tagged.entry.plan.title || basename(tagged.entry.path, '.md'))}`)
    : '';
  const roundsHtml = (rounds, heading) =>
    rounds
      .map(
        (entry) =>
          `<${heading}>${entry.kind === 'panel' ? `Round ${entry.round}` : 'Hand-off review'}${entry.seats ? ` ${seatsHtml(entry.seats)}` : ''}</${heading}><ul class="findings">${entry.findings
            .map((row) => findingHtml(row.decision, row.result ?? ''))
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
  const carried = carriedPlans(self, root);
  const entries = [self, ...carried];
  const headerFlow = `<div class="flow">${flowRailHtml(mergedFlow(entries, status, playbooks))}</div>`;
  const carriedTag = carried.length
    ? `<span>Plans ${carried.map((entry) => `<strong>${inline(entry.plan.title || basename(entry.path, '.md'))}</strong>`).join(', ')}</span>`
    : '';
  const planTag = doc !== plan ? `<span>Plan <strong>${inline(plan.title || basename(planPath, '.md'))}</strong></span>` : '';
  const sentence = status.trim();
  const statusLine = sentence ? `<p class="status-line">${inline(sentence[0].toUpperCase() + sentence.slice(1))}</p>` : '';
  const title = escapeHtml(doc.title || basename(planPath, '.md'));
  const where = subjectPath ? relative(root, subjectPath) : repoPath;
  const headerTag = `<header id="run-${escapeHtml(slugOf(repoPath))}" data-plan="${escapeHtml(repoPath)}">`;
  const shown = [...new Set([planPath, ...iterations.map((entry) => entry.path), ...carried.map((entry) => entry.path)])];
  const planFacts = facts(root, shown);
  const at = now.toISOString();
  const data = {
    v: 1,
    lead: repoPath,
    session,
    at,
    // The body shows the lead's whole hand-back but only another iteration's questions, and no carried plan's.
    plans: [self, ...iterations.filter((entry) => entry.path !== planPath)].map(({ path, plan: entry }) => ({
      plan: relative(root, path),
      slug: slugOf(path),
      title: entry.title || basename(path, '.md'),
      ...planFacts.get(path),
      ...(path === planPath ? { shows: 'all', session, at } : { shows: 'asks' }),
      done: finished(entry.meta.status ?? ''),
    })),
  };
  const briefMain = () => {
    const asks = needsOf(true);
    const asking = asks.length ? needsSection(asks, repoPath) : '';
    const answers = brief
      .map((answer) => ({ answer, index: BRIEF.findIndex((question) => sameText(question) === sameText(answer.question)) }))
      .filter(({ index }) => index >= 0)
      .map(({ answer, index }) => `<div class="qa hue-${BRIEF_HUES[index]}"><h2 title="${escapeHtml(answer.question)}">${BRIEF_LABELS[index]}</h2>${blocksHtml(answer.lines)}</div>`)
      .join('');
    const planLead = byRole('lead', plan);
    const currentLead = doc === plan ? [] : byRole('lead').filter((section) => !planLead.some((own) => sameText(own.title) === sameText(section.title)));
    const files = [planPath, subjectPath, ...carried.map((entry) => entry.path)]
      .filter(Boolean)
      .map((path) => `<code>${escapeHtml(relative(root, path))}</code>`);
    const parts = {
      teach: () => byRole('teach', plan).map((section) => teachHtml(section, frames)),
      ontop: () => byRole('ontop', plan).map((section) => sectionHtml(section)),
      demo: () => byRole('demo', plan).map((section) => demoHtml(section, frames)),
      needs: () => [asking, MOUNTS.others],
      picked: () => byRole('picked', plan).map((section) => pickedHtml(section)),
      api: () => byRole('api', plan).map((section) => sectionHtml(section)),
      lead: () =>
        [...planLead, ...currentLead]
          .sort((a, b) => lead.indexOf(a.title.toLowerCase()) - lead.indexOf(b.title.toLowerCase()))
          .map((section) => sectionHtml(section, 'plan', currentLead.includes(section) ? 'current' : '')),
      main: () => byRole('main', plan).map((section) => sectionHtml(section)),
      idea: () => byRole('idea', plan).filter((section) => !isOpenWork(section)).map((section) => sectionHtml(section)),
      // Proof stays in the plan file while work runs; a finished plan shows how far it is proven.
      verification: () => (finished(status) ? byRole('details', plan).filter(isVerification).map((section) => sectionHtml(section)) : []),
      scope: () => byRole('idea', plan).filter(isOpenWork).map((section) => sectionHtml(section)),
      plans: () => [`<p class="source">Proof, steps, history and review rounds are in ${listed(files)}.</p>`],
    };
    return `<main>
  ${headerTag}
    <h1>${title}</h1>
    ${headerFlow}
    ${statusLine}
    <div class="meta">${planTag}${carriedTag}${leadSeatsHtml(entries)}<span>Updated ${updated} UTC</span></div>
  </header>
  ${MOUNTS.live}
  <section class="brief card">${answers}</section>
  ${BRIEF_ORDER.flatMap((key) => parts[key]?.() ?? [])
    .filter(Boolean)
    .join('\n  ')}
</main>`;
  };

  const withViewer = (main) => (main.includes('<figure class="shot"><img') ? main.replace(/<\/main>$/, `${LIGHTBOX}\n</main>`) : main);
  const html = `<title>${title}</title>
${PAGE_HEAD}
${withViewer(brief ? briefMain() : `<main>
  ${headerTag}
    <h1>${title}</h1>
    ${headerFlow}
    ${statusLine}
    <div class="meta"><code>${escapeHtml(where)}</code>${planTag}${hub ? `<span>History <code>${escapeHtml(hub)}</code></span>` : ''}${carriedTag}${leadSeatsHtml(entries)}${reviewTag}<span>Updated ${updated} UTC</span></div>
  </header>
  ${MOUNTS.live}
  ${byRole('demo', plan).map((section) => demoHtml(section, frames)).join('')}
  ${needs.length ? needsSection(needs, repoPath) : ''}${MOUNTS.others}${close ? sectionHtml(close, 'panel') : ''}
  ${byRole('teach', plan).map((section) => teachHtml(section, frames)).join('')}
  ${changeHtml('api')}
  ${changeHtml('lead')}
  ${changeHtml('main')}
  ${byRole('picked', plan)
    .map((section) => pickedHtml(section))
    .join('\n  ')}
  ${doc.lead.some((line) => line.trim()) ? `<section class="plan">${blocksHtml(doc.lead)}</section>` : ''}
  ${[...byRole('ontop'), ...byRole('idea')]
    .map((section) => sectionHtml(section))
    .join('\n  ')}
  ${iterationList}
  ${
    details.length
      ? `<details open class="details"><summary>Details: ${details
          .map((section) => escapeHtml(section.title.toLowerCase()))
          .join(', ')}</summary>${details.map((section) => sectionHtml(section)).join('')}</details>`
      : ''
  }
  ${reviewHistory}
</main>`)}
${dataBlock(data)}
${DECK_SCRIPT}
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>
window.hljs?.highlightAll();
document.querySelectorAll('.diff code').forEach((element) => window.hljs?.highlightElement(element));
</script>
`;
  return { html, name: subject ? join('topics', subject) : basename(planPath, '.md') };
}

const PR_START = '<!-- plan-page:start -->';
const PR_END = '<!-- plan-page:end -->';
const FRAME_NOTE = /^<!-- frame: (\S+) -->$/;

const seatMd = ({ name, effort, missing }) => `\`${name}\`${effort ? ` \`${effort}\`` : ''}${missing ? ' missing' : ''}`;

function githubOf(root) {
  try {
    const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const repo = git('remote', 'get-url', 'origin').match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
    return repo ? { repo, sha: git('rev-parse', 'HEAD') } : null;
  } catch {
    // A checkout without a GitHub origin or a commit links plans by path instead.
    return null;
  }
}

function blobLinker(github, root) {
  if (!github) return null;
  // A plan the commit does not hold, such as an uncommitted one, would link to a 404, so it is named by path.
  return (path) => {
    const where = relative(root, path);
    try {
      execFileSync('git', ['cat-file', '-e', `${github.sha}:${where}`], { cwd: root, stdio: 'ignore' });
      return `https://github.com/${github.repo}/blob/${github.sha}/${where}`;
    } catch {
      return null;
    }
  };
}

const PATH_NOTE = /^\s*(?:\/\/|#|<!--)/;

function unifiedDiff(before, after) {
  // Each fence opens with its path note; one copy of the after note says where the change lives.
  const [beforeHead, ...beforeRest] = before.split('\n');
  const [afterHead, ...afterRest] = after.split('\n');
  if (PATH_NOTE.test(beforeHead) && PATH_NOTE.test(afterHead)) return [` ${afterHead}`, ...unifiedDiff(beforeRest.join('\n'), afterRest.join('\n'))];
  if (!before.trim()) return after.split('\n').map((line) => `+${line}`);
  if (!after.trim()) return before.split('\n').map((line) => `-${line}`);
  const out = [];
  let removed = [];
  let added = [];
  for (const [left, right] of lineDiff(before, after)) {
    if (left?.kind === 'same') {
      out.push(...removed, ...added, ` ${left.text}`);
      removed = [];
      added = [];
      continue;
    }
    if (left) removed.push(`-${left.text}`);
    if (right) added.push(`+${right.text}`);
  }
  return [...out, ...removed, ...added];
}

function sectionMd(lines, paired) {
  const out = [];
  for (let index = 0; index < lines.length; ) {
    if (!isFence(lines[index])) {
      out.push(lines[index]);
      index += 1;
      continue;
    }
    const pair = readFencePair(lines, index);
    const end = paired && pair.after ? pair.next : pair.first.next;
    if (paired && pair.after) out.push('```diff', ...unifiedDiff(pair.first.body, pair.after.body), '```');
    else out.push(...lines.slice(index, end));
    index = end;
  }
  return out;
}

function picksMd(lines) {
  const out = [];
  for (let index = 0; index < lines.length; ) {
    const head = /^\s*\|/.test(lines[index]) && TABLE_RULE.test(lines[index + 1] ?? '') ? splitRow(lines[index]) : null;
    if (!head || !isDefaultsHead(head)) {
      out.push(lines[index]);
      index += 1;
      continue;
    }
    const rows = [];
    for (index += 2; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) rows.push(splitRow(lines[index]));
    // The attention tag rates a pick for the owner, not for a reviewer.
    const plain = (cell) => clause(cell.replace(/\s*\((?:safe|look|answer)\)\s*$/iu, ''));
    const list = (group) =>
      group.flatMap(([decision = '', pick = '', alternative = '']) => [
        `- ${clause(decision)}`,
        `  - **${plain(pick)}**`,
        ...alternative.split(';').map(clause).filter(Boolean).map((option) => `  - ${option} (alt)`),
      ]);
    const impact = impactColumn(head);
    if (impact < 0) {
      out.push(...list(rows));
      continue;
    }
    // A reviewer weighs the big calls; smaller ones stay in the plan.
    out.push(...list(rows.filter((row) => headCell(row[impact] ?? '') === 'big')));
  }
  return out;
}

// A local frame goes up through `gh --attach`, which rewrites its reference; the note keeps the uploaded link for the next sync.
function frameMd(label, path, base, root, uploaded, attach) {
  const caption = label ? label[0].toUpperCase() + label.slice(1) : '';
  if (/^https?:\/\//.test(path)) {
    const image = SHOT_TYPES[extname(new URL(path).pathname).toLowerCase()];
    return [caption, image ? `![${label}](${path})` : path].filter(Boolean);
  }
  const file = `./${relative(root, resolve(base, path))}`;
  const known = uploaded.get(file);
  if (!known) attach.add(file);
  return [caption, `<!-- frame: ${file} -->\n${known ?? `![${label}](${file})`}`].filter(Boolean);
}

function uploadedFrames(body) {
  const lines = body.split('\n');
  const frames = new Map();
  lines.forEach((line, index) => {
    const note = line.match(FRAME_NOTE);
    if (note && /https?:\/\//.test(lines[index + 1] ?? '')) frames.set(note[1], lines[index + 1]);
  });
  return frames;
}

const CHECK_STAGES = ['Design', 'Plan review', 'Code review', 'Verify', 'Audit'];

// Every PR runs the same rail, so the body names only what varies: the playbooks and the checks that did not run.
function prProcess(entries, playbooks) {
  const flow = mergedFlow(entries, entries[0].plan.meta.status ?? 'unknown', playbooks);
  const named = [...new Set(entries.map((entry) => entry.plan.meta.playbook).filter(Boolean))];
  const skipped = CHECK_STAGES.filter((label) => !flow.some((stage) => stage.label === label && stage.ran));
  return [
    named.length ? `${named.map((name) => `\`${name}\``).join(', ')}` : '',
    skipped.length ? `not run: ${skipped.join(', ').toLowerCase()}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

const prModels = (entries) =>
  leadSeats(entries).flatMap(({ lead, seats }) => [
    lead ? `- \`${[lead.name, lead.effort].filter(Boolean).join(' ')}\`` : '- Lead not logged',
    ...seats.map(({ seat, count }) => `  - ${seatMd(seat)}${count > 1 ? ` ×${count}` : ''}`),
  ]);

// With since, the body is a comment on someone else's PR about the commits after theirs; against is the PR's description.
function prBody(planPath, existing = '', { since = null, against = '' } = {}) {
  page(planPath);
  const { plan, root, playbooks } = contextOf(planPath);
  const where = relative(root, planPath);
  const flag = since ? '--comment' : '--pr';
  const output = since ? 'PR comment' : 'PR body';
  if (since) {
    try {
      execFileSync('git', ['cat-file', '-e', `${since}^{commit}`], { cwd: root, stdio: 'ignore' });
    } catch {
      throw new Error(`--comment names ${since}, which is not a commit in this checkout; fetch the PR's head and pass the author's last commit before yours`);
    }
    // The compare link runs from the author's commit to this checkout's head, so the checkout must hold the pushed PR head.
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', since, 'HEAD'], { cwd: root, stdio: 'ignore' });
    } catch {
      throw new Error(`--comment names ${since}, which this checkout's HEAD does not contain; render from a checkout at the PR's pushed head`);
    }
  }
  if (!briefOf(plan)) throw new Error(`${where} needs a ## Brief before ${flag}, because the ${output} opens with its Changes and Risks`);
  assertBrief(plan, where);
  assertTeach(plan, where);
  assertPlain(plan, where);
  if (/\bPR\s*#?\d+/i.test(plan.title)) throw new Error(`${where} is titled "${plan.title}"; the ${output} links its plan by title, so name the change instead of the PR`);
  const selfReference = briefOf(plan).find(({ lines }) => /\bPR\s*#?\d+/i.test(lines.join(' ')));
  if (selfReference) throw new Error(`## Brief in ${where} names a PR number in "${selfReference.question}"; the ${output} opens with the brief, so say what changes for a reviewer instead`);
  // A brief still in the future tense was written before the build, not rewritten for the reviewer.
  const promised = briefOf(plan).find(({ question, lines }) => sameText(question) === sameText(BRIEF[0]) && /\bwill\b/i.test(lines.join(' ')));
  if (promised) throw new Error(`## Brief in ${where} answers "${promised.question}" with "will"; at PR time say what the PR changes, for a reviewer`);
  const self = { path: planPath, plan };
  const carried = carriedPlans(self, root);
  const entries = [self, ...carried];
  // A PR plan is often written by another playbook than the plans it carries, so each plan's playbook adds the sections it names.
  const pr = [
    ...new Set(
      entries.flatMap(({ path, plan: each }) => {
        const name = each.meta.playbook;
        const known = !name || PSTACK_PLAYBOOKS.includes(name) || playbooks.some((entry) => entry.name === name);
        return pageSections(playbooks, known ? name : null, relative(root, path)).pr;
      })
    ),
  ];
  const { lead, pairs } = pageSections(playbooks, plan.meta.playbook, where);
  const sections = (role) => plan.sections.filter((section) => roleOf(section, lead) === role && section.lines.some((line) => line.trim()));
  const base = dirname(planPath);
  const uploaded = uploadedFrames(existing);
  const attach = new Set();
  const github = githubOf(root);
  const blob = blobLinker(github, root);
  const link = (entry) => {
    const title = entry.plan.title || basename(entry.path, '.md');
    const url = blob?.(entry.path);
    return url ? `[${title}](${url})` : `${title} (\`${relative(root, entry.path)}\`)`;
  };
  // A clip the description already shows is not shown again, and neither is a step whose clips all are.
  const repeated = (path) => Boolean(against) && /^https?:\/\//.test(path) && against.includes(path);
  const frames = (text) =>
    [...text.matchAll(SHOT)].filter(([, , path]) => !repeated(path)).flatMap(([, label, path]) => ['', ...frameMd(label, path, base, root, uploaded, attach).flatMap((part) => [part, ''])]);
  const fresh = (step) => {
    const paths = [...step.matchAll(SHOT)].map(([, , path]) => path);
    return !paths.length || !paths.every(repeated);
  };
  const brief = briefOf(plan).map(({ question, lines }) => {
    const index = BRIEF.findIndex((asked) => sameText(asked) === sameText(question));
    const body = lines.join('\n').trim().split('\n');
    // Changes opens the body as its summary; GitHub's Caution box already titles the risks.
    return index === 0 ? [...body, ''] : ['> [!CAUTION]', ...body.map((line) => (line.trim() ? `> ${line}` : '>')), ''];
  });
  const titled = (title, lines) => (lines.some((line) => line.trim()) ? [`## ${title}`, '', ...lines, ''] : []);
  const filled = (section) => (section?.lines.some((line) => line.trim()) ? section : null);
  const process = prProcess(entries, playbooks);
  const models = prModels(entries);
  if (models.length) models[0] = [models[0], process].filter(Boolean).join(' · ');
  else if (process) models.push(process);
  // A reviewer needs what the PR leaves out, not who tracks it or where its run files sit.
  const followUps = (lines) =>
    lines.map((line) => {
      const item = line.match(/^(\s*[-*+]\s+)(.*)$/);
      if (!item) return line;
      const head = item[2].replace(/\s+owner:.*$/iu, '').replace(/,?\s*`[^`]*docs\/plans\/artifacts\/[^`]*`/gu, '').split(/(?<=\.)\s/u)[0];
      return `${item[1]}${head}`;
    });
  const parts = {
    teach: () =>
      sections('teach').flatMap((section) =>
        titled('How it works', section.lines.flatMap((line) => (line.match(SHOT) && !line.replace(SHOT, '').trim() ? frames(line) : [line])))
      ),
    demo: () =>
      sections('demo').flatMap((section) => {
        const { intro, steps } = demoSteps(section.lines);
        return titled('Demo', [...intro, ...steps.filter(fresh).flatMap((step, index) => [`${index + 1}. ${step.replace(SHOT, '').replace(/\s+/g, ' ').trim()}`, ...frames(step), ''])]);
      }),
    ontop: () => sections('ontop').flatMap((section) => titled(section.title, section.lines)),
    // Without a Demo, the first Main changes items say what moved.
    moved: () =>
      sections('demo').length ? [] : titled('What changed', sections('main').flatMap((section) => section.lines.filter((line) => /^[-*+]\s/.test(line)).slice(0, 3))),
    needs: () => sections('needs').flatMap((section) => titled('Open questions', section.lines)),
    picked: () => titled('Decisions', sections('picked').flatMap((section) => picksMd(section.lines)).filter((line) => line.trim())),
    api: () => sections('api').flatMap((section) => titled(section.title, sectionMd(section.lines, true))),
    // The playbook names the sections a reviewer judges the design by; a PR plan without one shows each carried plan's.
    lead: () =>
      [...pr]
        .sort((a, b) => lead.indexOf(a) - lead.indexOf(b))
        .flatMap((title) => {
          const own = filled(sectionNamed(plan, title));
          if (own) return titled(own.title, sectionMd(own.lines, pairs.includes(title)));
          const theirs = carried.flatMap((entry) => {
            const section = filled(sectionNamed(entry.plan, title));
            return section ? [{ entry, section }] : [];
          });
          if (!theirs.length) return [];
          return titled(
            theirs[0].section.title,
            theirs.flatMap(({ entry, section }) => [`### ${entry.plan.title || basename(entry.path, '.md')}`, '', ...sectionMd(section.lines, pairs.includes(title)), ''])
          );
        }),
    verification: () => sections('details').filter(isVerification).flatMap((section) => titled('Verification', section.lines)),
    scope: () => sections('idea').filter(isOpenWork).flatMap((section) => titled('Out of scope', followUps(section.lines))),
    plans: () => titled('Plans', entries.map((entry) => `- ${link(entry)}`)),
  };
  // The compare view is exactly the commits after the author's, so the comment never pastes code a reviewer can open there.
  const range = since && (github ? [`[My commits after yours](https://github.com/${github.repo}/compare/${since}...${github.sha})`, ''] : [`My commits after \`${since}\``, '']);
  const region = [PR_START, ...models, '', ...(range || []), ...brief.flat(), ...BRIEF_ORDER.flatMap((key) => parts[key]?.() ?? []), PR_END]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  const start = existing.indexOf(PR_START);
  const end = existing.indexOf(PR_END);
  const body =
    start >= 0 && end > start
      ? `${existing.slice(0, start)}${region}${existing.slice(end + PR_END.length)}`
      : existing.trim()
        ? `${region}\n\n${existing.trimStart()}`
        : `${region}\n`;
  return { body, attach: [...attach], name: `${basename(planPath, '.md')}${since ? '.comment' : '.pr'}` };
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
        const rendered = page((open ?? iterations[0]).path);
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
      ? statusHtml(row.status, 90)
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

export { contextOf, page, parsePlan, rail, stagesOf };

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
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
  const valueOf = (flag) => (args.indexOf(flag) >= 0 ? (args[args.indexOf(flag) + 1] ?? '') : null);
  const into = valueOf('--into');
  const since = valueOf('--comment');
  const against = valueOf('--against');
  const valued = new Set(['--into', '--comment', '--against'].flatMap((flag) => (args.indexOf(flag) >= 0 ? [args.indexOf(flag) + 1] : [])));
  const flags = args.filter((_, index) => !valued.has(index));
  const target = flags.find((arg) => !arg.startsWith('--'));
  const planPath = target && resolve(target);
  if (
    !planPath ||
    !existsSync(planPath) ||
    flags.some((arg) => arg.startsWith('--') && !['--folded', '--check', '--rail', '--pr', '--into', '--comment', '--against'].includes(arg)) ||
    (flags.includes('--pr') && since !== null) ||
    (since !== null && (!since || since.startsWith('--'))) ||
    [into, against].some((path) => path !== null && (!path || !existsSync(path))) ||
    (into !== null && !flags.includes('--pr') && since === null) ||
    (against !== null && since === null)
  ) {
    console.error('Usage: node .agents/pstack/plan-page.mjs <plan.md> [--folded] [--check] | <plan.md> --pr [--into <body.md>] | <plan.md> --comment <author sha> [--into <comment.md>] [--against <description.md>] | <plan.md> --rail | --index');
    process.exit(2);
  }
  if (flags.includes('--pr') || since !== null) {
    try {
      const { body, attach, name } = prBody(planPath, into ? readFileSync(into, 'utf-8') : '', { since, against: against ? readFileSync(against, 'utf-8') : '' });
      const out = join(dirname(planPath), 'artifacts', `${name}.md`);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, body);
      console.info([out, ...attach.map((file) => `--attach ${file}`)].join('\n'));
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
    process.exit(0);
  }
  if (args.includes('--rail')) {
    try {
      console.info(JSON.stringify(rail(planPath)));
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
    process.exit(0);
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
  const { root, subjectPath } = contextOf(planPath);
  const bound = pageUrlOf(root, subjectPath ?? planPath);
  console.info([...(bound.url ? [`Page: ${bound.url}`] : []), ...bound.others.map((other) => `Page in ${other.tree}: ${other.url}`), out].join('\n'));
}
