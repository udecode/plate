import { renderHook } from '@testing-library/react';

const usePluginOptionMock = mock();
const useEmojiPickerMock = mock();
const getFloatingLibraryInstanceMock = mock();
const getFloatingIndexSearchInstanceMock = mock();
const FrequentEmojiStorageMock = mock(function (this: any, options: any) {
  this.options = options;
});

mock.module('platejs/react', () => ({
  usePluginOption: usePluginOptionMock,
}));

mock.module('../../lib', () => ({
  EmojiFloatingIndexSearch: {
    getInstance: getFloatingIndexSearchInstanceMock,
  },
  EmojiSettings: {
    showFrequent: { limit: 5 },
  },
}));

mock.module('../EmojiPlugin', () => ({
  EmojiPlugin: { key: 'emoji' },
}));

mock.module('../storage', () => ({
  FrequentEmojiStorage: FrequentEmojiStorageMock,
}));

mock.module('../utils', () => ({
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
    getFloatingIndexSearchInstanceMock.mockReset();
    FrequentEmojiStorageMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('creates storage + library singletons and returns picker state with open controls', async () => {
    const { useEmojiDropdownMenuState } = await import(
      `./useEmojiDropdownMenuState?test=${Math.random().toString(36).slice(2)}`
    );

    usePluginOptionMock.mockReturnValue({ categories: [], emojis: [] });
    getFloatingLibraryInstanceMock.mockReturnValue({ id: 'library' });
    getFloatingIndexSearchInstanceMock.mockReturnValue({ id: 'index' });
    useEmojiPickerMock.mockReturnValue({
      emoji: undefined,
      isOpen: true,
      setIsOpen: mock(),
    });

    const { result } = renderHook(() => useEmojiDropdownMenuState());

    expect(FrequentEmojiStorageMock).toHaveBeenCalledWith({ limit: 5 });
    expect(getFloatingLibraryInstanceMock).toHaveBeenCalled();
    expect(getFloatingIndexSearchInstanceMock).toHaveBeenCalledWith({
      id: 'library',
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.emojiPickerState.emoji).toBeUndefined();
  });
});
