import { expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';

for (const dynamic of [false, true]) {
  test(`docs generation and imports agree in ${dynamic ? 'dynamic' : 'static'} mode`, () => {
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        `import configure from './next.config';
        const config = configure('phase-development-server');
        console.log(JSON.stringify(config.turbopack));`,
      ],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
        env: {
          ...process.env,
          // Inspect loader configuration without starting a second watcher.
          _FUMADOCS_MDX: '1',
          PLATE_WWW_DYNAMIC_DOCS: dynamic ? '1' : '0',
        },
      }
    );

    expect(result.status).toBe(0);
    const { resolveAlias, rules } = JSON.parse(result.stdout) as {
      resolveAlias: Record<string, string>;
      rules: Record<
        string,
        { loaders: Array<{ options: { outDir: string } }> }
      >;
    };
    const directories = new Set(
      Object.values(rules).flatMap((rule) =>
        rule.loaders.map((loader) => loader.options.outDir)
      )
    );
    expect([...directories]).toEqual([dynamic ? '.source-dev' : '.source']);
    if (dynamic) {
      expect(resolveAlias['collections/server']).toBe(
        './.source-dev/dynamic.ts'
      );
    } else {
      expect(resolveAlias['collections/server']).toBeUndefined();
    }
  });
}
