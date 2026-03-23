import { setMediaNode } from './setMediaNode';

describe('setMediaNode', () => {
  it('delegates to editor.tf.setNodes', () => {
    const setNodes = mock();
    const editor = {
      tf: { setNodes },
    } as any;

    setMediaNode(
      editor,
      {
        type: 'img',
        url: 'https://platejs.org/image.png',
        width: 320,
      },
      { at: [0] }
    );

    expect(setNodes).toHaveBeenCalledWith(
      {
        type: 'img',
        url: 'https://platejs.org/image.png',
        width: 320,
      },
      { at: [0] }
    );
  });
});
