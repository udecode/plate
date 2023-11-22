import { createPlateEditor } from '@udecode/plate-common';

import { createOpMessagesPlugin } from './createOpMessagesPlugin';
import { dispatchOpMessage } from './dispatchOpMessage';

describe('createOpMessagesPlugin', () => {
  it('dispatches and receives messages and inverse messages', () => {
    const onMessage = jest.fn();

    const editor = createPlateEditor({
      plugins: [
        createOpMessagesPlugin({
          options: {
            onMessage,
          },
        }) as any,
      ],
    });

    dispatchOpMessage(editor, 'create_user', { name: 'John' });

    expect(onMessage).toHaveBeenLastCalledWith({
      messageType: 'create_user',
      data: { name: 'John' },
      inverse: false,
    });

    editor.undo();

    expect(onMessage).toHaveBeenLastCalledWith({
      messageType: 'create_user',
      data: { name: 'John' },
      inverse: true,
    });

    editor.redo();

    expect(onMessage).toHaveBeenLastCalledWith({
      messageType: 'create_user',
      data: { name: 'John' },
      inverse: false,
    });
  });
});
