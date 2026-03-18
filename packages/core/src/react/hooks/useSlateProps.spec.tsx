import React from 'react';

import type { TRange } from '@platejs/slate';

import { act, renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';
import {
  useEditorVersion,
  useSelectionVersion,
  useValueVersion,
} from '../stores';
import { useSlateProps } from './useSlateProps';

describe('useSlateProps', () => {
  it('routes slate callbacks through the matching plate callbacks and versions', () => {
    const onChange = mock();
    const onSelectionChange = mock();
    const onValueChange = mock();
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate
        editor={editor}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
        onValueChange={onValueChange}
      >
        {children}
      </Plate>
    );
    const { result } = renderHook(
      () => ({
        editorVersion: useEditorVersion(),
        props: useSlateProps({}),
        selectionVersion: useSelectionVersion(),
        valueVersion: useValueVersion(),
      }),
      { wrapper }
    );
    const nextValue = [{ children: [{ text: 'two' }], type: 'p' }];
    const nextSelection: TRange = {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    onChange.mockClear();
    onSelectionChange.mockClear();
    onValueChange.mockClear();

    expect(result.current.props.editor).toBe(editor);
    expect(result.current.props.initialValue).toBe(editor.children);
    expect(result.current.props.key).toBe(editor.meta.key);

    act(() => {
      result.current.props.onChange(nextValue as any);
    });

    expect(result.current.editorVersion).toBe(2);
    expect(result.current.selectionVersion).toBe(1);
    expect(result.current.valueVersion).toBe(1);
    expect(onChange).toHaveBeenCalledWith({ editor, value: nextValue });

    act(() => {
      result.current.props.onValueChange(nextValue as any);
    });

    expect(result.current.editorVersion).toBe(2);
    expect(result.current.selectionVersion).toBe(1);
    expect(result.current.valueVersion).toBe(2);
    expect(onValueChange).toHaveBeenCalledWith({ editor, value: nextValue });

    act(() => {
      result.current.props.onSelectionChange(nextSelection);
    });

    expect(result.current.editorVersion).toBe(2);
    expect(result.current.selectionVersion).toBe(2);
    expect(result.current.valueVersion).toBe(2);
    expect(onSelectionChange).toHaveBeenCalledWith({
      editor,
      selection: nextSelection,
    });
  });

  it('increments the editor version without forwarding handled changes', () => {
    const handledChange = mock(() => true);
    const onChange = mock();
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          handlers: { onChange: handledChange },
          key: 'handled',
        }),
      ],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor} onChange={onChange}>
        {children}
      </Plate>
    );
    const { result } = renderHook(
      () => ({
        editorVersion: useEditorVersion(),
        props: useSlateProps({}),
      }),
      { wrapper }
    );

    handledChange.mockClear();
    onChange.mockClear();

    act(() => {
      result.current.props.onChange([
        { children: [{ text: 'two' }], type: 'p' },
      ] as any);
    });

    expect(result.current.editorVersion).toBe(2);
    expect(handledChange).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
