/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { getNode } from "../../../queries/index";

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

it("should be", () => {
  expect(getNode(input, [0, 0, 0])).toBeNull();
});
