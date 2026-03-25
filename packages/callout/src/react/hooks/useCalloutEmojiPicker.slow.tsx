import { renderHook } from '@testing-library/react';
import * as platejsReact from 'platejs/react';

import { useCalloutEmojiPicker } from './useCalloutEmojiPicker';

describe('useCalloutEmojiPicker', () => {
  let useEditorReadOnlySpy: ReturnType<typeof spyOn>;
  let useEditorRefSpy: ReturnType<typeof spyOn>;
  let useElementSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    localStorage.clear();

    useEditorReadOnlySpy = spyOn(
      platejsReact,
      'useEditorReadOnly'
    ).mockReturnValue(false);
    useEditorRefSpy = spyOn(platejsReact, 'useEditorRef').mockReturnValue({
      tf: { setNodes: mock() },
    } as any);
    useElementSpy = spyOn(platejsReact, 'useElement').mockReturnValue({
      id: 'callout-1',
    } as any);
  });

  afterEach(() => {
    useEditorReadOnlySpy?.mockRestore();
    useEditorRefSpy?.mockRestore();
    useElementSpy?.mockRestore();
  });

  it('updates the element icon, stores it, and closes the picker when editable', () => {
    const setNodes = mock();
    const setIsOpenMock = mock();
    const setIsOpen = (isOpen: boolean) => (setIsOpenMock as any)(isOpen);

    useEditorRefSpy.mockReturnValue({
      tf: { setNodes },
    } as any);

    const { result } = renderHook(() =>
      useCalloutEmojiPicker({ isOpen: true, setIsOpen })
    );

    result.current.props.onSelectEmoji({
      skins: [{ native: '🔥' }],
    });

    expect(setNodes).toHaveBeenCalledWith(
      { icon: '🔥' },
      { at: { id: 'callout-1' } }
    );
    expect(localStorage.getItem('plate-storage-callout')).toBe('🔥');
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });
});
