import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const htmlPath = args.html || 'docs/perf/index.html';
const evidencePath = args.evidence || 'docs/perf/evidence.html';
const sourceEvidencePath = args.sourceEvidence || htmlPath;
const healthPath =
  args.health || 'benchmarks/results/benchmark-health-latest.json';
const richTextDataPath = args.richTextData || 'docs/perf/rich-text-data.json';
const internalsDataPath =
  args.internalsData || 'docs/perf/slate-v2-internals-data.json';
const perfWikiPath = args.perfWiki || 'docs/perf/perf-wiki.json';
const targetHistoryPath =
  args.targetHistory || '../targets/history/slate-v2-latest.json';
const targetRegistryPath = args.targetRegistry || '../targets/slate-v2.json';

const sourceEvidenceHtml = readIfExists(sourceEvidencePath);
const shouldPreserveEvidence =
  sourceEvidenceHtml && !isGeneratedLandingIndex(sourceEvidenceHtml);

if (!args.check && shouldPreserveEvidence) {
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, sourceEvidenceHtml);
}

const html = renderIndexHtml({
  evidence: summarizePerfWiki(perfWikiPath),
  health: summarizeHealth(healthPath),
  internals: summarizeViewerData(internalsDataPath),
  richText: summarizeViewerData(richTextDataPath),
  targets: summarizeTargets({
    historyPath: targetHistoryPath,
    registryPath: targetRegistryPath,
  }),
});

if (args.check) {
  assertFileEquals(htmlPath, html);
  if (!fs.existsSync(evidencePath)) {
    throw new Error(`missing preserved Evidence Kit wiki: ${evidencePath}`);
  }
  console.log(`checked ${htmlPath} and ${evidencePath}`);
} else {
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html);
  console.log(`${shouldPreserveEvidence ? 'wrote' : 'kept'} ${evidencePath}`);
  console.log(`wrote ${htmlPath}`);
}

function summarizeViewerData(filePath) {
  const payload = readJsonIfExists(filePath);

  if (!payload) {
    return {
      groups: 0,
      rowCount: 0,
    };
  }

  return {
    groups: Array.isArray(payload.groups) ? payload.groups.length : 0,
    rowCount: Number(payload.rowCount) || 0,
  };
}

function summarizePerfWiki(filePath) {
  const payload = readJsonIfExists(filePath);

  if (!payload) {
    return {
      benchmarkRows: 0,
      notes: 0,
      researchSources: 0,
    };
  }

  return {
    benchmarkRows: Number(payload.benchmarkRowCount) || 0,
    notes: Number(payload.noteCount) || 0,
    researchSources: Array.isArray(payload.researchRegistry)
      ? payload.researchRegistry.length
      : 0,
  };
}

function summarizeHealth(filePath) {
  const payload = readJsonIfExists(filePath);

  if (!payload) {
    return {
      activeArtifacts: 0,
      discardedUnregisteredArtifacts: 0,
      nextActions: [],
      rowCount: 0,
      statusCounts: {},
    };
  }

  return {
    activeArtifacts: Number(payload.registry?.activeArtifacts) || 0,
    discardedUnregisteredArtifacts:
      Number(payload.registry?.discardedUnregisteredArtifacts) || 0,
    nextActions: Array.isArray(payload.nextActions)
      ? payload.nextActions.slice(0, 5)
      : [],
    rowCount: Number(payload.result?.rowCount) || 0,
    statusCounts: payload.result?.statusCounts || {},
  };
}

function summarizeTargets({ historyPath, registryPath }) {
  const registry = readJsonIfExists(registryPath);
  const history = readJsonIfExists(historyPath);
  const targets = history?.targets ?? registry?.targets ?? [];
  const statusCounts = history?.counts?.statusCounts ?? {};
  const families = countBy(targets, (target) => target.family ?? 'unknown');
  const nonOkTargets = targets
    .filter((target) => target.status && target.status !== 'ok')
    .slice(0, 6)
    .map((target) => ({
      command: target.command,
      id: target.id,
      metric: target.metric ?? target.metrics?.primary ?? 'unknown',
      status: target.status,
    }));

  return {
    artifactCounts: history?.counts ?? null,
    families,
    nonOkTargets,
    registryPath,
    statusCounts,
    targetCount: Number(history?.counts?.targets) || targets.length,
  };
}

function renderIndexHtml({ evidence, health, internals, richText, targets }) {
  const statusSummary =
    Object.entries(targets.statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ') || 'no target history yet';
  const familySummary =
    Object.entries(targets.families)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([family, count]) => `${family}: ${count}`)
      .join(', ') || 'no targets yet';
  const nextActions =
    targets.nonOkTargets.length > 0
      ? targets.nonOkTargets
          .map(
            (target) =>
              `<li><strong>${escapeHtml(target.id)}</strong><br><span class="meta">status=${escapeHtml(target.status)}; metric=${escapeHtml(target.metric)}; run <code>pnpm bench:targets:dry-run -- ${escapeHtml(target.id)}</code></span></li>`
          )
          .join('')
      : '<li><strong>No required target artifacts missing</strong><br><span class="meta">Use <code>pnpm bench:targets:list</code>, <code>pnpm bench:targets:dry-run -- &lt;target-id&gt;</code>, then <code>[$slate-ar-perf] &lt;target-id&gt;</code>.</span></li>';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Editor Benchmark Index</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body{font-family:Helvetica,Arial,sans-serif;margin:24px;line-height:1.45;color:#111}
      h1{font-size:24px;margin:0 0 16px}
      h2{font-size:18px;margin:0 0 8px}
      p{margin:4px 0 12px;max-width:820px}
      ul{margin:0;padding:0;list-style:none;max-width:900px}
      li{border:1px solid #ccc;margin:0 0 12px;padding:12px}
      a{font-size:18px;font-weight:700;text-decoration:none;color:#00e}
      code{background:#eee;padding:1px 4px}
      .meta{color:#555;font-size:13px}
      .health{border:1px solid #999;margin:16px 0 20px;max-width:900px;padding:12px}
      .health h2{margin-top:0}
      .health ol{margin:8px 0 0 22px;padding:0}
      .health li{border:0;margin:0 0 8px;padding:0}
      footer{border-top:1px solid #ccc;margin-top:24px;padding-top:12px;color:#555;font-size:13px}
      footer a{font-size:13px}
    </style>
  </head>
  <body>
    <h1>Editor Benchmark Index</h1>
    <p>Slate v2 benchmark target dashboard. Active benchmark decisions come from <code>${escapeHtml(targets.registryPath)}</code>; Evidence Kit is retained as an audit archive.</p>
    <section class="health">
      <h2>Target Health</h2>
      <p>${targets.targetCount} targets. Status: ${escapeHtml(statusSummary)}.</p>
      <p class="meta">Families: ${escapeHtml(familySummary)}.</p>
      <ol>
        ${nextActions}
      </ol>
    </section>
    <ul>
      <li>
        <a href="../../../targets/reports/slate-v2.md">Slate v2 target report</a>
        <p>Generated from the active target registry for benchmark routing, Autoresearch setup, metric ownership, and artifact health.</p>
        <p class="meta">Required artifacts: ${targets.artifactCounts?.existingArtifacts ?? 0}/${targets.artifactCounts?.requiredArtifacts ?? 0}. Missing optional: ${targets.artifactCounts?.missingOptionalArtifacts ?? 0}. Data: <code>../../../targets/history/slate-v2-latest.json</code></p>
      </li>
      <li>
        <a href="rich-text.html">Rich text editor comparison</a>
        <p>Evidence Kit comparison rows for Slate v2 and Slate.</p>
        <p class="meta">${richText.rowCount} rows across ${richText.groups} groups. Data: <code>rich-text-data.json</code></p>
      </li>
      <li>
        <a href="slate-v2-internals.html">Slate v2 internals</a>
        <p>Evidence Kit rows for Slate v2-only runtime, React, collaboration, clipboard, and transaction proof.</p>
        <p class="meta">${internals.rowCount} rows across ${internals.groups} groups. Data: <code>slate-v2-internals-data.json</code></p>
      </li>
    </ul>
    <footer>
      Evidence Kit archive:
      <a href="evidence.html">Evidence Kit wiki</a>
      (${evidence.benchmarkRows} benchmark rows, ${evidence.notes} notes, ${evidence.researchSources} research sources; health snapshot: ${health.rowCount} rows, ${health.discardedUnregisteredArtifacts} discarded historical artifacts)
    </footer>
  </body>
</html>
`;
}

function countBy(items, getKey) {
  const counts = {};

  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]
  );
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function isGeneratedLandingIndex(html) {
  return html.includes('<title>Editor Benchmark Index</title>');
}

function assertFileEquals(filePath, expected) {
  let current;
  try {
    current = fs.readFileSync(filePath, 'utf8');
  } catch {
    throw new Error(`missing generated file: ${filePath}`);
  }
  if (current !== expected) {
    throw new Error(`generated file is stale: ${filePath}`);
  }
}

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    if (key === 'check') {
      out.check = true;
      continue;
    }

    out[key] = argv[i] || true;
    i++;
  }

  return out;
}
