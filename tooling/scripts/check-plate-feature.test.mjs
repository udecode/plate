import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { after } from 'node:test';

import { computePackageFingerprint } from '../../.agents/rules/plate-next/scripts/version.mjs';
import {
  requiredSurfaces,
  validateFeaturePlan,
} from './check-plate-feature.mjs';

const fixtureRoot = mkdtempSync(join(tmpdir(), 'plate-feature-check-'));
const fixtureSlug = 'example';
const fixturePackage = join(fixtureRoot, 'packages', fixtureSlug);

mkdirSync(join(fixturePackage, 'src'), { recursive: true });
writeFileSync(
  join(fixturePackage, 'package.json'),
  JSON.stringify({ name: '@platejs/example' })
);
writeFileSync(
  join(fixturePackage, 'src/index.ts'),
  'export const value = 1;\n'
);

const fixtureFingerprint = computePackageFingerprint(fixtureRoot, fixtureSlug);
const fixturePlanPath = join(fixtureRoot, 'docs/plans/feature.md');
const fixturePlanRelativePath = 'docs/plans/feature.md';
const fixtureRegistry = {
  latestVersion: 98,
  packages: {
    [fixtureSlug]: {
      appliedVersion: 98,
      evidence: fixturePlanRelativePath,
      fingerprint: fixtureFingerprint.fingerprint,
    },
  },
};

mkdirSync(join(fixtureRoot, 'docs/plans'), { recursive: true });
writeFileSync(fixturePlanPath, '# Feature plan\n');

const validate = (source) =>
  validateFeaturePlan(source, {
    planPath: fixturePlanPath,
    registry: fixtureRegistry,
    root: fixtureRoot,
  });

after(() => {
  rmSync(fixtureRoot, { force: true, recursive: true });
});

const makePlan = (flowMode, excluded = []) => {
  const rows = requiredSurfaces.map((surface) => {
    if (excluded.includes(surface)) {
      return `| ${surface} | no | plate-feature | N/A: excluded by flow | consumer | N/A: excluded by flow | N/A: excluded by flow |`;
    }
    const artifact = ['Package', 'Plate Next attestation'].includes(surface)
      ? '[Package file evidence](#package-file-evidence)'
      : 'artifact';

    return `| ${surface} | yes | owner | ${artifact} | consumer | proof | complete |`;
  });

  const packageEvidence = excluded.includes('Package')
    ? ''
    : `\nPackage file evidence:\n- Package: ${fixtureSlug}\n- Manifest command / file count: version.mjs fingerprint ${fixtureSlug} (${fixtureFingerprint.fileCount} files).\n- Package fingerprint: ${fixtureFingerprint.fingerprint}\n${fixtureFingerprint.files.map((path) => `- File: \`packages/${fixtureSlug}/${path}\``).join('\n')}\n${fixtureFingerprint.files.map((path) => `- [x] \`packages/${fixtureSlug}/${path}\` — score: 100 — verdict: keep — owner: package — evidence: typecheck — next: none.`).join('\n')}\n`;

  return `Flow mode:\n- ${flowMode}\n\nFeature Manifest:\n| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n${packageEvidence}\nCompletion Gates:\n| Gate | Applies | Required action | Evidence |\n| --- | --- | --- | --- |\n| P2 autoreview | yes | review | clean |\n| Goal plan complete | yes | check | pending |\n`;
};

test('accepts a full new-package flow', () => {
  assert.deepEqual(validate(makePlan('new package')), []);
});

test('accepts an existing-package React and registry flow', () => {
  assert.deepEqual(
    validate(makePlan('existing package plus React/registry')),
    []
  );
});

test('accepts a headless package with explicit exclusions', () => {
  assert.deepEqual(
    validate(
      makePlan('headless package', [
        'React adapter',
        'Registry UI',
        'Composition',
        'Registry metadata/examples',
      ])
    ),
    []
  );
});

test('accepts a registry-only flow with explicit exclusions', () => {
  assert.deepEqual(
    validate(
      makePlan('registry-only', [
        'API',
        'Package',
        'React adapter',
        'Plate Next attestation',
      ])
    ),
    []
  );
});

test('rejects missing and unresolved surfaces', () => {
  const missing = makePlan('new package').replace(/^\| API .*\n/m, '');
  const pending = makePlan('new package').replace(
    '| Package | yes | owner | [Package file evidence](#package-file-evidence) | consumer | proof | complete |',
    '| Package | yes | owner | [Package file evidence](#package-file-evidence) | consumer | proof | pending |'
  );

  assert.match(validate(missing).join('\n'), /Missing manifest surface: API/);
  assert.match(
    validate(pending).join('\n'),
    /Package: applicable row must be complete/
  );
});

test('rejects duplicate surfaces', () => {
  const plan = makePlan('new package').replace(
    '| Package | yes | owner | [Package file evidence](#package-file-evidence) | consumer | proof | complete |',
    '| API | yes | owner | artifact | consumer | proof | complete |'
  );

  assert.match(validate(plan).join('\n'), /duplicate surfaces/);
});

test('rejects unresolved evidence and review gates', () => {
  const placeholder = makePlan('new package').replace(
    '| API | yes | owner | artifact | consumer | proof | complete |',
    '| API | yes | pending | TODO | consumer | proof | complete |'
  );
  const pendingReview = makePlan('new package').replace(
    '| P2 autoreview | yes | review | clean |',
    '| P2 autoreview | yes | review | pending |'
  );

  assert.match(validate(placeholder).join('\n'), /placeholder/);
  assert.match(validate(pendingReview).join('\n'), /resolved evidence/);
});

test('rejects missing or unresolved package-file evidence', () => {
  const missingLink = makePlan('new package').replace(
    '[Package file evidence](#package-file-evidence)',
    'artifact'
  );
  const unchecked = makePlan('new package').replace(
    '- [x] `packages/',
    '- [ ] `packages/'
  );

  assert.match(validate(missingLink).join('\n'), /must link/);
  assert.match(validate(unchecked).join('\n'), /unchecked rows/);
});

test('rejects incomplete manifests and forged fingerprints', () => {
  const incompleteManifest = makePlan('new package').replace(
    /^- File: `packages\/example\/package\.json`\n/m,
    ''
  );
  const forgedFingerprint = makePlan('new package').replace(
    fixtureFingerprint.fingerprint,
    `sha256:${'0'.repeat(64)}`
  );
  const malformedReview = makePlan('new package').replace(
    '- [x] `packages/',
    '- [z] `packages/'
  );

  assert.match(
    validate(incompleteManifest).join('\n'),
    /manifest count and unique file list|current package source manifest/
  );
  assert.match(
    validate(forgedFingerprint).join('\n'),
    /fingerprint does not match/
  );
  assert.match(
    validate(malformedReview).join('\n'),
    /one valid unique review row/
  );
});

test('binds package attestation to this exact plan and latest version', () => {
  const missingPlanPath = validateFeaturePlan(makePlan('new package'), {
    registry: fixtureRegistry,
    root: fixtureRoot,
  });
  const staleRegistry = {
    ...fixtureRegistry,
    packages: {
      [fixtureSlug]: {
        ...fixtureRegistry.packages[fixtureSlug],
        appliedVersion: 97,
        evidence: 'docs/plans/another.md',
      },
    },
  };
  const staleAttestation = validateFeaturePlan(makePlan('new package'), {
    planPath: fixturePlanPath,
    registry: staleRegistry,
    root: fixtureRoot,
  });

  assert.match(
    missingPlanPath.join('\n'),
    /requires the checked repo-relative/
  );
  assert.match(staleAttestation.join('\n'), /not current|exact plan/);
});

test('rejects N/A for required evidence', () => {
  const manifestNarrowing = makePlan('new package').replace(
    '| API | yes | owner | artifact | consumer | proof | complete |',
    '| API | yes | owner | N/A: skipped | consumer | proof | complete |'
  );
  const reviewNarrowing = makePlan('new package').replace(
    '| P2 autoreview | yes | review | clean |',
    '| P2 autoreview | yes | review | N/A: skipped |'
  );

  assert.match(validate(manifestNarrowing).join('\n'), /placeholder/);
  assert.match(validate(reviewNarrowing).join('\n'), /resolved evidence/);
});

test('rejects missing or contradictory flow modes', () => {
  const missingMode = makePlan('new package').replace(
    'Flow mode:\n- new package\n\n',
    ''
  );
  const headlessWithRegistry = makePlan('headless package', [
    'React adapter',
    'Composition',
    'Registry metadata/examples',
  ]);

  assert.match(validate(missingMode).join('\n'), /Flow mode must be/);
  assert.match(
    validate(headlessWithRegistry).join('\n'),
    /headless package: Registry UI must be excluded/
  );
});
