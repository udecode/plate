#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative } from 'node:path';

import { Command } from 'commander';

import { registerDepsCommand } from './deps';
import { generateEditors } from './generate';
import { createEditorMigration } from './migrate';
import { runEditorMigrationInput, runEditorMigrations } from './run-migration';
import { watchEditors } from './watch';

const DEFAULT_ENTRY = 'src/editor.ts';
const packageJson = createRequire(import.meta.url)('../package.json') as {
  version: string;
};
const displayPath = (path: string) => relative(process.cwd(), path) || '.';

const program = new Command()
  .name('plate')
  .version(packageJson.version)
  .description('Generate exact Plate editor schema contracts.');

registerDepsCommand(program);

program
  .command('generate')
  .description('Generate one or more exact editor contracts.')
  .argument('[entries...]', 'editor module files', [DEFAULT_ENTRY])
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
        const onInterrupt = () => {
          stop(130);
        };
        const onTerminate = () => {
          stop(143);
        };
        const controller = new AbortController();

        process.on('SIGINT', onInterrupt);
        process.on('SIGTERM', onTerminate);
        void signal.then(() => {
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

const migrateCommand = program
  .command('migrate')
  .description('Create or run typed editor schema migrations.');

migrateCommand
  .command('new')
  .argument('<name>', 'lowercase kebab-case migration name')
  .option('--entry <path>', 'editor module file', DEFAULT_ENTRY)
  .action(async (name: string, options: Readonly<{ entry: string }>) => {
    const result = await createEditorMigration(options.entry, name);

    process.stdout.write(
      `Created migration ${displayPath(result.directory)}\n`
    );
    result.paths.forEach((path) => {
      process.stdout.write(`  ${displayPath(path)}\n`);
    });
  });

migrateCommand
  .command('run')
  .description(
    'Dry-run, check, or write document migrations to the current schema.'
  )
  .argument('[files...]', 'JSON document files', [])
  .option('--entry <path>', 'editor module file', DEFAULT_ENTRY)
  .option('--check', 'exit nonzero when files require migration')
  .option('--stdin', 'read one JSON document from standard input')
  .option('--write', 'atomically replace changed files')
  .action(
    async (
      files: string[],
      options: Readonly<{
        check?: boolean;
        entry: string;
        stdin?: boolean;
        write?: boolean;
      }>
    ) => {
      if (options.stdin) {
        if (files.length > 0) {
          throw new Error(
            'plate migrate run --stdin cannot include file paths.'
          );
        }
        if (options.write) {
          throw new Error('plate migrate run --stdin cannot use --write.');
        }
        const result = await runEditorMigrationInput(
          options.entry,
          readFileSync(0, 'utf-8'),
          options
        );

        if (options.check) {
          process.stderr.write(
            `${result.changed ? 'change' : 'current'} stdin${result.applied.length > 0 ? ` (${result.applied.join(' -> ')})` : ''}\n`
          );
          if (result.changed) process.exitCode = 1;
        } else {
          process.stdout.write(result.outputText);
        }

        return;
      }
      const result = await runEditorMigrations(options.entry, files, options);
      const verb = options.write
        ? 'Migrated'
        : options.check
          ? 'Checked'
          : 'Would migrate';

      process.stdout.write(
        `${verb} ${result.changed} of ${result.files.length} document${result.files.length === 1 ? '' : 's'}\n`
      );
      result.files.forEach(({ applied, changed, path }) => {
        process.stdout.write(
          `  ${changed ? 'change' : 'current'} ${displayPath(path)}${applied.length > 0 ? ` (${applied.join(' -> ')})` : ''}\n`
        );
      });
      if (options.check && result.changed > 0) process.exitCode = 1;
    }
  );

program.parseAsync().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
