/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Ancestor, Editor, NodeEntry, Path } from "slate";
import { getNodeById } from "../queries/getNodeById";
import { moveChildren } from "./moveChildren";

const input = ((
  <editor>
    <hul>
      <hli>
        <hp>11</hp>
      </hli>
      <hli id="12">
        <hp>12</hp>
      </hli>
    </hul>
    <hul id="2">
      <hli>
        <hp>21</hp>
      </hli>
      <hli>
        <hp>22</hp>
      </hli>
    </hul>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hul>
      <hli>
        <hp>11</hp>
      </hli>
      <hli id="12">
        <hp>12</hp>
      </hli>
      <hli>
        <hp>21</hp>
      </hli>
      <hli>
        <hp>22</hp>
      </hli>
    </hul>
    <hul id="2">
      <htext />
    </hul>
  </editor>
) as any) as Editor;

it("should be", () => {
  const [, atPath] = getNodeById(input, "2") as NodeEntry<Ancestor>;
  const [, toPath] = getNodeById(input, "12") as any;

  const moved = moveChildren(input, { at: atPath, to: Path.next(toPath) });

  expect(input.children).toEqual(output.children);
  expect(moved).toBe(2);
});
