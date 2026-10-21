import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cutTests } from './cut-tests.mjs';

test('cuts the named cases and table rows, then the helpers only they used', () => {
  const source = `import assert from 'node:assert/strict';
import { gone, keep } from './helpers';

const shared = () => keep();
const deep = () => gone();
const helper = () => deep();
export const exported = () => 3;

describe('menu', () => {
  it('keeps', () => {
    assert.equal(shared(), 1);
  });

  // Goes with its case.
  it('cuts', () => {
    assert.equal(helper() + exported(), 2);
  });
});

const rows = [
  { name: 'first row', value: 1 },
  { name: 'second row', value: 2 },
];

for (const row of rows) {
  it(row.name, () => {
    assert.equal(row.value > 0, true);
  });
}
`;

  assert.deepEqual(
    cutTests('a.test.ts', source, ['menu > cuts', 'first row']),
    {
      helpers: ['helper', 'deep', 'gone'],
      text: `import assert from 'node:assert/strict';
import { keep } from './helpers';

const shared = () => keep();
export const exported = () => 3;

describe('menu', () => {
  it('keeps', () => {
    assert.equal(shared(), 1);
  });
});

const rows = [
  { name: 'second row', value: 2 },
];

for (const row of rows) {
  it(row.name, () => {
    assert.equal(row.value > 0, true);
  });
}
`,
    }
  );
});

test('refuses a name that matches no case or several', () => {
  const source = `it('same', () => {});
describe('group', () => {
  it('same', () => {});
});
it('same', () => {});
`;

  assert.throws(() => cutTests('a.test.ts', source, ['same']));
  assert.throws(() => cutTests('a.test.ts', source, ['group > missing']));
  assert.doesNotThrow(() => cutTests('a.test.ts', source, ['group > same']));
});
