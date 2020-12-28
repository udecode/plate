/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { pipe } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { useMention } from '../../../index';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
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
