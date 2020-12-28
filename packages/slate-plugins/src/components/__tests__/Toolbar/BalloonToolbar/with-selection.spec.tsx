import { render } from "@testing-library/react";
import { SlateDocument } from "@udecode/slate-plugins-common";
import * as React from "react";
import { useState } from "react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Slate, withReact } from "slate-react";
import { BalloonToolbar } from "../../../Toolbar/index";

const Editor = () => {
  const [value, setValue] = useState<SlateDocument>([
    { children: [{ text: "test" }] },
  ]);

  const editor = withHistory(withReact(createEditor()));

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue as SlateDocument);
      }}
    >
      <BalloonToolbar>test</BalloonToolbar>
    </Slate>
  );
};

it("should not be visible", () => {
  const { getByTestId } = render(<Editor />);

  expect(getByTestId("Toolbar")).not.toBeVisible();
});
