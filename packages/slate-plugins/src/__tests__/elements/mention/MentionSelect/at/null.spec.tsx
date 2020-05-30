import * as React from 'react';
import { mentionables } from '__tests__/elements/mention/useMention/onKeyDown/mentionables.fixture';
import { render } from '@testing-library/react';
import { MentionSelect } from 'elements/mention/components';
import * as SlateReact from 'slate-react';

it('should render null', () => {
  jest.spyOn(SlateReact, 'useSlate').mockReturnValue(null as any);

  const { queryByTestId } = render(
    <MentionSelect
      data-testid="MentionSelect"
      at={null}
      options={mentionables}
      valueIndex={0}
      onClickMention={() => {}}
    />
  );

  expect(queryByTestId('MentionSelect')).toBeNull();
});
