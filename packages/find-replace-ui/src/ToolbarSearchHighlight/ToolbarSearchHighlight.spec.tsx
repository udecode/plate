import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ToolbarSearchHighlight } from './ToolbarSearchHighlight';

it('should render', () => {
  const setSearch = jest.fn();

  const { getByTestId } = render(
    <ToolbarSearchHighlight icon="Search" setSearch={setSearch} />
  );

  fireEvent.change(getByTestId('ToolbarSearchHighlightInput'), {
    target: { value: 'test' },
  });

  expect(setSearch).toBeCalled();
});
