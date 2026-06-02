import React from 'react';

import { renderHook } from '@testing-library/react';

import { createSlateEditor } from '../../lib/editor';
import { createSlatePlugin } from '../../lib/plugin';
import { TestPlate as Plate } from '../../react/__tests__/TestPlate';
import { createPlateEditor, useEditorValue } from '../../react';
import { pipeTransformInitialValue } from './pipeTransformInitialValue';

describe('pipeTransformInitialValue', () => {
  const createTestPlugin = (key: string) =>
    createSlatePlugin({
      key,
      transformInitialValue: ({ value: initialValue }: any) =>
        initialValue.map((node: any) => ({
          ...node,
          count: node.count + 1,
        })),
    });

  const plugins = [createTestPlugin('a'), createTestPlugin('b')];

  describe('when children is passed to createPlateEditor', () => {
    it('normalize the initial value once', () => {
      const editor = createPlateEditor({
        plugins,
        value: [{ children: [{ text: '' }], count: 0, type: 'p' }],
      });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(() => useEditorValue(), {
        wrapper,
      });

      expect(result.current).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('when initialValue was previously passed to Plate', () => {
    it('normalize the initial value once', () => {
      const editor = createPlateEditor({
        plugins,
        value: [{ children: [{ text: '' }], count: 0, type: 'p' }],
      });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(() => useEditorValue(), {
        wrapper,
      });

      expect(result.current).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('when both children and initialValue were previously provided', () => {
    it('use children and normalize it once', () => {
      const editor = createPlateEditor({
        plugins,
        value: [{ children: [{ text: '' }], count: 0, type: 'p' }],
      });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(() => useEditorValue(), {
        wrapper,
      });

      expect(result.current).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('withPlate', () => {
    describe('children handling', () => {
      it('use provided children', () => {
        const children = [
          { children: [{ text: 'Test' }], count: 0, type: 'p' },
        ];
        const editor = createPlateEditor({
          plugins,
          value: children,
        });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );

        const { result } = renderHook(() => useEditorValue(), {
          wrapper,
        });

        expect(result.current).toEqual([
          { children: [{ text: 'Test' }], count: 2, type: 'p' },
        ]);
      });

      it('use create.value when children is empty', () => {
        const editor = createPlateEditor({
          plugins,
          value: [{ children: [{ text: 'Factory' }], count: 0, type: 'p' }],
        });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );

        const { result } = renderHook(() => useEditorValue(), {
          wrapper,
        });

        expect(result.current).toEqual([
          { children: [{ text: 'Factory' }], count: 2, type: 'p' },
        ]);
      });
    });

    describe('selection handling', () => {
      it('use provided selection', () => {
        const selection = {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        };
        const editor = createPlateEditor({
          plugins,
          selection,
        });

        expect(editor.selection).toEqual(selection);
      });

      it('auto-select start when autoSelect is "start"', () => {
        const editor = createPlateEditor({
          autoSelect: 'start',
          value: [{ children: [{ text: 'Test' }], type: 'p' }],
        });

        expect(editor.selection).toEqual({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
      });

      it('auto-select end when autoSelect is true', () => {
        const editor = createPlateEditor({
          autoSelect: true,
          value: [{ children: [{ text: 'Test' }], type: 'p' }],
        });

        expect(editor.selection).toEqual({
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        });
      });
    });
  });

  it('supports legacy normalizeInitialValue hooks that return a value', () => {
    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'legacy',
          normalizeInitialValue: ({ value: initialValue }: any) =>
            initialValue.map((node: any) => ({
              ...node,
              count: node.count + 1,
            })),
        }),
      ],
    });
    editor.children = [
      { children: [{ text: '' }], count: 0, type: 'p' },
    ] as any;

    pipeTransformInitialValue(editor);

    expect(editor.children).toEqual([
      { children: [{ text: '' }], count: 1, type: 'p' },
    ]);
  });

  it('supports legacy normalizeInitialValue hooks that mutate in place', () => {
    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'legacy-mutate',
          normalizeInitialValue: ({ value: initialValue }: any) => {
            initialValue[0].count += 1;
          },
        }),
      ],
    });
    editor.children = [
      { children: [{ text: '' }], count: 0, type: 'p' },
    ] as any;

    pipeTransformInitialValue(editor);

    expect(editor.children).toEqual([
      { children: [{ text: '' }], count: 1, type: 'p' },
    ]);
  });

  it('throws when a transformInitialValue hook returns undefined', () => {
    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'bad',
          transformInitialValue: (() => {}) as any,
        }),
      ],
      skipInitialization: true,
    });
    editor.children = [{ children: [{ text: '' }], type: 'p' }] as any;

    expect(() => pipeTransformInitialValue(editor)).toThrow(
      'Plugin "bad" transformInitialValue must return the next value.'
    );
  });

  it('skips transformInitialValue for read-only editOnly plugins', () => {
    const callCount = mock();
    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'skip',
          editOnly: { transformInitialValue: true },
          transformInitialValue: ({ value }) => {
            callCount();

            return value;
          },
        }),
      ],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.dom.readOnly = true;
    (callCount as any).mockClear();

    pipeTransformInitialValue(editor);

    expect(callCount).not.toHaveBeenCalled();
  });
});
