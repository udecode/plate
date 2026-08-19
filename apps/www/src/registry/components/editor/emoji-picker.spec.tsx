import type { Emoji, EmojiMartData } from '@emoji-mart/data';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import React from 'react';

import type { EmojiSettingsType } from './emoji-picker';

const insert = mock();
const useEditorMock = mock(() => ({
  plugin: () => ({ update: { insert } }),
}));
const coreReact = await import('platejs/react');
const OriginalIntersectionObserver = globalThis.IntersectionObserver;

class IntersectionObserverMock {
  disconnect = mock();
  observe = mock();
}

const wave: Emoji = {
  id: 'wave',
  keywords: ['hello'],
  name: 'Waving Hand',
  skins: [{ native: '👋', unified: '1f44b' }],
  version: 1,
};

const pizza: Emoji = {
  id: 'pizza',
  keywords: ['food'],
  name: 'Pizza',
  skins: [{ native: '🍕', unified: '1f355' }],
  version: 1,
};

const data = {
  aliases: {},
  categories: [
    { emojis: ['wave'], id: 'people' },
    { emojis: ['pizza'], id: 'foods' },
  ],
  emojis: { pizza, wave },
  sheet: { cols: 1, rows: 1 },
} satisfies EmojiMartData;

const settings = {
  buttonSize: { value: 36 },
  categories: { value: ['people', 'foods'] },
  perLine: { value: 8 },
  showFrequent: { value: false },
} satisfies EmojiSettingsType;

mock.module('platejs/react', () => ({
  ...coreReact,
  useEditor: useEditorMock,
  usePluginStore: () => data,
}));

const { EmojiPicker, EmojiPickerTrigger } = await import('./emoji-picker');

describe('EmojiPicker', () => {
  beforeEach(() => {
    insert.mockReset();
    window.localStorage.clear();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock,
    });
  });

  afterAll(() => {
    mock.restore();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: OriginalIntersectionObserver,
    });
  });

  it('owns open, search, selection, insertion, and close state', async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const view = render(
      <EmojiPicker data={data} settings={settings}>
        <EmojiPickerTrigger>
          <button>Open</button>
        </EmojiPickerTrigger>
      </EmojiPicker>
    );

    fireEvent.click(view.getByRole('button', { name: 'Open' }));
    await user.type(view.getByRole('textbox', { name: 'Search' }), 'wave');
    await user.click(view.getByRole('button', { name: '👋' }));

    expect(insert).toHaveBeenCalledWith(wave);
    expect(view.queryByRole('textbox', { name: 'Search' })).toBeNull();
  });

  it('delegates selection without exposing controller props', async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onSelectEmoji = mock();

    const view = render(
      <EmojiPicker
        data={data}
        onSelectEmoji={onSelectEmoji}
        settings={settings}
      >
        <EmojiPickerTrigger>
          <button>Open custom</button>
        </EmojiPickerTrigger>
      </EmojiPicker>
    );

    fireEvent.click(view.getByRole('button', { name: 'Open custom' }));
    await user.type(view.getByRole('textbox', { name: 'Search' }), 'pizza');
    await user.click(view.getByRole('button', { name: '🍕' }));

    expect(onSelectEmoji).toHaveBeenCalledWith(pizza);
    expect(insert).not.toHaveBeenCalled();
  });
});
