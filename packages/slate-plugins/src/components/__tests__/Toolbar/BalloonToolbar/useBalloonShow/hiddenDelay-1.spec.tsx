/** @jsx jsx */

import { renderHook } from "@testing-library/react-hooks";
import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { useBalloonShow } from "../../../../Toolbar/BalloonToolbar/useBalloonShow";

const input1 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

describe("when without selecting, then selecting, then deselecting, then again without ref", () => {
  it("should be", () => {
    const editor = input1;

    const ref: any = {
      current: document.createElement("div"),
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
