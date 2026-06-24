/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { Plite } from '../components/Plite';
import { createPlateEditor } from '../editor/withPlate';
import { useNodePath } from './useNodePath';

describe('useNodePath', () => {
  it('resolves the initial path from the Plite node store', () => {
    const editor = createPlateEditor({
      value: [
        {
          children: [{ text: 'Body' }],
          type: 'p',
        },
      ] as any,
    });
    const node = editor.children[0] as any;

    const Probe = () => {
      const path = useNodePath(node);

      return <div data-testid="path-probe">{path?.join(',')}</div>;
    };

    const { getByTestId } = render(
      <Plate editor={editor}>
        <Plite>
          <Probe />
        </Plite>
      </Plate>
    );

    expect(getByTestId('path-probe')).toHaveTextContent('0');
  });
});
