import * as React from 'react';
import { render } from '@testing-library/react';
import * as SlateReact from 'slate-react';
import { MentionSelect } from '../../../components/index';
import { mentionables } from '../../useMention/onKeyDown/mentionables.fixture';

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
