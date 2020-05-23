import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { pipe } from 'common';
import { withToggleType } from 'element';
import { HeadingType } from 'elements/heading';
import { ToolbarImage } from 'elements/image/components';
import * as SlateReact from 'slate-react';
import { input, output } from './onMouseDown.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest
    .spyOn(window, 'prompt')
    .mockReturnValue('https://i.imgur.com/removed.png');

  const { getByTestId } = render(
    <ToolbarImage
      data-testid="ToolbarImage"
      type={HeadingType.H1}
      icon={null}
    />
  );

  const element = getByTestId('ToolbarImage');
  fireEvent.mouseDown(element);

  expect(editor.children).toEqual(output.children);
});
