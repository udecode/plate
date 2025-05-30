import { ZodError } from 'zod';

import { highlighter, logger } from './logger';

export function handleError(error: unknown): void {
  logger.error(
    'Something went wrong. Please check the error below for more details.'
  );

  if (typeof error === 'string') {
    logger.error(error);
  } else if (error instanceof ZodError) {
    logger.error('Validation failed:');
    for (const [key, value] of Object.entries(error.flatten().fieldErrors)) {
      logger.error(
        `- ${highlighter.info(key)}: ${(value as string[]).join(', ')}`
      );
    }
  } else if (error instanceof Error) {
    logger.error(error.message);
  }

  logger.break();
  process.exit(1);
}
