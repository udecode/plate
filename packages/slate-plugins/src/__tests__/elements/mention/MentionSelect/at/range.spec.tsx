import * as React from 'react';
import { mentionables } from '__tests__/elements/mention/useMention/onKeyDown/mentionables.fixture';
import { render } from '@testing-library/react';
import { MentionSelect } from 'elements/mention/components';
import { PARAGRAPH } from 'elements/paragraph';
import { createEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import * as SlateReact from 'slate-react';

it('should render null', () => {
  const editor = createEditor();
  editor.children = [
    {
      type: PARAGRAPH,
      children: [
        {
          text: '@t2',
        },
      ],
    },
  ];

  editor.selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  };

  jest.spyOn(SlateReact, 'useSlate').mockReturnValue(null as any);
  jest.spyOn(ReactEditor, 'toDOMRange').mockReturnValue({
    getBoundingClientRect: () => ({
      top: 1,
      left: 1,
      width: 100,
    }),
  } as any);

  const { getByTestId } = render(
    <MentionSelect
      data-testid="MentionSelect"
      at={editor.selection}
      options={mentionables}
      valueIndex={0}
      onClickMention={() => {}}
    />
  );

  expect(getByTestId('MentionSelect')).toBeVisible();
});
