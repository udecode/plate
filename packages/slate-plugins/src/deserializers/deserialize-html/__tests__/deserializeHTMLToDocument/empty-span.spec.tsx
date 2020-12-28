/** @jsx jsx */

import { SlatePlugin } from "@udecode/slate-plugins-core/src";
import { jsx } from "@udecode/slate-plugins-test-utils";
import { deserializeHTMLToDocument } from "../../index";

const plugins: SlatePlugin[] = [];
const body = document.createElement("span");

const output = (
  <fragment>
    <block>
      <htext />
    </block>
  </fragment>
) as any;

it("should be", () => {
  expect(
    deserializeHTMLToDocument({
      plugins,
      element: body,
    })
  ).toEqual(output);
});
