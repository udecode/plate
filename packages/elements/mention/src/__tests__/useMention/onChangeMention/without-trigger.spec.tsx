/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { withSlatePlugins } from '@udecode/slate-plugins-core';
jsx;
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { pipe } from '../../../../../../slate-plugins/src/pipe/pipe';
import { useMentionPlugin } from '../../../useMentionPlugin';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

it('should do nothing', () => {
  const editor = pipe(input, withSlatePlugins());

  const { result } = renderHook(() => useMentionPlugin());

  act(() => {
    result.current.plugin.onChange?.(editor)([]);
  });

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
