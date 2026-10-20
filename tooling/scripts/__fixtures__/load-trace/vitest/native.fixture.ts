import { createRequire } from 'node:module';

test('loads a module through createRequire', () => {
  expect(createRequire(import.meta.url)('./native.cjs').native).toBe(true);
});
