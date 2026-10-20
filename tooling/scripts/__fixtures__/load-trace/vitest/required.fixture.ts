test('loads a module through the require Vitest injects', () => {
  expect(require(['./nat', 'ive.cjs'].join('')).native).toBe(true);
});
