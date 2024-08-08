import { createPlugin } from '../utils/index';

type DebugLevel = 'debug' | 'error' | 'info' | 'warn';

type DebugKey =
  | 'EDITOR_METHOD_NOT_OVERRIDDEN'
  | 'PLUGIN_DEPENDENCY_MISSING'
  | 'PLUGIN_INITIALIZATION_FAILED';
// ... other keys as needed

interface DebugMessage {
  key: DebugKey;
  level: DebugLevel;
  message: string;
  details?: any;
}

interface DebugOptions {
  logger: (message: DebugMessage) => void;
}

interface DebugApi {
  log: (message: DebugMessage) => void;
}

export const DebugPlugin = createPlugin<'debug', DebugOptions, DebugApi>({
  key: 'debug',
  options: {
    logger: (message) => {
      (console as any)[message.level](
        `[${message.key}] ${message.message}`,
        message.details
      );
    },
  },
}).extend(({ plugin: { options } }) => ({
  api: {
    log: (message: DebugMessage) => {
      options.logger(message);
    },
  },
}));
