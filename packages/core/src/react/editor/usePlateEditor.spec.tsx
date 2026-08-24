import React from 'react';

import type { Value } from '@platejs/slate';

import { render } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateContent } from '../components/PlateContent';
import { usePlateEditor } from './usePlateEditor';

describe('usePlateEditor', () => {
  it('isolates a shared static value between editor instances', () => {
    const value: Value = [{ children: [{ text: 'Shared text' }], type: 'p' }];

    const Editors = () => {
      const firstEditor = usePlateEditor({ value });
      const secondEditor = usePlateEditor({ value });

      return (
        <>
          <Plate editor={firstEditor}>
            <PlateContent />
          </Plate>
          <Plate editor={secondEditor}>
            <PlateContent />
          </Plate>
        </>
      );
    };

    expect(() => render(<Editors />)).not.toThrow();
  });
});
