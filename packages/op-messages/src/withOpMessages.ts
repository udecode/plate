import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-common';
import { Path } from 'slate';

import { handleOpMessage } from './handleOpMessage';
import { OpMessage, OpMessagesPlugin } from './types';

export const withOpMessages = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options: { operationPath } }: WithPlatePlugin<OpMessagesPlugin, V, E>
) => {
  const { apply } = editor;

  editor.apply = (op) => {
    if (op.type === 'set_node' && Path.equals(op.path, operationPath!)) {
      handleOpMessage<V, E>(editor, op.newProperties as OpMessage);

      /**
       * We need to allow the history editor to save the operation, while
       * ignoring any errors caused by attempting to apply set_node to an
       * invalid path.
       */
      try {
        apply(op);
      } catch (error) {}

      return;
    }

    apply(op);
  };

  return editor;
};
