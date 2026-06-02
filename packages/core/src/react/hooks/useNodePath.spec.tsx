/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateSlate } from '../components/PlateSlate';
import { createPlateEditor } from '../editor/withPlate';
import { useNodePath } from './useNodePath';

describe('useNodePath', () => {
  it('resolves the initial path with a single findPath call', () => {
    const editor = createPlateEditor({
      value: [
        {
          children: [{ text: 'Body' }],
          type: 'p',
        },
      ] as any,
    });
    const node = editor.children[0] as any;
    const originalFindPath = editor.api.findPath.bind(editor.api);
    let findPathCalls = 0;

    editor.api.findPath = ((target: any) => {
      findPathCalls += 1;

      return originalFindPath(target);
    }) as any;

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
    expect(findPathCalls).toBe(1);
  });
});
