#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const PORT = process.env.PORT ?? '3100';
const baseUrl =
  process.env.SOAK_BASE_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${PORT}`;
const TARGET_URL =
  process.env.SOAK_URL ??
  `${baseUrl.replace(/\/$/, '')}/examples/yjs-collaboration`;
const IS_HOCUSPOCUS_TARGET = TARGET_URL.includes('/examples/yjs-hocuspocus');
const CDP = process.env.SOAK_CDP ?? 'http://127.0.0.1:9222';
const DURATION_MS = Number(process.env.SOAK_MS ?? 3 * 60 * 60 * 1000);
const ACTION_DELAY_MS = Number(process.env.SOAK_ACTION_DELAY_MS ?? 1000);
const REPORT_EVERY_MS = Number(process.env.SOAK_REPORT_EVERY_MS ?? 60 * 1000);
const RUN_ID =
  process.env.SOAK_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
const TRACE_SCENARIO = process.env.SOAK_TRACE_SCENARIO;
const TRACE_SNAPSHOTS = process.env.SOAK_TRACE_SNAPSHOTS === '1';
const OUTPUT_ROOT =
  process.env.SOAK_OUTPUT_ROOT ?? 'test-results/yjs-collaboration-soak';
const OUT_DIR = path.resolve(repoRoot, OUTPUT_ROOT, RUN_ID);
const LOG_PATH = path.join(OUT_DIR, 'events.jsonl');
const SUMMARY_PATH = path.join(OUT_DIR, 'summary.md');
const SHOULD_LAUNCH_BROWSER = process.env.SOAK_LAUNCH !== '0';
const HAS_EXTERNAL_URL = Boolean(
  process.env.SOAK_URL ||
    process.env.SOAK_BASE_URL ||
    process.env.PLAYWRIGHT_BASE_URL
);
const SHOULD_START_SERVER =
  process.env.SOAK_START_SERVER !== '0' && !HAS_EXTERNAL_URL;
const SHOULD_FAIL_ON_ISSUES = process.env.SOAK_FAIL_ON_ISSUES === '1';

const PEERS = ['a', 'b', 'c', 'd'];
const ACTIONS = [
  'append',
  'insert-text',
  'split-node',
  'merge-node',
  'wrap-node',
  'unwrap',
  'lift',
  'insert-fragment',
  'delete-fragment',
  'delete-backward',
  'move',
  'replace',
  'set-node',
  'unset-node',
  'mark-bold',
  'undo',
  'redo',
  'move-down',
  'remove-node',
  'disconnect',
  'connect',
  'reconcile',
];

const ERROR_RE =
  /Cannot|No Yjs|hydration|nested|descendant|merge Yjs|end text node|<p> cannot contain|uncaught|error/i;
const IGNORE_CONSOLE_RE =
  /\[HMR\] Invalid message|Download the React DevTools|favicon\.ico/i;
const LOCAL_CLIENT_CURSOR_RE = /101:0/;

fs.mkdirSync(OUT_DIR, { recursive: true });

const startedAt = Date.now();
const issues = new Map();
const metrics = {
  actions: 0,
  consoleErrors: 0,
  hardResets: 0,
  iterations: 0,
  pageErrors: 0,
  scenarios: Object.create(null),
  skippedDisabled: 0,
};

let page;
let browser;
let server;
let lastAction = null;
let lastReportAt = Date.now();

function elapsedMs() {
  return Date.now() - startedAt;
}

function shouldContinue() {
  return elapsedMs() < DURATION_MS;
}

function write(event) {
  fs.appendFileSync(
    LOG_PATH,
    `${JSON.stringify({ t: new Date().toISOString(), ...event })}\n`
  );
}

function issueKey(kind, scenario, detail) {
  return `${kind}|${scenario}|${JSON.stringify(detail).slice(0, 600)}`;
}

function recordIssue(kind, scenario, detail, severity = 'suspect') {
  const key = issueKey(kind, scenario, detail);
  const existing = issues.get(key);
  if (existing) {
    existing.count += 1;
    existing.lastAt = new Date().toISOString();
    write({ type: 'issue-repeat', key, count: existing.count });
    return existing;
  }

  const issue = {
    count: 1,
    detail,
    firstAt: new Date().toISOString(),
    kind,
    lastAction,
    lastAt: new Date().toISOString(),
    scenario,
    severity,
  };
  issues.set(key, issue);
  write({ type: 'issue', key, issue });
  console.log(
    `[issue:${severity}] ${kind} ${scenario} ${JSON.stringify(detail).slice(0, 240)}`
  );
  return issue;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUrl(url, timeoutMs = 60_000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }

      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw lastError ?? new Error(`${url} did not become ready`);
}

async function startServer() {
  if (!SHOULD_START_SERVER) {
    return null;
  }

  try {
    await waitForUrl(TARGET_URL, 1000);
    return null;
  } catch {
    // No existing local server is ready on the soak URL.
  }

  const nextServer = spawn('bun', ['serve'], {
    cwd: repoRoot,
    env: { ...process.env, PORT },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  nextServer.stdout.on('data', (chunk) => process.stdout.write(chunk));
  nextServer.stderr.on('data', (chunk) => process.stderr.write(chunk));

  await waitForUrl(TARGET_URL);

  return nextServer;
}

function rng(seed) {
  let s = seed >>> 0;

  return () => {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;

    return s / 0x1_00_00_00_00;
  };
}

function pick(rand, xs) {
  return xs[Math.floor(rand() * xs.length)];
}

async function getExistingPage(browser) {
  const context =
    browser.contexts()[0] ??
    (await browser.newContext({ viewport: { width: 1400, height: 900 } }));
  if (process.env.SOAK_NEW_PAGE === '1') {
    return await context.newPage();
  }

  const pages = context.pages();
  return (
    pages.find((candidate) =>
      ['/examples/yjs-collaboration', '/examples/yjs-hocuspocus'].some(
        (pathname) => candidate.url().includes(pathname)
      )
    ) ??
    pages.find((candidate) => !candidate.isClosed()) ??
    (await context.newPage())
  );
}

function scenarioUrl(reason) {
  if (!IS_HOCUSPOCUS_TARGET) {
    return TARGET_URL;
  }

  const url = new URL(TARGET_URL);
  const slug = String(reason)
    .replace(/[^a-z0-9_.:-]/gi, '-')
    .slice(0, 80);

  url.searchParams.set(
    'room',
    `codex-hocuspocus-soak-${RUN_ID}-${metrics.hardResets}-${slug}`
  );

  return url.toString();
}

async function navigate(reason) {
  metrics.hardResets += 1;
  const url = scenarioUrl(reason);
  write({ type: 'navigate', reason, url });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-test-id="yjs-peer-a-append"]').waitFor({
    timeout: 30_000,
  });
  await page.waitForFunction(
    () => document.querySelectorAll('[contenteditable="true"]').length === 4,
    null,
    { timeout: 30_000 }
  );
  await sleep(ACTION_DELAY_MS);
}

async function click(peer, action, scenario) {
  lastAction = { action, peer, scenario };
  const locator = page
    .locator(`[data-test-id="yjs-peer-${peer}-${action}"]`)
    .first();
  if ((await locator.count()) === 0) {
    recordIssue('missing-control', scenario, { peer, action }, 'error');
    return false;
  }
  if (await locator.isDisabled()) {
    metrics.skippedDisabled += 1;
    write({ type: 'skip-disabled', peer, action, scenario });
    await sleep(ACTION_DELAY_MS);
    return false;
  }

  await locator.scrollIntoViewIfNeeded();
  await locator.click({ timeout: 5000 });
  metrics.actions += 1;
  write({ type: 'action', peer, action, scenario });
  await sleep(ACTION_DELAY_MS);
  await traceSnapshot(scenario, `${peer}:${action}`);
  return true;
}

async function connectAll(scenario) {
  for (const peer of PEERS) {
    await click(peer, 'connect', scenario);
  }
  await click('a', 'reconcile', scenario);
}

async function snapshot() {
  return await page.evaluate(() => {
    const normalizePliteText = (text) => text?.replaceAll('\uFEFF', '') ?? '';
    const roots = Array.from(
      document.querySelectorAll('[contenteditable="true"]')
    );
    const peers = roots.map((root, index) => {
      const blocks = Array.from(
        root.querySelectorAll(':scope > [data-plite-node="element"]')
      ).map((el) => ({
        childElementCount: el.querySelectorAll('[data-plite-node="element"]')
          .length,
        path: el.getAttribute('data-plite-path'),
        tag: el.tagName,
        text: normalizePliteText(el.textContent),
      }));

      return {
        blocks,
        index,
        text: normalizePliteText(root.textContent),
      };
    });

    return {
      bodyText: document.body.textContent?.slice(0, 2000) ?? '',
      cursorTexts: Array.from(
        document.querySelectorAll('[data-test-id$="-cursors"]')
      ).map((el) => el.textContent),
      editorCount: roots.length,
      nestedDivInP: document.querySelectorAll('[contenteditable="true"] p div')
        .length,
      nestedParagraphCount: document.querySelectorAll(
        '[contenteditable="true"] p p'
      ).length,
      peers,
      title: document.title,
      url: location.href,
    };
  });
}

function blockTexts(snap) {
  return snap.peers.map((peer) => peer.blocks.map((block) => block.text));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function traceSnapshot(scenario, label) {
  if (!TRACE_SNAPSHOTS) {
    return;
  }
  if (TRACE_SCENARIO && TRACE_SCENARIO !== scenario) {
    return;
  }

  const snap = await snapshot();

  write({
    type: 'snapshot',
    label,
    scenario,
    texts: blockTexts(snap),
  });
}

async function checkShape(scenario, label) {
  const snap = await snapshot();
  if (snap.editorCount !== 4) {
    recordIssue(
      'editor-count',
      scenario,
      { label, editorCount: snap.editorCount },
      'error'
    );
  }
  if (snap.nestedParagraphCount > 0) {
    recordIssue(
      'nested-paragraph',
      scenario,
      {
        label,
        nestedParagraphCount: snap.nestedParagraphCount,
        blocks: blockTexts(snap),
      },
      'error'
    );
  }
  if (snap.nestedDivInP > 0) {
    recordIssue(
      'nested-div-in-paragraph',
      scenario,
      { label, nestedDivInP: snap.nestedDivInP, blocks: blockTexts(snap) },
      'error'
    );
  }
  return snap;
}

async function expectConverged(scenario, label, expected = null) {
  const snap = await checkShape(scenario, label);
  const texts = blockTexts(snap);
  const first = texts[0];
  const converged = texts.every((candidate) => sameJson(candidate, first));

  if (!converged) {
    recordIssue('non-convergence', scenario, { label, texts }, 'error');
  }
  if (expected && !sameJson(first, expected)) {
    recordIssue(
      'unexpected-document',
      scenario,
      { expected, label, texts },
      'error'
    );
  }
  return snap;
}

async function runScenario(name, fn) {
  metrics.iterations += 1;
  metrics.scenarios[name] = (metrics.scenarios[name] ?? 0) + 1;
  write({ type: 'scenario-start', name });
  try {
    await fn(name);
  } catch (error) {
    recordIssue(
      'scenario-exception',
      name,
      {
        message: error?.message ?? String(error),
        stack: String(error?.stack ?? '').slice(0, 2000),
      },
      'error'
    );
    await navigate(`recover:${name}`);
  } finally {
    write({ type: 'scenario-end', name });
  }
}

async function runScenarioIfTimeRemaining(name, fn) {
  if (!shouldContinue()) {
    write({
      type: 'scenario-skip-timebox',
      durationMs: DURATION_MS,
      elapsedMs: elapsedMs(),
      name,
    });

    return false;
  }

  await runScenario(name, fn);

  return true;
}

async function scenarioBaselineSplit(name) {
  await navigate(name);
  await click('b', 'split-node', name);
  await expectConverged(name, 'after b split', ['Hello ', 'world!']);
}

async function scenarioOfflineUndoRemoteSplit(name) {
  await navigate(name);
  await click('a', 'disconnect', name);
  await click('a', 'split-node', name);
  await click('a', 'undo', name);
  await click('b', 'split-node', name);
  await click('a', 'connect', name);
  await expectConverged(name, 'after reconnect', ['Hello ', 'world!']);
}

async function scenarioOfflineUndoRemoteSplitRedo(name) {
  await navigate(name);
  await click('a', 'disconnect', name);
  await click('a', 'split-node', name);
  await click('a', 'undo', name);
  await click('b', 'insert-text', name);
  await click('b', 'split-node', name);
  await click('a', 'connect', name);
  await click('a', 'redo', name);
  await expectConverged(name, 'after redo', ['Hello ', 'world!!']);
}

async function scenarioSplitMergeLoop(name) {
  await navigate(name);
  for (let i = 0; i < 5; i += 1) {
    await click('a', 'split-node', name);
    await checkShape(name, `split ${i}`);
    await click('a', 'merge-node', name);
    await checkShape(name, `merge ${i}`);
  }
  await connectAll(name);
  await expectConverged(name, 'after split merge loop');
}

async function scenarioOfflineStructuralMix(name, seed) {
  await navigate(`${name}:${seed}`);
  const rand = rng(seed);
  const offlinePeer = pick(rand, PEERS);
  await click(offlinePeer, 'disconnect', name);

  const localActions = [
    'wrap-node',
    'insert-fragment',
    'delete-fragment',
    'move-down',
    'set-node',
    'unset-node',
    'split-node',
    'merge-node',
    'undo',
    'redo',
  ];
  const remoteActions = [
    'append',
    'insert-text',
    'split-node',
    'merge-node',
    'move',
    'wrap-node',
    'unwrap',
    'lift',
    'delete-backward',
  ];

  for (let i = 0; i < 8; i += 1) {
    const peer =
      i % 2 === 0
        ? offlinePeer
        : pick(
            rand,
            PEERS.filter((p) => p !== offlinePeer)
          );
    const action =
      peer === offlinePeer
        ? pick(rand, localActions)
        : pick(rand, remoteActions);
    await click(peer, action, name);
    await checkShape(name, `mix ${seed}.${i}`);
  }

  await click(offlinePeer, 'connect', name);
  await connectAll(name);
  await expectConverged(name, `after structural mix ${seed}`);
}

async function scenarioRandomControl(name, seed) {
  await navigate(`${name}:${seed}`);
  const rand = rng(seed);
  for (let i = 0; i < 14; i += 1) {
    await click(pick(rand, PEERS), pick(rand, ACTIONS), name);
    await checkShape(name, `random ${seed}.${i}`);
  }
  await connectAll(name);
  await expectConverged(name, `after random ${seed}`);
}

async function scenarioAwareness(name) {
  await navigate(name);
  await click('a', 'select', name);
  const selected = await snapshot();
  const cursorTexts = selected.cursorTexts.join(' | ');
  if (!LOCAL_CLIENT_CURSOR_RE.test(cursorTexts)) {
    recordIssue(
      'awareness-missing-selection',
      name,
      { cursorTexts },
      'suspect'
    );
  }

  await click('a', 'disconnect', name);
  const offline = await snapshot();
  const offlineCursorTexts = offline.cursorTexts.join(' | ');
  if (LOCAL_CLIENT_CURSOR_RE.test(offlineCursorTexts)) {
    recordIssue(
      'awareness-stale-offline-selection',
      name,
      { offlineCursorTexts },
      'suspect'
    );
  }

  await click('a', 'connect', name);
  await click('a', 'select', name);
  const reselected = await snapshot();
  const reselectedCursorTexts = reselected.cursorTexts.join(' | ');
  if (!LOCAL_CLIENT_CURSOR_RE.test(reselectedCursorTexts)) {
    recordIssue(
      'awareness-missing-after-reconnect',
      name,
      { reselectedCursorTexts },
      'suspect'
    );
  }
}

function writeSummary(final = false) {
  const sortedIssues = [...issues.values()].sort((a, b) => {
    const order = { error: 0, suspect: 1, warning: 2 };
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
  });

  const lines = [
    '# Yjs Collaboration Soak',
    '',
    `- status: ${final ? 'complete' : 'running'}`,
    `- url: ${TARGET_URL}`,
    `- run_id: ${RUN_ID}`,
    `- elapsed_ms: ${elapsedMs()}`,
    `- actions: ${metrics.actions}`,
    `- iterations: ${metrics.iterations}`,
    `- hard_resets: ${metrics.hardResets}`,
    `- skipped_disabled: ${metrics.skippedDisabled}`,
    `- console_errors: ${metrics.consoleErrors}`,
    `- page_errors: ${metrics.pageErrors}`,
    `- issues: ${sortedIssues.length}`,
    `- fail_on_issues: ${SHOULD_FAIL_ON_ISSUES}`,
    `- log: ${LOG_PATH}`,
    '',
    '## Scenario Counts',
    '',
    ...Object.entries(metrics.scenarios).map(
      ([name, count]) => `- ${name}: ${count}`
    ),
    '',
    '## Issues',
    '',
    ...(sortedIssues.length === 0
      ? ['None recorded yet.']
      : sortedIssues.map((issue, index) =>
          [
            `### ${index + 1}. ${issue.kind}`,
            '',
            `- severity: ${issue.severity}`,
            `- scenario: ${issue.scenario}`,
            `- count: ${issue.count}`,
            `- first_at: ${issue.firstAt}`,
            `- last_at: ${issue.lastAt}`,
            `- last_action: ${JSON.stringify(issue.lastAction)}`,
            `- detail: ${JSON.stringify(issue.detail)}`,
            '',
          ].join('\n')
        )),
    '',
  ];

  fs.writeFileSync(SUMMARY_PATH, `${lines.join('\n')}\n`);
}

async function main() {
  write({
    type: 'start',
    config: {
      ACTION_DELAY_MS,
      CDP,
      DURATION_MS,
      LOG_PATH,
      OUTPUT_ROOT,
      SHOULD_LAUNCH_BROWSER,
      SHOULD_START_SERVER,
      SHOULD_FAIL_ON_ISSUES,
      SUMMARY_PATH,
      TARGET_URL,
    },
  });

  server = await startServer();
  browser = SHOULD_LAUNCH_BROWSER
    ? await chromium.launch({ headless: process.env.SOAK_HEADLESS === '1' })
    : await chromium.connectOverCDP(CDP);
  page = await getExistingPage(browser);

  page.on('console', (msg) => {
    const text = msg.text();
    if (IGNORE_CONSOLE_RE.test(text)) {
      write({ type: 'console-ignored', messageType: msg.type(), text });
      return;
    }
    if (msg.type() === 'error' || ERROR_RE.test(text)) {
      metrics.consoleErrors += 1;
      recordIssue(
        'console',
        'page',
        { messageType: msg.type(), text },
        'error'
      );
    } else if (msg.type() === 'warning') {
      write({ type: 'console-warning', text });
    }
  });

  page.on('pageerror', (error) => {
    metrics.pageErrors += 1;
    recordIssue('pageerror', 'page', { message: error.message }, 'error');
  });

  await navigate('initial');

  let seed = Number(process.env.SOAK_START_SEED ?? 1);
  while (shouldContinue()) {
    const currentSeed = seed;
    const scenarioQueue = [
      ['baseline-split', scenarioBaselineSplit],
      ['offline-undo-remote-split', scenarioOfflineUndoRemoteSplit],
      ['offline-undo-remote-split-redo', scenarioOfflineUndoRemoteSplitRedo],
      ['split-merge-loop', scenarioSplitMergeLoop],
      ['awareness', scenarioAwareness],
      [
        `offline-structural-mix-${currentSeed}`,
        (name) => scenarioOfflineStructuralMix(name, currentSeed),
      ],
      [
        `random-control-${currentSeed}`,
        (name) => scenarioRandomControl(name, currentSeed),
      ],
    ];

    for (const [name, fn] of scenarioQueue) {
      if (!(await runScenarioIfTimeRemaining(name, fn))) {
        break;
      }
    }

    seed += 1;

    if (Date.now() - lastReportAt >= REPORT_EVERY_MS) {
      writeSummary(false);
      lastReportAt = Date.now();
      console.log(
        `[progress] elapsed=${Math.round(elapsedMs() / 1000)}s actions=${metrics.actions} iterations=${metrics.iterations} issues=${issues.size} summary=${SUMMARY_PATH}`
      );
    }
  }

  writeSummary(true);
  write({ type: 'complete', metrics, issues: [...issues.values()] });
  console.log(`[complete] summary=${SUMMARY_PATH}`);
  console.log(`[complete] log=${LOG_PATH}`);

  return issues.size;
}

async function cleanup() {
  if (SHOULD_LAUNCH_BROWSER && browser) {
    await browser.close();
  }

  if (server) {
    server.kill();
  }
}

main()
  .then(async (issueCount) => {
    await cleanup();
    process.exit(SHOULD_FAIL_ON_ISSUES && issueCount > 0 ? 1 : 0);
  })
  .catch(async (error) => {
    recordIssue(
      'runner-fatal',
      'main',
      {
        message: error?.message ?? String(error),
        stack: String(error?.stack ?? '').slice(0, 4000),
      },
      'error'
    );
    writeSummary(true);
    console.error(error);
    await cleanup();
    process.exit(1);
  });
