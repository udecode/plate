import React from 'react';

import { type TRange } from '@platejs/slate';

import { act, renderHook } from '@testing-library/react';

import { createPlateEditor } from '../../editor';
import {
  PlateStoreProvider,
  useEditorComposing,
  useEditorContainerRef,
  useEditorId,
  useEditorMounted,
  useEditorReadOnly,
  useEditorRef,
  useEditorScrollRef,
  useEditorSelection,
  useEditorState,
  useEditorValue,
  useEditorVersion,
  useIncrementVersion,
  usePlateSet,
  usePlateState,
  usePlateStore,
  usePlateValue,
  useRedecorate,
  useScrollRef,
  useSelectionVersion,
  useValueVersion,
} from './createPlateStore';

describe('createPlateStore', () => {
  const createScopedWrapper = () => {
    const editor = createPlateEditor({
      id: 'scoped-editor',
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } as TRange;

    const containerRef = { current: document.createElement('div') };
    const scrollRef = { current: document.createElement('section') };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlateStoreProvider
        composing={false}
        containerRef={containerRef}
        editor={editor}
        isMounted={true}
        primary={true}
        readOnly={true}
        scope="custom"
        scrollRef={scrollRef}
      >
        {children}
      </PlateStoreProvider>
    );

    return { containerRef, editor, scrollRef, wrapper };
  };

  it('reads and writes scoped store values and selector hooks', () => {
    const { containerRef, scrollRef, wrapper } = createScopedWrapper();

    const { result } = renderHook(
      () => {
        const [composing, setComposing] = usePlateState('composing', 'custom');
        const setVersionEditor = usePlateSet('versionEditor', 'custom');

        return {
          composing,
          containerRef: useEditorContainerRef('custom'),
          editorId: useEditorId(),
          isComposing: useEditorComposing('custom'),
          isMounted: useEditorMounted('custom'),
          isReadOnly: useEditorReadOnly('custom'),
          scrollRef: useEditorScrollRef('custom'),
          selectedScrollRef: useScrollRef('custom'),
          setComposing,
          setVersionEditor,
          versionEditor: usePlateValue('versionEditor', 'custom'),
        };
      },
      { wrapper }
    );

    expect(result.current.editorId).toBe('scoped-editor');
    expect(result.current.containerRef).toBe(containerRef);
    expect(result.current.scrollRef).toBe(scrollRef);
    expect(result.current.selectedScrollRef).toBe(scrollRef);
    expect(result.current.isMounted).toBe(true);
    expect(result.current.isReadOnly).toBe(true);
    expect(result.current.isComposing).toBe(false);
    expect(result.current.composing).toBe(false);
    expect(result.current.versionEditor).toBe(1);

    act(() => {
      result.current.setComposing(true);
      result.current.setVersionEditor(4);
    });

    expect(result.current.composing).toBe(true);
    expect(result.current.isComposing).toBe(true);
    expect(result.current.versionEditor).toBe(4);
  });

  it('tracks editor, selection, value, and version helpers', () => {
    const { editor, wrapper } = createScopedWrapper();

    const { result } = renderHook(
      () => ({
        editor: useEditorState('custom'),
        editorRef: useEditorRef('custom'),
        editorVersion: useEditorVersion('custom'),
        incrementDecorate: useIncrementVersion('versionDecorate', 'custom'),
        incrementEditor: useIncrementVersion('versionEditor', 'custom'),
        incrementSelection: useIncrementVersion('versionSelection', 'custom'),
        incrementValue: useIncrementVersion('versionValue', 'custom'),
        redecorate: useRedecorate('custom'),
        selection: useEditorSelection('custom'),
        selectionVersion: useSelectionVersion('custom'),
        store: usePlateStore('custom'),
        value: useEditorValue('custom'),
        valueVersion: useValueVersion('custom'),
      }),
      { wrapper }
    );

    expect(result.current.editor).toBe(editor);
    expect(result.current.editorRef).toBe(editor);
    expect(result.current.editorRef.store.store).toBe(
      result.current.store.store
    );
    expect(result.current.selection).toEqual(editor.selection);
    expect(result.current.value).toEqual(editor.children);
    expect(result.current.editorVersion).toBe(1);
    expect(result.current.selectionVersion).toBe(1);
    expect(result.current.valueVersion).toBe(1);

    act(() => {
      editor.selection = {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      } as TRange;
      editor.children = [
        ...editor.children,
        { children: [{ text: 'two' }], type: 'p' },
      ];
      result.current.store.set('versionEditor', 2);
      result.current.store.set('versionSelection', 2);
      result.current.store.set('versionValue', 2);
    });

    expect(result.current.selection).toEqual(editor.selection);
    expect(result.current.value).toEqual(editor.children);
    expect(result.current.editorVersion).toBe(2);
    expect(result.current.selectionVersion).toBe(2);
    expect(result.current.valueVersion).toBe(2);

    act(() => {
      result.current.incrementEditor();
      result.current.incrementSelection();
      result.current.incrementValue();
      result.current.incrementDecorate();
      result.current.redecorate();
    });

    expect(result.current.store.get('versionEditor')).toBe(2);
    expect(result.current.store.get('versionSelection')).toBe(2);
    expect(result.current.store.get('versionValue')).toBe(2);
    expect(result.current.store.get('versionDecorate')).toBe(2);
  });
});
