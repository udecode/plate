/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
jsx;
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { useMentionPlugin } from '../../../../useMentionPlugin';

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

it('should be', () => {
  const { result } = renderHook(() => useMentionPlugin());

  act(() => {
    result.current.plugin.onKeyDown?.(input)(new KeyboardEvent('ArrowDown'));
  });

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
