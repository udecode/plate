import React from 'react';
import { render } from '@testing-library/react';
import { Point } from 'slate';
import { Decorate, SlatePlugin, SlatePlugins, UseEditableOptions } from '../..';
import { EditablePlugins } from '../../components';

const EditorWithDecorateDeps = ({
  decorate,
  decorateDeps,
  plugins,
}: {
  decorate: UseEditableOptions['decorate'];
  decorateDeps: UseEditableOptions['decorateDeps'];
  plugins: UseEditableOptions['plugins'];
}) => {
  return (
    <SlatePlugins>
      <EditablePlugins
        data-testid="DecorateDeps"
        decorate={decorate}
        decorateDeps={decorateDeps}
        plugins={plugins}
      />
    </SlatePlugins>
  );
};

it('should decorate with deps', () => {
  const point: Point = { path: [0, 0], offset: 0 };
  const range = { anchor: point, focus: point };
  const decorate: Decorate = jest.fn(() => [range]);

  const plugins: SlatePlugin[] = [
    {
      decorateDeps: [1],
    },
  ];

  const { getAllByTestId } = render(
    <EditorWithDecorateDeps
      decorate={[decorate]}
      decorateDeps={[1]}
      plugins={plugins}
    />
  );
  // make sure everything rendered
  expect(getAllByTestId('DecorateDeps').length).toBeGreaterThan(0);
  expect(decorate).toHaveBeenCalledTimes(1);
});
