import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import {
  BLUR_EDITOR_EVENT,
  EventEditorStore,
  FOCUS_EDITOR_EVENT,
} from './EventEditorStore';
import {
  useEventPlateId,
  useFocusEditorEvents,
  useFocusedLast,
} from './useEventEditor';

describe('EventEditor hooks', () => {
  const resetEventEditorStore = () => {
    act(() => {
      EventEditorStore.set('blur', null);
      EventEditorStore.set('focus', null);
      EventEditorStore.set('last', null);
    });
  };

  beforeEach(resetEventEditorStore);
  afterEach(resetEventEditorStore);

  it('calls focus and blur handlers only for the matching editor id', () => {
    const editor = createPlateEditor({
      id: 'editor-a',
    });
    const onEditorFocus = mock();
    const onEditorBlur = mock();

    const { unmount } = renderHook(() =>
      useFocusEditorEvents({
        editorRef: editor,
        onEditorBlur,
        onEditorFocus,
      })
    );

    act(() => {
      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: 'editor-b' },
        })
      );
      document.dispatchEvent(
        new CustomEvent(BLUR_EDITOR_EVENT, {
          detail: { id: 'editor-a' },
        })
      );
      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: 'editor-a' },
        })
      );
    });

    expect(onEditorBlur).toHaveBeenCalledTimes(1);
    expect(onEditorFocus).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: 'editor-a' },
        })
      );
    });

    expect(onEditorFocus).toHaveBeenCalledTimes(1);
  });

  it('prefers explicit id, then event store ids, then the provider editor id', () => {
    const editor = createPlateEditor({
      id: 'provider-id',
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const current = renderHook(() => useEventPlateId(), { wrapper });
    const explicit = renderHook(() => useEventPlateId('explicit'), { wrapper });

    expect(current.result.current).toBe('provider-id');
    expect(explicit.result.current).toBe('explicit');

    act(() => {
      EventEditorStore.set('last', 'last-id');
    });
    expect(current.result.current).toBe('last-id');

    act(() => {
      EventEditorStore.set('blur', 'blur-id');
    });
    expect(current.result.current).toBe('blur-id');

    act(() => {
      EventEditorStore.set('focus', 'focus-id');
    });
    expect(current.result.current).toBe('focus-id');
  });

  it('keeps hook order stable when an explicit focused id toggles', () => {
    const editor = createPlateEditor({
      id: 'provider-id',
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    EventEditorStore.set('last', 'provider-id');
    const initialProps: { id?: string } = { id: undefined };

    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => useFocusedLast(id),
      {
        initialProps,
        wrapper,
      }
    );

    expect(result.current).toBe(true);

    rerender({ id: 'other-id' });
    expect(result.current).toBe(false);

    rerender({ id: undefined });
    expect(result.current).toBe(true);
  });

  it('keeps an explicit focused id provider-optional when it toggles', () => {
    EventEditorStore.set('last', 'explicit-id');
    const initialProps: { id?: string } = { id: 'explicit-id' };

    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => useFocusedLast(id),
      {
        initialProps,
      }
    );

    expect(result.current).toBe(true);

    rerender({ id: undefined });
    expect(result.current).toBe(false);

    rerender({ id: 'explicit-id' });
    expect(result.current).toBe(true);
  });
});
