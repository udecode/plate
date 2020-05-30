import * as React from 'react';
import { render } from '@testing-library/react';
import { MENTION } from 'elements/mention';
import { MentionElement } from 'elements/mention/components';
import * as SlateReact from 'slate-react';

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
        type: MENTION,
        children: [{ text: 'test' }],
        value: 't2',
      }}
    >
      @t2
    </MentionElement>
  );

  expect(getByTestId('MentionElement')).toBeVisible();
});
