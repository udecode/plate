import type { InferConfig } from '../../plugin/BasePlugin';

import { createBasePlugin } from '../../plugin/createBasePlugin';

export type DebugErrorType =
  | (string & {})
  | 'DEFAULT'
  | 'OVERRIDE_MISSING'
  | 'PLUGIN_DEPENDENCY_MISSING'
  | 'PLUGIN_MISSING'
  | 'USE_CREATE_PLUGIN'
  | 'USE_ELEMENT_CONTEXT';

export type LogLevel = 'error' | 'info' | 'log' | 'warn';

type LogFunction = (
  message: string,
  type?: DebugErrorType,
  details?: unknown
) => void;

export type DebugPluginState = {
  isProduction: boolean;
  logger: Partial<Record<LogLevel, LogFunction>>;
  logLevel: LogLevel;
  throwErrors: boolean;
};

const initialState: DebugPluginState = {
  isProduction: process.env.NODE_ENV === 'production',
  logger: {
    error: (message, type, details) =>
      console.error(`${type ? `[${type}] ` : ''}${message}`, details),
    info: (message, type, details) =>
      console.info(`${type ? `[${type}] ` : ''}${message}`, details),
    log: (message, type, details) =>
      // biome-ignore lint/suspicious/noConsole: lib
      console.log(`${type ? `[${type}] ` : ''}${message}`, details),
    warn: (message, type, details) =>
      console.warn(`${type ? `[${type}] ` : ''}${message}`, details),
  },
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'log',
  throwErrors: true,
};

export class PlateError extends Error {
  type: DebugErrorType;

  constructor(message: string, type: DebugErrorType = 'DEFAULT') {
    super(`[${type}] ${message}`);
    this.name = 'PlateError';
    this.type = type;
  }
}

export const DebugPlugin = createBasePlugin({
  api: ({ store }) => {
    const logLevels: LogLevel[] = ['error', 'warn', 'info', 'log'];

    const log = (
      level: LogLevel,
      message: string,
      type?: DebugErrorType,
      details?: unknown
    ) => {
      if (process.env.NODE_ENV === 'production') return;

      const state = store.get();

      if (state.isProduction && level === 'log') return;
      if (logLevels.indexOf(level) <= logLevels.indexOf(state.logLevel!)) {
        if (level === 'error' && state.throwErrors) {
          throw new PlateError(message, type);
        }
        state.logger[level]?.(message, type, details);
      }
    };

    return {
      error: (message: unknown, type?: DebugErrorType, details?: unknown) =>
        log('error', String(message), type, details),
      info: (message: string, type?: DebugErrorType, details?: unknown) =>
        log('info', message, type, details),
      log: (message: string, type?: DebugErrorType, details?: unknown) =>
        log('log', message, type, details),
      warn: (message: string, type?: DebugErrorType, details?: unknown) =>
        log('warn', message, type, details),
    };
  },
  key: 'debug',
  initialState,
});

export type DebugConfig = InferConfig<typeof DebugPlugin>;
