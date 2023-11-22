import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import { KEY_OP_MESSAGES } from './createOpMessagesPlugin';
import { OpMessage, OpMessagesPlugin } from './types';

export const dispatchOpMessage = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  messageType: string,
  data: any
) => {
  const { operationPath } = getPluginOptions<OpMessagesPlugin, V, E>(
    editor,
    KEY_OP_MESSAGES
  );

  const message: OpMessage = {
    messageType,
    data,
    inverse: false,
  };

  editor.apply({
    type: 'set_node',
    path: operationPath!,
    newProperties: message,
    properties: {
      ...message,
      inverse: true,
    },
  });
};
