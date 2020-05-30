import * as React from 'react';
import { render } from '@testing-library/react';
import { renderLeafPlugins } from 'components/EditablePlugins/utils';

const attributes = {
  'data-testid': 'Leaf',
  'data-slate-leaf': true,
} as any;

const text = { text: 'test' };

it('should render the default leaf', () => {
  // TODO: Error: Uncaught [TypeError: Cannot assign to read only property 'children' of object '#<Object>']
  const Leaf = renderLeafPlugins([], []);

  const { getByTestId } = render(
    <Leaf attributes={attributes} leaf={text} text={text}>
      text
    </Leaf>
  );

  expect(getByTestId('Leaf')).toHaveAttribute('data-slate-leaf', 'true');
});
