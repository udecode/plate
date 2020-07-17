import * as React from 'react';
import { render } from '@testing-library/react';
import * as SlateReact from 'slate-react';
import { MentionElement } from '../../components/index';
import { ELEMENT_MENTION } from '../../index';

it('should render', () => {
  jest.spyOn(SlateReact, 'useSelected').mockReturnValue(true);
  jest.spyOn(SlateReact, 'useFocused').mockReturnValue(true);

  const { getByTestId } = render(
    <MentionElement
      attributes={
        {
          'data-testid': 'MentionElement',
        } as any
      }
      element={{
        type: ELEMENT_MENTION,
        children: [{ text: 'test' }],
        value: 't2',
      }}
    >
      @t2
    </MentionElement>
  );

  expect(getByTestId('MentionElement')).toBeVisible();
});
