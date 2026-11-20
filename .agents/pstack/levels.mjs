#!/usr/bin/env node
// Lists each stretch of a decision log that ran below this session's level or
// the configured seats: a lead stretch on a lower effort, another model or a
// Codex lead, and a panel or arena round with a seat missing or on
// a lower effort. The configured seats come from the runtime's models sheet;
// a `<seat> @<effort>` that a project rule outside the pstack block names
// replaces that seat's effort, the highest one when it names several. The
// `maxEffort` in `.agents/pstack.json` caps every target, and is the target of
// a seat that names no effort.
// Installed by sync-pstack.
// Usage: node .agents/pstack/levels.mjs [--lead '<model> @<effort>'] [--seats '<seat list>'] <decision log>...
//        (--lead judges against that level instead of this session's;
//        --seats replaces the configured seats of every round)

import { existsSync, readFileSync } from 'node:fs';
import { capEffort, EFFORTS, findLead, maxEffort, modelsSheet } from './lead.mjs';

const rank = (effort) => EFFORTS.indexOf(effort);
const MODEL = /^(?:(?:codex|agy):[\w.-]+|claude-[\w.-]+|gpt-[\w.-]+|gemini-[\w.-]+|opus|sonnet|haiku|fable)$/u;
const family = (model) => (/^(?:claude-|opus|sonnet|haiku|fable)/u.test(model) ? 'claude' : /^(?:agy:|gemini-)/u.test(model) ? 'gemini' : 'codex');
// cross.mjs marks a seat refused only for a Codex or Gemini provider, so a Claude seat marked skipped is missing.
const REFUSING = new Set(['codex', 'gemini']);
// A sheet names `opus` where a row may name `claude-opus-5-5`; both are the Opus seat.
const seatKey = (model) => model.replace(/^(?:codex|agy):/u, '').replace(/^claude-([a-z]+)-.*$/u, '$1');
const ROUNDS = {
  panel: { opens: /^seats\b/u, role: 'interrogate reviewers' },
  arena: { opens: /^runners\b/u, role: 'arena runners' },
};
const BLOCK = /<!-- pstack:begin[\s\S]*?<!-- pstack:end -->/gu;

function seatOf(entry) {
  const words = entry.trim().split(/\s+/u);
  const at = words.findIndex((word) => MODEL.test(word));
  if (at === -1) return null;
  const model = words[at];
  const refused = words.includes('skipped') && REFUSING.has(family(model));
  const missing = !refused && (words.includes('missing') || words.includes('skipped'));
  return {
    name: seatKey(model),
    effort: words[at + 1]?.match(/^@(\w+)$/u)?.[1] ?? null,
    status: refused ? 'skipped' : missing ? 'missing' : entry.includes('same-family') ? 'same-family' : 'answered',
  };
}

const seatList = (text) =>
  text
    .replace(/\([^)]*\)/gu, ' ')
    .split(/,|\s+and\s+/u)
    .map(seatOf)
    .filter(Boolean);

const roundSeats = (decision) => seatList(decision.replace(/^(?:seats|runners)\b(?:[^,]*?:\s)?/u, '').split(';')[0]);

function parseLead(label) {
  const [model, effort] = label.trim().split(/\s+@/u);
  return { model, effort: effort ?? null };
}

function targets(sheet, agents, defaultEffort, override, max) {
  const raises = (agents ?? '')
    .replace(BLOCK, '')
    .match(/`[^`]+`/gu)
    ?.map((code) => seatOf(code.slice(1, -1)))
    .filter((seat) => seat?.effort) ?? [];
  const raised = (seat) => {
    const named = raises.filter((raise) => raise.name === seat.name);
    if (named.length === 0) return seat;
    return { ...seat, effort: named.reduce((top, raise) => (rank(raise.effort) > rank(top) ? raise.effort : top), named[0].effort) };
  };
  const capped = (seat) => ({ ...seat, effort: capEffort(seat.effort, max) });
  return (role) => {
    if (override) return seatList(override).map((seat) => capped({ ...seat, effort: seat.effort ?? max ?? defaultEffort }));
    const line = sheet?.match(new RegExp(`^${role}:\\s*(.+)$`, 'mu'))?.[1];
    const settle = (seat) => capped(raised({ ...seat, effort: seat.effort ?? max ?? defaultEffort }));
    // An entry may name a fallback after `or`, which answers for the seat when its first model cannot run.
    return line
      ? line.split(',').flatMap((entry) => {
          const [seat, ...alts] = entry.split(/\s+or\s+/u).map(seatOf).filter(Boolean).map(settle);
          return seat ? [{ ...seat, alts }] : [];
        })
      : null;
  };
}

function leadGap(label, lead) {
  if (!label || label === 'unknown') return 'no verified lead names its level';
  const { model, effort } = parseLead(label);
  if (family(model) !== family(lead.model)) return family(lead.model) === 'claude' ? 'led in Codex, and plans start in Claude Code' : null;
  if (model !== lead.model) return `${model}, not ${lead.model}`;
  if (rank(effort) < rank(lead.effort)) return `@${effort ?? 'unknown'} is below @${lead.effort}`;
  return null;
}

function roundGap(seats, wanted) {
  const gaps = wanted.flatMap((target) => {
    const options = [target, ...(target.alts ?? [])];
    if (seats.some((candidate) => options.some((option) => option.name === candidate.name) && candidate.status === 'skipped')) return [];
    const [option, seat] = options.map((each) => [each, seats.find((candidate) => candidate.name === each.name && candidate.status === 'answered')]).find(([, found]) => found) ?? [];
    if (!seat) return [`${target.name} missing`];
    if (rank(seat.effort) === -1) return [`${seat.name} has no effort`];
    return rank(seat.effort) < rank(option.effort) ? [`${seat.name} @${seat.effort} is below @${option.effort}`] : [];
  });
  return gaps.length ? gaps.join('; ') : null;
}

const seatLabel = (seat) => `${seat.name}${seat.effort ? ` @${seat.effort}` : ''}${seat.status === 'answered' ? '' : ` ${seat.status}`}`;

// Each lead row opens a stretch holding the rows after it; rows before the first one form a stretch of unknown level.
function levelUnits(text, lead, seatsFor) {
  let stretch = { kind: 'lead', label: null, from: null };
  const stretches = [stretch];
  const rounds = [];
  text.split('\n').forEach((line, index) => {
    const [, phase, decision] = line.split('\t');
    if (index === 0 || decision === undefined) return;
    const at = index + 1;
    if (phase === 'lead') {
      stretch = { kind: 'lead', label: decision, from: null };
      stretches.push(stretch);
      return;
    }
    stretch.from ??= at;
    stretch.to = at;
    const round = ROUNDS[phase];
    if (!round?.opens.test(decision)) return;
    const wanted = seatsFor(round.role);
    if (!wanted) throw new Error(`the models sheet has no "${round.role}:" line, so line ${at} cannot be judged; pass --seats`);
    const seats = roundSeats(decision);
    rounds.push({ kind: phase, label: seats.map(seatLabel).join(', '), from: at, to: at, gap: roundGap(seats, wanted) });
  });
  const leads = stretches.filter((unit) => unit.from !== null).map((unit) => ({ ...unit, gap: leadGap(unit.label, lead) }));
  return [...leads, ...rounds].sort((a, b) => a.from - b.from);
}

const lines = (unit) => (unit.from === unit.to ? `line ${unit.from}` : `lines ${unit.from}-${unit.to}`);
const describe = (unit) =>
  `${unit.gap ? 'below' : 'at'} ${lines(unit)}: ${unit.kind} ${unit.label ?? 'unknown'}${unit.gap ? ` (${unit.gap})` : ''}`;

function main(argv) {
  const usage = "usage: levels.mjs [--lead '<model> @<effort>'] [--seats '<seat list>'] <decision log>...";
  const flags = {};
  const logs = [];
  for (let index = 0; index < argv.length; index += 1) {
    const word = argv[index];
    if (word === '--lead' || word === '--seats') {
      if (!argv[index + 1] || argv[index + 1].startsWith('--')) return [usage, 1];
      flags[word.slice(2)] = argv[(index += 1)];
    } else if (word.startsWith('--')) return [usage, 1];
    else logs.push(word);
  }
  if (!logs.length) return [usage, 1];
  const missing = logs.find((log) => !existsSync(log));
  if (missing) return [`${missing} does not exist`, 1];
  const lead = flags.lead ? { run: parseLead(flags.lead) } : findLead();
  const found = lead.run;
  if (!found?.effort) return [`Runtime identity could not be verified${lead.miss ? ` because ${lead.miss}` : ''}, so the current level is unknown; pass --lead.`, 1];
  let max;
  try {
    max = maxEffort();
  } catch (error) {
    return [error.message, 1];
  }
  const run = { ...found, effort: capEffort(found.effort, max) };
  const sheetPath = modelsSheet(family(run.model) === 'claude' ? 'claude' : 'codex');
  const sheet = existsSync(sheetPath) ? readFileSync(sheetPath, 'utf8') : null;
  const sheetEffort = sheet?.match(/^default effort:\s*(\w+)/mu)?.[1];
  const defaultEffort = !sheetEffort || sheetEffort === 'session' ? run.effort : sheetEffort;
  const agents = existsSync('AGENTS.md') ? readFileSync('AGENTS.md', 'utf8') : null;
  const seatsFor = targets(sheet, agents, defaultEffort, flags.seats, max);
  const panel = seatsFor(ROUNDS.panel.role);
  const out = [`target: lead ${run.model} @${run.effort}${panel ? `; seats ${panel.map(seatLabel).join(', ')}` : ''}${max ? `; maxEffort ${max}` : ''}`];
  let below = 0;
  let total = 0;
  try {
    for (const log of logs) {
      const units = levelUnits(readFileSync(log, 'utf8'), run, seatsFor);
      out.push(log, ...units.map((unit) => `  ${describe(unit)}`));
      below += units.filter((unit) => unit.gap).length;
      total += units.length;
    }
  } catch (error) {
    return [error.message, 1];
  }
  out.push(below ? `${below} of ${total} units below target` : `every unit at target (${total})`);
  return [out.join('\n'), 0];
}

const [text, status] = main(process.argv.slice(2));
(status ? console.error : console.info)(text);
process.exitCode = status;
