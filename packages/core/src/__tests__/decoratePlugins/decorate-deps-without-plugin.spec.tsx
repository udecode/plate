import React from 'react';
import { render } from '@testing-library/react';
import { Point } from 'slate';
import { Decorate, SlatePlugins, UseEditableOptions } from '../..';
import { EditablePlugins } from '../../components';

const EditorWithDecorateDeps = ({
  decorate,
  decorateDeps,
}: {
  decorate: UseEditableOptions['decorate'];
  decorateDeps: UseEditableOptions['decorateDeps'];
}) => {
  return (
    <SlatePlugins>
      <EditablePlugins
        data-testid="DecorateDepsWithoutPlugin"
        decorate={decorate}
        decorateDeps={decorateDeps}
      />
    </SlatePlugins>
  );
};

it('should decorate with deps', () => {
  const point: Point = { path: [0, 0], offset: 0 };
  const range = { anchor: point, focus: point };
  const decorate: Decorate = jest.fn(() => [range]);
  const { getAllByTestId } = render(
    <EditorWithDecorateDeps decorate={[decorate]} decorateDeps={[1]} />
  );
  // make sure everything rendered
  expect(getAllByTestId('DecorateDepsWithoutPlugin').length).toBeGreaterThan(0);
  expect(decorate).toHaveBeenCalledTimes(1);
});
