import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type {
  EditorSurfaceOptions,
  SlateBrowserRenderStateSnapshot,
  SlateBrowserScenarioReductionCandidateSummary,
  SlateBrowserScenarioReplay,
  SlateBrowserScenarioResult,
  SlateBrowserScenarioStep,
} from '@platejs/browser/playwright';
import {
  createScenarioReductionCandidates,
  createScenarioReplay,
  summarizeScenarioReductionCandidate,
} from '@platejs/browser/playwright';

export type StressArtifactStatus = 'failed' | 'passed' | 'running';

export type StressArtifact = {
  baseURL: string | null;
  contract?: StressFamilyContract;
  createdAt: string;
  error?: string;
  family: string;
  finalSnapshot?: StressFinalSnapshot;
  id: string;
  projectName: string;
  reductionCandidates?: StressReductionCandidate[];
  replay: SlateBrowserScenarioReplay;
  replayCommand: string;
  resultPath?: string;
  route: string;
  seed: string;
  surface?: EditorSurfaceOptions;
  status: StressArtifactStatus;
  steps: Record<string, unknown>[];
  traceSummary?: StressTraceSummary;
  version: 1;
};

export type StressReductionCandidate =
  SlateBrowserScenarioReductionCandidateSummary & {
    replayCommand: string;
  };

export type StressFamilyContract = {
  assertions: readonly string[];
  family: string;
  routes: readonly string[];
};

export type StressCase = {
  contract?: StressFamilyContract;
  family: string;
  id: string;
  route: string;
  seed: string;
  surface?: EditorSurfaceOptions;
  steps: SlateBrowserScenarioStep[];
};

export type StressFinalSnapshot = Pick<
  SlateBrowserRenderStateSnapshot,
  'domSelection' | 'focusOwner' | 'lastCommit' | 'renderCounts' | 'selection'
>;

export type StressTraceSummary = {
  finalLabel: string | null;
  stepCount: number;
};

export const stressArtifactRoot = () =>
  resolve(
    process.cwd(),
    process.env.STRESS_ARTIFACT_DIR ?? 'tmp/stress-artifacts'
  );

const sanitizePathPart = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '');

export const stressArtifactPath = (
  projectName: string,
  stressCase: Pick<StressCase, 'family' | 'id' | 'route'>
) =>
  resolve(
    stressArtifactRoot(),
    sanitizePathPart(projectName),
    sanitizePathPart(stressCase.route),
    `${sanitizePathPart(stressCase.id)}.json`
  );

export const stressResultPath = (
  artifactPath: string,
  reductionLabel?: string
) =>
  artifactPath.replace(
    /\.json$/u,
    reductionLabel
      ? `.reduction-${sanitizePathPart(reductionLabel)}.result.json`
      : '.result.json'
  );

const stressReplayScript = (projectName: string) => {
  if (projectName === 'chromium') {
    return 'test:stress:replay';
  }
  if (projectName === 'firefox' || projectName === 'webkit') {
    return `test:stress:replay:${projectName}`;
  }

  return 'test:stress:replay:desktop';
};

const stressReplayCommand = ({
  artifactPath,
  projectName,
  reductionLabel,
}: {
  artifactPath: string;
  projectName: string;
  reductionLabel?: string;
}) =>
  [
    `STRESS_REPLAY=${artifactPath}`,
    reductionLabel ? `STRESS_REDUCTION=${reductionLabel}` : null,
    'bun',
    stressReplayScript(projectName),
  ]
    .filter(Boolean)
    .join(' ');

const createStressReductionCandidates = (
  stressCase: StressCase,
  {
    artifactPath,
    projectName,
    reductionCandidates,
  }: {
    artifactPath: string;
    projectName: string;
    reductionCandidates?: SlateBrowserScenarioReductionCandidateSummary[];
  }
): StressReductionCandidate[] =>
  (
    reductionCandidates ??
    createScenarioReductionCandidates(stressCase.steps).map(
      summarizeScenarioReductionCandidate
    )
  ).map((candidate) => ({
    ...candidate,
    replayCommand: stressReplayCommand({
      artifactPath,
      projectName,
      reductionLabel: candidate.label,
    }),
  }));

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack ?? ''}`.trim();
  }

  return String(error);
};

export const createStressArtifact = ({
  artifactPath,
  error,
  finalSnapshot,
  projectName,
  reductionCandidates,
  result,
  resultPath,
  status,
  stressCase,
}: {
  artifactPath: string;
  error?: unknown;
  finalSnapshot?: StressFinalSnapshot;
  projectName: string;
  reductionCandidates?: SlateBrowserScenarioReductionCandidateSummary[];
  result?: SlateBrowserScenarioResult;
  resultPath?: string;
  status: StressArtifactStatus;
  stressCase: StressCase;
}): StressArtifact => {
  const replay = createScenarioReplay(stressCase.steps);
  const artifactReductionCandidates = createStressReductionCandidates(
    stressCase,
    {
      artifactPath,
      projectName,
      reductionCandidates,
    }
  );
  const lastTraceEntry = result?.trace.at(-1) ?? null;

  return {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? null,
    contract: stressCase.contract,
    createdAt: new Date().toISOString(),
    error: error === undefined ? undefined : serializeError(error),
    family: stressCase.family,
    finalSnapshot,
    id: stressCase.id,
    projectName,
    reductionCandidates: artifactReductionCandidates,
    replay,
    replayCommand: stressReplayCommand({ artifactPath, projectName }),
    resultPath,
    route: stressCase.route,
    seed: stressCase.seed,
    surface: stressCase.surface,
    status,
    steps: replay.steps.map((step) => step.value),
    traceSummary: result
      ? {
          finalLabel: lastTraceEntry?.label ?? null,
          stepCount: result.trace.length,
        }
      : undefined,
    version: 1,
  };
};

export const writeStressArtifact = (
  artifactPath: string,
  artifact: StressArtifact
) => {
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
};

export const readStressArtifact = (artifactPath: string): StressArtifact => {
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8')) as unknown;

  if (!artifact || typeof artifact !== 'object') {
    throw new Error(`Stress replay artifact is not an object: ${artifactPath}`);
  }

  const record = artifact as Partial<StressArtifact>;

  if (
    record.version !== 1 ||
    typeof record.route !== 'string' ||
    typeof record.family !== 'string' ||
    !Array.isArray(record.steps)
  ) {
    throw new Error(
      `Stress replay artifact has an unsupported shape: ${artifactPath}`
    );
  }

  return record as StressArtifact;
};

export const artifactStepsToScenarioSteps = (
  artifact: StressArtifact,
  { reductionLabel }: { reductionLabel?: string } = {}
): SlateBrowserScenarioStep[] => {
  if (!reductionLabel) {
    return artifact.steps as SlateBrowserScenarioStep[];
  }

  const candidate = artifact.reductionCandidates?.find(
    ({ label }) => label === reductionLabel
  );

  if (!candidate) {
    const availableLabels =
      artifact.reductionCandidates?.map(({ label }) => label).join(', ') ??
      'none';

    throw new Error(
      `Stress replay artifact does not contain reduction candidate "${reductionLabel}". Available candidates: ${availableLabels}`
    );
  }

  if (!candidate.replay.replayable) {
    throw new Error(
      `Stress reduction candidate "${reductionLabel}" is not replayable.`
    );
  }

  return candidate.replay.steps.map(
    (step) => step.value
  ) as SlateBrowserScenarioStep[];
};
