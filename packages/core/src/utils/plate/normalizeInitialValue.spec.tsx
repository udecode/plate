import React from 'react';
import { render } from '@testing-library/react';
import { Plate } from '../../components/index';
import { getPlateSelectors } from '../../stores/index';
import { PlatePlugin } from '../../types/index';

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

      render(
        <Plate
          plugins={plugins}
          initialValue={[{ type: 'p', count: 0, children: [{ text: '' }] }]}
        />
      );

      const value = getPlateSelectors().value();

      expect(value).toEqual([
        { type: 'p', count: 2, children: [{ text: '' }] },
      ]);
    });
  });
});
