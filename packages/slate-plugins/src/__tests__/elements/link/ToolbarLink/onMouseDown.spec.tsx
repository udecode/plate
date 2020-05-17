import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { pipe } from 'common';
import { ToolbarLink, withLink } from 'elements/link';
import * as SlateReact from 'slate-react';
import { withReact } from 'slate-react';
import { input, output } from './onMouseDown.fixture';

it('should render', () => {
  const editor = pipe(input, withReact, withLink());

  jest.spyOn(SlateReact, 'useSlate').mockReturnValue(editor as any);
  jest
    .spyOn(window, 'prompt')
    .mockReturnValue('https://i.imgur.com/removed.png');

  const { getByTestId } = render(
    <ToolbarLink data-testid="ToolbarLink" icon={null} />
  );

  const element = getByTestId('ToolbarLink');
  fireEvent.mouseDown(element);

  expect(editor.children).toEqual(output.children);
});
