import { act, renderHook } from '@testing-library/react';

describe('useEmojiPickerState', () => {
  it('handles search, focus, open, and close reducer transitions', async () => {
    const { useEmojiPickerState } = await import(
      `./useEmojiPickerState?test=${Math.random().toString(36).slice(2)}`
    );

    const { result } = renderHook(() => useEmojiPickerState());

    act(() => {
      result.current[1]({ type: 'SET_OPEN' });
      result.current[1]({
        payload: {
          hasFound: true,
          searchResult: [{ id: 'wave' }] as any,
          searchValue: 'wave',
        },
        type: 'UPDATE_SEARCH_RESULT',
      });
      result.current[1]({
        payload: { focusedCategory: 'people' as any },
        type: 'SET_FOCUSED_CATEGORY',
      });
      result.current[1]({ type: 'SET_CLOSE' });
    });

    expect(result.current[0]).toMatchObject({
      focusedCategory: 'people',
      hasFound: false,
      isOpen: false,
      isSearching: false,
      searchValue: '',
    });
  });
});
