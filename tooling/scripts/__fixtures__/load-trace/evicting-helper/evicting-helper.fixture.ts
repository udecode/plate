import { expect, test } from 'bun:test';
import path from 'node:path';

test('a helper that evicts itself still leaves its loader in the trace', () => {
  const helper = require(
    path.join(import.meta.dir, ['evicting-', 'helper.cjs'].join(''))
  );

  expect(helper.value()).toBe(1);
});
