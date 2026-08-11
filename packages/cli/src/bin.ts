#!/usr/bin/env node

import { spawn } from 'node:child_process';

import { Command } from 'commander';

import { generateEditor } from './generate';
import { createEditorMigration } from './migrate';
import { watchEditor } from './watch';

const program = new Command()
  .name('plate')
  .description('Generate exact Plate editor schema contracts.');

program
  .command('generate')
  .description('Generate one or more closed editor contracts.')
  .argument('<entries...>', 'defineEditor entry files')
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
        await Promise.all(entries.map((entry) => watchEditor(entry)));
        await new Promise(() => {});

        return;
      }
      if (entries.length > 1) {
        for (const entry of entries) {
          await new Promise<void>((resolve, reject) => {
            const child = spawn(
              process.execPath,
              [
                process.argv[1]!,
                'generate',
                ...(options.check ? ['--check'] : []),
                entry,
              ],
              { stdio: 'inherit' }
            );

            child.once('error', reject);
            child.once('exit', (code, signal) => {
              if (code === 0) resolve();
              else {
                reject(
                  new Error(
                    signal
                      ? `plate generate stopped by ${signal}.`
                      : `plate generate failed for ${entry} with exit code ${code}.`
                  )
                );
              }
            });
          });
        }

        return;
      }

      for (const entry of entries) {
        const result = await generateEditor(entry, { check: options.check });

        process.stdout.write(
          `${options.check ? 'Checked' : 'Generated'} ${result.typesPath}\n`
        );
      }
    }
  );

program
  .command('migrate')
  .description('Scaffold an explicit typed editor schema migration.')
  .command('new')
  .argument('<entry>', 'defineEditor entry file')
  .argument('<name>', 'lowercase kebab-case migration name')
  .action(async (entry: string, name: string) => {
    const result = await createEditorMigration(entry, name);

    process.stdout.write(`Created ${result.migrationPath}\n`);
  });

program.parseAsync().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
