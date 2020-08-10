import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as SlateReact from 'slate-react';
import { withToggleType } from '../../../../common/plugins/toggle-type/withToggleType';
import { pipe } from '../../../../common/utils/pipe';
import { ELEMENT_H1 } from '../../../heading/defaults';
import { ToolbarLink } from '../../components/ToolbarLink';
// import { input, output } from './onMouseDown-with-url.fixture';
import { input } from './onMouseDown-with-url.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useSlate').mockReturnValue(editor as any);
  const prompt = jest
    .spyOn(window, 'prompt')
    .mockReturnValue('https://i.imgur.com/changed.png');

  const { getByTestId } = render(<ToolbarLink type={ELEMENT_H1} icon={null} />);

  const element = getByTestId('ToolbarButton');
  fireEvent.mouseDown(element);

  expect(prompt).toHaveBeenCalledWith(
    'Enter the URL of the link:',
    'https://i.imgur.com/removed.png'
  );

  // expect(editor.children).toEqual(output.children)
});
