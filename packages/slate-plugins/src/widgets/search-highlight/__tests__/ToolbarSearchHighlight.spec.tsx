import * as React from 'react';
import { Search } from '@styled-icons/material';
import { fireEvent, render } from '@testing-library/react';
import { ToolbarSearchHighlight } from '../components/index';

it('should render', () => {
  const setSearch = jest.fn();

  const { getByTestId } = render(
    <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
  );

  fireEvent.change(getByTestId('ToolbarSearchHighlightInput'), {
    target: { value: 'test' },
  });

  expect(setSearch).toBeCalled();
});
