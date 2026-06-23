/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateSlate } from '../components/PlateSlate';
import { createPlateEditor } from '../editor/withPlate';
import { useNodePath } from './useNodePath';

describe('useNodePath', () => {
  it('resolves the initial path without editor.findPath', () => {
    const editor = createPlateEditor({
      runtime: 'legacy',
      value: [
        {
          children: [{ text: 'Body' }],
          type: 'p',
        },
      ] as any,
    });
    const node = editor.children[0] as any;

    editor.api.findPath = () => {
      throw new Error('unexpected findPath call');
    };

    const Probe = () => {
      const path = useNodePath(node);

      return <div data-testid="path-probe">{path?.join(',')}</div>;
    };

    const { getByTestId } = render(
      <Plate editor={editor}>
        <PlateSlate>
          <Probe />
        </PlateSlate>
      </Plate>
    );

    expect(getByTestId('path-probe')).toHaveTextContent('0');
  });
});
