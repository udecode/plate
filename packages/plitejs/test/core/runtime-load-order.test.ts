// The www app's bundler loads core/view-carets first, and when a module of the
// editor runtime cycle threw on that order, every page failed to render.
describe('a module of the editor runtime cycle loaded first', () => {
  test.each(['view-carets', 'plugin-dispatch'])(
    'core/%s.ts loads cleanly',
    async (name) => {
      const url = new URL(`../../src/core/${name}.ts`, import.meta.url).href;
      const child = Bun.spawn({
        cmd: [
          process.execPath,
          '--eval',
          `await import(${JSON.stringify(url)})`,
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
    }
  );
});
