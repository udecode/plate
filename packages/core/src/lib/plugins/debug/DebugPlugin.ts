import { createPlugin } from '../../plugin';

export interface DebugMessage {
  message: string;
  type:
    | 'OVERRIDE_ERROR'
    | 'PLUGIN_DEPENDENCY_MISSING'
    | 'USE_ELEMENT_CONTEXT'
    | ({} & string);
  details?: any;
  level?: 'error' | 'info' | 'log' | 'warn';
}

export const DebugPlugin = createPlugin({
  key: 'debug',
  options: {
    logger: (message: DebugMessage) => {
      (console as any)[message.level ?? 'log'](
        `[${message.type}] ${message.message}`,
        ...(message.details ? [message.details] : [])
      );
    },
  },
}).extendApi(({ plugin: { options } }) => ({
  debug: {
    error: (message: DebugMessage) => {
      options.logger({ ...message, level: 'error' });
    },
    info: (message: DebugMessage) => {
      options.logger({ ...message, level: 'info' });
    },
    log: (message: DebugMessage) => {
      options.logger({ ...message, level: 'log' });
    },
    warn: (message: DebugMessage) => {
      options.logger({ ...message, level: 'warn' });
    },
  },
}));
