import { renderHook } from '@testing-library/react';
import type { CalloutElement } from '../lib/BaseCalloutPlugin';
import * as platejsReact from '@platejs/core/react';

import { BaseCalloutPlugin } from '../lib/BaseCalloutPlugin';
import { useCalloutEmojiPicker } from './useCalloutEmojiPicker';

const element = {
  id: 'callout-1',
  type: 'callout',
  children: [{ text: '' }],
} satisfies CalloutElement;

describe('useCalloutEmojiPicker', () => {
  let useEditorReadOnlySpy: ReturnType<typeof spyOn>;
  let useEditorSpy: ReturnType<typeof spyOn>;
  let useElementSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    localStorage.clear();

    useEditorReadOnlySpy = spyOn(
      platejsReact,
      'useEditorReadOnly'
    ).mockReturnValue(false);
    useEditorSpy = spyOn(platejsReact, 'useEditor').mockReturnValue({
      update: { nodes: { set: mock() } },
    } as unknown as ReturnType<typeof platejsReact.useEditor>);
    useElementSpy = spyOn(platejsReact, 'useElement').mockReturnValue(element);
  });

  afterEach(() => {
    useEditorReadOnlySpy?.mockRestore();
    useEditorSpy?.mockRestore();
    useElementSpy?.mockRestore();
  });

  it('updates the element icon, stores it, and closes the picker when editable', () => {
    const setIsOpenMock = mock();
    const setIsOpen = (isOpen: boolean) => {
      setIsOpenMock(isOpen);
    };
    const value: CalloutElement[] = [
      { ...element, icon: '💬' },
      {
        id: 'callout-2',
        type: 'callout',
        children: [{ text: '' }],
        icon: '✅',
      },
    ];
    const editor = platejsReact.createPlateEditor({
      plugins: [BaseCalloutPlugin],
      initialValue: value,
    });

    useEditorSpy.mockReturnValue(editor);
    const liveElement = editor.read.nodes.get([0])?.[0];

    if (!liveElement) throw new Error('Expected the first callout element.');

    useElementSpy.mockReturnValue(liveElement);

    const { result } = renderHook(() =>
      useCalloutEmojiPicker({ isOpen: true, setIsOpen })
    );

    result.current.props.onSelectEmoji({
      skins: [{ native: '🔥' }],
    });

    expect(editor.read.children()).toMatchObject([
      { id: 'callout-1', icon: '🔥' },
      { id: 'callout-2', icon: '✅' },
    ]);
    expect(localStorage.getItem('plate-storage-callout')).toBe('🔥');
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });
});
