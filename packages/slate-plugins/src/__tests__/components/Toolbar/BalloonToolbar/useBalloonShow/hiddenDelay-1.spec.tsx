/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { renderHook } from '@testing-library/react-hooks';
import { Editor } from 'slate';
import { useBalloonShow } from 'components/Toolbar/BalloonToolbar/useBalloonShow';

const input1 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

describe('when without selecting, then selecting, then deselecting, then again without ref', () => {
  it('should be', () => {
    const editor = input1;

    const ref: any = {
      current: document.createElement('div'),
    };

    const { result } = renderHook(() =>
      useBalloonShow({
        editor,
        ref,
        hiddenDelay: 1,
      })
    );
    expect(result.current[0]).toBe(true);
  });
});
