import type { addOptionsSchema } from '@/src/commands/add';
import type { z } from 'zod';

import fs from 'fs-extra';
import path from 'path';

import * as ERRORS from '@/src/utils/errors';
import { getConfig } from '@/src/utils/get-config';
import { highlighter } from '@/src/utils/highlighter';
import { logger } from '@/src/utils/logger';

export async function preFlightAdd(options: z.infer<typeof addOptionsSchema>) {
  const errors: Record<string, boolean> = {};

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, 'package.json'))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true;

    return {
      config: null,
      errors,
    };
  }
  // Check for existing components.json file.
  if (!fs.existsSync(path.resolve(options.cwd, 'components.json'))) {
    errors[ERRORS.MISSING_CONFIG] = true;

    return {
      config: null,
      errors,
    };
  }

  try {
    const config = await getConfig(options.cwd);

    return {
      config: config!,
      errors,
    };
  } catch (error) {
    logger.break();
    logger.error(
      `An invalid ${highlighter.info(
        'components.json'
      )} file was found at ${highlighter.info(
        options.cwd
      )}.\nBefore you can add components, you must create a valid ${highlighter.info(
        'components.json'
      )} file by running the ${highlighter.info('init')} command.`
    );
    logger.error(
      `Learn more at ${highlighter.info(
        'https://ui.shadcn.com/docs/components-json'
      )}.`
    );
    logger.break();
    process.exit(1);
  }
}
