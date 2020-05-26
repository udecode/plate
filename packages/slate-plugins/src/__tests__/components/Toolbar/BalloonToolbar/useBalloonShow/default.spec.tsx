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

    let ref: any = {
      current: document.createElement('div'),
    };

    const { result, rerender } = renderHook(() =>
      useBalloonShow({
        editor,
        ref,
        hiddenDelay: 0,
      })
    );
    expect(result.current[0]).toBe(true);

    editor = input2;
    rerender();
    expect(result.current[0]).toBe(false);

    editor = input1;
    rerender();
    expect(result.current[0]).toBe(true);

    editor = input2;
    rerender();
    expect(result.current[0]).toBe(false);

    editor = input1;
    ref = {};
    rerender();
    expect(result.current[0]).toBe(true);
  });
});
