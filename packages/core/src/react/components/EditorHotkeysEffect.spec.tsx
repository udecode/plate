import React, { useRef } from 'react';

import { act, render } from '@testing-library/react';
import { useHotkeys } from '@udecode/react-hotkeys';

import { createPlateEditor } from '../editor';
import { useEditorRef } from '../stores';
import { EditorHotkeysEffect } from './EditorHotkeysEffect';

// Mock the useEditorRef hook
jest.mock('../stores', () => ({
  useEditorRef: jest.fn(),
}));

// Mock the useHotkeys hook
jest.mock('@udecode/react-hotkeys', () => ({
  ...jest.requireActual('@udecode/react-hotkeys'),
  useHotkeys: jest.fn(),
}));

const SimpleComponent = ({ id }: { id?: string }) => {
  const editableRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={editableRef}>
      <EditorHotkeysEffect editableRef={editableRef} id={id} />
    </div>
  );
};

describe('EditorHotkeysEffect', () => {
  let editor: any;
  let setHotkeyRefMock: jest.Mock;
  const hotkeyCallback = jest.fn();

  beforeEach(() => {
    editor = createPlateEditor({
      shortcuts: {
        'mod+b': {
          handler: hotkeyCallback,
          keys: 'mod+b',
        },
        'mod+i': {
          handler: jest.fn(),
          keys: 'mod+i',
        },
      },
    });
    (useEditorRef as jest.Mock).mockReturnValue(editor);
    setHotkeyRefMock = jest.fn();
    (useHotkeys as jest.Mock).mockReturnValue(setHotkeyRefMock);
  });

  it('should render without crashing', () => {
    render(<SimpleComponent />);
  });

  it('should set up shortcuts for each configured hotkey', () => {
    render(<SimpleComponent />);

    expect(useHotkeys).toHaveBeenCalledWith(
      'mod+b',
      expect.any(Function),
      expect.objectContaining({ enableOnContentEditable: true }),
      []
    );
    expect(useHotkeys).toHaveBeenCalledWith(
      'mod+i',
      expect.any(Function),
      expect.objectContaining({ enableOnContentEditable: true }),
      []
    );
  });

  it('should call the hotkey callback when triggered', async () => {
    render(<SimpleComponent />);

    // Simulate setting up the hotkey
    const [, callbackPassedToUseHotkeys] = (useHotkeys as jest.Mock).mock
      .calls[0];

    // Trigger the hotkey
    await act(async () => {
      callbackPassedToUseHotkeys({} as any, {} as any);
    });

    expect(hotkeyCallback).toHaveBeenCalledTimes(1);
  });

  it('should set the hotkey ref to the editable element', () => {
    const { container } = render(<SimpleComponent />);

    const editableDiv = container.firstChild as HTMLDivElement;

    expect(setHotkeyRefMock).toHaveBeenCalledWith(editableDiv);
  });
});
