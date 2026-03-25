import { createSlateEditor } from 'platejs';

import { BaseEmojiPlugin } from '../BaseEmojiPlugin';
import { insertEmoji } from './insertEmoji';

describe('insertEmoji', () => {
  it('inserts the first native skin text by default', () => {
    const editor = createSlateEditor({
      plugins: [BaseEmojiPlugin],
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'hi ' }],
          type: 'p',
        },
      ],
    });

    insertEmoji(editor, {
      skins: [{ native: '🔥' }],
    } as any);

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'hi 🔥' }],
        type: 'p',
      },
    ]);
  });

  it('uses the configured createEmojiNode override', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseEmojiPlugin.configure({
          options: {
            createEmojiNode: (emoji: any) => ({
              children: [{ text: emoji.id }],
              type: 'emoji-chip',
            }),
          },
        }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'x' }],
          type: 'p',
        },
      ],
    });

    insertEmoji(editor, {
      id: 'fire',
      skins: [{ native: '🔥' }],
    } as any);

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'x' }],
        type: 'p',
      },
      {
        children: [{ text: 'fire' }],
        type: 'emoji-chip',
      },
    ]);
  });
});
