import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { PlateProvider } from '@/packages/core/src/components';
import { usePlateSelectors } from '@/packages/core/src/stores';
import { PlatePlugin } from '@/packages/core/src/types';

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
        <PlateProvider
          plugins={plugins}
          initialValue={[{ type: 'p', count: 0, children: [{ text: '' }] }]}
        >
          {children}
        </PlateProvider>
      );

      const { result } = renderHook(() => usePlateSelectors().value(), {
        wrapper,
      });

      expect(result.current).toEqual([
        { type: 'p', count: 2, children: [{ text: '' }] },
      ]);
    });
  });
});
