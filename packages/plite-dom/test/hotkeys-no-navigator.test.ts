test('imports hotkeys without navigator', async () => {
  const hotkeysUrl = new URL('../src/utils/hotkeys.ts', import.meta.url).href;
  const child = Bun.spawn({
    cmd: [
      process.execPath,
      '--eval',
      `delete globalThis.navigator; await import(${JSON.stringify(hotkeysUrl)})`,
    ],
    stderr: 'pipe',
    stdout: 'pipe',
  });

  const [exitCode, stderr] = await Promise.all([
    child.exited,
    child.stderr.text(),
  ]);

  expect(stderr).toBe('');
  expect(exitCode).toBe(0);
});
