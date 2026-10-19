#!/usr/bin/env node

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const syncDir = path.join(repoRoot, 'docs/sync/shadcn');
const deltasPath = path.join(syncDir, 'deltas.json');
const statusPath = path.join(syncDir, 'status.json');
const dashboardJsonPath = path.join(syncDir, 'dashboard.json');
const dashboardHtmlPath = path.join(syncDir, 'dashboard.html');

const args = process.argv.slice(2);
const shouldOpenDashboard = !args.includes('--no-open');
const commandArgs = args.filter((arg) => arg !== '--no-open');

if (commandArgs.length > 0 && commandArgs[0] !== 'dashboard') {
  console.error('Usage: pnpm sync-shadcn dashboard [--no-open]');
  process.exit(1);
}

function openFile(filePath) {
  if (!shouldOpenDashboard || process.env.SYNC_SHADCN_NO_OPEN === '1') {
    return { skipped: true };
  }

  if (process.env.CI === 'true') {
    return { skipped: true, reason: 'CI=true' };
  }

  const opener =
    process.platform === 'darwin'
      ? { command: 'open', args: [filePath] }
      : process.platform === 'win32'
        ? { command: 'cmd', args: ['/c', 'start', '', filePath] }
        : { command: 'xdg-open', args: [filePath] };

  const result = spawnSync(opener.command, opener.args, {
    stdio: 'ignore',
  });

  if (result.error || result.status !== 0) {
    return {
      error:
        result.error?.message ?? `${opener.command} exited ${result.status}`,
    };
  }

  return { opened: true };
}

const stateMeta = {
  defer: {
    label: 'Defer',
    tone: 'defer',
    description: 'Acknowledged and intentionally postponed.',
  },
  pending: {
    label: 'Pending',
    tone: 'pending',
    description: 'No final decision yet.',
  },
  fork: {
    label: 'Fork',
    tone: 'fork',
    description: 'Plate intentionally diverges.',
  },
  rejected: {
    label: 'Rejected',
    tone: 'rejected',
    description: 'Upstream behavior is explicitly excluded.',
  },
  synced: {
    label: 'Synced',
    tone: 'synced',
    description: 'Accepted, implemented, and verified.',
  },
};

const knownStates = new Set(Object.keys(stateMeta));
const actionableStateList = ['pending', 'defer'];
const actionableStates = new Set(actionableStateList);
const doneStateList = ['fork', 'rejected', 'synced'];
const screenshotCleanupStates = new Set(
  doneStateList.filter((state) => state !== 'fork')
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function validateState(state, pathLabel) {
  if (!knownStates.has(state)) {
    throw new Error(
      `${pathLabel} uses unknown state "${state}". Known states: ${[
        ...knownStates,
      ].join(', ')}`
    );
  }
}

function normalizeFeature(feature) {
  if (!feature.id || !feature.label) {
    throw new Error('Every feature needs id and label.');
  }

  validateState(feature.reviewState, `feature ${feature.id}`);

  const items = ensureArray(feature.items).map((item) => {
    if (!item.id || !item.title || !item.state) {
      throw new Error(
        `Feature ${feature.id} has an item without id, title, or state.`
      );
    }

    validateState(item.state, `feature ${feature.id} item ${item.id}`);

    return {
      decision: '',
      evidence: '',
      suggestion: '',
      upstream: '',
      ...item,
      files: ensureArray(item.files),
      screenshots: normalizeScreenshots(item.screenshots),
    };
  });

  return {
    summary: '',
    ...feature,
    items,
  };
}

function normalizeScreenshots(screenshots) {
  const normalized = {
    suggestion: '',
    shadcn: '',
    ...(screenshots ?? {}),
  };

  for (const [kind, screenshotPath] of Object.entries(normalized)) {
    if (
      !screenshotPath ||
      screenshotPath.startsWith('http') ||
      screenshotPath.startsWith('data:')
    ) {
      continue;
    }

    const absolutePath = path.resolve(repoRoot, screenshotPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing ${kind} screenshot: ${screenshotPath}`);
    }
  }

  return normalized;
}

function isLocalScreenshotPath(screenshotPath) {
  if (
    !screenshotPath ||
    screenshotPath.startsWith('http') ||
    screenshotPath.startsWith('data:')
  ) {
    return false;
  }

  return path
    .resolve(repoRoot, screenshotPath)
    .startsWith(`${syncDir}${path.sep}`);
}

function collectScreenshotPaths(features) {
  const paths = new Set();

  for (const feature of ensureArray(features)) {
    for (const item of ensureArray(feature.items)) {
      for (const screenshotPath of Object.values(item.screenshots ?? {})) {
        if (screenshotPath) {
          paths.add(screenshotPath);
        }
      }
    }
  }

  return paths;
}

function cleanupDoneScreenshots(deltas) {
  const removedPaths = new Set();
  let changed = false;

  for (const feature of ensureArray(deltas.features)) {
    for (const item of ensureArray(feature.items)) {
      if (!screenshotCleanupStates.has(item.state) || !item.screenshots) {
        continue;
      }

      for (const screenshotPath of Object.values(item.screenshots)) {
        if (screenshotPath) {
          removedPaths.add(screenshotPath);
        }
      }

      item.screenshots = undefined;
      changed = true;
    }
  }

  if (!changed) {
    return [];
  }

  fs.writeFileSync(deltasPath, `${JSON.stringify(deltas, null, 2)}\n`);

  const referencedPaths = collectScreenshotPaths(deltas.features);
  const deletedFiles = [];

  for (const screenshotPath of removedPaths) {
    if (
      referencedPaths.has(screenshotPath) ||
      !isLocalScreenshotPath(screenshotPath)
    ) {
      continue;
    }

    const absolutePath = path.resolve(repoRoot, screenshotPath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    fs.rmSync(absolutePath);
    deletedFiles.push(screenshotPath);
  }

  return deletedFiles;
}

function countByState(features, field) {
  const counts = Object.fromEntries(
    Object.keys(stateMeta).map((state) => [state, 0])
  );

  for (const feature of features) {
    if (field === 'feature') {
      counts[feature.reviewState] += 1;
      continue;
    }

    for (const item of feature.items) {
      counts[item.state] += 1;
    }
  }

  return counts;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function shortSha(value) {
  return value ? String(value).slice(0, 7) : 'none';
}

function renderBadge(state) {
  const meta = stateMeta[state];
  return `<span class="badge ${meta.tone}" data-state-label="${escapeHtml(state)}">${escapeHtml(meta.label)}</span>`;
}

function renderFiles(files) {
  if (files.length === 0) return '<span class="muted">None listed</span>';

  return `<ul class="files">${files.map((file) => `<li><code>${escapeHtml(file)}</code></li>`).join('')}</ul>`;
}

function renderReviewActions(selectedState) {
  const stateActionButton = (state, label) => {
    const checked = state === selectedState ? 'true' : 'false';

    return `<button type="button" role="radio" aria-checked="${checked}" data-preset-state="${escapeHtml(state)}">${escapeHtml(label)}</button>`;
  };

  return `<div class="quick-action-row">
    <button type="button" data-question-action aria-pressed="false">Ask</button>
    ${stateActionButton('defer', 'Defer')}
  </div>
  <div class="quick-action-row" role="radiogroup" aria-label="Apply review state">
    ${stateActionButton('synced', 'Sync')}
    ${stateActionButton('rejected', 'Reject')}
    ${stateActionButton('fork', 'Fork')}
  </div>`;
}

function screenshotSrc(screenshotPath) {
  if (!screenshotPath) return '';
  if (screenshotPath.startsWith('http') || screenshotPath.startsWith('data:')) {
    return screenshotPath;
  }

  return path
    .relative(syncDir, path.resolve(repoRoot, screenshotPath))
    .replaceAll(path.sep, '/');
}

function renderScreenshots(item) {
  if (screenshotCleanupStates.has(item.state)) return '';

  const entries = ['suggestion', 'shadcn']
    .map((kind) => {
      const screenshotPath = item.screenshots[kind];
      if (!screenshotPath) return '';

      const src = screenshotSrc(screenshotPath);
      const label = `${kind === 'suggestion' ? 'Suggestion' : 'shadcn'} screenshot for ${item.title}`;

      return `<figure class="screenshot-card">
        <figcaption>${kind === 'suggestion' ? 'Suggestion' : 'shadcn'}</figcaption>
        <button type="button" class="screenshot-thumb" data-screenshot-src="${escapeHtml(src)}" data-screenshot-label="${escapeHtml(label)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(label)}" loading="lazy" /></button>
      </figure>`;
    })
    .filter(Boolean);

  if (entries.length === 0) return '';

  return `<div class="screenshot-grid">${entries.join('')}</div>`;
}

function renderHtml(dashboard) {
  const actionableTotal = actionableStateList.reduce(
    (sum, state) => sum + dashboard.itemCounts[state],
    0
  );
  const doneTotal = doneStateList.reduce(
    (sum, state) => sum + dashboard.itemCounts[state],
    0
  );
  const featureRows = dashboard.features
    .map((feature) => {
      const items = feature.items
        .map(
          (item) => `
            <article class="item-card" data-state="${escapeHtml(item.state)}" data-feature="${escapeHtml(feature.id)}" data-feature-label="${escapeHtml(feature.label)}" data-item-id="${escapeHtml(item.id)}" data-item-title="${escapeHtml(item.title)}" data-current-state="${escapeHtml(item.state)}">
              <div class="review-cell">
                <div class="review-options">
                  <span>Review</span>
                  <input type="hidden" data-review-state value="${escapeHtml(item.state)}" />
                  <div class="quick-actions" aria-label="Review actions">
                    ${renderReviewActions(item.state)}
                  </div>
                </div>
                <label>
                  <span>Note</span>
                  <textarea data-review-note rows="3" placeholder="Pick an action first" disabled></textarea>
                </label>
              </div>
              <div class="item-body">
                <div class="item-heading">
                  <div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.decision)}</p>
                  </div>
                  ${renderBadge(item.state)}
                </div>
                <div class="comparison-grid">
                  <section>
                    <h4>shadcn</h4>
                    <p>${escapeHtml(item.upstream)}</p>
                  </section>
                  <section>
                    <h4>Suggestion</h4>
                    <p>${escapeHtml(item.suggestion)}</p>
                    <button type="button" class="note-action" data-use-suggestion-note="${escapeHtml(item.suggestion)}">Apply</button>
                  </section>
                </div>
                ${renderScreenshots(item)}
                <div class="item-meta-grid">
                  <section>
                    <h4>Owner Files</h4>
                    ${renderFiles(item.files)}
                  </section>
                </div>
              </div>
            </article>`
        )
        .join('');

      return `
        <section class="feature" data-feature-card="${escapeHtml(feature.id)}" data-state="${escapeHtml(feature.reviewState)}">
          <div class="feature-header">
            <div>
              <p class="eyebrow">${escapeHtml(feature.id)}</p>
              <h2>${escapeHtml(feature.label)}</h2>
              <p>${escapeHtml(feature.summary)}</p>
            </div>
            ${renderBadge(feature.reviewState)}
          </div>
          <div class="item-list">${items}</div>
        </section>`;
    })
    .join('');

  const actionButtons = actionableStateList
    .map((state) => {
      const meta = stateMeta[state];

      return `<button type="button" data-filter="${escapeHtml(state)}">${escapeHtml(meta.label)} <span>${dashboard.itemCounts[state]}</span></button>`;
    })
    .join('');
  const doneButtons = doneStateList
    .map((state) => {
      const meta = stateMeta[state];

      return `<button type="button" data-filter="${escapeHtml(state)}">${escapeHtml(meta.label)} <span>${dashboard.itemCounts[state]}</span></button>`;
    })
    .join('');
  const stateButtons = Object.entries(stateMeta)
    .filter(
      ([state]) =>
        !actionableStates.has(state) && !doneStateList.includes(state)
    )
    .map(
      ([state, meta]) =>
        `<button type="button" data-filter="${escapeHtml(state)}">${escapeHtml(meta.label)} <span>${dashboard.itemCounts[state]}</span></button>`
    )
    .join('');

  const featureCounts = Object.entries(dashboard.featureCounts)
    .filter(([, count]) => count > 0)
    .map(
      ([state, count]) =>
        `<li>${renderBadge(state)} <strong>${count}</strong></li>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>sync-shadcn dashboard</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f6f6f7;
        --panel: #ffffff;
        --text: #111113;
        --muted: #686b73;
        --line: #dedfe3;
        --code: #f1f1f3;
        --synced: #dff6e7;
        --synced-text: #17633a;
        --defer: #fff3cf;
        --defer-text: #7a4b00;
        --pending: #eeeeef;
        --pending-text: #4d4f57;
        --fork: #f2ebff;
        --fork-text: #5730a3;
        --rejected: #ffe8e5;
        --rejected-text: #a02c21;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #111113;
          --panel: #191a1f;
          --text: #f4f4f5;
          --muted: #a1a1aa;
          --line: #2d2e35;
          --code: #25262d;
          --synced: #143820;
          --synced-text: #9be7b4;
          --defer: #3f300c;
          --defer-text: #ffd982;
          --pending: #2b2c33;
          --pending-text: #d0d2da;
          --fork: #2b2046;
          --fork-text: #ceb9ff;
          --rejected: #451d1a;
          --rejected-text: #ffb3ac;
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.45;
      }

      main {
        width: min(1440px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 48px 0;
      }

      header {
        display: grid;
        gap: 18px;
        margin-bottom: 28px;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        font-size: 40px;
        line-height: 1.05;
      }

      h2 {
        font-size: 22px;
        line-height: 1.2;
      }

      .muted,
      header p,
      .feature-header p {
        color: var(--muted);
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 18px;
        color: var(--muted);
        font-size: 14px;
      }

      .summary {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        margin-bottom: 20px;
      }

      .summary-card,
      .feature {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
      }

      .summary-card {
        padding: 14px 16px;
      }

      .summary-card strong {
        display: block;
        font-size: 28px;
      }

      .state-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .state-list li {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .filter-groups {
        display: grid;
        gap: 10px;
        margin: 24px 0;
      }

      .filter-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .filter-label {
        min-width: 78px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      button {
        height: 34px;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: var(--panel);
        color: var(--text);
        cursor: pointer;
        padding: 0 12px;
        font: inherit;
      }

      button[aria-pressed="true"] {
        border-color: var(--text);
      }

      button span {
        color: var(--muted);
      }

      .prompt-panel {
        position: fixed;
        left: 50%;
        bottom: 18px;
        z-index: 40;
        display: grid;
        width: min(780px, calc(100vw - 32px));
        gap: 10px;
        padding: 12px;
        transform: translateX(-50%);
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--panel);
        box-shadow: 0 18px 60px rgb(0 0 0 / 22%);
      }

      .prompt-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .prompt-panel-header h2 {
        font-size: 15px;
      }

      .prompt-panel-header p {
        font-size: 13px;
      }

      .prompt-actions {
        display: flex;
        gap: 8px;
      }

      .prompt-panel textarea {
        width: 100%;
        min-height: 92px;
        max-height: 34vh;
        resize: vertical;
      }

      body.has-review-prompt main {
        padding-bottom: 220px;
      }

      .feature {
        margin: 18px 0;
        overflow: hidden;
      }

      .feature-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        padding: 18px;
        border-bottom: 1px solid var(--line);
      }

      .eyebrow {
        margin-bottom: 5px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        height: 26px;
        white-space: nowrap;
        border-radius: 999px;
        padding: 0 10px;
        font-size: 12px;
        font-weight: 700;
      }

      .synced {
        background: var(--synced);
        color: var(--synced-text);
      }

      .defer {
        background: var(--defer);
        color: var(--defer-text);
      }

      .pending {
        background: var(--pending);
        color: var(--pending-text);
      }

      .fork {
        background: var(--fork);
        color: var(--fork-text);
      }

      .rejected {
        background: var(--rejected);
        color: var(--rejected-text);
      }

      .item-list {
        display: grid;
        gap: 12px;
        padding: 12px;
      }

      .item-card {
        display: grid;
        grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
        gap: 18px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 14px;
        background: var(--bg);
      }

      .item-body {
        display: grid;
        gap: 14px;
        min-width: 0;
      }

      .item-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }

      .item-heading h3 {
        margin: 0;
        font-size: 18px;
        line-height: 1.25;
      }

      .item-heading p {
        margin-top: 5px;
        color: var(--muted);
      }

      .comparison-grid,
      .item-meta-grid {
        display: grid;
        gap: 12px;
      }

      .comparison-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .item-meta-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .comparison-grid section,
      .item-meta-grid section {
        min-width: 0;
      }

      .comparison-grid h4,
      .item-meta-grid h4 {
        margin: 0 0 5px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .comparison-grid p,
      .item-meta-grid p {
        margin: 0;
      }

      .note-action {
        height: 28px;
        margin-top: 10px;
        padding: 0 8px;
        font-size: 12px;
      }

      textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: var(--panel);
        color: var(--text);
        font: inherit;
      }

      textarea {
        padding: 9px 10px;
      }

      .review-cell {
        min-width: 0;
      }

      .review-cell label {
        display: grid;
        gap: 6px;
      }

      .review-options + label {
        margin-top: 10px;
      }

      .quick-actions {
        display: grid;
        gap: 6px;
        margin: 10px 0;
      }

      .quick-action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .quick-actions button {
        height: 28px;
        padding: 0 8px;
        font-size: 12px;
      }

      .quick-actions button[aria-checked="true"],
      .quick-actions button[aria-pressed="true"] {
        border-color: var(--text);
        background: var(--code);
        color: var(--text);
      }

      .review-cell span {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .screenshot-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .screenshot-card {
        display: grid;
        gap: 6px;
        margin: 0;
      }

      .screenshot-card figcaption {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .screenshot-thumb {
        display: flex;
        width: 100%;
        height: 180px;
        padding: 0;
        overflow: hidden;
        border-radius: 7px;
      }

      .screenshot-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .screenshot-modal {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 28px;
        background: rgb(0 0 0 / 72%);
      }

      .screenshot-dialog {
        display: grid;
        gap: 12px;
        width: min(1200px, 96vw);
        max-height: 92vh;
      }

      .screenshot-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        color: white;
      }

      .screenshot-dialog-header p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .screenshot-dialog img {
        max-width: 100%;
        max-height: calc(92vh - 70px);
        border-radius: 8px;
        background: var(--panel);
        object-fit: contain;
      }

      code {
        border-radius: 5px;
        background: var(--code);
        padding: 2px 5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 12px;
      }

      .files {
        display: grid;
        gap: 5px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .hidden {
        display: none;
      }

      @media (max-width: 720px) {
        main {
          width: min(100vw - 24px, 1440px);
          padding: 28px 0;
        }

        h1 {
          font-size: 32px;
        }

        .feature-header {
          display: grid;
        }

        .prompt-panel {
          bottom: 12px;
          width: min(100vw - 20px, 780px);
        }

        .prompt-panel-header {
          display: grid;
        }

        .prompt-actions {
          width: 100%;
        }

        .prompt-actions button {
          flex: 1;
        }

        .item-card,
        .comparison-grid,
        .item-meta-grid,
        .screenshot-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>sync-shadcn dashboard</h1>
        <p>Feature-owned delta board for deciding what Plate should land, defer, reject, fork, or keep pending from upstream shadcn.</p>
        <div class="meta">
          <span>Generated ${escapeHtml(dashboard.generatedAt)}</span>
          <span>Baseline ${escapeHtml(shortSha(dashboard.status.lastSyncedCommit))}</span>
          <span>Planned ${escapeHtml(shortSha(dashboard.status.lastPlannedCommit))}</span>
          <span>Plan ${escapeHtml(dashboard.status.lastPlan || 'none')}</span>
        </div>
      </header>

      <section class="summary" aria-label="Summary">
        <div class="summary-card">
          <span class="muted">Features</span>
          <strong>${dashboard.features.length}</strong>
        </div>
        <div class="summary-card">
          <span class="muted">Items</span>
          <strong>${dashboard.itemTotal}</strong>
        </div>
        <div class="summary-card">
          <span class="muted">Partial Syncs</span>
          <strong>${dashboard.status.partialSyncCount}</strong>
        </div>
        <div class="summary-card">
          <span class="muted">Feature States</span>
          <ul class="state-list">${featureCounts}</ul>
        </div>
      </section>

      <nav class="filter-groups" aria-label="State filters">
        <div class="filter-row">
          <span class="filter-label">Action</span>
          <button type="button" data-filter="actionable" aria-pressed="true">All Action <span>${actionableTotal}</span></button>
          ${actionButtons}
        </div>
        <div class="filter-row">
          <span class="filter-label">Done</span>
          <button type="button" data-filter="done">All Done <span>${doneTotal}</span></button>
          ${doneButtons}
          <button type="button" data-filter="all">Everything <span>${dashboard.itemTotal}</span></button>
          ${stateButtons}
        </div>
      </nav>

      ${featureRows}
    </main>
    <section class="prompt-panel hidden" aria-label="Review prompt">
      <div class="prompt-panel-header">
        <div>
          <h2>Prompt</h2>
        </div>
        <div class="prompt-actions">
          <button type="button" id="cancel-review-prompt">Cancel</button>
          <button type="button" id="copy-review-prompt" disabled>Copy</button>
        </div>
      </div>
      <textarea id="review-prompt" readonly></textarea>
    </section>
    <div id="screenshot-modal" class="screenshot-modal hidden" role="dialog" aria-modal="true" aria-label="Screenshot preview">
      <div class="screenshot-dialog">
        <div class="screenshot-dialog-header">
          <p id="screenshot-modal-label"></p>
          <button type="button" id="close-screenshot-modal">Close</button>
        </div>
        <img id="screenshot-modal-image" alt="" />
      </div>
    </div>
    <script>
      const buttons = Array.from(document.querySelectorAll("[data-filter]"));
      const rows = Array.from(document.querySelectorAll(".item-card[data-state]"));
      const cards = Array.from(document.querySelectorAll("[data-feature-card]"));
      const promptPanel = document.querySelector(".prompt-panel");
      const copyReviewPromptButton = document.querySelector("#copy-review-prompt");
      const cancelReviewPromptButton = document.querySelector("#cancel-review-prompt");
      const reviewPrompt = document.querySelector("#review-prompt");
      const actionableStates = new Set(${JSON.stringify(actionableStateList)});
      const doneStates = new Set(${JSON.stringify(doneStateList)});
      const screenshotModal = document.querySelector("#screenshot-modal");
      const screenshotModalImage = document.querySelector("#screenshot-modal-image");
      const screenshotModalLabel = document.querySelector("#screenshot-modal-label");
      const closeScreenshotModalButton = document.querySelector("#close-screenshot-modal");

      function applyFilter(state) {
        buttons.forEach((button) => {
          button.setAttribute("aria-pressed", String(button.dataset.filter === state));
        });

        rows.forEach((row) => {
          const isVisible =
            state === "all" ||
            (state === "actionable" && actionableStates.has(row.dataset.state)) ||
            (state === "done" && doneStates.has(row.dataset.state)) ||
            row.dataset.state === state;
          row.classList.toggle("hidden", !isVisible);
        });

        cards.forEach((card) => {
          const visibleRows = Array.from(card.querySelectorAll(".item-card")).some(
            (row) => !row.classList.contains("hidden")
          );
          card.classList.toggle("hidden", !visibleRows);
        });
      }

      buttons.forEach((button) => {
        button.addEventListener("click", () => applyFilter(button.dataset.filter));
      });
      applyFilter("actionable");

      function enableNote(row, placeholder = "Optional decision note") {
        const noteInput = row.querySelector("[data-review-note]");
        noteInput.disabled = false;
        noteInput.placeholder = placeholder;
        return noteInput;
      }

      function setQuestionActive(row, isActive) {
        row.querySelector("[data-question-action]").setAttribute("aria-pressed", String(isActive));
      }

      function setSelectedState(row, nextState) {
        row.querySelector("[data-review-state]").value = nextState;

        row.querySelectorAll("[data-preset-state]").forEach((button) => {
          button.setAttribute("aria-checked", String(button.dataset.presetState === nextState));
        });
      }

      function collectReviewChanges() {
        return rows
          .map((row) => {
            const stateInput = row.querySelector("[data-review-state]");
            const noteInput = row.querySelector("[data-review-note]");
            const nextState = stateInput.value;
            const note = noteInput.disabled ? "" : noteInput.value.trim().replace(/\\s+/g, " ");

            if (nextState === row.dataset.currentState && note.length === 0) {
              return null;
            }

            return {
              currentState: row.dataset.currentState,
              featureId: row.dataset.feature,
              featureLabel: row.dataset.featureLabel,
              itemId: row.dataset.itemId,
              itemTitle: row.dataset.itemTitle,
              intent: row.dataset.reviewIntent || "",
              nextState,
              note
            };
          })
          .filter(Boolean);
      }

      function isQuestionNote(note) {
        return (
          /^question:/i.test(note) ||
          /[?？]/.test(note) ||
          /^(what|which|should|would|could|can|do|does|is|are|how|why|where|when)\\b/i.test(note)
        );
      }

      function buildReviewPrompt() {
        const changes = collectReviewChanges();

        if (changes.length === 0) {
          return "No dashboard review changes selected yet.";
        }

        const questionRows = changes.filter((change) => {
          return (
            change.intent === "question" ||
            (change.nextState === change.currentState && isQuestionNote(change.note))
          );
        });
        const applyRows = changes.filter((change) => !questionRows.includes(change));
        const lines = ["$sync-shadcn apply"];

        for (const change of applyRows) {
          const row = [
            "- " + change.featureId + "/" + change.itemId,
            "(" + change.featureLabel + " / " + change.itemTitle + "):",
            change.currentState + " -> " + change.nextState
          ];

          if (change.note) {
            row.push("note: " + change.note);
          }

          lines.push(row.join(" "));
        }

        if (questionRows.length > 0) {
          lines.push("", "Questions:");
        }

        for (const change of questionRows) {
          lines.push(
            "- " +
              change.featureId +
              "/" +
              change.itemId +
              " (" +
              change.featureLabel +
              " / " +
              change.itemTitle +
              "): " +
              change.note
          );
        }

        return lines.join("\\n");
      }

      function updateReviewPrompt() {
        const changes = collectReviewChanges();
        const hasChanges = changes.length > 0;
        reviewPrompt.value = hasChanges ? buildReviewPrompt() : "";
        promptPanel.classList.toggle("hidden", !hasChanges);
        document.body.classList.toggle("has-review-prompt", hasChanges);
        copyReviewPromptButton.disabled = changes.length === 0;
      }

      function resetReviewPrompt() {
        rows.forEach((row) => {
          delete row.dataset.reviewIntent;
          setQuestionActive(row, false);
          setSelectedState(row, row.dataset.currentState);
          const noteInput = row.querySelector("[data-review-note]");
          noteInput.value = "";
          noteInput.disabled = true;
          noteInput.placeholder = "Pick an action first";
        });
        updateReviewPrompt();
      }

      rows.forEach((row) => {
        row.querySelector("[data-review-note]").addEventListener("input", updateReviewPrompt);
      });

      document.querySelectorAll("[data-preset-state]").forEach((button) => {
        button.addEventListener("click", () => {
          const row = button.closest(".item-card");
          row.dataset.reviewIntent = "apply";
          setQuestionActive(row, false);
          setSelectedState(row, button.dataset.presetState);
          enableNote(row);
          updateReviewPrompt();
        });
      });

      document.querySelectorAll("[data-question-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const row = button.closest(".item-card");
          row.dataset.reviewIntent = "question";
          setQuestionActive(row, true);
          setSelectedState(row, row.dataset.currentState);
          const noteInput = enableNote(row, "Ask a question");
          noteInput.focus();
          updateReviewPrompt();
        });
      });

      document.querySelectorAll("[data-use-suggestion-note]").forEach((button) => {
        button.addEventListener("click", () => {
          const row = button.closest(".item-card");
          row.dataset.reviewIntent = "apply";
          setQuestionActive(row, false);
          const noteInput = enableNote(row);
          noteInput.value = button.dataset.useSuggestionNote || "";
          noteInput.focus();
          updateReviewPrompt();
        });
      });

      copyReviewPromptButton.addEventListener("click", async () => {
        updateReviewPrompt();

        try {
          await navigator.clipboard.writeText(reviewPrompt.value);
          copyReviewPromptButton.textContent = "Copied";
        } catch {
          reviewPrompt.select();
          document.execCommand("copy");
          copyReviewPromptButton.textContent = "Copied";
        }

        window.setTimeout(() => {
          copyReviewPromptButton.textContent = "Copy";
        }, 1200);
      });

      cancelReviewPromptButton.addEventListener("click", resetReviewPrompt);

      function closeScreenshotModal() {
        screenshotModal.classList.add("hidden");
        screenshotModalImage.removeAttribute("src");
        screenshotModalImage.alt = "";
        screenshotModalLabel.textContent = "";
      }

      document.querySelectorAll("[data-screenshot-src]").forEach((button) => {
        button.addEventListener("click", () => {
          const label = button.dataset.screenshotLabel || "Screenshot preview";
          screenshotModalImage.src = button.dataset.screenshotSrc;
          screenshotModalImage.alt = label;
          screenshotModalLabel.textContent = label;
          screenshotModal.classList.remove("hidden");
        });
      });

      closeScreenshotModalButton.addEventListener("click", closeScreenshotModal);
      screenshotModal.addEventListener("click", (event) => {
        if (event.target === screenshotModal) {
          closeScreenshotModal();
        }
      });
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !screenshotModal.classList.contains("hidden")) {
          closeScreenshotModal();
        }
      });
    </script>
  </body>
</html>
`;
}

const deltas = readJson(deltasPath);
const status = readJson(statusPath);
const deletedScreenshotFiles = cleanupDoneScreenshots(deltas);
const features = ensureArray(deltas.features).map(normalizeFeature);

const dashboard = {
  generatedAt: new Date().toISOString(),
  source: {
    deltas: path.relative(repoRoot, deltasPath),
    status: path.relative(repoRoot, statusPath),
  },
  status: {
    lastSyncedCommit: status.lastSyncedCommit ?? '',
    lastPlannedCommit: status.lastPlannedCommit ?? '',
    lastPlan: status.lastPlan ?? '',
    partialSyncCount: ensureArray(status.partialSyncs).length,
    target: status.plate ?? {},
    upstream: status.upstream ?? {},
  },
  stateMeta,
  featureCounts: countByState(features, 'feature'),
  itemCounts: countByState(features, 'item'),
  itemTotal: features.reduce((sum, feature) => sum + feature.items.length, 0),
  features,
};

fs.writeFileSync(dashboardJsonPath, `${JSON.stringify(dashboard, null, 2)}\n`);
fs.writeFileSync(dashboardHtmlPath, renderHtml(dashboard));

console.log(`Dashboard: ${path.relative(repoRoot, dashboardHtmlPath)}`);
console.log(`Data: ${path.relative(repoRoot, dashboardJsonPath)}`);
const openResult = openFile(dashboardHtmlPath);
if (openResult.opened) {
  console.log(`Opened: ${pathToFileURL(dashboardHtmlPath).href}`);
} else if (openResult.error) {
  console.warn(`Open failed: ${openResult.error}`);
} else if (openResult.reason) {
  console.log(`Open skipped: ${openResult.reason}`);
}
if (deletedScreenshotFiles.length > 0) {
  console.log(`Deleted screenshots: ${deletedScreenshotFiles.length}`);
}
console.log('');
console.log('| Feature | State | Items |');
console.log('| --- | --- | ---: |');
for (const feature of features) {
  console.log(
    `| ${feature.label} | ${feature.reviewState} | ${feature.items.length} |`
  );
}
