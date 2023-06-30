import React from 'react';
import { render } from '@testing-library/react';

import { createPlateEditor } from './createPlateEditor';
import { pipeRenderLeaf } from './pipeRenderLeaf';

const attributes = {
  'data-testid': 'Leaf',
  'data-slate-leaf': true,
} as any;

const text = { text: 'test' };

it('should render the default leaf', () => {
  const Leaf = pipeRenderLeaf(createPlateEditor({ plugins: [] }))!;

  const { getByTestId } = render(
    <Leaf attributes={attributes} leaf={text} text={text}>
      text
    </Leaf>
  );

  expect(getByTestId('Leaf')).toHaveAttribute('data-slate-leaf', 'true');
});
