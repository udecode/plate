/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { onKeyDownExitBreak } from "../../index";

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent("keydown");

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it("should be", () => {
  onKeyDownExitBreak()(event, input);
  expect(input.children).toEqual(output.children);
});
