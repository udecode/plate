/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { MARK_BOLD } from "../../../constants";
import { isMarkActive } from "../../../queries/isMarkActive";

const input = (
  <editor>
    <hp>
      tes
      <htext bold>t</htext>
      <cursor />
    </hp>
  </editor>
) as any;

it("should be", () => {
  expect(isMarkActive(input, MARK_BOLD)).toEqual(true);
});
