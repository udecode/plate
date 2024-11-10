import type { initOptionsSchema } from '@/src/commands/init';
import type { z } from 'zod';

import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

import { getPackageManager } from '@/src/utils/get-package-manager';
import { highlighter } from '@/src/utils/highlighter';
import { logger } from '@/src/utils/logger';
import { spinner } from '@/src/utils/spinner';

export async function createProject(
  options: Pick<
    z.infer<typeof initOptionsSchema>,
    'cwd' | 'force' | 'pm' | 'srcDir'
  >
) {
  options = {
    srcDir: false,
    ...options,
  };

  if (!options.force) {
    const { proceed } = await prompts({
      initial: true,
      message: `The path ${highlighter.info(
        options.cwd
      )} does not contain a package.json file. Would you like to start a new ${highlighter.info(
        'Next.js'
      )} project?`,
      name: 'proceed',
      type: 'confirm',
    });

    if (!proceed) {
      return {
        projectName: null,
        projectPath: null,
      };
    }
  }

  const packageManager =
    options.pm ||
    (await getPackageManager(options.cwd, {
      withFallback: true,
    }));

  const { name } = await prompts({
    format: (value: string) => value.trim(),
    initial: 'my-app',
    message: `What is your project named?`,
    name: 'name',
    type: 'text',
    validate: (value: string) =>
      value.length > 128 ? `Name should be less than 128 characters.` : true,
  });

  const projectPath = `${options.cwd}/${name}`;

  // Check if path is writable.
  try {
    await fs.access(options.cwd, fs.constants.W_OK);
  } catch (error) {
    logger.break();
    logger.error(`The path ${highlighter.info(options.cwd)} is not writable.`);
    logger.error(
      `It is likely you do not have write permissions for this folder or the path ${highlighter.info(
        options.cwd
      )} does not exist.`
    );
    logger.break();
    process.exit(1);
  }

  if (fs.existsSync(path.resolve(options.cwd, name, 'package.json'))) {
    logger.break();
    logger.error(
      `A project with the name ${highlighter.info(name)} already exists.`
    );
    logger.error(`Please choose a different name and try again.`);
    logger.break();
    process.exit(1);
  }

  const createSpinner = spinner(
    `Creating a new Next.js project. This may take a few minutes.`
  ).start();

  // Note: pnpm fails here. Fallback to npx with --use-PACKAGE-MANAGER.
  const args = [
    '--tailwind',
    '--eslint',
    '--typescript',
    '--app',
    options.srcDir ? '--src-dir' : '--no-src-dir',
    '--no-import-alias',
    `--use-${packageManager}`,
  ];

  try {
    await execa(
      'npx',
      ['create-next-app@14.2.16', projectPath, '--silent', ...args],
      {
        cwd: options.cwd,
      }
    );
  } catch (error) {
    logger.break();
    logger.error(
      `Something went wrong creating a new Next.js project. Please try again.`,
      error
    );
    process.exit(1);
  }

  createSpinner?.succeed('Creating a new Next.js project.');

  return {
    projectName: name,
    projectPath,
  };
}
