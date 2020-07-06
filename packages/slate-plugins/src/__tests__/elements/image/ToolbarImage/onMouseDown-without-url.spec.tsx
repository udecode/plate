import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as SlateReact from 'slate-react';
import { pipe, withToggleType } from '../../../../common';
import { HeadingType } from '../../../../elements/heading/types';
import { ToolbarImage } from '../../../../elements/image/components/ToolbarImage';
import { input, output } from './onMouseDown-without-url.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(window, 'prompt').mockReturnValue('');

  const { getByTestId } = render(
    <ToolbarImage type={HeadingType.H1} icon={null} />
  );

  const element = getByTestId('ToolbarButton');
  fireEvent.mouseDown(element);

  expect(editor.children).toEqual(output.children);
});
