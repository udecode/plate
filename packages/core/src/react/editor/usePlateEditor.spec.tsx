import React from 'react';

import type { Value } from '@platejs/slate';

import { render } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateContent } from '../components/PlateContent';
import { usePlateEditor } from './usePlateEditor';

describe('usePlateEditor', () => {
  it('isolates a shared static value between editor instances', () => {
    const value: Value = [
      {
        children: [{ text: 'Shared text' }],
        text: 'Element metadata',
        type: 'p',
      },
    ];
    let firstValue: Value | undefined;
    let secondValue: Value | undefined;

    const Editors = () => {
      const firstEditor = usePlateEditor({ value });
      const secondEditor = usePlateEditor({ value });

      firstValue = firstEditor.children;
      secondValue = secondEditor.children;

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
    expect(firstValue).not.toBe(value);
    expect(secondValue).not.toBe(value);
    expect(firstValue).not.toBe(secondValue);
    expect(firstValue![0]).not.toBe(secondValue![0]);
    expect(firstValue![0].children).not.toBe(secondValue![0].children);
    expect(firstValue![0].children[0]).not.toBe(secondValue![0].children[0]);
  });
});
