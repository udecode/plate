/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { pipe } from '../../../../../../pipe/pipe';
import { withInlineVoid } from '../../../../../../plugins/withInlineVoid/withInlineVoid';
import { ELEMENT_MENTION } from '../../../../defaults';
import { useMention } from '../../../../useMention';
import { mentionables } from '../mentionables.fixture';

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

const withOverrides = [
  withReact,
  withHistory,
  withInlineVoid({
    inlineTypes: [ELEMENT_MENTION],
    voidTypes: [ELEMENT_MENTION],
  }),
] as const;

it('should go down', () => {
  const editor = pipe(input, ...withOverrides);

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
