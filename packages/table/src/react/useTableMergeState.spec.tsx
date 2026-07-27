/** @jsx jsxt */

import React from 'react';

import { renderHook } from '@testing-library/react';
import { createPlateEditor, Plate } from '@platejs/core/react';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { TablePlugin } from './TablePlugin';
import { useTableMergeState } from './useTableMergeState';

jsxt;

describe('useTableMergeState', () => {
  it('keeps hook order stable while merge support changes live', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                11
              </hp>
            </htd>
            <htd>
              <hp>
                12
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createPlateEditor({
      nodeId: true,
      plugins: [
        TablePlugin.configure({
          initialState: { disableMerge: false },
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Plate, {
        children,
        editor,
        suppressInstanceWarning: true,
      });
    const { rerender, result } = renderHook(() => useTableMergeState(), {
      wrapper,
    });

    expect(result.current).toEqual({ canMerge: true, canSplit: false });

    editor.plugin(TablePlugin).store.set({ disableMerge: true });
    rerender();

    expect(result.current).toEqual({ canMerge: false, canSplit: false });

    editor.plugin(TablePlugin).store.set({ disableMerge: false });
    rerender();

    expect(result.current).toEqual({ canMerge: true, canSplit: false });
  });
});
