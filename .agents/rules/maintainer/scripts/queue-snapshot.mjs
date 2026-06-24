#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const DEFAULT_REPO = 'udecode/plate';
const DEFAULT_OUT = 'docs/maintainer/queue.md';
const DEFAULT_JSON = '.tmp/maintainer/queue-snapshot.json';
const HTTP_URL_RE = /^https?:\/\//;

function parseArgs(argv) {
  const args = {
    fixture: '',
    json: DEFAULT_JSON,
    limit: 20,
    out: DEFAULT_OUT,
    repo: DEFAULT_REPO,
    write: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = requireValue(argv, ++i, arg);
    else if (arg === '--limit')
      args.limit = Number(requireValue(argv, ++i, arg));
    else if (arg === '--out') args.out = requireValue(argv, ++i, arg);
    else if (arg === '--json') args.json = requireValue(argv, ++i, arg);
    else if (arg === '--fixture') args.fixture = requireValue(argv, ++i, arg);
    else if (arg === '--no-write') args.write = false;
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.limit) || args.limit < 1) {
    throw new Error('--limit must be a positive number');
  }

  return args;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function printHelp() {
  console.log(`Usage: node .agents/rules/maintainer/scripts/queue-snapshot.mjs [options]

Options:
  --repo owner/repo       GitHub repo to inspect. Default: ${DEFAULT_REPO}
  --limit n              Max issues and PRs to read. Default: 20
  --out path             Markdown ledger path. Default: ${DEFAULT_OUT}
  --json path            JSON artifact path. Default: ${DEFAULT_JSON}
  --fixture path         Read fixture JSON instead of live gh
  --no-write             Print summary only; do not write artifacts
`);
}

function ghJson(args) {
  const stdout = execFileSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(stdout || '[]');
}

function loadSnapshot(args) {
  if (args.fixture) {
    const fixture = JSON.parse(readFileSync(args.fixture, 'utf8'));
    return {
      advisories: fixture.advisories ?? [],
      issues: fixture.issues ?? [],
      prs: fixture.prs ?? [],
      source: `fixture:${args.fixture}`,
      warnings: fixture.warnings ?? [],
    };
  }

  const warnings = [];
  const issues = safeRead(
    () =>
      ghJson([
        'issue',
        'list',
        '--repo',
        args.repo,
        '--state',
        'open',
        '--limit',
        String(args.limit),
        '--json',
        'number,title,url,updatedAt,labels,assignees,comments',
      ]),
    warnings,
    'issues'
  );

  const prs = safeRead(
    () =>
      ghJson([
        'pr',
        'list',
        '--repo',
        args.repo,
        '--state',
        'open',
        '--limit',
        String(args.limit),
        '--json',
        'number,title,url,updatedAt,isDraft,reviewDecision,author,labels',
      ]),
    warnings,
    'pull requests'
  );

  const advisories = safeRead(
    () =>
      ghJson([
        'api',
        `repos/${args.repo}/security-advisories`,
        '--jq',
        '[.[] | {ghsa_id, summary, html_url, state, updated_at}]',
      ]),
    warnings,
    'security advisories'
  );

  return {
    advisories,
    issues,
    prs,
    source: 'gh',
    warnings,
  };
}

function safeRead(read, warnings, label) {
  try {
    return read();
  } catch (error) {
    warnings.push(`${label}: ${error.message.split('\n')[0]}`);
    return [];
  }
}

function labelsOf(item) {
  return (item.labels ?? [])
    .map((label) => (typeof label === 'string' ? label : label.name))
    .filter(Boolean);
}

function scoreIssue(issue) {
  const labels = labelsOf(issue).map((label) => label.toLowerCase());
  let score = 30;
  const reasons = [];

  if (labels.some((label) => label.includes('security'))) {
    score += 60;
    reasons.push('security-shaped');
  }
  if (labels.includes('bug')) {
    score += 25;
    reasons.push('bug');
  }
  if (labels.some((label) => label.includes('regression'))) {
    score += 20;
    reasons.push('regression');
  }
  if (labels.some((label) => label.includes('needs reproduction'))) {
    score -= 25;
    reasons.push('needs reproduction');
  }
  if ((issue.comments ?? 0) > 5) {
    score += 5;
    reasons.push('active thread');
  }

  return {
    category: labels.some((label) => label.includes('security'))
      ? 'security'
      : labels.includes('bug')
        ? 'issue bug'
        : 'issue triage',
    decision: labels.some((label) => label.includes('needs reproduction'))
      ? 'brief-only'
      : 'candidate',
    intake: labels.some((label) => label.includes('needs reproduction'))
      ? 'needs-repro'
      : 'unknown until body read',
    owner: labels.some((label) => label.includes('security'))
      ? 'security-triage'
      : 'maintainer -> owner after body read',
    proof: labels.some((label) => label.includes('needs reproduction'))
      ? 'missing repro'
      : 'read issue body, linked repro, affected source, focused command',
    rankReason: reasons.join(', ') || 'open issue',
    score,
  };
}

function scorePr(pr) {
  const labels = labelsOf(pr).map((label) => label.toLowerCase());
  let score = 40;
  const reasons = [];

  if (pr.isDraft) {
    score -= 20;
    reasons.push('draft');
  }
  if (pr.reviewDecision === 'CHANGES_REQUESTED') {
    score += 30;
    reasons.push('changes requested');
  }
  if (pr.reviewDecision === 'REVIEW_REQUIRED') {
    score += 20;
    reasons.push('review required');
  }
  if (labels.some((label) => label.includes('security'))) {
    score += 50;
    reasons.push('security-shaped');
  }

  return {
    category: labels.some((label) => label.includes('security'))
      ? 'security PR'
      : 'PR review',
    decision: pr.isDraft ? 'defer' : 'candidate',
    intake: 'PR body must be read',
    owner: labels.some((label) => label.includes('security'))
      ? 'security-triage'
      : 'autoreview or resolve-pr-feedback',
    proof: 'read PR body/files/reviews/checks before action',
    rankReason: reasons.join(', ') || 'open PR',
    score,
  };
}

function scoreAdvisory(advisory) {
  return {
    category: 'security advisory',
    decision: 'candidate',
    intake: 'private advisory must be read',
    owner: 'security-triage',
    proof: 'GHSA read, shipped-state proof, trust boundary',
    rankReason: advisory.state ?? 'security advisory',
    score: 100,
  };
}

function buildRows(snapshot) {
  const rows = [];

  for (const advisory of snapshot.advisories ?? []) {
    const scored = scoreAdvisory(advisory);
    rows.push({
      ...scored,
      item: advisory.html_url ?? advisory.url ?? advisory.ghsa_id ?? 'advisory',
      title:
        advisory.summary ?? advisory.title ?? advisory.ghsa_id ?? 'Advisory',
      updatedAt: advisory.updated_at ?? advisory.updatedAt ?? '',
      type: 'advisory',
    });
  }

  for (const pr of snapshot.prs ?? []) {
    const scored = scorePr(pr);
    rows.push({
      ...scored,
      item: pr.url ?? `PR #${pr.number}`,
      title: pr.title ?? '',
      updatedAt: pr.updatedAt ?? '',
      type: 'pr',
    });
  }

  for (const issue of snapshot.issues ?? []) {
    const scored = scoreIssue(issue);
    rows.push({
      ...scored,
      item: issue.url ?? `Issue #${issue.number}`,
      title: issue.title ?? '',
      updatedAt: issue.updatedAt ?? '',
      type: 'issue',
    });
  }

  return rows.sort((a, b) => b.score - a.score || a.item.localeCompare(b.item));
}

function markdown(args, snapshot, rows) {
  const now = new Date().toISOString();
  const topRows = rows.slice(0, Math.max(args.limit, 1));
  return `# Maintainer Queue

Generated: ${now}
Repo: ${args.repo}
Source: ${snapshot.source}
Public mutations: none

This ledger is a local Codex maintainer input. It is not a GitHub source of
truth. Before acting on any row, read the live issue, PR, advisory, checks,
comments, linked work, owner skill, and current source.

## Summary

- advisories: ${(snapshot.advisories ?? []).length}
- pull requests: ${(snapshot.prs ?? []).length}
- issues: ${(snapshot.issues ?? []).length}
- warnings: ${(snapshot.warnings ?? []).length}

## Warnings

${snapshot.warnings?.length ? snapshot.warnings.map((warning) => `- ${escapeCell(warning)}`).join('\n') : '- none'}

## Candidate Matrix

| Rank | Score | Item | Type | Title | Category | Intake | Owner | Proof | Decision | Updated |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${topRows.map((row, index) => `| ${index + 1} | ${row.score} | ${displayItem(row)} | ${escapeCell(row.type)} | ${displayTitle(row)} | ${escapeCell(row.category)} | ${escapeCell(row.intake)} | ${escapeCell(row.owner)} | ${escapeCell(row.proof)} | ${escapeCell(row.decision)} | ${escapeCell(row.updatedAt)} |`).join('\n')}

## Next Heartbeat

1. Pick the highest ranked row that fits \`VISION.md\`.
2. Read live state and public intake for that row.
3. Run duplicate/claim guard.
4. Route to the narrow owner or execute one safe local slice.
5. Record changed files, proof, public mutation boundary, needs-attention, and next heartbeat.
`;
}

function linkOrText(value) {
  const text = escapeCell(value);
  return HTTP_URL_RE.test(value) ? `[link](${text})` : text;
}

function displayItem(row) {
  if (row.type === 'advisory') {
    return 'private advisory';
  }
  return linkOrText(row.item);
}

function displayTitle(row) {
  if (row.type === 'advisory') {
    return 'Redacted; read live GHSA or local `.tmp` artifact';
  }
  return escapeCell(row.title);
}

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshot = loadSnapshot(args);
  const rows = buildRows(snapshot);
  const artifact = {
    generatedAt: new Date().toISOString(),
    repo: args.repo,
    rows,
    snapshot,
  };
  const md = markdown(args, snapshot, rows);

  if (args.write) {
    writeJson(args.json, artifact);
    writeText(args.out, md);
  }

  console.log(
    JSON.stringify(
      {
        advisories: snapshot.advisories.length,
        issues: snapshot.issues.length,
        json: args.write ? args.json : null,
        out: args.write ? args.out : null,
        prs: snapshot.prs.length,
        rows: rows.length,
        warnings: snapshot.warnings.length,
      },
      null,
      2
    )
  );
}

try {
  main();
} catch (error) {
  console.error(`[queue-snapshot] ${error.message}`);
  process.exit(1);
}
