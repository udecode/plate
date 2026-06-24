#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const port = process.env.PORT ?? '3100';
const baseUrl =
  process.env.PERSISTENT_SOAK_BASE_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${port}`;
const targetUrl =
  process.env.PERSISTENT_SOAK_URL ??
  `${baseUrl.replace(/\/$/, '')}/examples/yjs-hocuspocus`;
const yjsUrl = process.env.PERSISTENT_SOAK_YJS_URL ?? 'ws://localhost:4444/yjs';
const yjsPort = Number(new URL(yjsUrl).port || 4444);
const runId =
  process.env.PERSISTENT_SOAK_RUN_ID ??
  `persistent-room-${new Date().toISOString().replace(/[:.]/g, '-')}`;
const outputRoot =
  process.env.PERSISTENT_SOAK_OUTPUT_ROOT ??
  'test-results/yjs-hocuspocus-persistent-room-soak';
const outDir = path.resolve(repoRoot, outputRoot, runId);
const storageDir =
  process.env.PERSISTENT_SOAK_STORAGE_DIR ?? path.join(outDir, 'documents');
const logPath = path.join(outDir, 'events.jsonl');
const summaryPath = path.join(outDir, 'summary.md');
const durationMs = Number(process.env.PERSISTENT_SOAK_MS ?? 60 * 60 * 1000);
const actionDelayMs = Number(
  process.env.PERSISTENT_SOAK_ACTION_DELAY_MS ?? 1000
);
const reportEveryMs = Number(
  process.env.PERSISTENT_SOAK_REPORT_EVERY_MS ?? 60_000
);
const convergenceTimeoutMs = Number(
  process.env.PERSISTENT_SOAK_CONVERGENCE_TIMEOUT_MS ?? 12_000
);
const authToken = process.env.PERSISTENT_SOAK_AUTH_TOKEN ?? 'persistent-soak';
const roomName = process.env.PERSISTENT_SOAK_ROOM ?? `persistent-room-${runId}`;
const shouldStartServers = process.env.PERSISTENT_SOAK_START_SERVERS !== '0';
const shouldFailOnIssues = process.env.PERSISTENT_SOAK_FAIL_ON_ISSUES === '1';
const shouldHeadless = process.env.SOAK_HEADLESS === '1';
const IGNORE_CONSOLE_RE =
  /Download the React DevTools|favicon\.ico|\[HMR\] Invalid message/;
const ERROR_RE = /Cannot|No Yjs|hydration|nested|uncaught|error/i;

const peers = ['a', 'b', 'c', 'd'];

fs.mkdirSync(outDir, { recursive: true });

const startedAt = Date.now();
const issues = new Map();
const metrics = {
  actions: 0,
  checkpoints: 0,
  consoleErrors: 0,
  offlineWindows: 0,
  pageErrors: 0,
  scenarios: Object.create(null),
  skippedDisabled: 0,
};
const growthSamples = [];

let browser;
let siteServer;
let yjsServer;
let lastAction = null;
let lastReportAt = Date.now();

function write(event) {
  fs.appendFileSync(
    logPath,
    `${JSON.stringify({ t: new Date().toISOString(), ...event })}\n`
  );
}

function issueKey(kind, scenario, detail) {
  return `${kind}|${scenario}|${JSON.stringify(detail).slice(0, 800)}`;
}

function recordIssue(kind, scenario, detail, severity = 'error') {
  const key = issueKey(kind, scenario, detail);
  const existing = issues.get(key);

  if (existing) {
    existing.count += 1;
    existing.lastAt = new Date().toISOString();
    existing.lastAction = lastAction;
    write({ type: 'issue-repeat', count: existing.count, key });
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
  write({ type: 'issue', issue, key });
  console.log(
    `[issue:${severity}] ${kind} ${scenario} ${JSON.stringify(detail).slice(0, 240)}`
  );
  return issue;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pacedSleep(multiplier = 1) {
  await sleep(actionDelayMs * multiplier);
}

async function waitForUrl(url, timeoutMs = 60_000) {
  const started = Date.now();
  let lastError = null;

  while (Date.now() - started < timeoutMs) {
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

async function waitForPort(checkPort, host = '127.0.0.1', timeoutMs = 60_000) {
  const started = Date.now();
  let lastError = null;

  while (Date.now() - started < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.connect(checkPort, host);
        socket.once('connect', () => {
          socket.end();
          resolve();
        });
        socket.once('error', reject);
        socket.setTimeout(1000, () => {
          socket.destroy();
          reject(new Error(`${host}:${checkPort} timed out`));
        });
      });
      return;
    } catch (error) {
      lastError = error;
      await sleep(250);
    }
  }

  throw lastError ?? new Error(`${host}:${checkPort} did not become ready`);
}

async function startServers() {
  if (!shouldStartServers) {
    return;
  }

  try {
    await waitForPort(yjsPort, '127.0.0.1', 1000);
  } catch {
    yjsServer = spawn('bun', ['start:yjs'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        PLITE_YJS_AUTH_TOKEN: authToken,
        PLITE_YJS_STORAGE_DIR: storageDir,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    yjsServer.stdout.on('data', (chunk) => process.stdout.write(chunk));
    yjsServer.stderr.on('data', (chunk) => process.stderr.write(chunk));
    await waitForPort(yjsPort);
  }

  try {
    await waitForUrl(targetUrl, 1000);
  } catch {
    siteServer = spawn('bun', ['serve'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        NEXT_PUBLIC_SLATE_YJS_TOKEN: authToken,
        NEXT_PUBLIC_SLATE_YJS_URL: yjsUrl,
        PORT: port,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    siteServer.stdout.on('data', (chunk) => process.stdout.write(chunk));
    siteServer.stderr.on('data', (chunk) => process.stderr.write(chunk));
    await waitForUrl(targetUrl);
  }
}

function peerUrl(peerId) {
  const url = new URL(targetUrl);
  url.searchParams.set('room', roomName);
  url.searchParams.set('peer', peerId);
  return url.toString();
}

async function createPeer(peerId) {
  const context = await browser.newContext({
    viewport: { height: 900, width: 1100 },
  });
  const page = await context.newPage();
  const peer = { context, id: peerId, page };

  page.on('console', (msg) => {
    const text = msg.text();

    if (IGNORE_CONSOLE_RE.test(text)) {
      write({
        type: 'console-ignored',
        messageType: msg.type(),
        peer: peerId,
        text,
      });
      return;
    }

    if (msg.type() === 'error' || ERROR_RE.test(text)) {
      metrics.consoleErrors += 1;
      recordIssue(
        'console',
        `peer-${peerId}`,
        { messageType: msg.type(), text },
        'error'
      );
    }
  });
  page.on('pageerror', (error) => {
    metrics.pageErrors += 1;
    recordIssue('pageerror', `peer-${peerId}`, { message: error.message });
  });

  await page.goto(peerUrl(peerId), { waitUntil: 'domcontentloaded' });
  await page.locator(`[data-test-id="yjs-peer-${peerId}-append"]`).waitFor({
    timeout: 30_000,
  });
  await page.waitForFunction(
    () => document.querySelectorAll('[contenteditable="true"]').length === 1,
    null,
    { timeout: 30_000 }
  );
  await pacedSleep(2);

  return peer;
}

async function click(peer, action, scenario) {
  lastAction = { action, peer: peer.id, scenario };
  const locator = peer.page
    .locator(`[data-test-id="yjs-peer-${peer.id}-${action}"]`)
    .first();

  if ((await locator.count()) === 0) {
    recordIssue('missing-control', scenario, { action, peer: peer.id });
    return false;
  }
  if (await locator.isDisabled()) {
    metrics.skippedDisabled += 1;
    write({ type: 'skip-disabled', action, peer: peer.id, scenario });
    await pacedSleep();
    return false;
  }

  await locator.scrollIntoViewIfNeeded();
  try {
    await locator.click({ timeout: 10_000 });
  } catch (error) {
    if (!String(error?.message ?? '').includes('<nextjs-portal>')) {
      throw error;
    }

    write({
      type: 'dev-overlay-click-fallback',
      action,
      peer: peer.id,
      scenario,
    });
    await locator.dispatchEvent('pointerdown', {
      button: 0,
      buttons: 1,
      pointerId: 1,
      pointerType: 'mouse',
    });
  }

  metrics.actions += 1;
  write({ type: 'action', action, peer: peer.id, scenario });
  await pacedSleep();
  return true;
}

async function snapshotPeer(peer) {
  return await peer.page.evaluate(() => {
    const normalize = (text) => text?.replaceAll('\uFEFF', '') ?? '';
    const root = document.querySelector('[contenteditable="true"]');
    const blocks = root
      ? Array.from(
          root.querySelectorAll(':scope > [data-plite-node="element"]')
        ).map((el) => ({
          childElementCount: el.querySelectorAll('[data-plite-node="element"]')
            .length,
          path: el.getAttribute('data-plite-path'),
          text: normalize(el.textContent),
        }))
      : [];
    const text = blocks.map((block) => block.text).join('\n');

    return {
      blockCount: blocks.length,
      blocks,
      bodyText: normalize(document.body.textContent).slice(0, 1000),
      charCount: text.length,
      editorCount: document.querySelectorAll('[contenteditable="true"]').length,
      nestedDivInP: document.querySelectorAll('[contenteditable="true"] p div')
        .length,
      nestedParagraphCount: document.querySelectorAll(
        '[contenteditable="true"] p p'
      ).length,
      text,
      url: location.href,
    };
  });
}

async function snapshot(peersById) {
  const entries = await Promise.all(
    peers.map(async (peerId) => [peerId, await snapshotPeer(peersById[peerId])])
  );

  return Object.fromEntries(entries);
}

function blockTexts(snap) {
  return peers.map((peerId) => snap[peerId].blocks.map((block) => block.text));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function summarizeGrowth(snap, scenario, label) {
  const peerSnaps = peers.map((peerId) => snap[peerId]);
  const blockCounts = peerSnaps.map((peerSnap) => peerSnap.blockCount);
  const charCounts = peerSnaps.map((peerSnap) => peerSnap.charCount);
  const sample = {
    blockCounts,
    charCounts,
    elapsedMs: Date.now() - startedAt,
    label,
    maxBlocks: Math.max(...blockCounts),
    maxChars: Math.max(...charCounts),
    minBlocks: Math.min(...blockCounts),
    minChars: Math.min(...charCounts),
    scenario,
  };

  growthSamples.push(sample);
  if (growthSamples.length > 25) {
    growthSamples.shift();
  }
  write({ type: 'growth-sample', sample });
  return sample;
}

async function checkShape(peersById, scenario, label) {
  const snap = await snapshot(peersById);

  for (const peerId of peers) {
    const peerSnap = snap[peerId];

    if (peerSnap.editorCount !== 1) {
      recordIssue('editor-count', scenario, {
        editorCount: peerSnap.editorCount,
        label,
        peer: peerId,
      });
    }
    if (peerSnap.nestedParagraphCount > 0) {
      recordIssue('nested-paragraph', scenario, {
        label,
        nestedParagraphCount: peerSnap.nestedParagraphCount,
        peer: peerId,
        texts: blockTexts(snap),
      });
    }
    if (peerSnap.nestedDivInP > 0) {
      recordIssue('nested-div-in-paragraph', scenario, {
        label,
        nestedDivInP: peerSnap.nestedDivInP,
        peer: peerId,
        texts: blockTexts(snap),
      });
    }
  }

  summarizeGrowth(snap, scenario, label);
  return snap;
}

async function waitForConvergence(peersById, scenario, label) {
  const started = Date.now();
  let lastSnap = null;

  while (Date.now() - started < convergenceTimeoutMs) {
    lastSnap = await checkShape(peersById, scenario, label);
    const texts = blockTexts(lastSnap);
    const first = texts[0];

    if (texts.every((candidate) => sameJson(candidate, first))) {
      metrics.checkpoints += 1;
      return lastSnap;
    }

    await sleep(500);
  }

  const texts = blockTexts(lastSnap ?? (await snapshot(peersById)));
  recordIssue('non-convergence', scenario, { label, texts });
  return lastSnap;
}

async function runScenario(name, fn) {
  metrics.scenarios[name] = (metrics.scenarios[name] ?? 0) + 1;
  write({ type: 'scenario-start', name });

  try {
    await fn(name);
  } catch (error) {
    recordIssue('scenario-exception', name, {
      message: error?.message ?? String(error),
      stack: String(error?.stack ?? '').slice(0, 3000),
    });
  } finally {
    write({ type: 'scenario-end', name });
  }
}

async function scenarioGrowthBurst(peersById, name) {
  for (const peerId of peers) {
    await click(peersById[peerId], 'append', name);
    await click(peersById[peerId], 'insert-text', name);
  }
  await waitForConvergence(peersById, name, 'after text growth burst');
}

async function scenarioBlockGrowth(peersById, name) {
  await click(peersById.a, 'split-node', name);
  await click(peersById.b, 'append', name);
  await click(peersById.c, 'split-node', name);
  await click(peersById.d, 'insert-fragment', name);
  await waitForConvergence(peersById, name, 'after block growth');
}

async function scenarioStructureChurn(peersById, name) {
  await click(peersById.a, 'wrap-node', name);
  await click(peersById.b, 'set-node', name);
  await click(peersById.c, 'move-down', name);
  await click(peersById.d, 'insert-fragment', name);
  await click(peersById.a, 'unwrap', name);
  await click(peersById.b, 'unset-node', name);
  await waitForConvergence(peersById, name, 'after structure churn');
}

async function scenarioOfflineCatchup(peersById, name) {
  metrics.offlineWindows += 1;
  await click(peersById.c, 'disconnect', name);
  await click(peersById.c, 'append', name);
  await click(peersById.c, 'insert-text', name);
  await click(peersById.a, 'append', name);
  await click(peersById.b, 'split-node', name);
  await click(peersById.d, 'insert-fragment', name);
  await click(peersById.c, 'connect', name);
  await click(peersById.a, 'reconcile', name);
  await waitForConvergence(peersById, name, 'after offline catchup');
}

async function scenarioHistoryInterleave(peersById, name) {
  await click(peersById.a, 'append', name);
  await click(peersById.a, 'undo', name);
  await click(peersById.b, 'append', name);
  await click(peersById.c, 'split-node', name);
  await click(peersById.a, 'redo', name);
  await click(peersById.d, 'insert-text', name);
  await waitForConvergence(peersById, name, 'after history interleave');
}

function writeSummary(final = false) {
  const sortedIssues = [...issues.values()].sort((a, b) => {
    const order = { error: 0, suspect: 1, warning: 2 };
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
  });
  const latestGrowth = growthSamples.at(-1);
  const lines = [
    '# Yjs Hocuspocus Persistent Room Soak',
    '',
    `- status: ${final ? 'complete' : 'running'}`,
    `- url: ${targetUrl}`,
    `- yjs_url: ${yjsUrl}`,
    `- room: ${roomName}`,
    `- run_id: ${runId}`,
    `- elapsed_ms: ${Date.now() - startedAt}`,
    `- actions: ${metrics.actions}`,
    `- checkpoints: ${metrics.checkpoints}`,
    `- offline_windows: ${metrics.offlineWindows}`,
    `- skipped_disabled: ${metrics.skippedDisabled}`,
    `- console_errors: ${metrics.consoleErrors}`,
    `- page_errors: ${metrics.pageErrors}`,
    `- issues: ${sortedIssues.length}`,
    `- storage_dir: ${storageDir}`,
    `- log: ${logPath}`,
    '',
    '## Latest Growth',
    '',
    latestGrowth
      ? `- ${JSON.stringify(latestGrowth)}`
      : '- No growth sample recorded yet.',
    '',
    '## Recent Growth Samples',
    '',
    ...growthSamples.slice(-10).map((sample) => `- ${JSON.stringify(sample)}`),
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

  fs.writeFileSync(summaryPath, `${lines.join('\n')}\n`);
}

async function main() {
  write({
    type: 'start',
    config: {
      actionDelayMs,
      authTokenConfigured: Boolean(authToken),
      convergenceTimeoutMs,
      durationMs,
      roomName,
      shouldHeadless,
      shouldStartServers,
      storageDir,
      summaryPath,
      targetUrl,
      yjsUrl,
    },
  });

  await startServers();
  await waitForUrl(targetUrl);
  browser = await chromium.launch({ headless: shouldHeadless });

  const peerEntries = await Promise.all(
    peers.map(async (peerId) => [peerId, await createPeer(peerId)])
  );
  const peersById = Object.fromEntries(peerEntries);

  await waitForConvergence(peersById, 'initial', 'initial convergence');

  while (Date.now() - startedAt < durationMs) {
    await runScenario('growth-burst', (name) =>
      scenarioGrowthBurst(peersById, name)
    );
    await runScenario('block-growth', (name) =>
      scenarioBlockGrowth(peersById, name)
    );
    await runScenario('structure-churn', (name) =>
      scenarioStructureChurn(peersById, name)
    );
    await runScenario('offline-catchup', (name) =>
      scenarioOfflineCatchup(peersById, name)
    );
    await runScenario('history-interleave', (name) =>
      scenarioHistoryInterleave(peersById, name)
    );

    if (Date.now() - lastReportAt >= reportEveryMs) {
      writeSummary(false);
      lastReportAt = Date.now();
      console.log(
        `[progress] elapsed=${Math.round((Date.now() - startedAt) / 1000)}s actions=${metrics.actions} checkpoints=${metrics.checkpoints} issues=${issues.size} summary=${summaryPath}`
      );
    }
  }

  writeSummary(true);
  write({ type: 'complete', issues: [...issues.values()], metrics });
  console.log(`[complete] summary=${summaryPath}`);
  console.log(`[complete] log=${logPath}`);

  if (shouldFailOnIssues && issues.size > 0) {
    process.exitCode = 1;
  }
}

async function cleanup() {
  if (browser) {
    await browser.close();
  }
  if (siteServer) {
    siteServer.kill();
  }
  if (yjsServer) {
    yjsServer.kill();
  }
}

main()
  .catch((error) => {
    recordIssue('runner-fatal', 'main', {
      message: error?.message ?? String(error),
      stack: String(error?.stack ?? '').slice(0, 4000),
    });
    writeSummary(true);
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    process.exit(process.exitCode ?? 0);
  });
