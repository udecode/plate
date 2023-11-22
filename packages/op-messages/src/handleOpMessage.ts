import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import { KEY_OP_MESSAGES } from './createOpMessagesPlugin';
import { OpMessage, OpMessagesPlugin } from './types';

export const handleOpMessage = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  message: OpMessage
) => {
  const { onMessage, catchErrors } = getPluginOptions<OpMessagesPlugin, V, E>(
    editor,
    KEY_OP_MESSAGES
  );

  if (catchErrors) {
    try {
      onMessage(message);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'An error occurred while handling an operation message:',
        error
      );
      // eslint-disable-next-line no-console
      console.debug('Operation message:', message);
    }
  } else {
    onMessage(message);
  }
};
