/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { getRangeFromBlockStart } from "../../../queries/index";

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const output = undefined;

it("should be", () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
