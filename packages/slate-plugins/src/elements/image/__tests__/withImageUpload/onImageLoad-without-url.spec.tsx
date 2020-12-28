/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { onImageLoad } from "../../../index";

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const reader = {
  result: "",
};

const output = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

it("should be", () => {
  onImageLoad(input, reader as any)();
  expect(input.children).toEqual(output.children);
});
