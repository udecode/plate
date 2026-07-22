// biome-ignore-all lint/performance/useTopLevelRegex: Stress artifact paths are normalized once per result.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type {
  EditorSurfaceOptions,
  PliteBrowserRenderStateSnapshot,
  PliteBrowserScenarioReductionCandidateSummary,
  PliteBrowserScenarioReplay,
  PliteBrowserScenarioResult,
  PliteBrowserScenarioStep,
} from '@platejs/browser/playwright';
import {
  createScenarioReductionCandidates,
  createScenarioReplay,
  decodeScenarioReplay,
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
  replay: PliteBrowserScenarioReplay;
  replayCommand: string;
  resultPath?: string;
  route: string;
  seed: string;
  surface?: EditorSurfaceOptions;
  status: StressArtifactStatus;
  traceSummary?: StressTraceSummary;
  version: 2;
};

type StressReplayArtifact = Pick<
  StressArtifact,
  'family' | 'id' | 'replay' | 'route' | 'surface' | 'version'
> & {
  reductionCandidates?: Pick<StressReductionCandidate, 'label' | 'replay'>[];
};

export type StressReductionCandidate =
  PliteBrowserScenarioReductionCandidateSummary & {
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
  steps: PliteBrowserScenarioStep[];
};

export type StressFinalSnapshot = Pick<
  PliteBrowserRenderStateSnapshot,
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
    reductionCandidates?: PliteBrowserScenarioReductionCandidateSummary[];
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
  reductionCandidates?: PliteBrowserScenarioReductionCandidateSummary[];
  result?: PliteBrowserScenarioResult;
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
    traceSummary: result
      ? {
          finalLabel: lastTraceEntry?.label ?? null,
          stepCount: result.trace.length,
        }
      : undefined,
    version: 2,
  };
};

export const writeStressArtifact = (
  artifactPath: string,
  artifact: StressArtifact
) => {
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const decodeStressSurface = (
  value: unknown,
  artifactPath: string
): EditorSurfaceOptions | undefined => {
  if (value === undefined) return;
  if (
    !isRecord(value) ||
    Object.keys(value).some((key) => key !== 'frame' && key !== 'scope') ||
    (value.frame !== undefined && typeof value.frame !== 'string') ||
    (value.scope !== undefined && typeof value.scope !== 'string')
  ) {
    throw new Error(
      `Stress replay artifact has an invalid surface: ${artifactPath}`
    );
  }

  return {
    ...(value.frame === undefined ? {} : { frame: value.frame }),
    ...(value.scope === undefined ? {} : { scope: value.scope }),
  };
};

export const readStressArtifact = (
  artifactPath: string
): StressReplayArtifact => {
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8')) as unknown;

  if (!isRecord(artifact)) {
    throw new Error(`Stress replay artifact is not an object: ${artifactPath}`);
  }

  if (
    artifact.version !== 2 ||
    typeof artifact.id !== 'string' ||
    typeof artifact.route !== 'string' ||
    typeof artifact.family !== 'string'
  ) {
    throw new Error(
      `Stress replay artifact has an unsupported shape: ${artifactPath}`
    );
  }

  let reductionCandidates: StressReplayArtifact['reductionCandidates'];

  if (artifact.reductionCandidates !== undefined) {
    if (!Array.isArray(artifact.reductionCandidates)) {
      throw new Error(
        `Stress replay artifact has invalid reduction candidates: ${artifactPath}`
      );
    }

    reductionCandidates = artifact.reductionCandidates.map(
      (candidate, index) => {
        if (!isRecord(candidate) || typeof candidate.label !== 'string') {
          throw new Error(
            `Stress replay artifact has invalid reduction candidate ${index}: ${artifactPath}`
          );
        }

        return {
          label: candidate.label,
          replay: decodeScenarioReplay(candidate.replay),
        };
      }
    );
  }

  return {
    family: artifact.family,
    id: artifact.id,
    replay: decodeScenarioReplay(artifact.replay),
    route: artifact.route,
    ...(reductionCandidates === undefined ? {} : { reductionCandidates }),
    ...(artifact.surface === undefined
      ? {}
      : { surface: decodeStressSurface(artifact.surface, artifactPath) }),
    version: 2,
  };
};

export const artifactStepsToScenarioSteps = (
  artifact: StressReplayArtifact,
  { reductionLabel }: { reductionLabel?: string } = {}
): PliteBrowserScenarioStep[] => {
  if (!reductionLabel) {
    return artifact.replay.steps.map((step) => step.value);
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

  return candidate.replay.steps.map((step) => step.value);
};
