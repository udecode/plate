/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { ELEMENT_ALIGN_CENTER } from "../../defaults";
import { upsertAlign } from "../../transforms/upsertAlign";

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hcenter>
      <hp>test</hp>
    </hcenter>
  </editor>
) as any) as Editor;

it("should align center", () => {
  upsertAlign(input, { type: ELEMENT_ALIGN_CENTER });

  expect(input.children).toEqual(output.children);
});
