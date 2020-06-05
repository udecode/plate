/** @jsx jsx */
import { jsx } from '__test-utils__/jsx';
import { act, renderHook } from '@testing-library/react-hooks';
import { pipe } from 'common/utils/pipe';
import { useMention } from 'elements/mention';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const withPlugins = [withReact, withHistory] as const;

it('should do nothing', () => {
  const editor = pipe(input, ...withPlugins);

  const { result } = renderHook(() => useMention());

  act(() => {
    result.current.onChangeMention(editor);
  });

  expect(result.current.index).toBe(0);
});
