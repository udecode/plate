/** @jsx jsxt */

import React from 'react';

import { renderHook } from '@testing-library/react';
import { Plate } from '@platejs/core/react';
import { schema } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { createTestTableEditor } from '../lib/__tests__/getTestTablePlugins';
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
    const editor = createTestTableEditor({
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

  it('detects tables through their configured persisted type', () => {
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
    const plugins = [
      TablePlugin.configure({
        initialState: { disableMerge: false },
      }),
    ] as const;
    const applicationSchema = {
      overrides: [
        schema.override(TablePlugin, {
          element: { type: 'customTable' },
        }),
      ],
    } as const;
    const editor = createTestTableEditor({
      plugins,
      schema: applicationSchema,
      selection: input.selection,
      initialValue: input.children.map((node, index) =>
        index === 0 ? { ...node, type: 'customTable' } : node
      ),
    });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Plate, {
        children,
        editor,
        suppressInstanceWarning: true,
      });
    const { result } = renderHook(() => useTableMergeState(), { wrapper });

    expect(result.current).toEqual({ canMerge: true, canSplit: false });
  });
});
