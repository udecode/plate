import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import type { Emoji, EmojiMartData } from '@emoji-mart/data';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
          <button type="button">Open</button>
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
          <button type="button">Open custom</button>
        </EmojiPickerTrigger>
      </EmojiPicker>
    );

    fireEvent.click(view.getByRole('button', { name: 'Open custom' }));
    await user.type(view.getByRole('textbox', { name: 'Search' }), 'pizza');
    await user.click(view.getByRole('button', { name: '🍕' }));

    expect(onSelectEmoji).toHaveBeenCalledWith(pizza);
    expect(insert).not.toHaveBeenCalled();
  });

  it('keeps configured category order and row grouping through search navigation', async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const view = render(
      <EmojiPicker
        data={data}
        settings={{
          ...settings,
          categories: { value: ['foods', 'people'] },
          perLine: { value: 1 },
        }}
      >
        <EmojiPickerTrigger>
          <button type="button">Open categories</button>
        </EmojiPickerTrigger>
      </EmojiPicker>
    );
    fireEvent.click(view.getByRole('button', { name: 'Open categories' }));
    expect(
      Array.from(view.getByRole('navigation').querySelectorAll('button')).map(
        (button) => button.getAttribute('aria-label')
      )
    ).toEqual(['Food & Drink', 'Smileys & People']);
    await user.type(
      view.getByRole('textbox', { name: 'Search' }),
      'nothing-matches'
    );
    expect(view.getByText('Oh no!')).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: 'Food & Drink' }));
    expect(
      view.getByRole('textbox', { name: 'Search' }).getAttribute('value')
    ).toBe('');
    expect(view.getByRole('button', { name: '🍕' })).toBeTruthy();
    expect(view.queryByRole('button', { name: '👋' })).toBeNull();
    fireEvent.click(view.getByRole('button', { name: 'Smileys & People' }));
    expect(view.getByRole('button', { name: '👋' })).toBeTruthy();
    expect(view.queryByRole('button', { name: '🍕' })).toBeNull();
  });

  it('ranks selected frequent emojis, persists their counts and stays open when configured', async () => {
    const user = userEvent.setup({ document: globalThis.document });
    window.localStorage.setItem(
      'picker-proof:recent',
      JSON.stringify({ pizza: 1 })
    );
    const view = render(
      <EmojiPicker
        closeOnSelect={false}
        data={data}
        settings={{
          ...settings,
          showFrequent: {
            value: true,
            prefix: 'picker-proof',
            key: 'recent',
            limit: 2,
          },
        }}
      >
        <EmojiPickerTrigger>
          <button type="button">Open frequent</button>
        </EmojiPickerTrigger>
      </EmojiPicker>
    );
    fireEvent.click(view.getByRole('button', { name: 'Open frequent' }));
    await user.type(view.getByRole('textbox', { name: 'Search' }), 'wave');
    await user.click(view.getByRole('button', { name: '👋' }));
    await user.click(view.getByRole('button', { name: '👋' }));
    expect(insert).toHaveBeenCalledTimes(2);
    expect(
      JSON.parse(window.localStorage.getItem('picker-proof:recent')!)
    ).toEqual({ pizza: 1, wave: 2 });
    fireEvent.click(view.getByRole('button', { name: 'Frequently used' }));
    const frequent = view.container.ownerDocument.querySelector(
      '[data-id="frequent"]'
    )!;
    expect(
      Array.from(frequent.querySelectorAll('button')).map((button) =>
        button.getAttribute('aria-label')
      )
    ).toEqual(['👋', '🍕']);
    expect(view.getByRole('textbox', { name: 'Search' })).toBeTruthy();
  });
});
