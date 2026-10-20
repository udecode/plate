test('loads a module through a computed specifier', async () => {
  const { computed } = await import(['./comp', 'uted.ts'].join(''));

  expect(computed).toBe(true);
});
