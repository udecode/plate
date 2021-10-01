/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { withPlate } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { pipe } from '../../../../../../plate/src/pipe/pipe';
import { createMentionPlugin } from '../../../createMentionPlugin';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

it('should do nothing', () => {
  const editor = pipe(input, withPlate());

  const { result } = renderHook(() => createMentionPlugin());

  act(() => {
    result.current.plugin.onChange?.(editor)([]);
  });

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
