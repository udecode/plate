import { KEYS } from 'platejs';

import { insertMediaEmbed } from './insertMediaEmbed';

describe('insertMediaEmbed', () => {
  it('does nothing without a selection', () => {
    const insertNodes = mock();
    const editor = {
      api: { parent: mock() },
      getType: (key: string) => key,
      selection: null,
      tf: { insertNodes },
    } as any;

    insertMediaEmbed(editor, { url: 'https://platejs.org/embed' });

    expect(insertNodes).not.toHaveBeenCalled();
  });

  it('does nothing when the selection parent cannot be resolved', () => {
    const insertNodes = mock();
    const parent = mock(() => {});
    const editor = {
      api: { parent },
      getType: (key: string) => key,
      selection: { anchor: { offset: 0, path: [0, 0] } },
      tf: { insertNodes },
    } as any;

    insertMediaEmbed(editor, { url: 'https://platejs.org/embed' });

    expect(insertNodes).not.toHaveBeenCalled();
  });

  it('inserts an embed node at the parent path', () => {
    const insertNodes = mock();
    const parent = mock(() => [{}, [1]]);
    const editor = {
      api: { parent },
      getType: (key: string) => key,
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      tf: { insertNodes },
    } as any;

    insertMediaEmbed(editor, { url: 'https://platejs.org/embed' }, { at: [9] });

    expect(insertNodes).toHaveBeenCalledWith(
      {
        children: [{ text: '' }],
        type: KEYS.mediaEmbed,
        url: 'https://platejs.org/embed',
      },
      {
        at: [9],
        nextBlock: true,
      }
    );
  });
});
