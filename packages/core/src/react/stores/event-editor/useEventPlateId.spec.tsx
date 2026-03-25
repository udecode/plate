import React from 'react';

import { act, renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { EventEditorStore } from '../../plugins/event-editor/EventEditorStore';
import { useEventPlateId } from './useEventPlateId';

describe('useEventPlateId', () => {
  const resetEventEditorStore = () => {
    act(() => {
      EventEditorStore.set('blur', null);
      EventEditorStore.set('focus', null);
      EventEditorStore.set('last', null);
    });
  };

  beforeEach(() => {
    resetEventEditorStore();
  });

  afterEach(() => {
    resetEventEditorStore();
  });

  it('prefers explicit id, then event store ids, then the provider editor id', () => {
    const editor = createPlateEditor({ id: 'provider-id' });
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
});
