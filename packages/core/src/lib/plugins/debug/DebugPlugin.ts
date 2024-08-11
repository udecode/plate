import { createPlugin } from '../../plugin';

export interface DebugMessage {
  message: string;
  type: string;
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
})
  .extendApi(({ plugin: { options } }) => ({
    debug: {
      log: (message: DebugMessage) => {
        options.logger({ ...message, level: 'log' });
      },
    },
  }))
  .extendApi(({ plugin: { api } }) => ({
    debug: {
      error: (message: DebugMessage) => {
        api.debug.log({ ...message, level: 'error' });
      },
      info: (message: DebugMessage) => {
        api.debug.log({ ...message, level: 'info' });
      },
      warn: (message: DebugMessage) => {
        api.debug.log({ ...message, level: 'warn' });
      },
    },
  }));
