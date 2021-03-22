/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { pipe } from '../../../../../../slate-plugins/src/pipe/pipe';
import { useMentionPlugin } from '../../../useMentionPlugin';
import { mentionables } from './mentionables.fixture';

const input = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const withOverrides = [withReact, withHistory] as const;

it('should go down', () => {
  const editor = pipe(input, ...withOverrides);

  const { result } = renderHook(() => useMentionPlugin({ mentionables }));

  act(() => {
    result.current.onChange?.(editor)([]);
  });

  act(() => {
    result.current.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'a' })
    );
  });

  expect(result.current.getMentionSelectProps().at).toBeDefined();
});
