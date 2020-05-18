import React from 'react';
import {
  input,
  output,
} from '__tests__/element/ToolbarBlock/onMouseDown.fixture';
import { fireEvent, render } from '@testing-library/react';
import { pipe } from 'common';
import { withBlock } from 'element';
import { ToolbarBlock } from 'element/components';
import { HeadingType } from 'elements/heading';
import * as SlateReact from 'slate-react';

it('should render', () => {
  const editor = pipe(input, withBlock());

  jest.spyOn(SlateReact, 'useSlate').mockReturnValue(editor as any);

  const { getByTestId } = render(
    <ToolbarBlock
      data-testid="ToolbarBlock"
      type={HeadingType.H1}
      icon={null}
    />
  );

  const element = getByTestId('ToolbarBlock');
  fireEvent.mouseDown(element);

  expect(editor.children).toEqual(output.children);
});
