import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  readFeatureManifest,
  requiredSurfaces,
  validateFeaturePlan,
} from './check-plate-feature.mjs';

const makePlan = (flowMode, excluded = []) => {
  const rows = requiredSurfaces.map((surface) =>
    excluded.includes(surface)
      ? `| ${surface} | no | plate-feature | N/A: excluded by flow | consumer | N/A: excluded by flow | N/A: excluded by flow |`
      : `| ${surface} | yes | owner | artifact | consumer | proof | complete |`
  );

  return `Flow mode:\n- ${flowMode}\n\nFeature Manifest:\n| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`;
};

test('accepts a full new public feature entrypoint flow', () => {
  assert.deepEqual(
    validateFeaturePlan(makePlan('new public feature entrypoint')),
    []
  );
});

test('accepts a source-backed scale N/A and still requires the surface', () => {
  assert.deepEqual(
    validateFeaturePlan(
      makePlan('new public feature entrypoint', ['Scale proof'])
    ),
    []
  );

  const missing = makePlan('new public feature entrypoint').replace(
    /^\| Scale proof .*\n/m,
    ''
  );
  assert.match(
    validateFeaturePlan(missing).join('\n'),
    /Missing manifest surface: Scale proof/
  );
});

test('accepts the template blank line before a flow-mode bullet', () => {
  const plan = makePlan('existing package plus React/registry').replace(
    'Flow mode:\n- existing package plus React/registry',
    'Flow mode:\n\n- existing package plus React/registry'
  );

  assert.deepEqual(validateFeaturePlan(plan), []);
});

test('accepts headless and registry-only flows with explicit exclusions', () => {
  assert.deepEqual(
    validateFeaturePlan(
      makePlan('headless package', [
        'React adapter',
        'Registry UI',
        'Composition',
        'Registry metadata/examples',
      ])
    ),
    []
  );
  assert.deepEqual(
    validateFeaturePlan(
      makePlan('registry-only', ['API', 'Package', 'React adapter'])
    ),
    []
  );
});

test('rejects missing and unresolved surfaces', () => {
  const missing = makePlan('new public feature entrypoint').replace(
    /^\| API .*\n/m,
    ''
  );
  const pending = makePlan('new public feature entrypoint').replace(
    '| Package | yes | owner | artifact | consumer | proof | complete |',
    '| Package | yes | owner | artifact | consumer | proof | pending |'
  );

  assert.match(
    validateFeaturePlan(missing).join('\n'),
    /Missing manifest surface: API/
  );
  assert.match(
    validateFeaturePlan(pending).join('\n'),
    /Package: applicable row must be complete/
  );
});

test('rejects duplicate surfaces', () => {
  const plan = makePlan('new public feature entrypoint').replace(
    '| Package | yes | owner | artifact | consumer | proof | complete |',
    '| API | yes | owner | artifact | consumer | proof | complete |'
  );

  assert.match(validateFeaturePlan(plan).join('\n'), /duplicate surfaces/);
});

test('rejects placeholder or N/A evidence on an applicable row', () => {
  const placeholder = makePlan('new public feature entrypoint').replace(
    '| API | yes | owner | artifact | consumer | proof | complete |',
    '| API | yes | pending | TODO | consumer | proof | complete |'
  );
  const narrowed = makePlan('new public feature entrypoint').replace(
    '| API | yes | owner | artifact | consumer | proof | complete |',
    '| API | yes | owner | N/A: skipped | consumer | proof | complete |'
  );

  assert.match(validateFeaturePlan(placeholder).join('\n'), /placeholder/);
  assert.match(validateFeaturePlan(narrowed).join('\n'), /placeholder/);
});

test('rejects missing or contradictory flow modes', () => {
  const missingMode = makePlan('new public feature entrypoint').replace(
    'Flow mode:\n- new public feature entrypoint\n\n',
    ''
  );
  const headlessWithRegistry = makePlan('headless package', [
    'React adapter',
    'Composition',
    'Registry metadata/examples',
  ]);

  assert.match(
    validateFeaturePlan(missingMode).join('\n'),
    /Flow mode must be/
  );
  assert.match(
    validateFeaturePlan(headlessWithRegistry).join('\n'),
    /headless package: Registry UI must be excluded/
  );
});

test('the feature plan template lists every surface the checker requires', () => {
  const template = readFileSync(
    new URL(
      '../../.agents/rules/plate-plugins/references/feature/template.md',
      import.meta.url
    ),
    'utf-8'
  );

  assert.deepEqual(
    readFeatureManifest(template).map(([surface]) => surface),
    requiredSurfaces
  );
});
