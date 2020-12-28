/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { pipe } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { useMention } from '../../../../index';
import { mentionables } from '../mentionables.fixture';

const input = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const withPlugins = [withReact, withHistory] as const;

it('should go down', () => {
  const editor = pipe(input, ...withPlugins);

  const { result } = renderHook(() => useMention(mentionables));

  act(() => {
    result.current.onChangeMention(editor);
  });

  act(() => {
    result.current.onKeyDownMention(
      new KeyboardEvent('keydown', { key: 'ArrowUp' }),
      editor
    );
  });

  expect(result.current.index).toBe(2);
});
