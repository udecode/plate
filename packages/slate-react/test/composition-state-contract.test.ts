import type { CompositionEvent } from 'react';
import { createEditor } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { describe, expect, it, vi } from 'vitest';

import {
  applyEditableCompositionEnd,
  applyEditableCompositionStart,
  applyEditableCompositionUpdate,
} from '../src/editable/composition-state';
import { ReactEditor } from '../src/plugin/react-editor';

const createTextEditor = (text = 'abcd') => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text }] }],
    marks: null,
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor as ReactEditor;
};

const createCompositionEvent = (data = '') => {
  const event = {
    currentTarget: {
      querySelectorAll: () => [],
    },
    data,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    nativeEvent: {
      data,
      isTrusted: true,
    },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {},
  };

  return event as unknown as CompositionEvent<HTMLDivElement> & {
    preventDefault: ReturnType<typeof vi.fn>;
    stopPropagation: ReturnType<typeof vi.fn>;
  };
};

describe('composition state', () => {
  it('does not predelete expanded selections on read-only compositionstart', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文');
    const setComposing = vi.fn();
    const onCompositionStart = vi.fn();
    const androidInputManager = { handleCompositionStart: vi.fn() };
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        androidInputManagerRef: { current: androidInputManager },
        editor,
        event,
        onCompositionStart,
        readOnly: true,
        setComposing,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(androidInputManager.handleCompositionStart).not.toHaveBeenCalled();
      expect(onCompositionStart).not.toHaveBeenCalled();
      expect(setComposing).not.toHaveBeenCalled();
      expect(Editor.string(editor, [])).toBe('abcd');
    } finally {
      hasEditableTarget.mockRestore();
    }
  });

  it('does not commit Chrome composition fallback while read-only', () => {
    const editor = createTextEditor('stable');
    const event = createCompositionEvent('!');
    const setComposing = vi.fn();
    const onCompositionEnd = vi.fn();
    const androidInputManager = { handleCompositionEnd: vi.fn() };
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: androidInputManager },
        editor,
        event,
        inputController: {
          state: { selectionSource: 'composition-owned' },
        } as any,
        onCompositionEnd,
        readOnly: true,
        setComposing,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(androidInputManager.handleCompositionEnd).not.toHaveBeenCalled();
      expect(onCompositionEnd).not.toHaveBeenCalled();
      expect(setComposing).toHaveBeenCalledWith(false);
      expect(Editor.string(editor, [])).toBe('stable');
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('does not enter composition state on read-only compositionupdate', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('ghost');
    const setComposing = vi.fn();
    const onCompositionUpdate = vi.fn();
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionUpdate({
        editor,
        event,
        onCompositionUpdate,
        readOnly: true,
        setComposing,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(onCompositionUpdate).not.toHaveBeenCalled();
      expect(setComposing).not.toHaveBeenCalled();
      expect(Editor.string(editor, [])).toBe('abcd');
    } finally {
      hasEditableTarget.mockRestore();
    }
  });
});
