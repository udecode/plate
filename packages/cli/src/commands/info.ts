import { Command } from 'commander';

import { getConfig } from '@/src/utils/get-config';
import { getProjectInfo } from '@/src/utils/get-project-info';
import { logger } from '@/src/utils/logger';

export const info = new Command()
  .name('info')
  .description('get information about your project')
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .action(async (opts) => {
    logger.info('> project info');
    console.info(await getProjectInfo(opts.cwd));
    logger.break();
    logger.info('> components.json');
    console.info(await getConfig(opts.cwd));
  });
