import type { Config } from '@/src/utils/get-config';
import type { RegistryItem } from '@/src/utils/registry/schema';

import { existsSync, promises as fs } from 'fs';
import path, { basename } from 'path';
import prompts from 'prompts';

import { getProjectInfo } from '@/src/utils/get-project-info';
import { highlighter } from '@/src/utils/highlighter';
import { logger } from '@/src/utils/logger';
import {
  getRegistryBaseColor,
  getRegistryItemFileTargetPath,
} from '@/src/utils/registry';
import { spinner } from '@/src/utils/spinner';
import { transform } from '@/src/utils/transformers';
import { transformCssVars } from '@/src/utils/transformers/transform-css-vars';
import { transformIcons } from '@/src/utils/transformers/transform-icons';
import { transformImport } from '@/src/utils/transformers/transform-import';
import { transformRsc } from '@/src/utils/transformers/transform-rsc';
import { transformTwPrefixes } from '@/src/utils/transformers/transform-tw-prefix';

export function resolveTargetDir(
  projectInfo: Awaited<ReturnType<typeof getProjectInfo>>,
  config: Config,
  target: string
) {
  if (target.startsWith('~/')) {
    return path.join(config.resolvedPaths.cwd, target.replace('~/', ''));
  }

  return projectInfo?.isSrcDir
    ? path.join(config.resolvedPaths.cwd, 'src', target)
    : path.join(config.resolvedPaths.cwd, target);
}

export async function updateFiles(
  files: RegistryItem['files'],
  config: Config,
  options: {
    force?: boolean;
    overwrite?: boolean;
    silent?: boolean;
  }
) {
  if (!files?.length) {
    return;
  }

  options = {
    force: false,
    overwrite: false,
    silent: false,
    ...options,
  };
  const filesCreatedSpinner = spinner(`Updating files.`, {
    silent: options.silent,
  })?.start();

  const [projectInfo, baseColor] = await Promise.all([
    getProjectInfo(config.resolvedPaths.cwd),
    getRegistryBaseColor(config.tailwind.baseColor),
  ]);

  const filesCreated = [];
  const filesUpdated = [];
  const filesSkipped = [];

  for (const file of files) {
    if (!file.content) {
      continue;
    }

    let targetDir = getRegistryItemFileTargetPath(file, config);
    const fileName = basename(file.path);
    let filePath = path.join(targetDir, fileName);

    if (file.target) {
      filePath = resolveTargetDir(projectInfo, config, file.target);
      targetDir = path.dirname(filePath);
    }
    if (!config.tsx) {
      filePath = filePath.replace(/\.tsx?$/, (match) =>
        match === '.tsx' ? '.jsx' : '.js'
      );
    }

    const existingFile = existsSync(filePath);

    if (existingFile && !options.overwrite) {
      filesCreatedSpinner.stop();
      const { overwrite } = await prompts({
        initial: false,
        message: `The file ${highlighter.info(
          fileName
        )} already exists. Would you like to overwrite?`,
        name: 'overwrite',
        type: 'confirm',
      });

      if (!overwrite) {
        filesSkipped.push(path.relative(config.resolvedPaths.cwd, filePath));

        continue;
      }

      filesCreatedSpinner?.start();
    }
    // Create the target directory if it doesn't exist.
    if (!existsSync(targetDir)) {
      await fs.mkdir(targetDir, { recursive: true });
    }

    // Run our transformers.
    const content = await transform(
      {
        baseColor,
        config,
        filename: file.path,
        raw: file.content,
        transformJsx: !config.tsx,
      },
      [
        transformImport,
        transformRsc,
        transformCssVars,
        transformTwPrefixes,
        transformIcons,
      ]
    );

    await fs.writeFile(filePath, content, 'utf-8');
    existingFile
      ? filesUpdated.push(path.relative(config.resolvedPaths.cwd, filePath))
      : filesCreated.push(path.relative(config.resolvedPaths.cwd, filePath));
  }

  const hasUpdatedFiles = filesCreated.length || filesUpdated.length;

  if (!hasUpdatedFiles && filesSkipped.length === 0) {
    filesCreatedSpinner?.info('No files updated.');
  }
  if (filesCreated.length > 0) {
    filesCreatedSpinner?.succeed(
      `Created ${filesCreated.length} ${
        filesCreated.length === 1 ? 'file' : 'files'
      }:`
    );

    if (!options.silent) {
      for (const file of filesCreated) {
        logger.log(`  - ${file}`);
      }
    }
  } else {
    filesCreatedSpinner?.stop();
  }
  if (filesUpdated.length > 0) {
    spinner(
      `Updated ${filesUpdated.length} ${
        filesUpdated.length === 1 ? 'file' : 'files'
      }:`,
      {
        silent: options.silent,
      }
    )?.info();

    if (!options.silent) {
      for (const file of filesUpdated) {
        logger.log(`  - ${file}`);
      }
    }
  }
  if (filesSkipped.length > 0) {
    spinner(
      `Skipped ${filesSkipped.length} ${
        filesUpdated.length === 1 ? 'file' : 'files'
      }:`,
      {
        silent: options.silent,
      }
    )?.info();

    if (!options.silent) {
      for (const file of filesSkipped) {
        logger.log(`  - ${file}`);
      }
    }
  }
  if (!options.silent) {
    logger.break();
  }
}
