import React from 'react';

import type { Value } from '@udecode/slate';

import { renderHook } from '@testing-library/react-hooks';

import { Plate, createPlateEditor, usePlateSelectors } from '../../client';
import { createPlugin } from './createPlugin';

describe('pipeNormalizeInitialValue', () => {
  const createTestPlugin = (key: string) =>
    createPlugin({
      key,
      normalizeInitialValue: ({ value: initialValue }: any) => {
        initialValue[0].count += 1;

        return initialValue;
      },
    });

  const plugins = [createTestPlugin('a'), createTestPlugin('b')];

  describe('when children is passed to createPlateEditor', () => {
    it('should normalize the initial value once', () => {
      const editor = createPlateEditor({
        children: [{ children: [{ text: '' }], count: 0, type: 'p' }],
        plugins,
      });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(() => usePlateSelectors().value(), {
        wrapper,
      });

      expect(result.current).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('when initialValue is passed to Plate', () => {
    it('should normalize the initial value once', () => {
      const editor = createPlateEditor({ plugins });

      const wrapper = ({ children }: any) => (
        <Plate
          editor={editor}
          initialValue={
            [{ children: [{ text: '' }], count: 0, type: 'p' }] as Value
          }
        >
          {children}
        </Plate>
      );

      const { result } = renderHook(() => usePlateSelectors().value(), {
        wrapper,
      });

      expect(result.current).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('when both children and initialValue are provided', () => {
    it('should use initialValue and normalize it once', () => {
      const editor = createPlateEditor({
        children: [{ children: [{ text: 'ignored' }], count: 0, type: 'p' }],
        plugins,
      });

      const wrapper = ({ children }: any) => (
        <Plate
          editor={editor}
          initialValue={[{ children: [{ text: '' }], count: 0, type: 'p' }]}
        >
          {children}
        </Plate>
      );

      const { result } = renderHook(() => usePlateSelectors().value(), {
        wrapper,
      });

      expect(result.current).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('when no initial value is provided', () => {
    it('should not normalize', () => {
      const editor = createPlateEditor({
        plugins,
      });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(() => usePlateSelectors().value(), {
        wrapper,
      });

      expect(result.current).toEqual([{ children: [{ text: '' }], type: 'p' }]);
    });
  });
});
