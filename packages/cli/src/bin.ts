#!/usr/bin/env node

import { createRequire } from 'node:module';
import { relative } from 'node:path';

import { Command } from 'commander';

import { generateEditors } from './generate';
import { createEditorMigration } from './migrate';
import { watchEditors } from './watch';

const DEFAULT_ENTRY = 'src/editor/editor-definition.tsx';
const packageJson = createRequire(import.meta.url)('../package.json') as {
  version: string;
};
const displayPath = (path: string) => relative(process.cwd(), path) || '.';

const program = new Command()
  .name('plate')
  .version(packageJson.version)
  .description('Generate exact Plate editor schema contracts.');

program
  .command('generate')
  .description('Generate one or more closed editor contracts.')
  .argument('[entries...]', 'defineEditor entry files', [DEFAULT_ENTRY])
  .option('--check', 'fail when committed artifacts are stale')
  .option('--watch', 'regenerate when an entry dependency changes')
  .action(
    async (
      entries: string[],
      options: Readonly<{ check?: boolean; watch?: boolean }>
    ) => {
      if (options.check && options.watch) {
        throw new Error('plate generate cannot combine --check and --watch.');
      }
      if (options.watch) {
        let exitCode: number | undefined;
        let resolveSignal!: () => void;
        const signal = new Promise<void>((resolve) => {
          resolveSignal = resolve;
        });
        const stop = (code: number) => {
          if (exitCode !== undefined) return;
          exitCode = code;
          resolveSignal();
        };
        const onInterrupt = () => stop(130);
        const onTerminate = () => stop(143);
        const controller = new AbortController();

        process.on('SIGINT', onInterrupt);
        process.on('SIGTERM', onTerminate);
        signal.then(() => {
          controller.abort(new Error('Plate watch stopped during startup.'));
        });
        let watcher: Awaited<ReturnType<typeof watchEditors>> | undefined;

        try {
          watcher = await watchEditors(
            entries,
            process.cwd(),
            controller.signal
          );
          await signal;
        } catch (error) {
          if (!controller.signal.aborted) throw error;
        } finally {
          process.off('SIGINT', onInterrupt);
          process.off('SIGTERM', onTerminate);
          await watcher?.close();
        }
        process.exitCode = exitCode;

        return;
      }
      const startedAt = performance.now();
      const results = await generateEditors(entries, { check: options.check });
      const elapsed = ((performance.now() - startedAt) / 1000).toFixed(2);
      const generated = results.filter(
        ({ status }) => status === 'generated'
      ).length;
      const verb = options.check
        ? 'Checked'
        : generated === 0
          ? 'Up to date'
          : 'Generated';

      process.stdout.write(
        `${verb} ${results.length} editor${results.length === 1 ? '' : 's'} in ${elapsed}s\n`
      );
      results.forEach(({ schemaPath, typesPath }) => {
        process.stdout.write(
          `  ${displayPath(typesPath)}\n  ${displayPath(schemaPath)}\n`
        );
      });
    }
  );

program
  .command('migrate')
  .description('Scaffold an explicit typed editor schema migration.')
  .command('new')
  .argument('<name>', 'lowercase kebab-case migration name')
  .option('--entry <path>', 'defineEditor entry file', DEFAULT_ENTRY)
  .action(async (name: string, options: Readonly<{ entry: string }>) => {
    const result = await createEditorMigration(options.entry, name);

    process.stdout.write(
      `Created migration ${displayPath(result.directory)}\n`
    );
    result.paths.forEach((path) => {
      process.stdout.write(`  ${displayPath(path)}\n`);
    });
  });

program.parseAsync().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
