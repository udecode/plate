#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/plan-page.mjs <plan.md> --check
//        node .agents/pstack/plan-page.mjs <plan.md> --rail
//        node .agents/pstack/plan-page.mjs <plan.md> --pr [--public] [--into <body.md>]
//        node .agents/pstack/plan-page.mjs <plan.md> --comment <author sha> [--into <comment.md>] [--against <description.md>]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEATS, STAGE_PHASES, isFence, isHandOffReview, landed, outsideFences, readFence, splitRow, stageOfRow, stateOf, strayFence, TABLE_RULE, tablesOf } from './status.mjs';

export const slugOf = (path) => path.split('/').at(-1).replace(/\.md$/u, '').replace(/[^A-Za-z0-9._-]+/gu, '-');

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
  lead.includes(section.title.toLowerCase()) ? 'lead' : (ROLES.find(([pattern]) => pattern.test(section.title))?.[1] ?? 'idea');

const listOf = (meta, key) => (meta[key] ?? '').split(',').map((entry) => entry.trim()).filter(Boolean);
const sameText = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();
const sectionsNamed = (doc, title) => doc.sections.filter((section) => section.title.toLowerCase() === title.toLowerCase());
const sectionNamed = (doc, title) => sectionsNamed(doc, title)[0];
const headCell = (cell) => sameText(cell.replace(/[*_`]/g, ''));
const clause = (text) => text.trim().replace(/[.!?]+$/u, '');
const listed = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0]);
const finished = (status) => stateOf(status) === 'done';

const DEFAULTS_HEAD = ['decision', 'pick', 'alternative', 'word'];
const isDefaultsHead = (head) => DEFAULTS_HEAD.every((cell, index) => headCell(head[index] ?? '') === cell);
const IMPACTS = new Set(['big', 'small']);
const RETIRED_IMPACTS = new Set(['detail']);
const impactColumn = (head) => head.findIndex((cell) => headCell(cell) === 'impact');

const BRIEF = ['What will change?', 'What could go wrong?'];
const BRIEF_WORDS = 40;
const RETIRED_BRIEF = ['What did you find?', 'What do you need from me?', 'What happens if I say go?'];
const wordCount = (text) => text.split(/\s+/).filter(Boolean).length;

const SHOT = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
const SHOT_TYPES = { '.gif': 'image/gif', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const DEMO_STEP = /^\d+[.)]\s+(.*)$/;
const PR_START = '<!-- plan-page:start -->';
const PR_END = '<!-- plan-page:end -->';
const FRAME_NOTE = /^<!-- frame: (\S+) -->$/;
const PATH_NOTE = /^\s*(?:\/\/|#|<!--)/;
const PART_ORDER = ['teach', 'ontop', 'demo', 'moved', 'needs', 'picked', 'api', 'lead', 'main', 'idea', 'verification', 'scope', 'plans'];
const COMMENT_PARTS = new Set(['ontop', 'demo', 'api', 'lead', 'verification']);
const PRIVATE_PARTS = new Set(['needs', 'picked', 'plans']);
const CHECK_STAGES = ['Design', 'Plan review', 'Code review', 'Verify', 'Audit'];
const WRITING_PASSES = ['deslop', 'no-comments', 'unslop'];
const CAN_BE_CURRENT = ['Design', 'Plan review', 'Build', 'Writing', 'Code review', 'Verify', 'Ship'];
const CURRENT_STATES = ['now', 'waiting', 'blocked'];
const WORD_HUES = { waiting: 'orange', awaiting: 'orange', review: 'orange', reviewing: 'orange', reopened: 'pink', rework: 'pink', partial: 'amber' };
const STATE_HUES = { active: 'violet', held: 'red', planning: 'blue' };

const PSTACK_PLAYBOOKS = [
  'authoring-a-skill', 'autonomous-run', 'autopilot-full', 'autopilot-stack', 'babysit', 'bug-fix', 'eval', 'feature', 'figure-it-out',
  'hillclimb', 'investigation', 'multi-phase-plan', 'opening-a-pr', 'orchestrate', 'pause-safely', 'perf-issue', 'prototype',
  'refactoring', 'runtime-forensics', 'session-pickup', 'shipping', 'trace-forensics', 'visual-parity', 'worktree-cleanup',
];

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
  const outside = outsideFences(lines);
  for (const [index, line] of lines.entries()) {
    const field = outside[index] && line.match(/^(Status|Page|Topic|Playbook|Plans|Built by):\s*(.*)$/);
    if (field && sections.length === 0) {
      meta[field[1].toLowerCase()] = field[2].trim();
      fields[field[1].toLowerCase()] = field[2].trim();
      continue;
    }
    if (!title && outside[index] && /^#\s+/.test(line)) {
      title = line.replace(/^#\s+/, '').trim();
      continue;
    }
    const heading = outside[index] && line.match(/^##\s+(.*)$/);
    if (heading) sections.push({ title: heading[1].trim(), lines: [] });
    else (sections.at(-1)?.lines ?? lead).push(line);
  }
  const stray = strayFence(lines);
  const strayLine = stray < 0 ? 0 : source.split('\n').length - lines.length + stray + 1;
  return { meta, fields, lists, title, lead, sections, strayLine };
}

function assertFences(plan, where) {
  if (plan.strayLine) throw new Error(`${where} line ${plan.strayLine} opens a fence that never closes or that holds another fence's opening line; close it first`);
}

function assertDefaults(plan, where) {
  for (const section of sectionsNamed(plan, 'Defaults')) {
    if (!section.lines.some((line) => line.trim())) continue;
    const tables = tablesOf(section.lines).filter((table) => isDefaultsHead(table.head));
    if (!tables.length) {
      throw new Error(`## Defaults in ${where} needs a table whose columns start with Decision, Pick, Alternative and Word, one row per call made for the owner`);
    }
    for (const { head, rows } of tables) {
      const impact = impactColumn(head);
      const wrong = impact < 0 ? null : rows.find((row) => !IMPACTS.has(headCell(row[impact] ?? '')) && !RETIRED_IMPACTS.has(headCell(row[impact] ?? '')));
      if (wrong) throw new Error(`## Defaults in ${where} gives "${wrong[0]}" the impact "${wrong[impact] ?? ''}"; write big or small`);
    }
  }
}

export function defaultsRefusal(path) {
  const plan = parsePlan(readFileSync(path, 'utf-8'));
  if (finished(plan.meta.status ?? '')) return null;
  try {
    assertDefaults(plan, path);
    return null;
  } catch (error) {
    return error.message;
  }
}

function briefOf(plan) {
  const section = sectionNamed(plan, 'Brief');
  if (!section) return null;
  const answers = [];
  const outside = outsideFences(section.lines);
  for (const [index, line] of section.lines.entries()) {
    const heading = outside[index] && line.match(/^###\s+(.*)$/);
    if (heading) answers.push({ question: heading[1].trim(), lines: [] });
    else answers.at(-1)?.lines.push(line);
  }
  return answers;
}

function assertBrief(plan, where) {
  const shape = `a ## Brief with these ### questions in order, each answered in at most ${BRIEF_WORDS} words: ${BRIEF.join(' ')}`;
  const answers = briefOf(plan);
  if (!answers) throw new Error(`${where} needs ${shape}`);
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

function readFencePair(lines, start) {
  const first = readFence(lines, start);
  let index = first.next;
  while (index < lines.length && !lines[index].trim()) index += 1;
  const second = first.tag === 'before' && isFence(lines[index] ?? '') ? readFence(lines, index) : null;
  return second?.tag === 'after' ? { first, after: second, next: second.next } : { first, after: null, next: first.next };
}

const bodyLines = (body) => (body.trim() ? body.split('\n') : []);

function lineDiff(before, after) {
  const a = bodyLines(before);
  const b = bodyLines(after);
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
    for (let k = 0; k < Math.max(removed.length, added.length); k += 1) rows.push([removed[k] ?? null, added[k] ?? null]);
    removed = [];
    added = [];
  };
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      flush();
      rows.push([{ kind: 'same', text: a[i] }, { kind: 'same', text: b[j] }]);
      i += 1;
      j += 1;
    } else if (j < b.length && (i === a.length || common[i][j + 1] >= common[i + 1][j])) {
      added.push({ kind: 'add', text: b[j] });
      j += 1;
    } else {
      removed.push({ kind: 'del', text: a[i] });
      i += 1;
    }
  }
  flush();
  return rows;
}

function unifiedDiff(before, after) {
  const [beforeHead, ...beforeRest] = before.split('\n');
  const [afterHead, ...afterRest] = after.split('\n');
  if (PATH_NOTE.test(beforeHead) && PATH_NOTE.test(afterHead)) return [` ${afterHead}`, ...unifiedDiff(beforeRest.join('\n'), afterRest.join('\n'))];
  if (!before.trim()) return bodyLines(after).map((line) => `+${line}`);
  if (!after.trim()) return bodyLines(before).map((line) => `-${line}`);
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

function statusLead(status) {
  const text = status.trim();
  const lead = text.match(/^\W*((?:in\s+)?[a-z][a-z-]*)/i)?.[1] ?? '';
  const state = stateOf(text);
  const word = lead.toLowerCase().replace(/^in\s+/, '').replaceAll('-', '');
  const hue = state === 'done' ? (landed(text) ? 'green' : 'grey') : (WORD_HUES[word] ?? STATE_HUES[state] ?? 'grey');
  return { lead, state, hue };
}

const seatName = (seat) =>
  seat.replace(/\([^)]*\)?/g, '').replace(/@\w+/, '').replace(/\b(?:missing|skipped)\b/i, '').replace(/^.*:\s+/, '').replace(/^(?:codex|agy):/i, '').trim().split(/\s+/)[0];

const seatList = (seats) =>
  seats.split(/,\s*(?![^(]*\))/).map((seat) => ({ name: seatName(seat), effort: seat.match(/@(\w+)/)?.[1] ?? '', mark: seat.match(/\b(missing|skipped)\b/i)?.[1].toLowerCase() ?? '' })).filter((seat) => seat.name);

const seatMd = ({ name, effort, mark }) => `\`${name}\`${effort ? ` \`${effort}\`` : ''}${mark ? ` ${mark}` : ''}`;

function logRowsOf(planPath) {
  const log = planPath.replace(/\.md$/, '.decisions.tsv');
  if (!existsSync(log)) return [];
  return readFileSync(log, 'utf-8').split('\n').slice(1).filter(Boolean).map((line) => {
    const [, phase = '', decision = '', , , result = ''] = line.split('\t');
    return { phase, decision, result };
  });
}

function rosterByLead(entries) {
  const byLead = new Map();
  for (const entry of entries) {
    let lead = '';
    for (const row of logRowsOf(entry.path)) {
      if (row.phase === 'lead') lead = row.decision;
      if (!byLead.has(lead)) byLead.set(lead, { seats: new Map() });
      const { seats } = byLead.get(lead);
      if (row.phase !== 'panel' || !SEATS.test(row.decision)) continue;
      for (const seat of seatList(row.decision.replace(SEATS, ''))) {
        const key = `${seat.name}@${seat.effort}${seat.mark ? ` ${seat.mark}` : ''}`;
        seats.set(key, { seat, count: (seats.get(key)?.count ?? 0) + 1 });
      }
    }
  }
  return [...byLead].filter(([lead, { seats }]) => lead || seats.size).map(([lead, { seats }]) => ({ lead: lead && lead !== 'unknown' ? seatList(lead)[0] : null, seats: [...seats.values()] }));
}

const stepChecks = (plan) => (sectionNamed(plan, 'Steps')?.lines ?? []).flatMap((line) => line.match(/^\s*(?:\d+\.\s+)?[-*+]\s+\[([ xX])\]/)?.slice(1) ?? []).map((mark) => mark !== ' ');

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

function contextOf(planPath) {
  const plan = parsePlan(readFileSync(planPath, 'utf-8'));
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dirname(planPath), encoding: 'utf-8' }).trim();
  const repoPath = relative(root, planPath);
  const { playbooks, topic, branch } = pageConfig(root);
  return { plan, root, repoPath, playbooks, topic, branch };
}

function validatePlan(planPath) {
  const ctx = contextOf(planPath);
  assertFences(ctx.plan, ctx.repoPath);
  assertDefaults(ctx.plan, ctx.repoPath);
  pageSections(ctx.playbooks, ctx.plan.meta.playbook, ctx.repoPath);
  const self = { path: planPath, plan: ctx.plan };
  const carried = carriedPlans(self, ctx.root);
  return { ...ctx, self, carried };
}

function stagesOf(planPath) {
  const { plan, root, playbooks } = contextOf(planPath);
  const self = { path: planPath, plan };
  return mergedFlow([self, ...carriedPlans(self, root)], plan.meta.status ?? 'unknown', playbooks);
}

function rail(planPath) {
  const { plan, root, repoPath, playbooks } = contextOf(planPath);
  const self = { path: planPath, plan };
  const status = plan.meta.status ?? 'unknown';
  let reason = null;
  let entries = [self];
  try {
    const checked = validatePlan(planPath);
    entries = [checked.self, ...checked.carried];
  } catch (error) {
    reason = error.message;
  }
  const steps = entries.flatMap((entry) => stepChecks(entry.plan));
  return {
    requestedPlan: repoPath,
    page: null,
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

function githubOf(root) {
  try {
    const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const repo = git('remote', 'get-url', 'origin').match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
    return repo ? { repo, sha: git('rev-parse', 'HEAD') } : null;
  } catch {
    return null;
  }
}

function blobLinker(github, root) {
  if (!github) return null;
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
    const plain = (cell) => clause(cell.replace(/\s*\((?:safe|look|answer)\)\s*$/iu, ''));
    const list = (group) =>
      group.flatMap(([decision = '', pick = '', alternative = '']) => [
        `- ${clause(decision)}`,
        `  - **${plain(pick)}**`,
        ...alternative.split(';').map(clause).filter(Boolean).map((option) => `  - ${option} (alt)`),
      ]);
    const impact = impactColumn(head);
    out.push(...list(impact < 0 ? rows : rows.filter((row) => headCell(row[impact] ?? '') === 'big')));
  }
  return out;
}

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

function prProcess(entries, playbooks) {
  const flow = mergedFlow(entries, entries[0].plan.meta.status ?? 'unknown', playbooks);
  const named = [...new Set(entries.map((entry) => entry.plan.meta.playbook).filter(Boolean))];
  const skipped = CHECK_STAGES.filter((label) => !flow.some((stage) => stage.label === label && stage.ran));
  return [named.length ? named.map((name) => `\`${name}\``).join(', ') : '', skipped.length ? `not run: ${skipped.join(', ').toLowerCase()}` : ''].filter(Boolean).join(' · ');
}

const prModels = (entries) =>
  rosterByLead(entries).flatMap(({ lead, seats }) => [
    lead ? `- \`${[lead.name, lead.effort].filter(Boolean).join(' ')}\`` : '- Lead not logged',
    ...seats.map(({ seat, count }) => `  - ${seatMd(seat)}${count > 1 ? ` ×${count}` : ''}`),
  ]);

function assertPrBrief(plan, where) {
  if (!briefOf(plan)) throw new Error(`${where} needs a ## Brief before --pr, because the PR body opens with its Changes and Risks`);
  assertBrief(plan, where);
  if (/\bPR\s*#?\d+/i.test(plan.title)) throw new Error(`${where} is titled "${plan.title}"; name the change instead of the PR`);
  const selfReference = briefOf(plan).find(({ lines }) => /\bPR\s*#?\d+/i.test(lines.join(' ')));
  if (selfReference) throw new Error(`## Brief in ${where} names a PR number in "${selfReference.question}"; say what changes for a reviewer instead`);
  const promised = briefOf(plan).find(({ question, lines }) => sameText(question) === sameText(BRIEF[0]) && /\bwill\b/i.test(lines.join(' ')));
  if (promised) throw new Error(`## Brief in ${where} answers "${promised.question}" with "will"; at PR time say what the PR changes, for a reviewer`);
}

function prBody(planPath, existing = '', { since = null, against = '', forPublic = false } = {}) {
  const { plan, root, repoPath: where, playbooks, self, carried } = validatePlan(planPath);
  if (since) {
    try {
      execFileSync('git', ['cat-file', '-e', `${since}^{commit}`], { cwd: root, stdio: 'ignore' });
    } catch {
      throw new Error(`--comment names ${since}, which is not a commit in this checkout; fetch the PR's head and pass the author's last commit before yours`);
    }
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', since, 'HEAD'], { cwd: root, stdio: 'ignore' });
    } catch {
      throw new Error(`--comment names ${since}, which this checkout's HEAD does not contain; render from a checkout at the PR's pushed head`);
    }
  } else {
    assertPrBrief(plan, where);
  }
  const entries = [self, ...carried];
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
  if (since && !sections('ontop').length) throw new Error(`${where} needs a non-empty ## On top of the PR before --comment`);
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
  const repeated = (path) => Boolean(against) && /^https?:\/\//.test(path) && against.includes(path);
  const frames = (text) =>
    [...text.matchAll(SHOT)].filter(([, , path]) => !repeated(path)).flatMap(([, label, path]) => ['', ...frameMd(label, path, base, root, uploaded, attach).flatMap((part) => [part, ''])]);
  const fresh = (step) => {
    const paths = [...step.matchAll(SHOT)].map(([, , path]) => path);
    return !paths.length || !paths.every(repeated);
  };
  const brief = (since ? [] : briefOf(plan)).map(({ question, lines }) => {
    const index = BRIEF.findIndex((asked) => sameText(asked) === sameText(question));
    const body = lines.join('\n').trim().split('\n');
    return index === 0 ? [...body, ''] : ['> [!CAUTION]', ...body.map((line) => (line.trim() ? `> ${line}` : '>')), ''];
  });
  const titled = (title, lines) => (lines.some((line) => line.trim()) ? [`## ${title}`, '', ...lines, ''] : []);
  const filled = (section) => (section?.lines.some((line) => line.trim()) ? section : null);
  const process = since || forPublic ? '' : prProcess(entries, playbooks);
  const models = since || forPublic ? [] : prModels(entries);
  if (models.length) models[0] = [models[0], process].filter(Boolean).join(' · ');
  else if (process) models.push(process);
  const followUps = (lines) =>
    lines.map((line) => {
      const item = line.match(/^(\s*[-*+]\s+)(.*)$/);
      if (!item) return line;
      const head = item[2].replace(/\s+owner:.*$/iu, '').replace(/,?\s*`[^`]*docs\/plans\/artifacts\/[^`]*`/gu, '').split(/(?<=\.)\s/u)[0];
      return `${item[1]}${head}`;
    });
  const parts = {
    teach: () => sections('teach').flatMap((section) => titled('How it works', section.lines.flatMap((line) => (line.match(SHOT) && !line.replace(SHOT, '').trim() ? frames(line) : [line])))),
    demo: () =>
      sections('demo').flatMap((section) => {
        const { intro, steps } = demoSteps(section.lines);
        return titled('Demo', [...intro, ...steps.filter(fresh).flatMap((step, index) => [`${index + 1}. ${step.replace(SHOT, '').replace(/\s+/g, ' ').trim()}`, ...frames(step), ''])]);
      }),
    ontop: () => sections('ontop').flatMap((section) => titled(section.title, section.lines)),
    moved: () => (sections('demo').length ? [] : titled('What changed', sections('main').flatMap((section) => section.lines.filter((line) => /^[-*+]\s/.test(line)).slice(0, 3)))),
    needs: () => sections('needs').flatMap((section) => titled('Open questions', section.lines)),
    picked: () => titled('Decisions', sections('picked').flatMap((section) => picksMd(section.lines)).filter((line) => line.trim())),
    api: () => sections('api').flatMap((section) => titled(section.title, sectionMd(section.lines, true))),
    lead: () =>
      [...pr]
        .filter((title) => !forPublic || !PRIVATE_PARTS.has(ROLES.find(([pattern]) => pattern.test(title))?.[1]))
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
    verification: () => sections('details').filter((section) => sameText(section.title) === 'verification').flatMap((section) => titled('Verification', section.lines)),
    scope: () => sections('idea').filter((section) => sameText(section.title) === 'open work').flatMap((section) => titled('Out of scope', followUps(section.lines))),
    plans: () => titled('Plans', entries.map((entry) => `- ${link(entry)}`)),
  };
  const range = since && (github ? [`[My commits after yours](https://diffshub.com/${github.repo}/compare/${since}...${github.sha})`, ''] : [`My commits after \`${since}\``, '']);
  const region = [PR_START, ...models, '', ...(range || []), ...brief.flat(), ...PART_ORDER.filter((key) => (since ? COMMENT_PARTS.has(key) : !forPublic || !PRIVATE_PARTS.has(key))).flatMap((key) => parts[key]?.() ?? []), PR_END]
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

export { contextOf, parsePlan, rail, stagesOf };

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
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
    flags.some((arg) => arg.startsWith('--') && !['--check', '--rail', '--pr', '--public', '--into', '--comment', '--against'].includes(arg)) ||
    (flags.includes('--pr') && since !== null) ||
    (flags.includes('--public') && !flags.includes('--pr')) ||
    (since !== null && (!since || since.startsWith('--'))) ||
    [into, against].some((path) => path !== null && (!path || !existsSync(path))) ||
    (into !== null && !flags.includes('--pr') && since === null) ||
    (against !== null && since === null) ||
    (!flags.includes('--pr') && since === null && !flags.includes('--rail') && !flags.includes('--check'))
  ) {
    console.error('Usage: node .agents/pstack/plan-page.mjs <plan.md> --check | <plan.md> --rail | <plan.md> --pr [--public] [--into <body.md>] | <plan.md> --comment <author sha> [--into <comment.md>] [--against <description.md>]');
    process.exit(2);
  }
  try {
    if (flags.includes('--pr') || since !== null) {
      const { body, attach, name } = prBody(planPath, into ? readFileSync(into, 'utf-8') : '', { since, against: against ? readFileSync(against, 'utf-8') : '', forPublic: flags.includes('--public') });
      const out = join(dirname(planPath), 'artifacts', `${name}.md`);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, body);
      console.info([out, ...attach.map((file) => `--attach ${file}`)].join('\n'));
    } else if (flags.includes('--rail')) {
      console.info(JSON.stringify(rail(planPath)));
    } else {
      const { plan, repoPath } = validatePlan(planPath);
      if (briefOf(plan)) assertBrief(plan, repoPath);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
