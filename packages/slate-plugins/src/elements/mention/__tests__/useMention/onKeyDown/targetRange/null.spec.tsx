/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
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
