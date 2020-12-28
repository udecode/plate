/** @jsx jsx */
import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";
import { isTextByPath } from "../../../queries/isTextByPath";

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const path = [0];

const output = false;

it("should be", () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
