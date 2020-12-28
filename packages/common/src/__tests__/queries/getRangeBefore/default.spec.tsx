/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { getRangeBefore } from "../../../queries/getRangeBefore";

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = {
  anchor: {
    offset: 3,
    path: [0, 0],
  },
  focus: {
    offset: 4,
    path: [0, 0],
  },
};

it("should be", () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
