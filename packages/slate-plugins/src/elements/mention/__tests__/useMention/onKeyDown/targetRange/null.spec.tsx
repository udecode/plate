/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { Editor } from 'slate';
import { jsx } from '../../../../../../__test-utils__/jsx';
import { useMention } from '../../../../index';

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
