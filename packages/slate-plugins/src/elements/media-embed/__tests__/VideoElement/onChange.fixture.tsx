/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";

export const input = ((
  <editor>
    <hembed url="test" />
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hembed url="change">
      <cursor />
    </hembed>
  </editor>
) as any;
