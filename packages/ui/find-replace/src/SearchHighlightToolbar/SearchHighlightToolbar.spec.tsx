import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Icons } from 'examples/src/common/icons';
import { SearchHighlightToolbar } from './SearchHighlightToolbar';

it('should render', () => {
  const setSearch = jest.fn();

  const { getByTestId } = render(
    <SearchHighlightToolbar icon={Icons.search} setSearch={setSearch} />
  );

  fireEvent.change(getByTestId('ToolbarSearchHighlightInput'), {
    target: { value: 'test' },
  });

  expect(setSearch).toHaveBeenCalled();
});
