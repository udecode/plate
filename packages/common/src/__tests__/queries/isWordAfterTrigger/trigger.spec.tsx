/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor, Range } from "slate";
import { isWordAfterTrigger } from "../../../queries/index";

const input = ((
  <editor>
    <hp>
      @test
      <cursor /> test2
    </hp>
  </editor>
) as any) as Editor;

const at = Range.start(input.selection as Range);

const output = "test";

it("should be", () => {
  expect(isWordAfterTrigger(input, { at, trigger: "@" }).match?.[1]).toBe(
    output
  );
});
