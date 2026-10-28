#!/usr/bin/env node
// Installed by the sync-pstack skill. Run from the project root; it writes nothing.
// Usage: node .agents/pstack/scorecard.mjs [--since <YYYY-MM-DD>] [--rows]
// Prints two Markdown tables. The seats table reads every decision log in the
// config's plans directory and places each panel critical row on its round's
// seats row: per model, the rounds it sat, the criticals it raised, how each
// was settled and the applied ones it alone raised, then the rows it could not
// place. A row names its seats as `critical [<seat>, ...]:`; older rows are
// read best effort, by model name, by the aliases opus, astra and sol, or by
// seat letter or number in roster order. A seat the seats row marks missing
// keeps its place in that order and is never credited. The escape table reads
// the fix commits on origin/<branch> as last fetched, merged ones included, by
// ISO week since --since or over the last 8 weeks: how many name the commit
// that introduced the bug in an `Introduced-by:` line, how many say none or
// have no line, the median days from that commit to its fix, and how many of
// those commits had, when they landed, a panel round in the decision log beside
// the plan their own `Plan:` line names. A `fix(revert)` commit counts only in
// the reverts column.
// --rows prints one line per critical row instead: its place, the reporters
// it placed or `unplaced`, and its result's first word.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { CRITICAL_SEATS, decisionLogs, seatKey, seatRoster, SEATS } from './status.mjs';

const USAGE = 'Usage: node .agents/pstack/scorecard.mjs [--since <YYYY-MM-DD>] [--rows]';
const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 8;
const SETTLED = ['applied', 'dismissed', 'open'];
const NAME = /(?<![\w.:-])(?:codex:)?(?:claude-[\w.-]*\w|gpt-[\w.-]*\w|opus|sonnet|haiku|fable|astra|sol|lead)(?![\w-])/giu;
const ONE_NAME = new RegExp(`^${NAME.source}$`, 'iu');
const ATTRIBUTION_FILLER = new Set(['a', 'all', 'also', 'and', 'as', 'both', 'by', 'critical', 'fallback', 'from', 'nit', 'raised', 'round', 'seat', 'seats', 'three', 'warning', 'warnings', 'with']);
const RAISED_BY = /\b(?:raised|flagged|found|caught|reported) by\b(.*)$/iu;
const REPLACED_SEAT = new RegExp(`\\b(?:for|in)\\s+(?:${NAME.source})(?:'s)?(?:\\s+(?:seat|place))?`, 'giu');
const ALL_SEATS = /\b(?:all (?:three |3 |the )?seats|every seat)\b/iu;

const git = (...args) => spawnSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28 });

function resolveName(name, roster) {
  const word = name.toLowerCase();
  if (word === 'lead') return 'lead';
  if (!['astra', 'sol'].includes(word)) return seatKey(word);
  return roster?.models.find((model) => model.split('-').includes(word)) ?? null;
}

function seatRefs(text, roster) {
  let afterSeat = false;
  return text
    .split(/[\s,;/&+]+|\band\b/u)
    .map((token) => token.replace(/[^\w-]/gu, ''))
    .filter(Boolean)
    .flatMap((token) => {
      const letter = token.match(/^seat-([a-e])$/iu)?.[1] ?? (/^[A-E]$/u.test(token) || (afterSeat && /^[a-e]$/u.test(token)) ? token : null);
      const at = letter ? letter.toLowerCase().charCodeAt(0) - 97 : afterSeat && /^[1-9]$/u.test(token) ? Number(token) - 1 : -1;
      afterSeat = at >= 0 || /^seats?$/iu.test(token);
      return roster?.slots[at] ? [roster.slots[at]] : [];
    });
}

function groupReporters(group, roster) {
  const text = group.replace(REPLACED_SEAT, ' ');
  const named = (text.match(NAME) ?? []).map((name) => resolveName(name, roster)).filter(Boolean);
  const all = ALL_SEATS.test(text) ? (roster?.models ?? []) : [];
  if (named.length || all.length) return [...named, ...all];
  return seatRefs(text, roster);
}

const words = (text) => text.split(/[\s,;()[\]&+]+/u).filter(Boolean);
const isAttribution = (word) => {
  const bare = word.replace(/[.'’]+$/u, '');
  return ONE_NAME.test(bare) || ATTRIBUTION_FILLER.has(bare.toLowerCase()) || /^(?:seat-)?[a-e]$/iu.test(bare) || /^[a-z]{0,2}#?\d+[a-z]?$/iu.test(bare);
};

function reporters(decision, roster) {
  const bracketed = decision.match(CRITICAL_SEATS)?.[1];
  if (bracketed !== undefined) return groupReporters(bracketed, roster);
  const body = decision.replace(/^critical\s+/u, '');
  const groups = [];
  const masked = body.replace(/[([][^()[\]]*[)\]]/gu, (group) => `\0${groups.push(group) - 1}\0`);
  const segments = masked
    .split(/:(?=\s|$)|;/u)
    .map((segment) => segment.replace(/\0(\d+)\0/gu, (_, at) => groups[at]))
    .filter((segment) => segment.trim() && words(segment).every(isAttribution));
  const named = segments.flatMap((segment) => groupReporters(segment, roster));
  if (named.length) return named;
  const leading = body.match(/^[([]([^()[\]]*)[)\]]/u)?.[1];
  const led = leading === undefined ? [] : groupReporters(leading, roster);
  if (led.length) return led;
  const opening = words(body);
  const opener = opening.slice(0, opening.findIndex((word) => !isAttribution(word))).join(' ');
  if (opener.replace(/[.'’]+(?=\s|$)/gu, '').match(NAME)) return groupReporters(opener, roster);
  for (const [, group] of body.matchAll(/[([]([^()[\]]*)[)\]]/gu)) {
    const found = groupReporters(group, roster);
    if (found.length) return found;
  }
  const raised = body.match(RAISED_BY)?.[1];
  const found = raised ? groupReporters(raised, roster) : [];
  if (found.length) return found;
  return ALL_SEATS.test(body) ? (roster?.models ?? []) : [];
}

function readLogs(plans) {
  const rounds = new Map();
  const rows = [];
  for (const path of decisionLogs(plans)) {
    let roster = null;
    readFileSync(path, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        const [, phase, decision = '', , , result = ''] = line.split('\t');
        if (index === 0 || phase !== 'panel') return;
        if (SEATS.test(decision)) {
          roster = seatRoster(decision);
          for (const model of roster.models) rounds.set(model, (rounds.get(model) ?? 0) + 1);
        } else if (/^critical\b/u.test(decision)) {
          const word = result.match(/^\w+/u)?.[0].toLowerCase() ?? '';
          const named = reporters(decision, roster).filter((model) => !roster?.missing.includes(model));
          rows.push({ where: `${path}:${index + 1}`, reporters: [...new Set(named)], word, result: SETTLED.includes(word) ? word : 'other' });
        }
      });
  }
  return { rounds, rows };
}

const percent = (part, whole) => (whole ? `${Math.round((100 * part) / whole)}%` : '-');

function seatTable({ rounds, rows }) {
  const tally = new Map();
  const of = (model) => {
    if (!tally.has(model)) tally.set(model, { raised: 0, applied: 0, dismissed: 0, open: 0, other: 0, alone: 0 });
    return tally.get(model);
  };
  for (const model of rounds.keys()) of(model);
  of('lead');
  for (const row of rows) {
    for (const model of row.reporters) {
      const counts = of(model);
      counts.raised += 1;
      counts[row.result] += 1;
      if (row.result === 'applied' && row.reporters.length === 1) counts.alone += 1;
    }
  }
  const order = [...tally.keys()].filter((model) => model !== 'lead').sort((a, b) => tally.get(b).raised - tally.get(a).raised || a.localeCompare(b));
  const unplaced = rows.filter((row) => row.reporters.length === 0);
  return [
    '## Seats',
    '',
    '| model | rounds sat | criticals | applied | dismissed | open | other | applied, raised alone |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...[...order, 'lead'].map((model) => {
      const counts = tally.get(model);
      return `| ${model} | ${model === 'lead' ? '-' : (rounds.get(model) ?? 0)} | ${counts.raised} | ${counts.applied} | ${counts.dismissed} | ${counts.open} | ${counts.other} | ${counts.alone} |`;
    }),
    '',
    `${rows.length - unplaced.length} of ${rows.length} critical rows placed; ${unplaced.length} unplaced${unplaced.length ? ', such as:' : '.'}`,
    ...unplaced.slice(0, 10).map((row) => `- ${row.where}`),
  ];
}

function isoWeek(time) {
  const date = new Date(time);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const year = date.getUTCFullYear();
  const week = 1 + Math.round((date - Date.UTC(year, 0, 4)) / DAY / 7 - (3 - ((new Date(Date.UTC(year, 0, 4)).getUTCDay() + 6) % 7)) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

const mondayOf = (time) => {
  const date = new Date(time);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime() - ((date.getUTCDay() + 6) % 7) * DAY;
};

function median(values) {
  if (!values.length) return '-';
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return (sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2).toFixed(1);
}

function introduced(sha, plans) {
  const shown = git('log', '-1', '--format=%cI%x1f%B', sha, '--');
  if (shown.status !== 0 || !shown.stdout.trim()) return null;
  const [date, message] = shown.stdout.split('\x1f');
  const plan = message.match(/^Plan:\s*(\S+\.md)\s*$/mu)?.[1];
  const log = plan?.startsWith(`${plans}/`) ? git('show', `${sha}:${plan.replace(/\.md$/u, '.decisions.tsv')}`) : null;
  const paneled = log?.status === 0 && log.stdout.split('\n').some((line) => line.split('\t')[1] === 'panel' && SEATS.test(line.split('\t')[2] ?? ''));
  return { time: Date.parse(date), paneled };
}

function escapeTable(branch, plans, since) {
  if (!branch) return ['## Escapes', '', '.agents/pstack.json names no branch, so there are no landings to read.'];
  const ref = `refs/remotes/origin/${branch}`;
  const heading = `## Escapes on origin/${branch} since ${new Date(since).toISOString().slice(0, 10)}`;
  if (git('rev-parse', '--verify', '--quiet', ref).status !== 0) return [heading, '', `There is no origin/${branch} yet; fetch it first.`];
  const log = git('log', '--no-merges', `--since=${new Date(since).toISOString()}`, '--format=%H%x1f%cI%x1f%s%x1f%b%x1e', ref);
  const weeks = new Map();
  for (let monday = mondayOf(since); monday <= Date.now(); monday += 7 * DAY) weeks.set(isoWeek(monday), { fixes: 0, named: 0, none: 0, missing: 0, days: [], intros: 0, paneled: 0, reverts: 0 });
  for (const entry of log.stdout.split('\x1e')) {
    const [, date, subject, body = ''] = entry.trim().split('\x1f');
    if (!subject || !/^fix(?:\([^)]*\))?!?:/u.test(subject)) continue;
    const time = Date.parse(date);
    const week = weeks.get(isoWeek(time));
    if (!week) continue;
    if (/^fix\(revert\)/u.test(subject)) {
      week.reverts += 1;
      continue;
    }
    const values = [...body.matchAll(/^Introduced-by:[ \t]*(\S+)[ \t]*$/gmu)].map((match) => match[1]);
    const shas = values.filter((value) => /^[0-9a-f]{7,40}$/iu.test(value));
    week.fixes += 1;
    if (shas.length) week.named += 1;
    else if (values.length) week.none += 1;
    else week.missing += 1;
    for (const sha of shas) {
      const intro = introduced(sha, plans);
      if (!intro) continue;
      week.days.push((time - intro.time) / DAY);
      week.intros += 1;
      if (intro.paneled) week.paneled += 1;
    }
  }
  return [
    heading,
    '',
    '| week | fixes | naming a commit | none | no line | median days to fix | introducing commit\'s plan log had a panel round | reverts |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...[...weeks].map(([week, row]) => `| ${week} | ${row.fixes} | ${row.named} (${percent(row.named, row.fixes)}) | ${row.none} (${percent(row.none, row.fixes)}) | ${row.missing} | ${median(row.days)} | ${row.paneled} of ${row.intros} | ${row.reverts} |`),
  ];
}

function main(argv) {
  let since = mondayOf(Date.now()) - (WEEKS - 1) * 7 * DAY;
  let rows = false;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--rows') rows = true;
    else if (argv[index] === '--since' && /^\d{4}-\d{2}-\d{2}$/u.test(argv[index + 1] ?? '')) since = Date.parse(`${argv[(index += 1)]}T00:00:00Z`);
    else return [USAGE, 2];
  }
  const config = existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {};
  const plans = config.plans || 'docs/plans';
  if (!existsSync(plans)) return [`No plans directory at ${plans}; run this from the project root.`, 2];
  const read = readLogs(plans);
  if (rows) return [read.rows.map((row) => `${row.where}\t${row.reporters.join(', ') || 'unplaced'}\t${row.word}`).join('\n'), 0];
  return [[...seatTable(read), '', ...escapeTable(config.branch, plans, since)].join('\n'), 0];
}

const [text, status] = main(process.argv.slice(2));
(status ? console.error : console.info)(text);
process.exitCode = status;
