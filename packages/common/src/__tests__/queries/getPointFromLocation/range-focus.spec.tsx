/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { getPointFromLocation } from "../../../queries/getPointFromLocation";

const input = ((
  <editor>
    <hp>
      tes
      <anchor />
      tt
      <focus />
    </hp>
  </editor>
) as any) as Editor;

const output = {
  offset: 5,
  path: [0, 0],
};

it("should be", () => {
  expect(getPointFromLocation(input, { focus: true })).toEqual(output);
});
