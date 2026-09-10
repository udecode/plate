import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { syncResources } from './sync-resources.mjs';

test('a new owned method delivers nested resources to both agents and protects installed owners', () => {
  const root = mkdtempSync(join(tmpdir(), 'plate-skill-resources-'));
  try {
    const source = join(root, '.agents/rules/custom-method');
    mkdirSync(join(source, 'references/nested'), { recursive: true });
    writeFileSync(`${source}.mdc`, '---\ndescription: Fixture method.\n---\n# Fixture\n');
    writeFileSync(join(source, 'references/nested/recipe.md'), 'A complete fixture procedure.\n');
    const vendor = join(root, '.agents/skills/vendor');
    mkdirSync(vendor, { recursive: true });
    writeFileSync(join(vendor, 'SKILL.md'), 'Installed vendor content.\n');
    writeFileSync(join(root, 'skills-lock.json'), JSON.stringify({ skills: { vendor: { source: 'fixture/vendor' } } }));

    const missing = syncResources(root, { check: true });
    assert.equal(missing.length, 2);
    assert.equal(existsSync(join(root, missing[0])), false);
    syncResources(root);
    for (const agent of ['.agents', '.claude']) {
      assert.equal(readFileSync(join(root, agent, 'skills/custom-method/references/nested/recipe.md'), 'utf8'), 'A complete fixture procedure.\n');
    }
    assert.deepEqual(syncResources(root, { check: true }), []);
    assert.equal(readFileSync(join(vendor, 'SKILL.md'), 'utf8'), 'Installed vendor content.\n');

    writeFileSync(join(root, '.agents/rules/vendor.mdc'), '---\ndescription: Shadow.\n---\n# Shadow\n');
    assert.throws(() => syncResources(root), /Protected installed skill/);
    assert.equal(readFileSync(join(vendor, 'SKILL.md'), 'utf8'), 'Installed vendor content.\n');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
