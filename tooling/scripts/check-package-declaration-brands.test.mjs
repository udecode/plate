import assert from 'node:assert/strict';
import test from 'node:test';

import { auditPrivatePlateDeclarationBrands } from './check-package-declaration-brands.mjs';

const audit = (source) =>
  auditPrivatePlateDeclarationBrands([{ path: 'dist/index.d.ts', source }]);

test('rejects private Plate unique-symbol brands in public declarations', () => {
  for (const source of [
    'declare const PLATE_PLUGIN_SCHEMA_MODEL: unique symbol;',
    'type Model = typeof PLATE_PLUGIN_SCHEMA_MODEL;',
    'interface Model { readonly [PLATE_PLUGIN_SCHEMA_MODEL]: true }',
    "import { PLATE_PLUGIN_SCHEMA_MODEL as model } from '@platejs/core';",
  ]) {
    assert.deepEqual(audit(source), [
      'dist/index.d.ts: public declaration exposes private Plate brand PLATE_PLUGIN_SCHEMA_MODEL',
    ]);
  }
});

test('allows ordinary public Plate constants', () => {
  assert.deepEqual(
    audit(
      [
        "import { PLATE_SCOPE } from '@platejs/core';",
        "declare const PLATE_SCOPE = 'plate';",
        'declare const PLATE_DEFAULT_PRIORITY = 100;',
        'export { PLATE_DEFAULT_PRIORITY, PLATE_SCOPE };',
      ].join('\n')
    ),
    []
  );
});
