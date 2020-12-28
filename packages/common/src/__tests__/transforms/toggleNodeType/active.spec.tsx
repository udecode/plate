/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { ELEMENT_BLOCKQUOTE } from "../../../constants";
import { toggleNodeType } from "../../../transforms/toggleNodeType";

const input = ((
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it("should be", () => {
  toggleNodeType(input, { activeType: ELEMENT_BLOCKQUOTE });

  expect(input.children).toEqual(output.children);
});
