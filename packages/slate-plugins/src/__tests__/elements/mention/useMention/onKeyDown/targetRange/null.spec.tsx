/** @jsx jsx */
import { jsx } from '__test-utils__/jsx';
import { act, renderHook } from '@testing-library/react-hooks';
import { useMention } from 'elements/mention';
import { Editor } from 'slate';

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

it('should be', () => {
  const { result } = renderHook(() => useMention());

  act(() => {
    result.current.onKeyDownMention(new KeyboardEvent('ArrowDown'), input);
  });

  expect(result.current.index).toBe(0);
});
