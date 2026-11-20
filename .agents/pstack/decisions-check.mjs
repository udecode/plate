#!/usr/bin/env node
// Checks the rows a show-me-your-work decision log gained since HEAD, so a
// committed row always says plainly whether its work is fixed, partial or still
// open. Rows already committed are left as history. PSTACK_BASE=<commit> checks
// against that commit instead, so an owner's commit mid-run does not exempt the
// run's rows; a value that names no commit fails. Installed by sync-pstack.
// Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...]
//        node .agents/pstack/decisions-check.mjs --all
//        node .agents/pstack/decisions-check.mjs append <log> <phase> <decision> <why> <evidence> <result>
//        (stamps the row, checks it, and writes it only when it passes)
//        node .agents/pstack/decisions-check.mjs append <log> --from <rows.tsv>
//        (each line holds the five cells; writes every row only when all pass)
//        In trunk delivery, when the ledger's repository has an origin, both append forms to the
//        project's ledger wait up to 60 s for the ledger lock, bring the ledger to
//        refs/pstack/ledger's order first, and push the new rows at once; they exit 1 when a row
//        the ref got first refuses a new row, and keep the rows locally until the next sync when
//        origin cannot be reached or the ref moves on every try.
//        Both append forms open the batch with a lead row naming the session's model
//        and effort, read by lead.mjs, when they differ from the log's last lead row.
//        Both append forms, unlike the <log> and --all checks, refuse a partial, open, gap,
//        blocked or inconclusive row without proof: <existing file under <plans>/artifacts/>
//        or proof: none, and an accepted row unless its proof: names files an earlier row
//        left not passed and its word: is a Word option in the plan's Defaults. Review-phase
//        rows are exempt. In trunk delivery, once the log records a landed step, both
//        refuse a new step's "built: step <n>" row while another step is built and has
//        no delivery row "step <n> landed", published or dropped. From a log's second
//        open critical panel finding on, both refuse each one unless its result names
//        task:<id> of an offered or started kind: decide task in the project's ledger
//        whose finding, or one folded or merged into it, holds the log's file name
//        without .decisions.tsv. When the plan beside the log names in its Playbook:
//        line a project playbook whose frontmatter sets redesign-runs: on, both refuse,
//        in a panel round that holds no "plan round:" row, a critical panel finding that
//        is not dismissed once its round holds as many such findings as it has owners:
//        one, or the count an earlier "separate owners:" row in that round names,
//        separated by semicolons. In such a log this refusal and the task:<id> one
//        above end once it holds a row whose decision starts with "redesign run:"
//        followed by text, in phase owner, or in phase verdict with evidence naming
//        another existing .md or .decisions.tsv file in the plans directory.
//        Both append forms refuse an open row whose patch: names a new plan in the plans
//        directory, one that no earlier open row of the run's logs names in its patch: and
//        whose own log holds no earlier such row, when the lead already chose another new
//        plan since the run's last landing. The run's logs are this log and every log that
//        shares a plan with them, the plan a log is named for or one an open row's patch:
//        names, found in turn through each log added from the plans directory and each
//        folder directly under <plans>/artifacts/, both checkouts' copies in trunk
//        delivery. Their rows are read in time order. An owner row whose decision starts
//        with "second plan:" and quotes the owner in double quotes lifts the refusal for
//        the next new plan, and that plan does not count as the lead's. For this count, a
//        landing is a row in any phase whose decision starts with "landed as <sha>" or
//        "step <n> landed as <sha>". They also refuse every open row that names a new plan,
//        the first one included, unless the first path under <plans>/artifacts/ in any
//        prior-art: of its evidence or result is an existing file there, read without a
//        :line suffix, quotes, asterisks or trailing punctuation and with its .. segments
//        resolved. Both append forms take a "recorded" result on a row whose decision starts
//        with "critical", in any phase, only with step: <n> in it and proof: <existing file
//        under <plans>/artifacts/> in its evidence, and refuse a build row whose decision
//        starts with "built:" and holds reach: <text> while such a row has no later panel or
//        build row whose evidence names the same proof: file and whose result starts with
//        applied, dismissed, fixed or verified. That refusal reads the build row's step
//        from the word after "built: step" and each recorded row's steps from the word
//        after each step: label, any letter case for both, a label not right after a
//        letter, digit or _. A step id is 1 to 9 digits and then at most one ASCII letter,
//        either case, once trailing .,:)]}"'`* is cut, ordered by number then letter. It
//        counts a row when one of its steps is the build row's step or earlier, or has the
//        same number with no letter on one side; when it names no step:; or when the build
//        row has no "built: step", or either word is not a step id, or another word that
//        starts with a digit, past any symbols, follows it before the next ";" and, on the
//        build row, before reach:, or on a recorded row before the next label. Words split
//        at spaces and commas. They refuse a build row to a log in a git checkout whose
//        change builds a dated plan's step past the step budget, as status.mjs's stepLines
//        counts it, unless a changed decision log holds an owner row starting "big step:"
//        with no later "landed as" row.
//        node .agents/pstack/decisions-check.mjs rounds <log> [--patch <file>]
//        (exits 1 when the log is at the cap of panel rounds since its last restart, the
//        maxRounds in .agents/pstack.json or 1, plus one round after a round that applied
//        three or more critical findings; a built: row restarts the count only for a step
//        the log has not built before; with --patch, also exits 1 when the patch
//        changes more product lines than stepBudget.lines in .agents/pstack.json, 400 by
//        default, not counting tests, specs, fixtures, Markdown, the plans directory, the
//        config's generated paths or stepBudget.exclude globs, unless an owner row
//        starting "big step:" follows the last seats row)
//        node .agents/pstack/decisions-check.mjs chips [--fetch] [--session <id>] [<ledger>]
//        (prints every open suggested task as ready, started, waiting or unmigrated,
//        by priority, listing P0 and P1 in full and counting the rest unless chips all,
//        with the items of the chips.ship command as P1 offers when the config names one,
//        its topic and a Do list of one pass, withdrawals, then ledger rows, then cards,
//        and exits 1 when any pass holds a problem: a card on a task that cannot start,
//        a wait that can never clear or two open design questions in one topic;
//        a run: wait on a plan whose last commit and last decision log row are over a
//        week old reads it as stale and lists it under Stale plans, the ones whose
//        Status waits on the owner first; for each other stale plan the Do list offers
//        one fresh verdict per review scope, or folds the plan into the design question
//        its scope's topic holds, and moves each wait on the plan there;
//        <ledger> defaults to <plans>/artifacts/suggested-tasks.decisions.tsv in trunk
//        delivery and <plans>/suggested-tasks.decisions.tsv otherwise,
//        --fetch refreshes the remote branches that PR waits read, and --session names
//        this session, so it cards only the tasks it owns, and each card it does not hold
//        gets a check item instead of a withdraw problem)
//        node .agents/pstack/decisions-check.mjs chips all --session <id> [--sessions <file>] [<ledger>]
//        (lists every priority, also cards the tasks no session owns, and with the session
//        tool's list saved as a JSON array, takes over each task whose owner session is
//        archived or gone)
//        node .agents/pstack/decisions-check.mjs chips sync [--session <id>] [<ledger>]
//        (prints the board without its card pass, and withdraws only the cards of tasks
//        that cannot start, so a sweep that applies its Do list brings the ledger up to
//        date and offers no card)
//        node .agents/pstack/decisions-check.mjs chips stale [<ledger>]
//        (prints each open task's age, its priority, a ship item that closed, the paths it
//        writes that were deleted since its offer or are missing, the commits on its paths
//        since its offer, its closed PR waits and its card, likeliest stale first; a commit
//        counts in the repository or companion that holds the path, and a pure rename or a
//        move between the two counts none)
//        node .agents/pstack/decisions-check.mjs chips groups [<ledger>]
//        (prints the groups of open tasks that may answer one question: each pair shares two
//        of problem wording, a failure and a fix area, and neither waits on the other through
//        task: or names the other in an apart row's from:)
//        node .agents/pstack/decisions-check.mjs chips id
//        (prints a fresh id for a new task)
//        node .agents/pstack/decisions-check.mjs chips brief <id> [<ledger>]
//        (prints the prompt a card for that task carries)
//        node .agents/pstack/decisions-check.mjs chips cleanup --sessions <file> [--session <id>] [<ledger>]
//        (reads the session tool's list of every session, archived ones included, saved as a
//        JSON array, and prints the idle card sessions of landed tasks to archive, the worktrees
//        of archived ones to remove, and a report line with each task's commits; --session
//        names this session, whose own tasks it skips)

import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { findLead, leadLabel, maxEffort, runtimeFolder } from './lead.mjs';
import { parsePlan } from './plan-page.mjs';
import { board, boardState, briefOf, CHIP_STATES, cleanupOf, chipRowProblems, baseRedProblems, gitMerges, groupsOf, hasToken, LEDGER_REF, ledgerPath, lockLedger, namesOwner, newChipRowProblems, newId, offeredAt, readShip, readTasks, recordRow, REFUSED, renderBoard, renderGroups, SESSION, staleReport, startedOverlaps, syncLedger, withoutPlannedWrites } from './tasks.mjs';
import { acceptedWord, BIG_STEP, bracketSeats, committedLines, decisionLogs, defaultsWords, isAcceptingWord, isHandOffReview, liftsStep, NOT_PASSED, overBudget, plansOf, proofLabels, proofStates, PROVEN, runPaths, seatRoster, SEATS, severityOf, STATUSES, statusOf, stepBudget, stepLines, stepRecords, tidy } from './status.mjs';

const HEADER = 'ts\tphase\tdecision\twhy\tevidence\tresult';
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;
const CELLS = ['phase', 'decision', 'why', 'evidence', 'result'];

const opens = (line) => {
  const [, phase, decision = ''] = line.split('\t');
  return phase === 'panel' && SEATS.test(decision);
};
const roundCap = () => {
  const { maxRounds: cap = 1 } = projectConfig();
  if (!Number.isInteger(cap) || cap < 1) throw new Error(`.agents/pstack.json: maxRounds is ${JSON.stringify(cap)}, not a whole number of 1 or more`);
  return cap;
};
const EXTRA_ROUND_FIXES = 3;
const STEP_BUILT = /^built:\s*step\s+(\d+[a-z]?)(?![a-z0-9])/iu;
const ROUND_STEP = /^built:\s*step\s+([a-z0-9]+(?:[.-][a-z0-9]+)*)(?![a-z0-9]|[.-][a-z0-9])/iu;
// A built: row for a step the log has built before records that step's fixes, not a new diff, so it starts no count.
function trackRound(state, line) {
  const [, phase, decision = '', , , result = ''] = line.split('\t');
  if (phase === 'build' && /^built:\s*\S/u.test(decision) && /^(applied|fixed|partial|proven|recorded|verified)\b/u.test(result)) {
    const step = decision.match(ROUND_STEP)?.[1].toLowerCase();
    if (!step || !state.steps.has(step)) Object.assign(state, { rounds: 0, applied: 0 });
    if (step) state.steps.add(step);
  } else if (phase === 'owner' && /^another round:\s*\S/u.test(decision)) Object.assign(state, { rounds: 0, applied: 0 });
  else if (opens(line)) Object.assign(state, { rounds: state.rounds + 1, applied: 0 });
  else if (phase === 'panel' && /^critical\b/u.test(decision) && /^applied\b/u.test(result)) state.applied += 1;
}
const roundState = (lines) => {
  const state = { rounds: 0, applied: 0, steps: new Set() };
  for (const line of lines) trackRound(state, line);
  return state;
};
const ESCAPES = { a: 7, b: 8, t: 9, n: 10, v: 11, f: 12, r: 13, '"': 34, '\\': 92 };
const encoder = new TextEncoder();
// Git quotes a path that holds a double quote, a backslash, a control character or, unless core.quotePath is false, a non-ASCII byte, as "b/caf\303\251.js".
const unquote = (quoted) => {
  const bytes = [];
  for (let at = 0; at < quoted.length; at += 1) {
    const octal = quoted.slice(at + 1, at + 4);
    if (quoted[at] !== '\\') {
      const char = String.fromCodePoint(quoted.codePointAt(at));
      bytes.push(...encoder.encode(char));
      at += char.length - 1;
    }
    else if (/^[0-7]{3}$/u.test(octal)) {
      bytes.push(Number.parseInt(octal, 8));
      at += 3;
    } else {
      at += 1;
      bytes.push(ESCAPES[quoted[at]] ?? quoted.charCodeAt(at));
    }
  }
  return Buffer.from(bytes).toString('utf8');
};
function patchLines(patch, excluded) {
  const count = { product: 0, other: 0 };
  let [file, before, inHunk] = [null, null, false];
  const side = (line) => {
    const name = line.slice(4).replace(/\t.*$/u, '');
    if (name === '/dev/null') return null;
    return (name.startsWith('"') ? unquote(name.slice(1, -1)) : name).replace(/^[^/]+\//u, '');
  };
  for (const line of patch.split('\n')) {
    if (line.startsWith('diff --git ')) [file, before, inHunk] = [null, null, false];
    else if (!inHunk && line.startsWith('--- ')) before = side(line);
    else if (!inHunk && line.startsWith('+++ ')) file = side(line) ?? before;
    else if (line.startsWith('@@')) inHunk = true;
    else if (file && inHunk && /^[+-]/u.test(line)) count[excluded(file) ? 'other' : 'product'] += 1;
  }
  return count;
}
// An owner's "big step:" row lifts the step budget for the next round only, so a seats row after it ends the lift.
const bigStep = (lines) => lines.reduce((lifted, line) => {
  const [, phase, decision = ''] = line.split('\t');
  if (phase === 'owner' && BIG_STEP.test(decision)) return true;
  return opens(line) ? false : lifted;
}, false);
const gitIn = (dir, ...args) => {
  const run = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
  return run.error || run.status !== 0 ? null : run.stdout.replace(/\n$/u, '');
};
function buildBudgetProblems(path, existing, rows, where) {
  const builds = rows.flatMap((row, at) => (row.split('\t')[1] === 'build' ? [at] : []));
  const dir = dirname(resolve(path));
  const top = builds.length > 0 && existsSync(dir) ? gitIn(dir, 'rev-parse', '--show-toplevel') : null;
  if (!top) return [];
  const config = projectConfig(top);
  const { lines: budget } = stepBudget(config);
  const step = stepLines(top, config, gitIn);
  const records = step && step.product > budget ? stepRecords(top, config, gitIn, step.files) : null;
  if (!records) return [];
  const log = existsSync(path) ? realpathSync.native(path) : join(realpathSync.native(dir), basename(path));
  const inPlans = dirname(log) === join(top, plansOf(config));
  const dated = inPlans && /^\d{4}-\d{2}-\d{2}-[^/]+\.decisions\.tsv$/u.test(basename(log));
  if (!records.planned && !dated) return [];
  const others = records.logs.filter((other) => other !== log);
  if (others.some((other) => liftsStep(readFileSync(other, 'utf8')))) return [];
  const own = inPlans || records.logs.includes(log);
  const unlifted = builds.find((at) => !own || !liftsStep([...existing, ...rows.slice(0, at)].join('\n')));
  return unlifted === undefined ? [] : [`${where(unlifted)}: ${top}'s change since ${step.base} ${overBudget(step.product, budget)}. Split it before you log more of its build`];
}
const capMessage = ({ rounds }) =>
  `this would be panel round ${rounds + 1} since the last restart, past the cap of ${roundCap()}, and the last round applied fewer than ${EXTRA_ROUND_FIXES} critical findings, or already was the one extra round. Stop reviewing: settle each open finding as applied, dismissed on its proof, recorded when no user can reach its case, deferred with its owner when it is not critical, or open with its patch:, owner: and stop: when the Panel review rule lets it stay open, then build the plan or land the step. A built: row for a step this log has not built yet, or an owner row whose decision starts with "another round:" and quotes the owner, starts the count again; a built: row for a step already built does not`;
const pastCap = ({ rounds, applied }) => rounds >= roundCap() && !(rounds === roundCap() && applied >= EXTRA_ROUND_FIXES);
const STEP_LANDED = /(?:^|\bstep\s+)(\d+[a-z]?)(?![a-z0-9])[^\t]*?\b(?:landed|published|dropped)\b/iu;
const stepOf = (line, phase, pattern) => {
  const cells = line.split('\t');
  return cells[1] === phase ? (cells[2]?.match(pattern)?.[1].toLowerCase() ?? null) : null;
};
// A trunk plan whose steps land one by one builds one step at a time, as long-runs.md says. A log that has recorded
// no landing yet may be building steps that land together, so only a landing turns the refusal on.
const trackStep = (steps, line) => {
  const built = stepOf(line, 'build', STEP_BUILT);
  if (built && !steps.built.has(built)) {
    steps.built.add(built);
    steps.unlanded.add(built);
  }
  const landed = stepOf(line, 'delivery', STEP_LANDED);
  if (landed) {
    steps.unlanded.delete(landed);
    steps.landing = true;
  }
};
function stepInFlightProblems(steps, row, where) {
  const step = stepOf(row, 'build', STEP_BUILT);
  if (!step || !steps.landing || steps.built.has(step) || steps.unlanded.size === 0) return [];
  const waiting = [...steps.unlanded].map((other) => `step ${other}`).join(', ');
  return [`${where}: this starts step ${step} while ${waiting} ${steps.unlanded.size > 1 ? 'are' : 'is'} built and not landed. A trunk plan whose steps land one by one builds one step at a time, as the Long runs rule says: land each built step and log its delivery row "step <n> landed as <sha>", or "step <n> dropped" for one that will not land, before this row`];
}

const git = gitMerges({ branch: projectConfig().branch });
let shipped;
const shipList = () => (shipped ??= readShip(projectConfig().chips?.ship));

let ledgerTasks = null;
const currentLedger = () => {
  const path = trunk() ? join(mainCheckout(), ledgerFile()) : ledgerFile();
  ledgerTasks ??= readTasks(existsSync(path) ? readFileSync(path, 'utf8').split('\n').slice(1) : []);
  return ledgerTasks;
};

function projectConfig(root = '.') {
  const config = join(root, '.agents/pstack.json');
  return existsSync(config) ? JSON.parse(readFileSync(config, 'utf8')) : {};
}

function plansDir() {
  return projectConfig().plans || 'docs/plans';
}

const ledgerFile = () => ledgerPath(plansDir(), projectConfig().delivery);

const trunk = () => projectConfig().delivery === 'trunk';

let main;
function mainCheckout() {
  if (main === undefined) {
    try {
      main = execFileSync('git', ['worktree', 'list', '--porcelain'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).match(/^worktree (.+)$/mu)?.[1] ?? process.cwd();
    } catch {
      main = process.cwd();
    }
  }
  return main;
}
function chipsArgs(args) {
  const valued = new Set(['--session', '--sessions'].flatMap((name) => (args.includes(name) ? [args.indexOf(name), args.indexOf(name) + 1] : [])));
  const at = args.flatMap((arg, index) => (index > 0 && arg !== '--fetch' && !valued.has(index) ? [index] : []));
  const first = args[at[0]];
  const logAt = first === 'brief' ? at[2] : ['stale', 'groups', 'all', 'cleanup', 'sync'].includes(first) ? at[1] : first === 'id' ? undefined : at[0];
  return { rest: at.map((index) => args[index]), logAt };
}
function runLedgerCommandFromMainCheckout(args) {
  if (!trunk() || !['append', 'chips'].includes(args[0])) return;
  const logAt = args[0] === 'append' ? 1 : chipsArgs(args).logAt;
  const ledgers = [resolve(ledgerFile()), join(mainCheckout(), ledgerFile())];
  if (logAt !== undefined && !ledgers.includes(resolve(args[logAt] ?? ''))) return;
  if (args[0] === 'append' && args[2] === '--from' && args[3]) args[3] = resolve(args[3]);
  const sessions = args.indexOf('--sessions');
  if (sessions !== -1 && args[sessions + 1]) args[sessions + 1] = resolve(args[sessions + 1]);
  process.chdir(mainCheckout());
  if (logAt !== undefined) args[logAt] = ledgerFile();
}
const checkoutCopies = (path) => [path, ...(trunk() && !isAbsolute(path) ? [join(mainCheckout(), path)] : [])];
const onDisk = (path) => checkoutCopies(path).some((copy) => existsSync(copy));

function missingPlan(path, line, where) {
  if (line.split('\t')[1] !== 'panel' || dirname(resolve(path)) !== resolve(plansDir())) return [];
  const plan = path.replace(/\.decisions\.tsv$/u, '.md');
  return existsSync(plan) ? [] : [`${where}: a panel row needs its plan ${plan} beside the log, so the page shows the round; write the plan first`];
}

const markedMissing = (evidence, path) =>
  new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?::\\d+)*(?:#L\\d+)?\`?\\s*\\(missing\\)`, 'u').test(evidence);

function missingPaths(evidence, where) {
  return runPaths(evidence, plansDir())
    .filter((path) => !onDisk(path) && !markedMissing(evidence, path))
    .map((path) => `${where}: evidence cites ${path}, which does not exist; write it first or cite the path it was saved to`);
}

function skippedClaudeSeats(decision, where) {
  return decision
    .split(/[,;]/u)
    .filter((entry) => /\bskipped\b/u.test(entry) && /(?<![\w.:-])(?:claude-|opus|sonnet|haiku|fable)/u.test(entry))
    .map((entry) => `${where}: only a Codex seat is marked skipped, after its provider refused it for security; mark ${entry.replace(/^seats\s+/u, '').trim()} missing`);
}

function unnamedSeats(decision, seatsRow, where) {
  const { models } = seatRoster(seatsRow);
  const names = bracketSeats(decision, models);
  if (names?.includes('lead') && names.length > 1) return [`${where}: lead stands only for a critical finding no seat raised; name just the seats that raised it`];
  if (names?.every((name) => name === 'lead' || models.includes(name))) return [];
  return [`${where}: a critical panel finding opens "critical [<seat>, ...]: <finding>" and names each seat that raised it at any severity, from its round's seats row: ${models.length ? `${models.join(', ')} or lead` : 'lead'}`];
}

function recordedProblems(severity, [, , , evidence, result], where) {
  if (severity !== 'critical') return [`${where}: only a critical finding is recorded; a warning or nit is applied, dismissed or deferred with its owner:`];
  const labels = proofLabels(evidence, plansDir(), onDisk).filter((label) => label.path);
  const found = labels.filter((label) => !label.exists).map((label) => `${where}: proof: ${label.path} names no file`);
  if (labels.length === 0) found.push(`${where}: a recorded critical finding names the seat's saved case as "proof: <file under ${plansDir()}/artifacts/>" in its evidence`);
  if (!/(?<![\p{L}\p{N}_])[sS][tT][eE][pP]:\s*\S/u.test(result)) found.push(`${where}: a recorded critical finding names the plan step that fixes it as "step: <n>" in its result, a step that lands no later than the plan's reach step`);
  return found;
}

// A recorded finding waits in code no user can reach, so the step that lets users reach that code waits for it.
const REACH = /(?:^|[\s;,(])reach:\s*\S/u;
const isRecorded = ([, decision = '', , , result = '']) => /^critical\b/u.test(decision) && /^recorded\b/u.test(result);
const settlesRecorded = ([phase, , , , result = '']) => ['panel', 'build'].includes(phase) && /^(applied|dismissed|fixed|verified)\b/u.test(result);
const caseKeys = (evidence) => proofLabels(evidence, plansDir(), onDisk).filter((label) => label.path).map((label) => label.key);

const STEP_ID = /^(\d{1,9})([a-zA-Z]?)$/u;
const STEP_LABEL = /(?<![\p{L}\p{N}_])[sS][tT][eE][pP]:/gu;
const BUILT_STEP = /^built:\s*[sS][tT][eE][pP]\s+/u;
function readStep(clause) {
  const [token = '', ...words] = clause.split(';')[0].trim().split(/[\s,]+/u);
  const [, number, letter] = token.replace(/[.,:)\]}"'`*]+$/u, '').match(STEP_ID) ?? [];
  if (number === undefined || words.some((word) => /^\W*\d/u.test(word))) return null;
  return [Number(number), letter.toLowerCase()];
}
function labelSteps(result) {
  const starts = [...result.matchAll(STEP_LABEL)].map(({ index }) => index);
  return starts.map((start, next) => readStep(result.slice(start + 'step:'.length, starts[next + 1])));
}
const comesAfter = ([number, letter], [builtNumber, builtLetter]) => number > builtNumber || (number === builtNumber && letter !== '' && builtLetter !== '' && letter > builtLetter);
const holdsStep = (steps, built) => !built || steps.length === 0 || steps.some((step) => !step || !comesAfter(step, built));

function trackRecorded(recorded, cells) {
  if (isRecorded(cells)) {
    const entry = { finding: cells[1], steps: labelSteps(cells[4]) };
    for (const key of caseKeys(cells[3])) recorded.set(key, [...(recorded.get(key) ?? []), entry]);
  } else if (settlesRecorded(cells)) for (const key of caseKeys(cells[3])) recorded.delete(key);
}

function reachProblems(recorded, [phase, decision = ''], where) {
  if (phase !== 'build' || !/^built:/u.test(decision) || !REACH.test(decision)) return [];
  const built = BUILT_STEP.test(decision) ? readStep(decision.replace(BUILT_STEP, '').split(/(?<![\p{L}\p{N}_])reach:/u)[0]) : null;
  const held = [...new Set([...recorded.values()].flat())].filter(({ steps }) => holdsStep(steps, built)).map(({ finding }) => finding);
  if (held.length === 0) return [];
  const count = held.length === 1 ? 'a recorded critical finding is' : `${held.length} recorded critical findings are`;
  const unread = built ? '' : ' This row does not name one readable step as "built: step <n>" with no other word that starts with a digit, past any symbols, before its first ";" or reach:, so every recorded finding counts.';
  return [`${where}: this built: row names its step's reach:, and ${count} not settled: ${held.join('; ')}.${unread} Before users can reach that code, fix each in the step its row's step: names, and log a panel or build row whose evidence names the same proof: file with a result that starts applied, dismissed, fixed or verified`];
}

function rowProblems(line, where, roster, chips) {
  const cells = line.split('\t');
  if (cells.length !== 6) return [`${where}: ${cells.length} cells, expected 6`];
  const found = [];
  const [ts, ...rest] = cells;
  if (!TIMESTAMP.test(ts)) found.push(`${where}: ts "${ts}" is not UTC ISO8601`);
  for (const [cell, value] of rest.entries()) {
    if (!value.trim()) found.push(`${where}: empty ${CELLS[cell]}`);
  }
  const status = statusOf(rest[4]);
  if (rest[4].trim() && (!status || !STATUSES.includes(status))) {
    found.push(`${where}: result must start with one of: ${STATUSES.join(', ')}`);
  }
  // A claim of success names what the proof covered (widths, persona,
  // fixture, allowed or denied path), which is where overclaims hide.
  if (status && PROVEN.includes(status) && !/\bscope:/iu.test(rest[3])) {
    found.push(`${where}: a ${status} result needs "scope:" in its evidence naming what the proof covered, or a partial result that states the gap`);
  }
  if (rest[0] === 'panel' && !SEATS.test(rest[1])) {
    const severity = severityOf(rest[1]);
    if (!severity) found.push(`${where}: a panel row's decision starts with "seats" or a severity: critical, warning or nit; any other phase, such as build or trail, takes a row that is neither`);
    else if (!roster) found.push(`${where}: a panel finding needs a "seats" row before it`);
    else if (severity === 'critical') found.push(...unnamedSeats(rest[1], roster, where));
    if (!/^(applied|dismissed|deferred|open|recorded)\b\W+\w/u.test(rest[4])) found.push(`${where}: a panel finding's result starts with "applied", "dismissed", "deferred", "open" or, for a critical finding no user can reach yet, "recorded", and gives the reason`);
    else if (/^recorded\b/u.test(rest[4])) found.push(...recordedProblems(severity, rest, where));
    else if (/^deferred\b/u.test(rest[4])) {
      if (rest[1].startsWith('critical')) found.push(`${where}: a critical panel finding is never deferred: apply it or pivot the run to it, record it when no user can reach its case yet, dismiss it on proof that it is no defect or is rare, or, when its own case fails the same way on the run's base, log it open with patch: none, owner:, stop: and each line it limits in the result, and proof: none and the base run in the evidence`);
      else if (!/\bowner:\s*\S/u.test(rest[4])) found.push(`${where}: a deferred panel finding names its owner:`);
    } else if (/^open\b/u.test(rest[4]) && !(/\bpatch:\s*\S/u.test(rest[4]) && /\bowner:\s*\S/u.test(rest[4]))) {
      found.push(`${where}: an open panel finding names its patch: and owner:`);
    }
  }
  if (rest[0] === 'panel' && SEATS.test(rest[1])) found.push(...skippedClaudeSeats(rest[1], where));
  if (rest[0] !== 'panel' && isRecorded(rest)) found.push(...recordedProblems('critical', rest, where));
  if (rest[0] !== 'chip' && CHIP_STATES.includes(status)) {
    found.push(`${where}: ${/^[aeiou]/u.test(status) ? 'an' : 'a'} ${status} result belongs only in a chip row; a run's log records the same step as applied, decided, fixed or verified`);
  }
  if (rest[0] === 'chip' && chips) found.push(...chipRowProblems(rest, chips, where));
  const reviewerRow = isHandOffReview(rest[0]);
  return reviewerRow ? found : [...found, ...missingPaths(chips ? withoutPlannedWrites(rest) : rest[3], where)];
}

// A card session reads a finding's evidence from this checkout, never from the worktree that wrote it.
function missingFindingPaths(cells, where) {
  if (!['offered', 'folded'].includes(statusOf(cells[4]))) return [];
  return runPaths(cells[2], plansDir())
    .filter((path) => !existsSync(path) && !markedMissing(cells[2], path))
    .map((path) => `${where}: the finding cites ${path}, which this checkout lacks; copy it here from the worktree that wrote it, or cite the path it was saved to`);
}

function newRowProblems(cells, where, chips, writer) {
  const found = [];
  if (cells[0] === 'chip' && chips) found.push(...missingFindingPaths(cells, where));
  return [...found, ...(cells[0] === 'chip' && chips ? newChipRowProblems(cells, chips, where, git, writer, shipList, invokedFrom) : []), ...baseRedProblems(cells[3], chips ?? currentLedger(), where)];
}

const transcriptOf = (run) => (run ? basename(run.transcript, '.jsonl') : null);

// An owner's session id can change with the account, so an offer or a takeover
// that names session: also records the writing session's transcript id.
function stampTranscript(cells, run) {
  const [phase, , , evidence, result] = cells;
  const owning = phase === 'chip' && /^(?:offered|updated)\b/u.test(result) && namesOwner(evidence) && !hasToken(evidence, 'transcript');
  return owning && run ? [cells[0], cells[1], cells[2], `${evidence}; transcript: ${transcriptOf(run)}`, cells[4]] : cells;
}

function appendOnlyLabelProblems(log, row, earlier, where) {
  const [, phase, , , evidence, result] = row.split('\t');
  if (isHandOffReview(phase)) return [];
  const status = statusOf(result);
  if (!NOT_PASSED.includes(status) && status !== 'accepted') return [];
  const labels = proofLabels(evidence, plansDir(), onDisk);
  const found = labels
    .filter((label) => label.path && !label.exists)
    .map((label) => `${where}: proof: ${label.path} names no file`);
  if (NOT_PASSED.includes(status)) {
    if (labels.length === 0) found.push(`${where}: an unlabeled ${status} row: name the file whose verdict it states as "proof: <path under ${plansDir()}/artifacts/>" in its evidence, or write "proof: none" when it grades no file, such as a row that tracks a bug or a finding`);
    return found;
  }
  const states = proofStates(earlier.map((line) => line.split('\t')), plansDir());
  const files = labels.filter((label) => label.path);
  if (files.length === 0) found.push(`${where}: an accepted row names the not-passed file it accepts as "proof: <path>"`);
  for (const label of files.filter((file) => file.exists && states.get(file.key)?.passed !== false)) {
    found.push(`${where}: ${label.path} has no labeled partial, open, gap, blocked or inconclusive row before this one, so there is nothing to accept`);
  }
  const plan = log.replace(/\.decisions\.tsv$/u, '.md');
  const word = acceptedWord(evidence);
  if (!word) found.push(`${where}: an accepted row names the accepting Defaults word as "word: <word>"`);
  else if (!existsSync(plan)) found.push(`${where}: an accepted row needs its plan ${plan}, whose Defaults offers the word`);
  else if (!isAcceptingWord(word, defaultsWords(readFileSync(plan, 'utf8')))) found.push(`${where}: word: ${word} is not an option of a Word cell in ${plan}'s Defaults`);
  return found;
}

const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
const isOpenCritical = ([phase, decision = '', , , result = '']) => phase === 'panel' && /^critical\b/u.test(decision) && /^open\b/u.test(result);

function designQuestionProblems(log, cells, where, count) {
  const slug = basename(log).replace(/\.decisions\.tsv$/u, '');
  const cited = new RegExp(`(?<![\\w-])${escaped(slug)}(?![\\w-])`, 'u');
  const held = `this log already holds ${count} open critical finding${count === 1 ? '' : 's'}, and a design that leaves two critical findings open may need a redesign`;
  const route = `offer one kind: decide task in ${ledgerFile()}, with via: panel when it ranks P2 or P3, whose finding cites ${slug} and asks whether the design those findings live in needs a redesign, or fold this finding into the topic's open design question with a folded row whose finding cites ${slug}, then name it in this row's result as "task:<id>"`;
  const ids = [...cells[4].matchAll(/(?:^|[\s,;(])task:\s*([\w-]+)/gu)].map((match) => match[1]);
  if (ids.length === 0) return [`${where}: ${held}: ${route}`];
  const reasons = ids.map((id) => {
    const task = currentLedger().get(id);
    if (!task) return `task:${id} is not a task in ${ledgerFile()}`;
    if (task.kind !== 'decide') return `task:${id} is a ${task.kind} task, not a design question`;
    if (!['offered', 'started'].includes(task.status)) return `task:${id} is ${task.status}, not open`;
    const findings = [...task.findings, ...task.covers.flatMap((covered) => covered.findings)];
    return findings.some((finding) => cited.test(finding)) ? null : `no finding of task:${id} cites ${slug}`;
  });
  return reasons.includes(null) ? [] : [`${where}: ${held}; ${reasons.join('; ')}; ${route}`];
}

function redesignPlaybook(log) {
  const plan = log.replace(/\.decisions\.tsv$/u, '.md');
  if (plan === log || !existsSync(plan)) return null;
  const meta = (file) => parsePlan(readFileSync(file, 'utf8').replaceAll('\r\n', '\n')).meta;
  const name = meta(plan).playbook ?? '';
  const file = join('.agents/playbooks', `${name}.md`);
  return /^[\w-]+$/u.test(name) && existsSync(file) && meta(file)['redesign-runs'] === 'on' ? name : null;
}

const isFailureKind = ([phase, decision = '', , , result = '']) => phase === 'panel' && /^critical\b/u.test(decision) && !/^dismissed\b/u.test(result);
const ownersNamed = (decision) => new Set(decision.replace(/^separate owners:/u, '').split(';').map((owner) => owner.trim().toLowerCase()).filter(Boolean)).size;

function marksRedesign([phase, decision = '', , evidence = ''], log) {
  if (!/^redesign run:\s*\S/u.test(decision)) return false;
  if (phase !== 'verdict') return phase === 'owner';
  const own = [log, log.replace(/\.decisions\.tsv$/u, '.md')].map((file) => resolve(file));
  const isOtherPlan = (file) => /\.(?:md|decisions\.tsv)$/u.test(file) && dirname(resolve(file)) === resolve(plansDir()) && !own.includes(resolve(file)) && onDisk(file);
  return evidence.split(/[\s`,;()[\]'"]+/u).map((token) => token.replace(/\.$/u, '').replace(/(?::\d+)+$/u, '')).some(isOtherPlan);
}

function trackRedesign(state, cells) {
  if (cells[0] === 'panel' && SEATS.test(cells[1])) Object.assign(state, { kinds: 0, owners: 1, plan: false });
  else if (marksRedesign(cells, state.log)) state.redesign = true;
  else if (/^plan round:\s*\S/u.test(cells[1])) state.plan = true;
  else if (/^separate owners:/u.test(cells[1])) state.owners = Math.max(ownersNamed(cells[1]), 1);
  else if (isFailureKind(cells)) state.kinds += 1;
}

function redesignProblems(state, cells, where) {
  if (!state.playbook || state.redesign || state.plan || !isFailureKind(cells) || state.kinds < state.owners) return [];
  const owners = state.owners > 1 ? ` while its separate owners: row names ${state.owners} owners` : '';
  return [
    `${where}: this is critical finding ${state.kinds + 1} of its panel round${owners}, and the ${state.playbook} playbook counts more than one failure kind with one owner in the review of one fix as a second failed fix. Before another attempt, run pstack:recall on the bug and its owner with no time window, then verdict on the owner, and log a row whose decision starts with "redesign run:": in phase verdict, giving the verdict and naming in its evidence the verdict's page or, in a plan that continues a redesign run, the earlier log that holds its "redesign run:" row; or in phase owner, quoting the owner's words that made this run a redesign. When this round reviews a plan, not a fix, log instead, before this row, a row whose decision starts with "plan round:" and names the plan. When each of the round's critical findings has its own owner, log instead, before this row, a row whose decision starts with "separate owners:" and names each owner, separated by semicolons`,
  ];
}

const PLAN_PATCH = /\bpatch:\s*`?([^\s`;,]+\.md)(?![\w-])/u;
const planOfLog = (log) => basename(log).replace(/\.decisions\.tsv$/u, '.md');
const plansDirs = () => [plansDir(), ...(isAbsolute(plansDir()) ? [] : [join(mainCheckout(), plansDir())])].map((dir) => resolve(dir));
const pivotPlanOf = ([, , , , result = '']) => {
  const path = /^open\b/u.test(result) ? result.match(PLAN_PATCH)?.[1] : null;
  return path && (dirname(path) === '.' || plansDirs().includes(resolve(dirname(path)))) ? basename(path) : null;
};
const landsWork = ([, decision = '']) => /^(?:step \S+ )?landed as [0-9a-f]{7,40}\b/iu.test(decision);
const allowsNextPlan = ([phase, decision = '']) => phase === 'owner' && /^second plan:[^"]*"[^"]+"/u.test(decision);

function trackPlans(state, cells) {
  const plan = pivotPlanOf(cells);
  const fresh = plan && !state.named.has(plan);
  if (plan) state.named.add(plan);
  if (landsWork(cells)) Object.assign(state, { plans: new Set(), allowed: false });
  else if (allowsNextPlan(cells)) state.allowed = true;
  else if (fresh) {
    if (!state.allowed) state.plans.add(plan);
    state.allowed = false;
  }
}

function runLogs() {
  const runs = checkoutCopies(join(plansDir(), 'artifacts')).filter((dir) => existsSync(dir)).flatMap((dir) =>
    readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(dir, entry.name)),
  );
  return [...new Set([...checkoutCopies(plansDir()), ...runs].filter((dir) => existsSync(dir)).flatMap(decisionLogs).map((log) => resolve(log)))];
}

const logEntry = (own, lines) => {
  const rows = lines.slice(1).filter(Boolean);
  return { own, rows, names: rows.filter((line) => line.includes('patch:')).map((line) => pivotPlanOf(line.split('\t').slice(1))).filter(Boolean) };
};

function runPlanState(log, existing) {
  const entries = [...runLogs().map((path) => logEntry(planOfLog(path), readFileSync(path, 'utf8').split('\n'))), logEntry(planOfLog(log), existing)];
  const plans = new Set([planOfLog(log)]);
  const members = new Set();
  for (let grew = true; grew; ) {
    grew = false;
    for (const entry of entries) {
      if (members.has(entry) || !(plans.has(entry.own) || entry.names.some((plan) => plans.has(plan)))) continue;
      members.add(entry);
      grew = true;
      for (const plan of [entry.own, ...entry.names]) plans.add(plan);
    }
  }
  const state = { plans: new Set(), named: new Set(), allowed: false };
  const stamp = ([line]) => line.slice(0, line.indexOf('\t'));
  const rows = [...new Map([...members].flatMap((entry) => entry.rows.map((line) => [line, entry.own])))].sort((one, two) => (stamp(one) < stamp(two) ? -1 : stamp(one) > stamp(two) ? 1 : 0));
  for (const [line, own] of rows) {
    const cells = line.split('\t').slice(1);
    if (pivotPlanOf(cells)) state.named.add(own);
    trackPlans(state, cells);
  }
  return state;
}

function secondPlanProblems(state, cells, where) {
  const plan = pivotPlanOf(cells);
  if (!plan || state.named.has(plan) || state.allowed || state.plans.size === 0) return [];
  const count = state.plans.size;
  return [
    `${where}: this starts the new plan ${plan} after ${count} new plan${count === 1 ? '' : 's'} the lead chose since the run's last landing, and the Second plan rule in .agents/pstack/rules/long-runs.md stops the run for the owner before each new plan after the first. Ask the owner that rule's one question, and keep landing the steps that do not depend on the answer. When the owner picks the new plan, log before this row an owner row whose decision starts with "second plan:" and quotes their answer in double quotes. When they keep the base's behavior, log this finding open with patch: none and their answer quoted. A landing counts only from a row whose decision starts with "landed as <sha>" or "step <n> landed as <sha>", so when the run has landed since its last new plan and logged it another way, log that row before this one`,
  ];
}

const PRIOR_ART = /(?:^|[\s;`(*])prior-art:\**\s*([^;\t]*)/giu;
const isFile = (path) => existsSync(path) && statSync(path).isFile();
const fileOnDisk = (path) => checkoutCopies(path).some(isFile);

function priorArtProblems(state, cells, where) {
  const plan = pivotPlanOf(cells);
  if (!plan || state.named.has(plan)) return [];
  const root = `${plansDir()}/artifacts/`;
  const words = [...`${cells[3]} ${cells[4]}`.matchAll(PRIOR_ART)].flatMap((match) => match[1].match(/[^\s()[\]<>`,*"']+/gu) ?? []);
  const word = words.find((part) => part.includes(root)) ?? words[0];
  const path = word && normalize(tidy(word));
  if (path?.includes(root) && fileOnDisk(path)) return [];
  const named = path ? `its prior-art: ${path} is no file under ${root}` : 'it names no prior-art: report';
  return [
    `${where}: this starts the new plan ${plan}, and ${named}. Before a pivot designs its plan, the lead runs evidence lanes on the finding's own case and saves their report in the run directory, as the pivot rule in .agents/pstack/rules/panel.md says. Name that report in this row as prior-art: <path under ${root}>`,
  ];
}

function problems(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  if (lines[0] !== HEADER) return [`${path}:1: header must be "${HEADER.replaceAll('\t', ' ')}"`];
  const committed = committedLines(path);
  let roster = null;
  const chips = resolve(path) === resolve(ledgerFile()) ? new Map() : null;
  return lines.flatMap((line, index) => {
    if (index === 0 || line === '') return [];
    const where = `${path}:${index + 1}`;
    const rowFound = committed.has(line) ? [] : [...rowProblems(line, where, roster, chips), ...missingPlan(path, line, where)];
    if (opens(line)) roster = line.split('\t')[2];
    if (chips) {
      const [ts, ...cells] = line.split('\t');
      recordRow(chips, cells, ts);
    }
    return rowFound;
  });
}

// The page shows which model and effort wrote each stretch of the log, so a
// batch from a session whose lead differs from the log's last lead row opens
// with a new one.
function leadRow(existing, run, miss) {
  const last = existing.findLast((line) => line.split('\t')[1] === 'lead')?.split('\t')[2];
  const label = run ? leadLabel(run) : 'unknown';
  const why = `runtime identity could not be verified${miss ? ` because ${miss.replace(/\s+/gu, ' ')}` : ''}`;
  if (!run) return last === label ? [] : [['lead', label, why, 'proof: none', 'recorded unknown session']];
  return last === label ? [] : [['lead', label, 'read from the session transcript, since an agent cannot see its own effort', `transcript ${basename(run.transcript)}`, `recorded ${run.runtime} session`]];
}

function append(path, batch, run, miss = null) {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z');
  const text = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const existing = (text ?? '').split('\n');
  const count = batch.length;
  const attribution = leadRow(existing, run, miss);
  batch = [...attribution, ...batch];
  let roster = existing.findLast(opens)?.split('\t')[2] ?? null;
  const isWriting = (line) => line.split('\t')[1] === 'writing';
  let written = isWriting(existing.findLast((line) => opens(line) || isWriting(line)) ?? '');
  const round = roundState(existing);
  let openCriticals = existing.slice(1).filter((line) => isOpenCritical(line.split('\t').slice(1))).length;
  const redesign = { log: path, playbook: redesignPlaybook(path), redesign: false, plan: false, kinds: 0, owners: 1 };
  for (const line of existing.slice(1).filter(Boolean)) trackRedesign(redesign, line.split('\t').slice(1));
  const recorded = new Map();
  for (const line of existing.slice(1).filter(Boolean)) trackRecorded(recorded, line.split('\t').slice(1));
  const steps = trunk() ? { built: new Set(), unlanded: new Set(), landing: false } : null;
  if (steps) for (const line of existing.slice(1)) trackStep(steps, line);
  const plans = batch.some((cells) => pivotPlanOf(cells)) ? runPlanState(path, existing) : null;
  const chips = readTasks(existing.slice(1));
  const ledger = resolve(path) === resolve(ledgerFile());
  const writer = run ? { session: null, transcript: transcriptOf(run) } : null;
  const rows = [];
  const found = [];
  for (let [index, cells] of batch.entries()) {
    if (cells.length === 5) cells = stampTranscript(cells, run);
    const where = index < attribution.length ? `${path} (lead row)` : count > 1 ? `${path} (new row ${index + 1 - attribution.length})` : `${path} (new row)`;
    if (cells.length !== 5) {
      found.push(`${where}: append takes 5 cells, got ${cells.length}`);
      continue;
    }
    const broken = cells.findIndex((cell) => /[\t\n]/u.test(cell));
    if (broken !== -1) {
      found.push(`${where}: ${CELLS[broken]} contains a tab or newline`);
      continue;
    }
    const row = [stamp, ...cells].join('\t');
    if (cells[0] === 'chip' && !ledger) found.push(`${where}: chip rows go in the project's ledger ${ledgerFile()}, because a suggested task outlives the run that offered it`);
    found.push(...rowProblems(row, where, roster, ledger ? chips : null), ...newRowProblems(cells, where, ledger ? chips : null, writer), ...missingPlan(path, row, where), ...appendOnlyLabelProblems(path, row, [...existing.slice(1).filter(Boolean), ...rows], where));
    if (isOpenCritical(cells)) {
      if (openCriticals > 0 && !(redesign.playbook && redesign.redesign)) found.push(...designQuestionProblems(path, cells, where, openCriticals));
      openCriticals += 1;
    }
    trackRecorded(recorded, cells);
    found.push(...redesignProblems(redesign, cells, where), ...reachProblems(recorded, cells, where));
    trackRedesign(redesign, cells);
    if (plans) {
      found.push(...secondPlanProblems(plans, cells, where), ...priorArtProblems(plans, cells, where));
      trackPlans(plans, cells);
    }
    if (opens(row) && roster && !written) {
      found.push(`${where}: a later round's seats row needs a writing row after the previous seats row: log the round's writing passes under phase writing, or log a writing row that says why none ran`);
    }
    if (opens(row) && pastCap(round)) found.push(`${where}: ${capMessage(round)}`);
    if (steps) {
      found.push(...stepInFlightProblems(steps, row, where));
      trackStep(steps, row);
    }
    trackRound(round, row);
    if (opens(row)) written = false;
    else if (isWriting(row)) written = true;
    if (opens(row)) roster = cells[1];
    recordRow(chips, cells, stamp);
    rows.push(row);
  }
  if (found.length === 0) found.push(...buildBudgetProblems(path, existing, rows, (at) => (count > 1 ? `${path} (new row ${at + 1 - attribution.length})` : `${path} (new row)`)));
  if (found.length > 0) return { found, rows: [] };
  const added = rows.map((row) => `${row}\n`).join('');
  if (text !== null) {
    appendFileSync(path, `${text === '' || text.endsWith('\n') ? '' : '\n'}${added}`);
  } else writeFileSync(path, `${HEADER}\n${added}`);
  return { found: [], rows };
}

function sharedLedgerGit(log) {
  if (!trunk() || resolve(log) !== resolve(ledgerFile())) return null;
  const dir = projectConfig().companion?.dir;
  const via = dir ? ['--git-dir', join(mainCheckout(), dir)] : [];
  if (dir && !existsSync(via[1])) return null;
  return spawnSync('git', [...via, 'remote', 'get-url', 'origin'], { stdio: 'ignore' }).status === 0 ? via : null;
}

const reportRefused = (refused) => {
  for (const { problem } of refused) console.error(`Refused ${problem}, because a row on ${LEDGER_REF} came first; the row moved to ${REFUSED}.`);
};

function appendShared(log, batch, run, miss, via) {
  let held = null;
  const lock = lockLedger(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).trim(), {
    waitMs: 60_000,
    onWait: (path) => {
      held = path;
      console.error(`Waiting for the ledger lock ${path}, which another run holds.`);
    },
  });
  if (!lock) return { found: [`another run held the ledger lock ${held} for 60 s; run append again`], rows: [] };
  try {
    const pulled = syncLedger(log, via, lock, { push: false });
    reportRefused(pulled.refused);
    const written = append(log, batch, run, miss);
    const keptLocally = (why) => console.error(`${log} keeps the new rows locally until the next sync, because ${why}.`);
    if (written.found.length > 0) return written;
    if (!pulled.reachable) {
      keptLocally('origin cannot be reached');
      return written;
    }
    const pushed = syncLedger(log, via, lock, { checked: pulled.tip });
    const lost = pushed.refused.filter(({ line }) => written.rows.includes(line));
    reportRefused(pushed.refused.filter((entry) => !lost.includes(entry)));
    if (lost.length > 0) return { found: lost.map(({ problem }) => `${problem}; the row moved to ${REFUSED}`), rows: [], heading: `Refused, because a row on ${LEDGER_REF} came first` };
    if (pushed.pending > 0) keptLocally(pushed.reachable ? `${LEDGER_REF} moved on each try` : 'origin cannot be reached');
    return written;
  } finally {
    lock.release();
  }
}

const args = process.argv.slice(2);
const invokedFrom = process.cwd();
runLedgerCommandFromMainCheckout(args);
function dispatch() {
  if (args[0] === '--help' || args[0] === '-h') {
    const source = readFileSync(new URL(import.meta.url), 'utf8').split('\n');
    const from = source.findIndex((line) => line.startsWith('// Usage:'));
    const to = source.findIndex((line, index) => index > from && !line.startsWith('//'));
    console.info(source.slice(from, to).map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
    return 0;
  }
  if (args[0] === 'rounds') {
    if (!args[1] || !existsSync(args[1])) {
      console.error(args[1] ? `no log at ${args[1]}` : 'Usage: node .agents/pstack/decisions-check.mjs rounds <log.decisions.tsv> [--patch <file>]');
      return 2;
    }
    const lines = readFileSync(args[1], 'utf8').split('\n');
    const round = roundState(lines);
    console.info(`${round.rounds} panel round(s) since the last restart, the last applying ${round.applied} critical finding(s); the cap is ${roundCap()}, plus one round after a round that applies ${EXTRA_ROUND_FIXES} or more`);
    let status = 0;
    if (pastCap(round)) {
      console.error(capMessage(round));
      status = 1;
    }
    const patchFile = args[args.indexOf('--patch') + 1];
    if (args.includes('--patch')) {
      if (!patchFile || !existsSync(patchFile)) {
        console.error(patchFile ? `no patch at ${patchFile}` : 'Usage: node .agents/pstack/decisions-check.mjs rounds <log.decisions.tsv> --patch <file>');
        return 2;
      }
      const budget = stepBudget(projectConfig());
      const { product, other } = patchLines(readFileSync(patchFile, 'utf8'), budget.excluded);
      console.info(`the patch changes ${product} product line(s), and ${other} more in tests, fixtures, Markdown, generated output and stepBudget.exclude globs; the step budget is ${budget.lines}`);
      if (product > budget.lines && !bigStep(lines)) {
        console.error(`the patch ${overBudget(product, budget.lines)}, which lifts the budget for one round`);
        status = 1;
      }
    }
    return status;
  }
  if (args[0] === 'chips') {
    const fetch = args.includes('--fetch');
    const at = args.indexOf('--session');
    const here = at === -1 ? null : (args[at + 1] ?? null);
    if (at !== -1 && !SESSION.test(here ?? '')) {
      console.error("--session takes this session's id, the one the runtime's session tool gives it");
      return 2;
    }
    const { rest, logAt } = chipsArgs(args);
    if (rest[0] === 'id') {
      console.info(newId());
      return 0;
    }
    const id = rest[0] === 'brief' ? rest[1] : null;
    const named = args[logAt];
    const ledger = named ?? ledgerFile();
    if (!existsSync(ledger)) {
      console.error(named ? `no log at ${ledger}` : `No ledger at ${ledger} yet; run this from the project root.`);
      return named ? 2 : 0;
    }
    const lines = readFileSync(ledger, 'utf8').split('\n').slice(1);
    const tasks = readTasks(lines);
    const sessionList = () => {
      const file = args.includes('--sessions') ? args[args.indexOf('--sessions') + 1] : null;
      if (!file) return null;
      let sessions = null;
      try {
        sessions = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
      } catch {}
      if (!Array.isArray(sessions)) {
        console.error(`${file} does not hold a JSON array of sessions, the session tool's list saved as JSON`);
        return false;
      }
      return sessions;
    };
    const all = rest[0] === 'all';
    if (all && here === null) {
      console.error("chips all takes --session <id>, the id the runtime's session tool gives this session, because the tasks it takes become this session's");
      return 2;
    }
    const listed = all ? sessionList() : null;
    if (listed === false) return 2;
    const owning = { transcript: here === null ? null : transcriptOf(findLead().run ?? null), all, live: listed && new Set(listed.filter((session) => !session.isArchived).map((session) => session.sessionId)) };
    if (rest[0] === 'cleanup') {
      const sessions = sessionList();
      if (sessions === false) return 2;
      if (!sessions) {
        console.error("chips cleanup takes --sessions <file>, the session tool's list of every session, archived ones included, saved as a JSON array");
        return 2;
      }
      // The shell may have moved out of the session's folder, which the runtime process keeps.
      const { archive, remove, report, kept } = cleanupOf(tasks, sessions, here, [invokedFrom, runtimeFolder()]);
      if (!report.length) {
        console.info('Nothing to clean up: no landed task has an idle card session or a worktree left.');
        return 0;
      }
      const out = [];
      if (archive.length) out.push(`Archive (${archive.length}), with the session tool, each idle card session whose task landed, then save the session list again and rerun chips cleanup:`, ...archive.map((session) => `  ${session.sessionId}  ${session.title}`));
      if (remove.length) out.push(`Remove (${remove.length}) the worktrees of landed tasks whose sessions are archived:`, `  node .agents/skills/cleanup/scripts/scan.mjs --repo . --remove ${remove.join(' ')}`);
      if (kept.length) out.push(`Keep (${kept.length}) each idle card session that holds a card nobody has started, because archiving it drops that card; a later cleanup archives it once the card is started or a week old:`, ...kept.map((line) => `  ${line}`));
      out.push(`Report (${report.length}):`, ...report.map((line) => `  ${line}`));
      console.info(out.join('\n'));
      return 0;
    }
    if (rest[0] === 'groups') {
      console.info(renderGroups(groupsOf(tasks, plansDir()), ledger));
      return 0;
    }
    if (rest[0] === 'stale') {
      const states = new Map();
      const prState = (pr) => {
        if (!states.has(pr)) {
          try {
            states.set(pr, execFileSync('gh', ['pr', 'view', String(pr), '--json', 'state', '-q', '.state'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
          } catch {
            states.set(pr, null);
          }
        }
        return states.get(pr);
      };
      const at = offeredAt(lines);
      const DAY = 86_400;
      const oldest = [...at.values()].sort()[0] ?? new Date().toISOString();
      const read = (via, args, input) => {
        try {
          return execFileSync('git', [...via, ...args], { encoding: 'utf8', input, maxBuffer: 1 << 30, stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'ignore'] });
        } catch {
          return '';
        }
      };
      const PURE_RENAME = 'R100';
      const logged = new Map();
      const logEntries = (via) => {
        const key = via.join('\0');
        if (logged.has(key)) return logged.get(key);
        const entries = [];
        let commit = null;
        for (const row of read([...via, '-c', 'core.quotePath=false'], ['log', '--first-parent', '--diff-merges=first-parent', `--since-as-filter=${oldest}`, '--format=%x01%ct%x09%h%x09%s', '--raw', '--no-abbrev', '-M']).split('\n')) {
          if (row.startsWith('\x01')) {
            const [time, hash, subject] = row.slice(1).split('\t');
            commit = { time: Number(time), hash, subject };
          } else if (row.startsWith(':') && commit) {
            const [meta, ...paths] = row.split('\t');
            const [, , before, after, status] = meta.split(' ');
            const changesContent = status !== PURE_RENAME;
            if (status.startsWith('R')) entries.push({ ...commit, status: 'D', path: paths[0], content: before, changesContent, renamed: true });
            entries.push({ ...commit, status: status[0], path: paths.at(-1), content: status[0] === 'D' ? before : after, changesContent });
          }
        }
        logged.set(key, entries);
        return entries;
      };
      const markMovesBetween = (entries, partner) => {
        const opposite = { A: 'D', D: 'A' };
        const halves = new Map();
        for (const entry of logEntries(partner)) {
          const key = `${entry.status}\0${entry.path}\0${entry.content}`;
          halves.set(key, [...(halves.get(key) ?? []), entry.time]);
        }
        for (const entry of entries) {
          const times = opposite[entry.status] ? halves.get(`${opposite[entry.status]}\0${entry.path}\0${entry.content}`) : null;
          if (times?.some((time) => Math.abs(time - entry.time) <= DAY)) entry.moved = true;
        }
      };
      const history = new Map();
      const historyOf = (via, partner = null) => {
        const key = via.join('\0');
        if (history.has(key)) return history.get(key);
        const entries = logEntries(via);
        if (partner) markMovesBetween(entries, partner);
        const byPath = new Map();
        for (const entry of entries) byPath.set(entry.path, [...(byPath.get(entry.path) ?? []), entry]);
        history.set(key, byPath);
        return byPath;
      };
      const companion = projectConfig().companion?.dir;
      const own = companion && existsSync(companion) ? [[], ['--git-dir', companion, '--work-tree', '.']] : [[]];
      const repoPath = (path) => {
        const clean = normalize(path).replace(/\/$/u, '');
        return clean === '.' ? '' : clean;
      };
      const root = realpathSync('.');
      const nearestDir = (path) => (existsSync(path) ? (statSync(path).isDirectory() ? path : dirname(path)) : nearestDir(dirname(path)));
      const ownHomes = (path) => own.map((via, index) => ({ byPath: historyOf(via, own.length > 1 ? own[1 - index] : null), path: repoPath(path) }));
      const homes = (written) => {
        if (!isAbsolute(written)) return ownHomes(written);
        const dir = nearestDir(written);
        const top = read(['-C', dir], ['rev-parse', '--show-toplevel']).trim();
        if (!top) return [];
        const path = join(read(['-C', dir], ['rev-parse', '--show-prefix']).trim(), relative(dir, written));
        return realpathSync(top) === root ? ownHomes(path) : [{ byPath: historyOf(['-C', top]), path: repoPath(path) }];
      };
      const entriesAt = (byPath, under, file) => (file ? (byPath.get(under) ?? []) : [...byPath].filter(([each]) => under === '' || each === under || each.startsWith(`${under}/`)).flatMap(([, entries]) => entries));
      const changesOf = (since, path) => {
        const after = Date.parse(since) / 1000;
        const file = existsSync(path) && !statSync(path).isDirectory();
        return homes(path).flatMap(({ byPath, path: under }) => entriesAt(byPath, under, file).filter((entry) => entry.time >= after && !entry.moved));
      };
      const deletedSince = (since, path) => changesOf(since, path).some((entry) => entry.status === 'D' && !entry.renamed);
      const commitsSince = (since, paths) => {
        const seen = new Map();
        for (const path of paths) for (const entry of changesOf(since, path)) if (entry.changesContent) seen.set(entry.hash, entry);
        return [...seen.values()].sort((a, b) => b.time - a.time).map((commit) => commit.subject);
      };
      const rows = staleReport(tasks, at, { exists: existsSync, deletedSince, commitsSince, prState, now: Date.now(), ship: shipList().items });
      console.info(rows.length ? `${rows.length} open suggested tasks in ${ledger}, the likeliest stale first:\n${rows.join('\n')}` : `No open suggested tasks in ${ledger}.`);
      return 0;
    }
    if (rest[0] === 'brief') {
      const task = tasks.get(id ?? '');
      if (!task) {
        console.error(`${id ?? '(no id)'} is not a task in ${ledger}`);
        return 2;
      }
      const git = gitMerges({ fetch, branch: projectConfig().branch });
      let view;
      const wholeBoard = () => (view ??= board(tasks, git, null, { ship: shipList() }));
      const { ok, text } = briefOf(tasks, id, ledger, maxEffort(), projectConfig().chips?.codex, (each) => boardState(tasks, each, git, wholeBoard));
      (ok ? console.info : console.error)(text);
      return ok ? 0 : 1;
    }
    const view = board(tasks, gitMerges({ fetch, branch: projectConfig().branch }), here, { ...owning, ship: shipList(), sync: rest[0] === 'sync' });
    for (const note of startedOverlaps(tasks)) console.error(note);
    console.info(renderBoard(view, ledger, maxEffort()));
    return view.problem ? 1 : 0;
  }
  if (args[0] === 'append') {
    const batch =
      args[2] === '--from'
        ? readFileSync(args[3] ?? '', 'utf8')
            .split(/\r?\n/u)
            .filter((line) => line.trim())
            .map((line) => line.split('\t'))
        : [args.slice(2)];
    const lead = findLead();
    const run = lead.run ?? null;
    if (!run) console.error(`Runtime identity is unknown because ${lead.miss}, so ${args[1]} records an unknown lead boundary.`);
    const via = sharedLedgerGit(args[1] ?? '');
    const { found, heading } = batch.length === 0 ? { found: [`${args[3]} holds no rows`] } : via ? appendShared(args[1], batch, run, lead.miss, via) : append(args[1] ?? '', batch, run, lead.miss);
    if (found.length > 0) {
      console.error(`${heading ?? (batch.length > 1 ? 'No row written' : 'Row not written')}:\n${found.join('\n')}`);
      return 1;
    }
    console.info(batch.length > 1 ? `Appended ${batch.length} rows to ${args[1]}.` : `Appended a row to ${args[1]}.`);
    if (run) console.info(`Lead: ${leadLabel(run)}.`);
    return 0;
  }
  const paths = args[0] === '--all' ? decisionLogs(plansDir()) : args;
  if (paths.length === 0 && args[0] !== '--all') {
    console.error('Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...] | --all');
    return 2;
  }
  const missing = paths.filter((path) => !existsSync(path));
  if (missing.length > 0) {
    console.error(`no log at ${missing.join(', ')}; --help prints the usage`);
    return 2;
  }
  const found = paths.flatMap(problems);
  if (found.length > 0) {
    console.error(`${found.length} problem(s):\n${found.join('\n')}`);
    return 1;
  }
  console.info(`New rows are well formed in ${paths.length} log(s).`);
  return 0;
}
process.exitCode = dispatch();
