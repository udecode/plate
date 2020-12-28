/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { isCollapsed } from "../../../queries/isCollapsed";

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = true;

it("should be", () => {
  expect(isCollapsed(input.selection)).toBe(output);
});
