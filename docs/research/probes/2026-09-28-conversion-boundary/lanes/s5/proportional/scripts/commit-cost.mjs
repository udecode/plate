// Per stream: publications (the first preview plus every 32 ms preview timer
// before the last output change), output commits (s5-batch marks: the preview
// DOM changed), publications per commit, and the sampled CPU time between
// consecutive commits by the harness's categories (a parse, b transaction or
// projection, c React, gc, program, other), plus inclusive time of a few static
// renderer frames. The trace and the CPU profile share a clock, as in the
// harness. The last commit is the strict final and is reported apart.
// Streams map to trace and profile files by cell start time and arm order.
// Usage: node commit-cost.mjs <matrix-dir> <trace-dir> <profile-dir> [out.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [matrixDir, traceDir, profileDir, out] = process.argv.slice(2);
const PARSE_FRAMES = new Set(['parseSlice', 'setPreview']);
const PROJECTION_FRAMES = new Set(['createProjectedEditorView', 'getStaticDocumentView']);
const REACT_FRAMES = new Set([
  'commitRoot',
  'flushPassiveEffects',
  'flushSyncWorkAcrossRoots_impl',
  'performSyncWorkOnRoot',
  'performWorkOnRoot',
  'performWorkUntilDeadline',
  'processRootScheduleInMicrotask',
  'renderRootConcurrent',
  'renderRootSync',
]);
const NAMED = [
  'Children',
  'EditorStatic',
  'BaseElementStatic',
  'BaseLeafStatic',
  'readBlockInputs',
  'visit',
  'isSameRenderedDocument',
  'areBlockInputsEqual',
  'areStaticDecorationsEqual',
  'getStaticDocumentView',
  'withDocumentViewRead',
  'commitRoot',
];
const CATEGORIES = ['parse', 'transaction', 'react', 'gc', 'program', 'other'];
// React time by phase: the nearest of these frames above the sample. A
// deferred (transition) render is time-sliced (renderRootConcurrent); a
// blocking render such as a parent's state update runs in renderRootSync.
const PHASES = ['commitRoot', 'flushPassiveEffects', 'renderRootConcurrent', 'renderRootSync'];
const median = (values) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const quantile = (values, q) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * q) - 1)];
};
const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);
const r2 = (n) => (n == null ? null : Math.round(n * 100) / 100);
const sum = (values) => values.reduce((total, value) => total + value, 0);

const cells = readdirSync(matrixDir)
  .filter((f) => f.endsWith('.json') && !f.startsWith('budget'))
  .map((f) => JSON.parse(readFileSync(path.join(matrixDir, f), 'utf8')))
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
const filesIn = (dir, composition, arm, from, to, ext) =>
  readdirSync(dir)
    .filter((f) => f.startsWith(`${composition}-${arm}-`) && f.endsWith(ext))
    .map((f) => [Number(f.slice(`${composition}-${arm}-`.length).split('.')[0]), f])
    .filter(([ms]) => ms >= from && ms < to)
    .sort((a, b) => a[0] - b[0])
    .map(([, f]) => path.join(dir, f));

const analyzeStream = (traceFile, profileFile, isAI) => {
  const events = JSON.parse(readFileSync(traceFile, 'utf8'));
  const start = events.find((e) => e.name === 's5-start');
  const main = events.filter((e) => e.pid === start.pid && e.tid === start.tid);
  const calls = (name) =>
    main
      .filter((e) => e.name === 'FunctionCall' && e.args?.data?.functionName === name)
      .map((e) => e.ts)
      .sort((a, b) => a - b);
  const marks = main
    .filter((e) => e.name === 's5-batch')
    .map((e) => e.ts)
    .sort((a, b) => a - b);
  const previews = calls('__s5Preview32');
  const lastMark = marks.at(-1);
  // Publications: the first preview (at the start) plus each preview timer
  // that ran before the final output change, as the harness counts them.
  const publications = [start.ts, ...previews.filter((t) => t <= lastMark)];
  const finalCall = [...calls('__s5CloseTick'), ...calls('__s5DemoArrival')].sort((a, b) => a - b).at(-1) ?? null;

  const profile = JSON.parse(readFileSync(profileFile, 'utf8'));
  const byId = new Map(profile.nodes.map((node) => [node.id, node]));
  const parent = new Map();
  for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id);
  const cache = new Map();
  const classify = (id) => {
    const cached = cache.get(id);
    if (cached) return cached;
    const own = byId.get(id).callFrame.functionName;
    let parse = false;
    let projection = false;
    let update = false;
    let effect = false;
    let react = false;
    const names = new Set();
    let phase = null;
    for (let at = id; at !== undefined; at = parent.get(at)) {
      const name = byId.get(at).callFrame.functionName;
      if (phase === null && PHASES.includes(name)) phase = name;
      if (PARSE_FRAMES.has(name)) parse = true;
      else if (PROJECTION_FRAMES.has(name)) projection = true;
      else if (name === 'updateEditor') update = true;
      else if (name === 'commitHookEffectListMount') effect = true;
      if (REACT_FRAMES.has(name)) react = true;
      if (NAMED.includes(name)) names.add(name);
    }
    const category =
      own === '(idle)'
        ? 'idle'
        : own === '(garbage collector)'
          ? 'gc'
          : own === '(program)'
            ? 'program'
            : parse
              ? 'parse'
              : projection || (update && (!isAI || effect))
                ? 'transaction'
                : react
                  ? 'react'
                  : 'other';
    const result = { category, names, phase: category === 'react' ? (phase ?? 'otherReact') : null };
    cache.set(id, result);
    return result;
  };
  // Interval k runs from the previous commit (or the start mark) to commit k.
  const bounds = [start.ts, ...marks];
  const intervals = marks.map(() => ({
    ...Object.fromEntries(CATEGORIES.map((c) => [c, 0])),
    named: Object.fromEntries(NAMED.map((n) => [n, 0])),
    phases: Object.fromEntries([...PHASES, 'otherReact'].map((n) => [n, 0])),
  }));
  let time = profile.startTime;
  let k = 0;
  for (const [index, id] of profile.samples.entries()) {
    time += profile.timeDeltas[index] ?? 0;
    const weight = Math.max(0, profile.timeDeltas[index + 1] ?? 0) / 1000;
    if (time <= bounds[0] || time > bounds.at(-1)) continue;
    while (k < marks.length && time > bounds[k + 1]) k += 1;
    const { category, names, phase } = classify(id);
    if (category === 'idle') continue;
    intervals[k][category] += weight;
    if (phase) intervals[k].phases[phase] += weight;
    for (const name of names) intervals[k].named[name] += weight;
  }
  const perInterval = intervals.map((interval, i) => ({
    ...interval,
    publications: publications.filter((t) => (i === 0 ? t >= bounds[0] : t > bounds[i]) && t <= bounds[i + 1]).length,
  }));
  const previewCommits = perInterval.slice(0, -1);
  const final = perInterval.at(-1);
  const react = previewCommits.map((c) => c.react);
  const render = previewCommits.map((c) => c.react + c.transaction);
  const totalPublications = publications.length;

  const arrivals = calls('__s5DemoArrival').filter((t) => t <= lastMark).length;

  return {
    arrivals,
    // React ms by phase over the preview commits, and per preview commit.
    reactPhasesMs: Object.fromEntries([...PHASES, 'otherReact'].map((n) => [n, r1(sum(previewCommits.map((c) => c.phases[n])))])),
    reactPhasesPerCommitMs: Object.fromEntries([...PHASES, 'otherReact'].map((n) => [n, r2(median(previewCommits.map((c) => c.phases[n])))])),
    commits: marks.length,
    previewCommits: previewCommits.length,
    publications: totalPublications,
    // Publications a deferred render never showed: more publications than
    // preview commits, counted per commit interval.
    commitsShowingSkips: previewCommits.filter((c) => c.publications > 1).length,
    publicationsPerCommit: r2(median(previewCommits.map((c) => c.publications))),
    maxPublicationsPerCommit: Math.max(0, ...previewCommits.map((c) => c.publications)),
    reactPerCommitMs: { median: r2(median(react)), p90: r2(quantile(react, 0.9)), mean: r2(sum(react) / Math.max(1, react.length)) },
    renderPerCommitMs: { median: r2(median(render)), p90: r2(quantile(render, 0.9)), mean: r2(sum(render) / Math.max(1, render.length)) },
    reactPerPublicationMs: r2(sum(react) / Math.max(1, totalPublications)),
    renderPerPublicationMs: r2(sum(render) / Math.max(1, totalPublications)),
    // Medians over preview commits of each static renderer frame's inclusive time.
    namedPerCommitMs: Object.fromEntries(NAMED.map((n) => [n, r2(median(previewCommits.map((c) => c.named[n])))])),
    namedTotalMs: Object.fromEntries(NAMED.map((n) => [n, r1(sum(previewCommits.map((c) => c.named[n])))])),
    previewTotals: Object.fromEntries(CATEGORIES.map((c) => [c, r1(sum(previewCommits.map((p) => p[c])))])),
    final: { ...Object.fromEntries(CATEGORIES.map((c) => [c, r1(final[c])])), publications: final.publications, finalCallBeforeLastCommit: finalCall !== null && finalCall <= lastMark },
  };
};

const rows = [];
for (const [index, cell] of cells.entries()) {
  const from = Date.parse(cell.startedAt);
  const to = index + 1 < cells.length ? Date.parse(cells[index + 1].startedAt) : Infinity;
  const isAI = cell.composition === 'ai' || cell.composition === 'ai-live';
  const streams = [];
  for (const arm of ['baseline', 'candidate']) {
    const traces = filesIn(traceDir, cell.composition, arm, from, to, '.json');
    const profiles = filesIn(profileDir, cell.composition, arm, from, to, '.cpuprofile');
    const receipts = cell.streams.filter((s) => s.arm === arm);
    if (traces.length !== receipts.length || profiles.length !== receipts.length) {
      throw new Error(`${cell.cell} ${arm}: ${receipts.length} streams, ${traces.length} traces, ${profiles.length} profiles`);
    }
    receipts.forEach((s, i) => {
      const result = analyzeStream(traces[i], profiles[i], isAI);
      // Cross-check against the receipt: commits equal outputBatches, and
      // publications equal the harness's preview count.
      streams.push({
        arm,
        role: s.role,
        load1: r1(s.loadavg[0]),
        receiptOutputBatches: s.page.outputBatches,
        receiptPreviews: s.page.previews,
        receiptPreviewTasks: s.trace.previewTasks,
        receiptPreviewTasksWithOutput: s.trace.previewTasksWithOutput,
        trace: path.basename(traces[i]),
        profile: path.basename(profiles[i]),
        ...result,
      });
    });
    global.gc?.();
  }
  const med = (arm, pick) => r2(median(streams.filter((s) => s.arm === arm && s.role.startsWith('pair-')).map(pick)));
  const medians = Object.fromEntries(
    ['baseline', 'candidate'].map((arm) => [
      arm,
      {
        publications: med(arm, (s) => s.publications),
        previewCommits: med(arm, (s) => s.previewCommits),
        commitsShowingSkips: med(arm, (s) => s.commitsShowingSkips),
        reactPerCommitMs: med(arm, (s) => s.reactPerCommitMs.median),
        reactPerCommitP90Ms: med(arm, (s) => s.reactPerCommitMs.p90),
        renderPerCommitMs: med(arm, (s) => s.renderPerCommitMs.median),
        renderPerCommitP90Ms: med(arm, (s) => s.renderPerCommitMs.p90),
        reactPerPublicationMs: med(arm, (s) => s.reactPerPublicationMs),
        renderPerPublicationMs: med(arm, (s) => s.renderPerPublicationMs),
        arrivals: med(arm, (s) => s.arrivals),
        reactPhasesMs: Object.fromEntries([...PHASES, 'otherReact'].map((n) => [n, med(arm, (s) => s.reactPhasesMs[n])])),
        reactPhasesPerCommitMs: Object.fromEntries([...PHASES, 'otherReact'].map((n) => [n, med(arm, (s) => s.reactPhasesPerCommitMs[n])])),
        namedTotalMs: Object.fromEntries(NAMED.map((n) => [n, med(arm, (s) => s.namedTotalMs[n])])),
        namedPerCommitMs: Object.fromEntries(NAMED.map((n) => [n, med(arm, (s) => s.namedPerCommitMs[n])])),
      },
    ])
  );
  rows.push({ cell: cell.cell, medians, streams });
  const m = medians.candidate;
  const b = medians.baseline;
  console.log(
    `${cell.cell}: candidate pubs ${m.publications} commits ${m.previewCommits} (skips in ${m.commitsShowingSkips}) | React/commit ${m.reactPerCommitMs} (p90 ${m.reactPerCommitP90Ms}) render/commit ${m.renderPerCommitMs} (p90 ${m.renderPerCommitP90Ms}) | React/pub ${m.reactPerPublicationMs} render/pub ${m.renderPerPublicationMs} || baseline pubs ${b.publications} commits ${b.previewCommits} React/commit ${b.reactPerCommitMs} render/commit ${b.renderPerCommitMs} React/pub ${b.reactPerPublicationMs}`
  );
}
if (out) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
