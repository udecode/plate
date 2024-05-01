import React from 'react';

import { renderHook } from '@testing-library/react-hooks';

import type { PlatePlugin } from '../types/index';

import { Plate, usePlateSelectors } from '../client';

describe('normalizeInitialValue', () => {
  describe('defined', () => {
    it('should normalize the initial value', () => {
      const plugins: PlatePlugin[] = [
        {
          key: 'a',
          normalizeInitialValue: (initialValue: any) => {
            initialValue[0].count += 1;

            return initialValue;
          },
        },
        {
          key: 'b',
          normalizeInitialValue: (initialValue: any) => {
            initialValue[0].count += 1;

            return initialValue;
          },
        },
      ];

      const wrapper = ({ children }: any) => (
        <Plate
          initialValue={[{ children: [{ text: '' }], count: 0, type: 'p' }]}
          plugins={plugins}
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
});
