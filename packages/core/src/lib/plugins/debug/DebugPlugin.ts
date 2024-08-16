import { createPlugin } from '../../plugin';

export type DebugErrorType =
  | 'DEFAULT'
  | 'OVERRIDE_MISSING'
  | 'PLUGIN_DEPENDENCY_MISSING'
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

type LogLevel = 'error' | 'info' | 'log' | 'warn';

type LogFunction = (
  message: string,
  type?: DebugErrorType,
  details?: any
) => void;

export const DebugPlugin = createPlugin({
  key: 'debug',
  options: {
    isProduction: process.env.NODE_ENV === 'production',
    logLevel:
      process.env.NODE_ENV === 'production' ? 'error' : ('log' as LogLevel),
    logger: {
      error: (message: any, type, details) =>
        console.error(`${type ? `[${type}] ` : ''}${message}`, details),
      info: (message, type, details) =>
        console.info(`${type ? `[${type}] ` : ''}${message}`, details),
      log: (message, type, details) =>
        console.log(`${type ? `[${type}] ` : ''}${message}`, details),
      warn: (message, type, details) =>
        console.warn(`${type ? `[${type}] ` : ''}${message}`, details),
    } as Partial<Record<LogLevel, LogFunction>>,
    throwErrors: true,
  },
}).extendApi(({ options }) => {
  const logLevels: LogLevel[] = ['error', 'warn', 'info', 'log'];

  const log = (
    level: LogLevel,
    message: any,
    type?: DebugErrorType,
    details?: any
  ) => {
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
      error: (
        message: string | unknown,
        type?: DebugErrorType,
        details?: any
      ) => log('error', message, type, details),
      info: (message: string, type?: DebugErrorType, details?: any) =>
        log('info', message, type, details),
      log: (message: string, type?: DebugErrorType, details?: any) =>
        log('log', message, type, details),
      warn: (message: string, type?: DebugErrorType, details?: any) =>
        log('warn', message, type, details),
    },
  };
});
