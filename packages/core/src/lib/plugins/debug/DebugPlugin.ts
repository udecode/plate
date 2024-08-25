import type { DebugConfig } from '../getCorePlugins';

import { createTSlatePlugin } from '../../plugin';

export type DebugErrorType =
  | 'DEFAULT'
  | 'OPTION_UNDEFINED'
  | 'OVERRIDE_MISSING'
  | 'PLUGIN_DEPENDENCY_MISSING'
  | 'PLUGIN_MISSING'
  | 'USE_CREATE_PLUGIN'
  | 'USE_ELEMENT_CONTEXT'
  | ({} & string);

export class PlateError extends Error {
  constructor(
    message: string,
    public type: DebugErrorType = 'DEFAULT'
  ) {
    super(`[${type}] ${message}`);
    this.name = 'PlateError';
  }
}

export type LogLevel = 'error' | 'info' | 'log' | 'warn';

export const DebugPlugin = createTSlatePlugin<DebugConfig>({
  key: 'debug',
  options: {
    isProduction: process.env.NODE_ENV === 'production',
    logLevel:
      process.env.NODE_ENV === 'production' ? 'error' : ('log' as LogLevel),
    logger: {
      error: (message, type, details) =>
        console.error(`${type ? `[${type}] ` : ''}${message}`, details),
      info: (message, type, details) =>
        console.info(`${type ? `[${type}] ` : ''}${message}`, details),
      log: (message, type, details) =>
        console.log(`${type ? `[${type}] ` : ''}${message}`, details),
      warn: (message, type, details) =>
        console.warn(`${type ? `[${type}] ` : ''}${message}`, details),
    },
    throwErrors: true,
  },
}).extendEditorApi<DebugConfig['api']>(({ getOptions }) => {
  const logLevels: LogLevel[] = ['error', 'warn', 'info', 'log'];

  const log = (
    level: LogLevel,
    message: any,
    type?: DebugErrorType,
    details?: any
  ) => {
    const options = getOptions();

    if (options.isProduction && level === 'log') return;
    if (logLevels.indexOf(level) <= logLevels.indexOf(options.logLevel!)) {
      if (level === 'error' && options.throwErrors) {
        const error =
          message instanceof Error ? message : new PlateError(message, type);

        throw error;
      } else {
        options.logger[level]?.(message, type, details);
      }
    }
  };

  return {
    debug: {
      error: (message, type, details) => log('error', message, type, details),
      info: (message, type, details) => log('info', message, type, details),
      log: (message, type, details) => log('log', message, type, details),
      warn: (message, type, details) => log('warn', message, type, details),
    },
  };
});
