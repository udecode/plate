import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ReactEditor } from 'slate-react';
import * as SlateReact from 'slate-react';
import { withToggleType } from '../../../../common/plugins/withToggleType';
import { pipe } from '../../../../common/utils/pipe';
import { ActionItemElement } from '../../../../elements/action-item/components/ActionItemElement';
import { ACTION_ITEM } from '../../../../elements/action-item/types';
import { input, output } from './onChange.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

  const { getByTestId } = render(
    <ActionItemElement
      data-testid="ActionItemElementCheckbox"
      attributes={{} as any}
      element={{
        type: ACTION_ITEM,
        checked: false,
        children: [{ text: 'test' }],
      }}
    >
      test
    </ActionItemElement>
  );

  const element = getByTestId('ActionItemElementCheckbox');
  fireEvent.click(element);

  expect(editor.children).toEqual(output.children);
});
