/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";

export const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;
