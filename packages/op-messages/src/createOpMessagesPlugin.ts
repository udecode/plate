import { createPluginFactory } from '@udecode/plate-common';

import { OpMessagesPlugin } from './types';
import { withOpMessages } from './withOpMessages';

export const KEY_OP_MESSAGES = 'opMessages';

export const createOpMessagesPlugin = createPluginFactory<OpMessagesPlugin>({
  key: KEY_OP_MESSAGES,
  withOverrides: withOpMessages,
  options: {
    operationPath: [],
    catchErrors: true,
    onMessage: () => {},
  },
});
