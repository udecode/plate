import React from 'react';

import type { Range, Value } from '@platejs/plite';

import { act, renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { createPlateEditor } from '../editor';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { createPlatePlugin } from '../plugin';
import { usePlateRootProps } from './usePlateRootProps';

describe('usePlateRootProps', () => {
  it('routes Plite callbacks through the matching Plate callbacks', () => {
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
        props: usePlateRootProps({}),
      }),
      { wrapper }
    );
    const nextValue: Value = [{ children: [{ text: 'two' }], type: 'p' }];
    const nextSelection: Range = {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    onChange.mockClear();
    onSelectionChange.mockClear();
    onValueChange.mockClear();

    expect(result.current.props.editor).toBe(editor);
    expect(result.current.props.key).toBe(getPlateEditorInstanceKey(editor));

    act(() => {
      result.current.props.onChange!(nextValue);
    });

    expect(onChange).toHaveBeenCalledWith({ editor, value: nextValue });

    act(() => {
      result.current.props.onValueChange!(nextValue);
    });

    expect(onValueChange).toHaveBeenCalledWith({ editor, value: nextValue });

    act(() => {
      result.current.props.onSelectionChange!(nextSelection);
    });

    expect(onSelectionChange).toHaveBeenCalledWith({
      editor,
      selection: nextSelection,
    });
  });

  it('does not forward handled changes', () => {
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
        props: usePlateRootProps({}),
      }),
      { wrapper }
    );

    handledChange.mockClear();
    onChange.mockClear();

    act(() => {
      result.current.props.onChange!([
        { children: [{ text: 'two' }], type: 'p' },
      ]);
    });

    expect(handledChange).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
