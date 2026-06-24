#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const PORT = process.env.PORT ?? '3100';
const baseUrl =
  process.env.PRODUCTION_SOAK_BASE_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${PORT}`;
const targetUrl =
  process.env.PRODUCTION_SOAK_URL ??
  `${baseUrl.replace(/\/$/, '')}/examples/yjs-hocuspocus`;
const yjsUrl = process.env.PRODUCTION_SOAK_YJS_URL ?? 'ws://localhost:4444/yjs';
const yjsPort = Number(new URL(yjsUrl).port || 4444);
const runId =
  process.env.PRODUCTION_SOAK_RUN_ID ??
  `production-hocuspocus-${new Date().toISOString().replace(/[:.]/g, '-')}`;
const outputRoot =
  process.env.PRODUCTION_SOAK_OUTPUT_ROOT ??
  'test-results/yjs-hocuspocus-production-soak';
const outDir = path.resolve(repoRoot, outputRoot, runId);
const storageDir =
  process.env.PRODUCTION_SOAK_STORAGE_DIR ?? path.join(outDir, 'documents');
const logPath = path.join(outDir, 'events.jsonl');
const summaryPath = path.join(outDir, 'summary.md');
const durationMs = Number(process.env.PRODUCTION_SOAK_MS ?? 60_000);
const actionDelayMs = Number(
  process.env.PRODUCTION_SOAK_ACTION_DELAY_MS ?? 250
);
const jitterMs = Number(process.env.PRODUCTION_SOAK_JITTER_MS ?? 200);
const authToken = process.env.PRODUCTION_SOAK_AUTH_TOKEN ?? 'production-soak';
const shouldStartServers = process.env.PRODUCTION_SOAK_START_SERVERS !== '0';
const shouldFailOnIssues = process.env.PRODUCTION_SOAK_FAIL_ON_ISSUES === '1';

const peers = ['a', 'b', 'c', 'd'];
const randomActions = [
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
  'set-node',
  'unset-node',
  'mark-bold',
  'undo',
  'redo',
  'move-down',
  'remove-node',
  'reconcile',
];
const networkProfiles = {
  baseline: {
    downloadThroughput: -1,
    latency: 0,
    offline: false,
    uploadThroughput: -1,
  },
  production: {
    downloadThroughput: 1_200_000,
    latency: 90,
    offline: false,
    uploadThroughput: 450_000,
  },
  degraded: {
    downloadThroughput: 240_000,
    latency: 320,
    offline: false,
    uploadThroughput: 90_000,
  },
  offline: {
    downloadThroughput: 0,
    latency: 0,
    offline: true,
    uploadThroughput: 0,
  },
};

fs.mkdirSync(outDir, { recursive: true });

const startedAt = Date.now();
let scenarioStartedAt = startedAt;
const issues = new Map();
const metrics = {
  actions: 0,
  browserOfflineWindows: 0,
  consoleErrors: 0,
  hardReloads: 0,
  pageErrors: 0,
  scenarios: Object.create(null),
};

let browser;
let siteServer;
let yjsServer;
let lastAction = null;

function write(event) {
  fs.appendFileSync(
    logPath,
    `${JSON.stringify({ t: new Date().toISOString(), ...event })}\n`
  );
}

function issueKey(kind, scenario, detail) {
  return `${kind}|${scenario}|${JSON.stringify(detail).slice(0, 500)}`;
}

function recordIssue(kind, scenario, detail, severity = 'error') {
  const key = issueKey(kind, scenario, detail);
  const existing = issues.get(key);

  if (existing) {
    existing.count += 1;
    existing.lastAt = new Date().toISOString();
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
    `[issue:${severity}] ${kind} ${scenario} ${JSON.stringify(detail).slice(0, 220)}`
  );
  return issue;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pacedSleep(multiplier = 1) {
  const jitter = jitterMs > 0 ? Math.floor(Math.random() * jitterMs) : 0;
  await sleep(actionDelayMs * multiplier + jitter);
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

async function waitForPort(port, host = '127.0.0.1', timeoutMs = 60_000) {
  const started = Date.now();
  let lastError = null;

  while (Date.now() - started < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.connect(port, host);
        socket.once('connect', () => {
          socket.end();
          resolve();
        });
        socket.once('error', reject);
        socket.setTimeout(1000, () => {
          socket.destroy();
          reject(new Error(`${host}:${port} timed out`));
        });
      });
      return;
    } catch (error) {
      lastError = error;
      await sleep(250);
    }
  }

  throw lastError ?? new Error(`${host}:${port} did not become ready`);
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
        PORT,
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
  url.searchParams.set('room', `production-soak-${runId}`);
  url.searchParams.set('peer', peerId);
  return url.toString();
}

async function applyNetwork(peer, profileName) {
  const profile = networkProfiles[profileName];

  if (!profile) {
    throw new Error(`Unknown network profile: ${profileName}`);
  }

  await peer.cdp.send('Network.enable');
  await peer.cdp.send('Network.emulateNetworkConditions', {
    connectionType: profile.offline ? 'none' : 'cellular3g',
    downloadThroughput: profile.downloadThroughput,
    latency: profile.latency,
    offline: profile.offline,
    uploadThroughput: profile.uploadThroughput,
  });
  peer.networkProfile = profileName;
  write({ type: 'network-profile', peer: peer.id, profileName, profile });
}

async function createPeer(peerId) {
  const context = await browser.newContext({
    viewport: { height: 900, width: 1100 },
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const peer = {
    cdp,
    context,
    id: peerId,
    networkProfile: 'production',
    page,
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      if (
        peer.networkProfile === 'offline' &&
        msg.text().includes('net::ERR_INTERNET_DISCONNECTED')
      ) {
        write({
          type: 'expected-offline-console',
          messageType: msg.type(),
          peer: peerId,
          text: msg.text(),
        });
        return;
      }

      metrics.consoleErrors += 1;
      recordIssue(
        'console',
        `peer-${peerId}`,
        { messageType: msg.type(), text: msg.text() },
        'error'
      );
    }
  });
  page.on('pageerror', (error) => {
    metrics.pageErrors += 1;
    recordIssue('pageerror', `peer-${peerId}`, { message: error.message });
  });

  await applyNetwork(peer, 'production');
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
    const root = document.querySelector('[contenteditable="true"]');
    const blocks = root
      ? Array.from(
          root.querySelectorAll(':scope > [data-plite-node="element"]')
        ).map((el) => ({
          childElementCount: el.querySelectorAll('[data-plite-node="element"]')
            .length,
          path: el.getAttribute('data-plite-path'),
          text: el.textContent,
        }))
      : [];

    return {
      blocks,
      bodyText: document.body.textContent?.slice(0, 1000) ?? '',
      cursorText:
        document.querySelector('[data-test-id$="-cursors"]')?.textContent ?? '',
      editorCount: document.querySelectorAll('[contenteditable="true"]').length,
      nestedDivInP: document.querySelectorAll('[contenteditable="true"] p div')
        .length,
      nestedParagraphCount: document.querySelectorAll(
        '[contenteditable="true"] p p'
      ).length,
      statusText:
        document.body.textContent?.match(
          /connected|connecting|disconnected|synced|syncing/g
        ) ?? [],
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
        blocks: blockTexts(snap),
        label,
        nestedParagraphCount: peerSnap.nestedParagraphCount,
        peer: peerId,
      });
    }
    if (peerSnap.nestedDivInP > 0) {
      recordIssue('nested-div-in-paragraph', scenario, {
        blocks: blockTexts(snap),
        label,
        nestedDivInP: peerSnap.nestedDivInP,
        peer: peerId,
      });
    }
  }

  return snap;
}

async function expectConverged(peersById, scenario, label, expected = null) {
  const snap = await checkShape(peersById, scenario, label);
  const texts = blockTexts(snap);
  const first = texts[0];
  const converged = texts.every((candidate) => sameJson(candidate, first));

  if (!converged) {
    recordIssue('non-convergence', scenario, { label, texts });
  }
  if (expected && !sameJson(first, expected)) {
    recordIssue('unexpected-document', scenario, { expected, label, texts });
  }

  return snap;
}

async function waitForConvergence(
  peersById,
  scenario,
  label,
  expected = null,
  timeoutMs = 8000
) {
  const started = Date.now();
  let lastSnap = null;

  while (Date.now() - started < timeoutMs) {
    lastSnap = await checkShape(peersById, scenario, label);
    const texts = blockTexts(lastSnap);
    const first = texts[0];

    if (
      texts.every((candidate) => sameJson(candidate, first)) &&
      (!expected || sameJson(first, expected))
    ) {
      return lastSnap;
    }

    await sleep(250);
  }

  return await expectConverged(peersById, scenario, label, expected);
}

async function runScenario(name, fn) {
  metrics.scenarios[name] = (metrics.scenarios[name] ?? 0) + 1;
  write({ type: 'scenario-start', name });

  try {
    await fn(name);
  } catch (error) {
    recordIssue('scenario-exception', name, {
      message: error?.message ?? String(error),
      stack: String(error?.stack ?? '').slice(0, 2000),
    });
  } finally {
    write({ type: 'scenario-end', name });
  }
}

async function reloadPeer(peer, scenario) {
  metrics.hardReloads += 1;
  write({ type: 'hard-reload', peer: peer.id, scenario });
  await peer.page.reload({ waitUntil: 'domcontentloaded' });
  await peer.page
    .locator(`[data-test-id="yjs-peer-${peer.id}-append"]`)
    .waitFor({
      timeout: 30_000,
    });
  await pacedSleep(2);
}

async function scenarioBaselineSplit(peersById, name) {
  await click(peersById.b, 'split-node', name);
  await waitForConvergence(
    peersById,
    name,
    'after b split',
    metrics.scenarios[name] === 1 ? ['Hello ', 'world!'] : null
  );
}

async function scenarioPersistenceReload(peersById, name) {
  await click(peersById.a, 'append', name);
  await waitForConvergence(peersById, name, 'after append');
  await pacedSleep(8);
  await reloadPeer(peersById.d, name);
  await waitForConvergence(peersById, name, 'after d reload');
}

async function scenarioBrowserNetworkPartition(peersById, name) {
  await applyNetwork(peersById.c, 'offline');
  metrics.browserOfflineWindows += 1;
  await click(peersById.c, 'insert-text', name);
  await click(peersById.a, 'append', name);
  await pacedSleep(4);
  await applyNetwork(peersById.c, 'degraded');
  await click(peersById.c, 'connect', name);
  await click(peersById.a, 'reconcile', name);
  await waitForConvergence(peersById, name, 'after browser network restore');
}

async function scenarioDegradedRandom(peersById, name) {
  await applyNetwork(peersById.a, 'degraded');
  await applyNetwork(peersById.d, 'degraded');

  for (let index = 0; index < 8; index += 1) {
    const peer = peersById[peers[index % peers.length]];
    const action = randomActions[index % randomActions.length];
    await click(peer, action, name);
    await checkShape(peersById, name, `random ${index}`);
  }

  await applyNetwork(peersById.a, 'production');
  await applyNetwork(peersById.d, 'production');
  await click(peersById.a, 'reconcile', name);
  await waitForConvergence(peersById, name, 'after degraded random');
}

function writeSummary(final = false) {
  const sortedIssues = [...issues.values()].sort((a, b) => {
    const order = { error: 0, suspect: 1, warning: 2 };
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
  });
  const lines = [
    '# Yjs Hocuspocus Production Soak',
    '',
    `- status: ${final ? 'complete' : 'running'}`,
    `- url: ${targetUrl}`,
    `- yjs_url: ${yjsUrl}`,
    `- run_id: ${runId}`,
    `- elapsed_ms: ${Date.now() - startedAt}`,
    `- actions: ${metrics.actions}`,
    `- hard_reloads: ${metrics.hardReloads}`,
    `- browser_offline_windows: ${metrics.browserOfflineWindows}`,
    `- console_errors: ${metrics.consoleErrors}`,
    `- page_errors: ${metrics.pageErrors}`,
    `- issues: ${sortedIssues.length}`,
    `- storage_dir: ${storageDir}`,
    `- log: ${logPath}`,
    '',
    '## Network Profiles',
    '',
    ...Object.entries(networkProfiles).map(
      ([name, profile]) => `- ${name}: ${JSON.stringify(profile)}`
    ),
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
      durationMs,
      jitterMs,
      logPath,
      outputRoot,
      shouldStartServers,
      storageDir,
      summaryPath,
      targetUrl,
      yjsUrl,
    },
  });

  await startServers();
  await waitForUrl(targetUrl);
  browser = await chromium.launch({
    headless: process.env.SOAK_HEADLESS === '1',
  });

  const peerEntries = await Promise.all(
    peers.map(async (peerId) => [peerId, await createPeer(peerId)])
  );
  const peersById = Object.fromEntries(peerEntries);

  await waitForConvergence(peersById, 'initial', 'initial convergence', [
    'Hello world!',
  ]);
  scenarioStartedAt = Date.now();

  while (Date.now() - scenarioStartedAt < durationMs) {
    await runScenario('baseline-split', (name) =>
      scenarioBaselineSplit(peersById, name)
    );
    await runScenario('persistence-reload', (name) =>
      scenarioPersistenceReload(peersById, name)
    );
    await runScenario('browser-network-partition', (name) =>
      scenarioBrowserNetworkPartition(peersById, name)
    );
    await runScenario('degraded-random', (name) =>
      scenarioDegradedRandom(peersById, name)
    );
    writeSummary(false);
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
