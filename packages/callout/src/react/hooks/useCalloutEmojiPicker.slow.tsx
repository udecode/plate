import { renderHook } from '@testing-library/react';
import * as platejsReact from 'platejs/react';

import { useCalloutEmojiPicker } from './useCalloutEmojiPicker';

describe('useCalloutEmojiPicker', () => {
  let useEditorReadOnlySpy: ReturnType<typeof spyOn>;
  let useEditorRefSpy: ReturnType<typeof spyOn>;
  let useElementSpy: ReturnType<typeof spyOn>;
  let useNodePathSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    localStorage.clear();

    useEditorReadOnlySpy = spyOn(
      platejsReact,
      'useEditorReadOnly'
    ).mockReturnValue(false);
    useEditorRefSpy = spyOn(platejsReact, 'useEditorRef').mockReturnValue({
      update: mock(),
    } as any);
    useElementSpy = spyOn(platejsReact, 'useElement').mockReturnValue({
      id: 'callout-1',
    } as any);
    useNodePathSpy = spyOn(platejsReact, 'useNodePath').mockReturnValue([0]);
  });

  afterEach(() => {
    useEditorReadOnlySpy?.mockRestore();
    useEditorRefSpy?.mockRestore();
    useElementSpy?.mockRestore();
    useNodePathSpy?.mockRestore();
  });

  it('updates the element icon, stores it, and closes the picker when editable', () => {
    const set = mock();
    const setIsOpenMock = mock();
    const setIsOpen = (isOpen: boolean) => (setIsOpenMock as any)(isOpen);

    useEditorRefSpy.mockReturnValue({
      update: (callback: any) => callback({ nodes: { set } }),
    } as any);

    const { result } = renderHook(() =>
      useCalloutEmojiPicker({ isOpen: true, setIsOpen })
    );

    result.current.props.onSelectEmoji({
      skins: [{ native: '🔥' }],
    });

    expect(set).toHaveBeenCalledWith({ icon: '🔥' }, { at: [0] });
    expect(localStorage.getItem('plate-storage-callout')).toBe('🔥');
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });
});
