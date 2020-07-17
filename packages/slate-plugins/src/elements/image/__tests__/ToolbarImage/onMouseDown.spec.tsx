import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as SlateReact from 'slate-react';
import { withToggleType } from '../../../../common/plugins/withToggleType';
import { pipe } from '../../../../common/utils/pipe';
import { ELEMENT_H1 } from '../../../heading/defaults';
import { ToolbarImage } from '../../components/ToolbarImage';
import { input, output } from './onMouseDown.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest
    .spyOn(window, 'prompt')
    .mockReturnValue('https://i.imgur.com/removed.png');

  const { getByTestId } = render(
    <ToolbarImage type={ELEMENT_H1} icon={null} />
  );

  const element = getByTestId('ToolbarButton');
  fireEvent.mouseDown(element);

  expect(editor.children).toEqual(output.children);
});
