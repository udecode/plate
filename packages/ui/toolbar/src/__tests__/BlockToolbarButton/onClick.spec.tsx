import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as core from '@udecode/plate-core';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { BlockToolbarButton } from '../../BlockToolbarButton/BlockToolbarButton';
import { input, output } from './onMouseDown.fixture';

it('should render', () => {
  const editor = input;
  jest.spyOn(core, 'usePlateEditorState').mockReturnValue(editor as any);

  const { getByTestId } = render(
    <BlockToolbarButton type={ELEMENT_H1} icon={null} />
  );

  const element = getByTestId('ToolbarButton');
  fireEvent.click(element);

  expect(editor.children).toEqual(output.children);
});
