/** @jsx jsx */

import { getNodeById } from "@udecode/slate-plugins-common";
import { jsx } from "@udecode/slate-plugins-test-utils";
import { isListNested } from "./isListNested";

describe("when the list is nested", () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hp>2</hp>
          <hul id="21">
            <hli>
              <hp>21</hp>
            </hli>
            <hli>
              <hp>
                22
                <cursor />
              </hp>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  it("should be", () => {
    const list = getNodeById(input, "21");

    expect(isListNested(input, list[1] as any)).toBeTruthy();
  });
});

describe("when the list is not nested", () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hp>2</hp>
        </hli>
      </hul>
    </editor>
  ) as any;

  it("should be", () => {
    const list = getNodeById(input, "1");

    expect(isListNested(input, list[1] as any)).toBeFalsy();
  });
});
