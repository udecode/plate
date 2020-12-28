/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";
import { Editor } from "slate";

export const input = ((
  <editor>
    <hp>
      <ha url="https://i.imgur.com/removed.png">
        <cursor />
        https://i.imgur.com/removed.png
      </ha>
    </hp>
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hp>
      <ha url="https://i.imgur.com/changed.png">
        <cursor />
        https://i.imgur.com/removed.png
      </ha>
    </hp>
  </editor>
) as any;
