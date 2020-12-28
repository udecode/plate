/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { ParagraphPlugin } from "../../../../elements/paragraph/index";
import { BoldPlugin } from "../../../../marks/bold/index";
import { ItalicPlugin } from "../../../../marks/italic/index";
import { deserializeHTMLToMarks } from "../../utils/index";

const input = {
  plugins: [ParagraphPlugin(), BoldPlugin(), ItalicPlugin()],
  element: document.createElement("strong"),
  children: [
    <hli>
      <hp>test</hp>test
    </hli>,
    null,
  ],
};

const output = (
  <fragment>
    <hli>
      <hp>
        <htext bold>test</htext>
      </hp>
      <htext bold>test</htext>
    </hli>
  </fragment>
);

it("should be", () => {
  expect(deserializeHTMLToMarks(input as any)).toEqual(output);
});
