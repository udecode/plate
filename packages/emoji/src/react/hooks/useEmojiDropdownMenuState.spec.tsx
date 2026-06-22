import { renderHook } from '@testing-library/react';
import * as actualPlatejsReact from 'platejs/react';

import { EmojiSettings } from '../../lib/constants';
import { EmojiFloatingIndexSearch } from '../../lib/utils/IndexSearch/EmojiFloatingIndexSearch';

const usePluginOptionMock = mock();
const useEmojiPickerMock = mock();
const getFloatingLibraryInstanceMock = mock();
const FrequentEmojiStorageMock = mock(function (this: any, options: any) {
  this.options = options;
});

mock.module('platejs/react', () => ({
  ...actualPlatejsReact,
  usePluginOption: usePluginOptionMock,
}));

mock.module('../EmojiPlugin', () => ({
  EmojiPlugin: { key: 'emoji' },
}));

mock.module('../storage', () => ({
  FrequentEmojiStorage: FrequentEmojiStorageMock,
}));

mock.module('../utils/EmojiLibrary/EmojiFloatingLibrary', () => ({
  EmojiFloatingLibrary: {
    getInstance: getFloatingLibraryInstanceMock,
  },
}));

mock.module('./useEmojiPicker', () => ({
  useEmojiPicker: useEmojiPickerMock,
}));

describe('useEmojiDropdownMenuState', () => {
  beforeEach(() => {
    usePluginOptionMock.mockReset();
    useEmojiPickerMock.mockReset();
    getFloatingLibraryInstanceMock.mockReset();
    FrequentEmojiStorageMock.mockClear();
    resetFloatingIndexSearch();
  });

  afterEach(() => {
    resetFloatingIndexSearch();
  });

  afterAll(() => {
    mock.restore();
  });

  const resetFloatingIndexSearch = () => {
    (
      EmojiFloatingIndexSearch as unknown as {
        instance?: EmojiFloatingIndexSearch;
      }
    ).instance = undefined;
  };

  it('creates storage + library singletons and returns picker state with open controls', async () => {
    const { useEmojiDropdownMenuState } = await import(
      `./useEmojiDropdownMenuState?test=${Math.random().toString(36).slice(2)}`
    );

    usePluginOptionMock.mockReturnValue({ categories: [], emojis: [] });
    getFloatingLibraryInstanceMock.mockReturnValue({ id: 'library' });
    useEmojiPickerMock.mockReturnValue({
      emoji: undefined,
      isOpen: true,
      setIsOpen: mock(),
    });

    const { result } = renderHook(() => useEmojiDropdownMenuState());

    expect(FrequentEmojiStorageMock).toHaveBeenCalledWith({
      limit: EmojiSettings.showFrequent.limit,
    });
    expect(getFloatingLibraryInstanceMock).toHaveBeenCalled();
    expect(useEmojiPickerMock.mock.calls[0]?.[0].indexSearch).toBeInstanceOf(
      EmojiFloatingIndexSearch
    );
    expect(result.current.isOpen).toBe(true);
    expect(result.current.emojiPickerState.emoji).toBeUndefined();
  });
});
