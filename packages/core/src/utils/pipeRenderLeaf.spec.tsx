import React from 'react';
import { render } from '@testing-library/react';
import { createPlateUIEditor } from 'packages/ui/plate/src/utils/createPlateUIEditor';
import { pipeRenderLeaf } from './pipeRenderLeaf';

const attributes = {
  'data-testid': 'Leaf',
  'data-slate-leaf': true,
} as any;

const text = { text: 'test' };

it('should render the default leaf', () => {
  const Leaf = pipeRenderLeaf(createPlateUIEditor({ plugins: [] }))!;

  const { getByTestId } = render(
    <Leaf attributes={attributes} leaf={text} text={text}>
      text
    </Leaf>
  );

  expect(getByTestId('Leaf')).toHaveAttribute('data-slate-leaf', 'true');
});
