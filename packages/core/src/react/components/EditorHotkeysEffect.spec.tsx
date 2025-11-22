import React, { useRef } from 'react';

import { act, render } from '@testing-library/react';
import * as reactHotkeysModule from '@udecode/react-hotkeys';

import { createPlateEditor } from '../editor';
import * as storesModule from '../stores';
import { EditorHotkeysEffect } from './EditorHotkeysEffect';

let useEditorRefSpy: ReturnType<typeof spyOn>;
let useHotkeysSpy: ReturnType<typeof spyOn>;

const SimpleComponent = ({ id }: { id?: string }) => {
  const editableRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={editableRef}>
      <EditorHotkeysEffect id={id} editableRef={editableRef} />
    </div>
  );
};

describe('EditorHotkeysEffect', () => {
  let editor: any;
  let setHotkeyRefMock: ReturnType<typeof mock>;
  const hotkeyCallback = mock();

  beforeEach(() => {
    editor = createPlateEditor({
      shortcuts: {
        'mod+b': {
          keys: 'mod+b',
          handler: hotkeyCallback,
        },
        'mod+i': {
          keys: 'mod+i',
          handler: mock(),
        },
      },
    });

    // Set up spies
    useEditorRefSpy = spyOn(storesModule, 'useEditorRef').mockReturnValue(
      editor
    );
    setHotkeyRefMock = mock();
    useHotkeysSpy = spyOn(reactHotkeysModule, 'useHotkeys').mockReturnValue(
      setHotkeyRefMock
    );
  });

  afterEach(() => {
    useEditorRefSpy?.mockRestore();
    useHotkeysSpy?.mockRestore();
  });

  it('should render without crashing', () => {
    render(<SimpleComponent />);
  });

  it('should set up shortcuts for each configured hotkey', () => {
    render(<SimpleComponent />);

    expect(useHotkeysSpy).toHaveBeenCalledWith(
      'mod+b',
      expect.any(Function),
      expect.objectContaining({ enableOnContentEditable: true }),
      []
    );
    expect(useHotkeysSpy).toHaveBeenCalledWith(
      'mod+i',
      expect.any(Function),
      expect.objectContaining({ enableOnContentEditable: true }),
      []
    );
  });

  it('should call the hotkey callback when triggered', async () => {
    render(<SimpleComponent />);

    // Simulate setting up the hotkey
    const [, callbackPassedToUseHotkeys] = useHotkeysSpy.mock.calls[0];

    const mockEvent = { preventDefault: mock() };

    // Trigger the hotkey
    await act(async () => {
      callbackPassedToUseHotkeys(mockEvent, {} as any);
    });

    expect(hotkeyCallback).toHaveBeenCalledTimes(1);
  });

  it('should set the hotkey ref to the editable element', () => {
    const { container } = render(<SimpleComponent />);

    const editableDiv = container.firstChild as HTMLDivElement;

    expect(setHotkeyRefMock).toHaveBeenCalledWith(editableDiv);
  });

  describe('preventDefault behavior', () => {
    let mockEvent: any;

    beforeEach(() => {
      mockEvent = {
        preventDefault: mock(),
      };
      // Clear previous mock calls
      useHotkeysSpy.mockClear();
    });

    it('should NOT call preventDefault when handler returns false', async () => {
      const handlerReturningFalse = mock().mockReturnValue(false);
      editor.meta.shortcuts = {
        'mod+x': {
          keys: 'mod+x',
          handler: handlerReturningFalse,
        },
      };

      render(<SimpleComponent />);

      const [, callbackPassedToUseHotkeys] = useHotkeysSpy.mock.calls[0];

      await act(async () => {
        callbackPassedToUseHotkeys(mockEvent, {} as any);
      });

      expect(handlerReturningFalse).toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should call preventDefault when handler returns undefined (default behavior)', async () => {
      const handlerReturningUndefined = mock().mockReturnValue(undefined);
      editor.meta.shortcuts = {
        'mod+y': {
          keys: 'mod+y',
          handler: handlerReturningUndefined,
        },
      };

      render(<SimpleComponent />);

      const [, callbackPassedToUseHotkeys] = useHotkeysSpy.mock.calls[0];

      await act(async () => {
        callbackPassedToUseHotkeys(mockEvent, {} as any);
      });

      expect(handlerReturningUndefined).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault when handler returns true', async () => {
      const handlerReturningTrue = mock().mockReturnValue(true);
      editor.meta.shortcuts = {
        'mod+z': {
          keys: 'mod+z',
          handler: handlerReturningTrue,
        },
      };

      render(<SimpleComponent />);

      const [, callbackPassedToUseHotkeys] = useHotkeysSpy.mock.calls[0];

      await act(async () => {
        callbackPassedToUseHotkeys(mockEvent, {} as any);
      });

      expect(handlerReturningTrue).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should NOT call preventDefault when preventDefault option is explicitly set to false', async () => {
      const handlerReturningTrue = mock().mockReturnValue(true);
      editor.meta.shortcuts = {
        'mod+a': {
          keys: 'mod+a',
          handler: handlerReturningTrue,
          preventDefault: false,
        },
      };

      render(<SimpleComponent />);

      const [, callbackPassedToUseHotkeys] = useHotkeysSpy.mock.calls[0];

      await act(async () => {
        callbackPassedToUseHotkeys(mockEvent, {} as any);
      });

      expect(handlerReturningTrue).toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should NOT call preventDefault when preventDefault option is explicitly set (regardless of handler return)', async () => {
      const handlerReturningFalse = mock().mockReturnValue(false);
      editor.meta.shortcuts = {
        'mod+s': {
          keys: 'mod+s',
          handler: handlerReturningFalse,
          preventDefault: true, // Even though this is true, the current logic ignores it when preventDefault is defined
        },
      };

      render(<SimpleComponent />);

      const [, callbackPassedToUseHotkeys] = useHotkeysSpy.mock.calls[0];

      await act(async () => {
        callbackPassedToUseHotkeys(mockEvent, {} as any);
      });

      expect(handlerReturningFalse).toHaveBeenCalled();
      // Current logic: if preventDefault is defined (even as true), it won't call event.preventDefault()
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});
