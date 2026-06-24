import { expect, test } from '@playwright/test';
import {
  assertNoIllegalKernelTransitions,
  installPliteReactRenderProfiler,
  openExample,
} from '@platejs/browser/playwright';

import {
  artifactStepsToScenarioSteps,
  readStressArtifact,
  stressResultPath,
} from './stress-utils';

const replayPath = process.env.STRESS_REPLAY;
const reductionLabel = process.env.STRESS_REDUCTION;

test.skip(!replayPath, 'Set STRESS_REPLAY to a stress artifact path.');
test.describe.configure({ mode: 'serial' });

test('replays a generated browser stress artifact', async ({
  page,
}, testInfo) => {
  if (!replayPath) {
    throw new Error('Set STRESS_REPLAY to a stress artifact path.');
  }

  const artifact = readStressArtifact(replayPath);
  const steps = artifactStepsToScenarioSteps(artifact, { reductionLabel });
  await installPliteReactRenderProfiler(page);
  const editor = await openExample(page, artifact.route, {
    ready: { editor: 'visible' },
    surface: artifact.surface,
  });
  const result = await editor.scenario.run(`${artifact.id}-replay`, steps, {
    metadata: {
      capabilities: [
        'stress-replay',
        ...(reductionLabel ? ['stress-reduction'] : []),
        artifact.family,
        artifact.route,
      ],
      platform: testInfo.project.name,
      transport: 'playwright-browser',
    },
    tracePath: stressResultPath(replayPath, reductionLabel),
  });

  assertNoIllegalKernelTransitions(result);
  expect(result.replay.replayable).toBe(true);
});
