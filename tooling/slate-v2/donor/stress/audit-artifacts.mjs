import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { getDesktopProjects } from './desktop-projects.mjs';

const readList = (name, fallback) =>
  (process.env[name] ?? fallback)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const readOptionalSet = (name) => {
  const raw = process.env[name];

  if (!raw) return null;

  return new Set(readList(name, ''));
};

const readNumber = (name, fallback) => {
  const value = process.env[name];

  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative number.`);
  }

  return parsed;
};

const artifactRoot = resolve(
  process.cwd(),
  process.env.STRESS_ARTIFACT_DIR ?? 'tmp/stress-artifacts'
);
const seed =
  process.env.STRESS_AUDIT_SEED ?? process.env.STRESS_SEED ?? 'default';
const projects = readList(
  'STRESS_AUDIT_PROJECTS',
  getDesktopProjects().join(',')
);
const projectSet = new Set(projects);
const routeSet = readOptionalSet('STRESS_AUDIT_ROUTES');
const familySet = readOptionalSet('STRESS_AUDIT_FAMILIES');
const COMMAND_TOKEN_SEPARATOR_RE = /\s+/;
const expectedPerProject = process.env.STRESS_AUDIT_EXPECTED_PER_PROJECT
  ? readNumber('STRESS_AUDIT_EXPECTED_PER_PROJECT', 0)
  : null;
const maxAgeMinutes = process.env.STRESS_AUDIT_MAX_AGE_MINUTES
  ? readNumber('STRESS_AUDIT_MAX_AGE_MINUTES', 30)
  : expectedPerProject === null
    ? 30
    : null;
const cutoffMs =
  maxAgeMinutes === null ? null : Date.now() - maxAgeMinutes * 60 * 1000;

const artifactFiles = [];

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      walk(path);
      continue;
    }

    if (
      (cutoffMs === null || stats.mtimeMs >= cutoffMs) &&
      path.endsWith('.json') &&
      !path.endsWith('.result.json')
    ) {
      artifactFiles.push(path);
    }
  }
};

const replayScriptForProject = (projectName) => {
  if (projectName === 'chromium') return 'test:stress:replay';
  if (projectName === 'firefox' || projectName === 'webkit') {
    return `test:stress:replay:${projectName}`;
  }

  return 'test:stress:replay:desktop';
};

const getCommandTokens = (command) =>
  typeof command === 'string'
    ? command.trim().split(COMMAND_TOKEN_SEPARATOR_RE).filter(Boolean)
    : [];

const getBunScript = (command) => {
  const tokens = getCommandTokens(command);
  const bunIndex = tokens.indexOf('bun');

  return bunIndex === -1 ? null : (tokens[bunIndex + 1] ?? null);
};

const getEnvAssignment = (command, name) => {
  const prefix = `${name}=`;
  const token = getCommandTokens(command).find((value) =>
    value.startsWith(prefix)
  );

  return token ? token.slice(prefix.length) : null;
};

walk(artifactRoot);

const matchingArtifacts = artifactFiles
  .map((path) => ({
    artifact: JSON.parse(readFileSync(path, 'utf8')),
    mtimeMs: statSync(path).mtimeMs,
    path,
  }))
  .filter(({ artifact }) => artifact.seed === seed)
  .filter(({ artifact }) => projectSet.has(artifact.projectName))
  .filter(({ artifact }) => !routeSet || routeSet.has(artifact.route))
  .filter(({ artifact }) => !familySet || familySet.has(artifact.family));

const getArtifactTimestamp = ({ artifact, mtimeMs }) => {
  const createdAtMs = Date.parse(artifact.createdAt ?? '');

  return Number.isFinite(createdAtMs) ? createdAtMs : mtimeMs;
};

const artifacts =
  expectedPerProject === null
    ? matchingArtifacts
    : projects.flatMap((project) =>
        matchingArtifacts
          .filter(({ artifact }) => artifact.projectName === project)
          .sort((a, b) => getArtifactTimestamp(b) - getArtifactTimestamp(a))
          .slice(0, expectedPerProject)
      );

const summaryByProject = new Map();
const failures = [];
const missingCandidates = [];
const missingCandidateCommands = [];
const badFullReplay = [];
const badCandidateReplay = [];
const nonReplayableCandidates = [];

for (const { artifact, path } of artifacts) {
  const summary = summaryByProject.get(artifact.projectName) ?? {
    candidates: [],
    count: 0,
    families: new Set(),
    routes: new Set(),
  };

  summary.count += 1;
  summary.candidates.push(artifact.reductionCandidates?.length ?? 0);
  summary.routes.add(artifact.route);
  summary.families.add(artifact.family);
  summaryByProject.set(artifact.projectName, summary);

  if (artifact.status !== 'passed') {
    failures.push(path);
  }

  if (!artifact.reductionCandidates?.length) {
    missingCandidates.push(path);
  }

  const expectedScript = replayScriptForProject(artifact.projectName);

  if (getBunScript(artifact.replayCommand) !== expectedScript) {
    badFullReplay.push({
      command: artifact.replayCommand,
      expectedScript,
      path,
    });
  }

  for (const candidate of artifact.reductionCandidates ?? []) {
    if (!candidate.replay?.replayable) {
      nonReplayableCandidates.push({ label: candidate.label, path });
    }
    if (
      getEnvAssignment(candidate.replayCommand, 'STRESS_REDUCTION') !==
      candidate.label
    ) {
      missingCandidateCommands.push({ label: candidate.label, path });
    }
    if (getBunScript(candidate.replayCommand) !== expectedScript) {
      badCandidateReplay.push({
        command: candidate.replayCommand,
        expectedScript,
        label: candidate.label,
        path,
      });
    }
  }
}

const summary = Object.fromEntries(
  [...summaryByProject.entries()].map(([project, value]) => [
    project,
    {
      count: value.count,
      families: value.families.size,
      maxCandidates: Math.max(...value.candidates),
      minCandidates: Math.min(...value.candidates),
      routes: value.routes.size,
    },
  ])
);

const errors = [];

if (artifacts.length === 0) {
  errors.push('No matching stress artifacts found.');
}

for (const project of projects) {
  const count = summaryByProject.get(project)?.count ?? 0;

  if (count === 0) {
    errors.push(`No matching stress artifacts found for project ${project}.`);
  }
  if (expectedPerProject !== null && count !== expectedPerProject) {
    errors.push(
      `Expected ${expectedPerProject} artifacts for ${project}, found ${count}.`
    );
  }
}

if (failures.length) errors.push(`${failures.length} artifacts failed.`);
if (missingCandidates.length) {
  errors.push(
    `${missingCandidates.length} artifacts lack reduction candidates.`
  );
}
if (missingCandidateCommands.length) {
  errors.push(
    `${missingCandidateCommands.length} reduction candidates lack replay commands.`
  );
}
if (badFullReplay.length) {
  errors.push(`${badFullReplay.length} artifacts have bad replay commands.`);
}
if (badCandidateReplay.length) {
  errors.push(
    `${badCandidateReplay.length} reduction candidates have bad replay commands.`
  );
}
if (nonReplayableCandidates.length) {
  errors.push(
    `${nonReplayableCandidates.length} reduction candidates are not replayable.`
  );
}

const report = {
  errors,
  filters: {
    artifactRoot,
    expectedPerProject,
    families: familySet ? [...familySet] : null,
    maxAgeMinutes,
    projects,
    routes: routeSet ? [...routeSet] : null,
    seed,
  },
  ok: errors.length === 0,
  samples: {
    badCandidateReplay: badCandidateReplay.slice(0, 5),
    badFullReplay: badFullReplay.slice(0, 5),
    failures: failures.slice(0, 5),
    missingCandidateCommands: missingCandidateCommands.slice(0, 5),
    missingCandidates: missingCandidates.slice(0, 5),
    nonReplayableCandidates: nonReplayableCandidates.slice(0, 5),
  },
  summary,
  total: artifacts.length,
};

console.log(JSON.stringify(report, null, 2));

if (errors.length) {
  process.exitCode = 1;
}
