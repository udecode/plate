import React from 'react';
import { Search } from '@styled-icons/material';
import { fireEvent, render } from '@testing-library/react';
import { SearchHighlightToolbar } from './SearchHighlightToolbar';

it('should render', () => {
  const setSearch = jest.fn();

  const { getByTestId } = render(
    <SearchHighlightToolbar icon={Search} setSearch={setSearch} />
  );

  fireEvent.change(getByTestId('ToolbarSearchHighlightInput'), {
    target: { value: 'test' },
  });

  expect(setSearch).toBeCalled();
});
