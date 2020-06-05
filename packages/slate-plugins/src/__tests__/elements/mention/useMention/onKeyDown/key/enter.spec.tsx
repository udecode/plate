/** @jsx jsx */
import { jsx } from '__test-utils__/jsx';
import { mentionables } from '__tests__/elements/mention/useMention/onKeyDown/mentionables.fixture';
import { act, renderHook } from '@testing-library/react-hooks';
import { pipe } from 'common/utils/pipe';
import { MENTION, useMention } from 'elements/mention';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { withInlineVoid } from '../../../../../../element';

const input = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hp>
      t1{' '}
      <hmention value="t2">
        <htext />
      </hmention>
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const withPlugins = [
  withReact,
  withHistory,
  withInlineVoid({ inlineTypes: [MENTION], voidTypes: [MENTION] }),
] as const;

it('should go down', () => {
  const editor = pipe(input, ...withPlugins);

  const { result } = renderHook(() => useMention(mentionables));

  act(() => {
    result.current.onChangeMention(editor);
  });

  act(() => {
    result.current.onKeyDownMention(
      new KeyboardEvent('keydown', { key: 'Enter' }),
      editor
    );
  });

  expect(input.children).toEqual(output.children);
  expect(result.current.target).toEqual(null);
});
