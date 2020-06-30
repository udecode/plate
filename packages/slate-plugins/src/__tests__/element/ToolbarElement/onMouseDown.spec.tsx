import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as SlateReact from 'slate-react';
import { pipe } from '../../../common';
import { withToggleType } from '../../../element';
import { ToolbarElement } from '../../../element/components';
import { HeadingType } from '../../../elements/heading';
import { input, output } from './onMouseDown.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useSlate').mockReturnValue(editor as any);

  const { getByTestId } = render(
    <ToolbarElement type={HeadingType.H1} icon={null} />
  );

  const element = getByTestId('ToolbarButton');
  fireEvent.mouseDown(element);

  expect(editor.children).toEqual(output.children);
});
