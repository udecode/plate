/** @jsx jsx */

import { SlatePlugin } from "@udecode/slate-plugins-core";
import { getHtmlDocument, jsx } from "@udecode/slate-plugins-test-utils";
import { ParagraphPlugin } from "../../../../elements/paragraph/index";
import { deserializeHTMLToDocumentFragment } from "../../utils/index";

const html = "<p>first</p><p>second</p>";
const input1: SlatePlugin[] = [ParagraphPlugin()];
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <hp>first</hp>
    <hp>second</hp>
  </fragment>
) as any;

it("should have the break line", () => {
  expect(
    deserializeHTMLToDocumentFragment({
      plugins: input1,
      element: input2,
    })
  ).toEqual(output);
});
