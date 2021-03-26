/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
jsx;
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { pipe } from '../../../../../../slate-plugins/src/pipe/pipe';
import { useMentionPlugin } from '../../../useMentionPlugin';

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
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const withOverrides = [withReact, withHistory] as const;

it('should do nothing', () => {
  const editor = pipe(input, ...withOverrides);

  const { result } = renderHook(() => useMentionPlugin());

  act(() => {
    result.current
      .getMentionSelectProps()
      .onClickMention?.(editor, { value: 't22' });
  });

  expect(input.children).toEqual(output.children);
});
