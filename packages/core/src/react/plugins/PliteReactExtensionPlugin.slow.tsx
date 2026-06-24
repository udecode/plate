import type { KeyboardEvent } from 'react';

import { parseHotkey } from 'is-hotkey';

import { getCurrentRuntimeTransforms } from '../../internal/currentRuntimeBridge';
import { createPlateEditor } from '../editor';
import { onPliteReactKeyDown } from './PliteReactExtensionPlugin';

type KeyboardRuntimeTransforms = {
  escape: () => boolean;
  moveLine: (options: { reverse: boolean }) => boolean;
  selectAll: () => boolean;
  tab: (options: { reverse: boolean }) => boolean;
};

const keyboardValue = [
  {
    children: [{ text: 'keyboard' }],
    type: 'p',
  },
];

const createKeyboardEditor = (
  transforms: Partial<KeyboardRuntimeTransforms> = {}
) => {
  const editor = createPlateEditor({
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value: keyboardValue,
  });

  Object.assign(getCurrentRuntimeTransforms(editor), transforms);

  return editor;
};

const createKeyboardEvent = (hotkey: string) => {
  const parsed = parseHotkey(hotkey, { byKey: true });

  return {
    altKey: parsed.altKey,
    ctrlKey: parsed.ctrlKey,
    key: parsed.key,
    metaKey: parsed.metaKey,
    persist: mock(),
    preventDefault: mock(),
    shiftKey: parsed.shiftKey,
    stopPropagation: mock(),
  } as unknown as KeyboardEvent;
};

const triggerKeyboardEvent = (
  editor: ReturnType<typeof createKeyboardEditor>,
  hotkey: string
) => {
  const event = createKeyboardEvent(hotkey);

  onPliteReactKeyDown({ editor, event });

  return event;
};

describe('PliteReactExtensionPlugin keyboard shortcuts', () => {
  describe('moveLine', () => {
    it('call moveLine with reverse: true on ArrowUp', () => {
      const moveLineMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ moveLine: moveLineMock });

      triggerKeyboardEvent(editor, 'ArrowUp');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: true });
    });

    it('call moveLine with reverse: false on ArrowDown', () => {
      const moveLineMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ moveLine: moveLineMock });

      triggerKeyboardEvent(editor, 'ArrowDown');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: false });
    });

    it('prevent the event when moveLine handles it', () => {
      const moveLineMock = mock().mockReturnValue(true);
      const editor = createKeyboardEditor({ moveLine: moveLineMock });
      const event = triggerKeyboardEvent(editor, 'ArrowUp');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: true });
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('allow default behavior when moveLine returns false', () => {
      const moveLineMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ moveLine: moveLineMock });
      const event = triggerKeyboardEvent(editor, 'ArrowDown');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: false });
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('tab', () => {
    it('call tab with reverse: false on Tab', () => {
      const tabMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ tab: tabMock });

      triggerKeyboardEvent(editor, 'Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: false });
    });

    it('call tab with reverse: true on Shift+Tab', () => {
      const tabMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ tab: tabMock });

      triggerKeyboardEvent(editor, 'Shift+Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: true });
    });

    it('prevent the event when tab handles it', () => {
      const tabMock = mock().mockReturnValue(true);
      const editor = createKeyboardEditor({ tab: tabMock });
      const event = triggerKeyboardEvent(editor, 'Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: false });
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('allow default behavior when tab returns false', () => {
      const tabMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ tab: tabMock });
      const event = triggerKeyboardEvent(editor, 'Shift+Tab');

      expect(tabMock).toHaveBeenCalledWith({ reverse: true });
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('selectAll', () => {
    it('call selectAll on Mod+A', () => {
      const selectAllMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ selectAll: selectAllMock });

      triggerKeyboardEvent(editor, 'mod+a');

      expect(selectAllMock).toHaveBeenCalledWith();
    });

    it('prevent the event when selectAll handles it', () => {
      const selectAllMock = mock().mockReturnValue(true);
      const editor = createKeyboardEditor({ selectAll: selectAllMock });
      const event = triggerKeyboardEvent(editor, 'mod+a');

      expect(selectAllMock).toHaveBeenCalledWith();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('allow default behavior when selectAll returns false', () => {
      const selectAllMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ selectAll: selectAllMock });
      const event = triggerKeyboardEvent(editor, 'mod+a');

      expect(selectAllMock).toHaveBeenCalledWith();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('escape', () => {
    it('call escape on Escape key', () => {
      const escapeMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ escape: escapeMock });

      triggerKeyboardEvent(editor, 'Escape');

      expect(escapeMock).toHaveBeenCalledWith();
    });

    it('prevent the event when escape handles it', () => {
      const escapeMock = mock().mockReturnValue(true);
      const editor = createKeyboardEditor({ escape: escapeMock });
      const event = triggerKeyboardEvent(editor, 'Escape');

      expect(escapeMock).toHaveBeenCalledWith();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('allow default behavior when escape returns false', () => {
      const escapeMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({ escape: escapeMock });
      const event = triggerKeyboardEvent(editor, 'Escape');

      expect(escapeMock).toHaveBeenCalledWith();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('default behavior', () => {
    it('does not throw when handlers are not overridden', () => {
      const editor = createKeyboardEditor();

      triggerKeyboardEvent(editor, 'ArrowUp');
      triggerKeyboardEvent(editor, 'ArrowDown');
      triggerKeyboardEvent(editor, 'Tab');
      triggerKeyboardEvent(editor, 'Shift+Tab');
      triggerKeyboardEvent(editor, 'mod+a');
      triggerKeyboardEvent(editor, 'Escape');
    });
  });

  describe('integration', () => {
    it('work with multiple custom implementations', () => {
      const moveLineMock = mock().mockReturnValue(true);
      const tabMock = mock().mockReturnValue(false);
      const selectAllMock = mock().mockReturnValue(true);
      const escapeMock = mock().mockReturnValue(false);
      const editor = createKeyboardEditor({
        escape: escapeMock,
        moveLine: moveLineMock,
        selectAll: selectAllMock,
        tab: tabMock,
      });

      triggerKeyboardEvent(editor, 'ArrowUp');
      triggerKeyboardEvent(editor, 'Tab');
      triggerKeyboardEvent(editor, 'mod+a');
      triggerKeyboardEvent(editor, 'Escape');

      expect(moveLineMock).toHaveBeenCalledWith({ reverse: true });
      expect(tabMock).toHaveBeenCalledWith({ reverse: false });
      expect(selectAllMock).toHaveBeenCalledWith();
      expect(escapeMock).toHaveBeenCalledWith();
    });
  });
});
