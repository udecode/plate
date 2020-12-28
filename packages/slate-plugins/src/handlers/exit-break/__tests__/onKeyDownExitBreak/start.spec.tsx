/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import * as isHotkey from "is-hotkey";
import { onKeyDownExitBreak } from "../../index";

const input = (
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent("keydown");

const output = (
  <editor>
    <hp>
      <htext />
      <cursor />
    </hp>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

it("should be", () => {
  jest.spyOn(isHotkey, "default").mockReturnValue(true);
  onKeyDownExitBreak({
    rules: [{ hotkey: "enter", level: 0, query: { start: true, end: true } }],
  })(event, input);
  expect(input.children).toEqual(output.children);
  expect(input.selection?.anchor).toEqual({ offset: 0, path: [1, 0] });
});
