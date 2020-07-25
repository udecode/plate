import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ReactEditor } from 'slate-react';
import * as SlateReact from 'slate-react';
import { withToggleType } from '../../../../common/plugins/toggle-type/withToggleType';
import { pipe } from '../../../../common/utils/pipe';
import { TodoListElement } from '../../components/TodoListElement';
import { ELEMENT_TODO_LI } from '../../defaults';
import { input, output } from './onChange.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

  const { getByTestId } = render(
    <TodoListElement
      data-testid="TodoListElementCheckbox"
      attributes={{} as any}
      element={{
        type: ELEMENT_TODO_LI,
        checked: false,
        children: [{ text: 'test' }],
      }}
    >
      test
    </TodoListElement>
  );

  const element = getByTestId('TodoListElementCheckbox');
  fireEvent.click(element);

  expect(editor.children).toEqual(output.children);
});
