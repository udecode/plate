/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { renderHook } from '@testing-library/react-hooks';
import { Editor } from 'slate';
import { useBalloonMove } from 'components/Toolbar/BalloonToolbar/useBalloonMove';

const input1 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const input2 = ((
  <editor>
    <hp>
      <anchor />
      test
      <focus />
    </hp>
  </editor>
) as any) as Editor;

describe('when without selecting, then selecting, then deselecting, then again without ref', () => {
  it('should be', () => {
    let editor = input1;

    const ref: any = {
      current: document.createElement('div'),
    };

    const { rerender } = renderHook(() =>
      useBalloonMove({
        editor,
        ref,
        direction: 'bottom',
      })
    );

    editor = input2;
    rerender();
    expect(1).toBe(1);
  });
});
