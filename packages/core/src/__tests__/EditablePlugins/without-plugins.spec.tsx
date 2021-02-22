import React from 'react';
import { render } from '@testing-library/react';
import { EditablePlugins } from '../../components';
import { SlatePlugins } from '../../components/SlatePlugins';

const EditorEmpty = () => {
  return (
    <SlatePlugins>
      <EditablePlugins data-testid="EditablePlugins" />
    </SlatePlugins>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<EditorEmpty />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});
