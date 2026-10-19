/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const findValue: Value = (
  <fragment>
    <hp>
      This is editable text that you can search. Find highlights every matching
      string without writing marks into the document.
    </hp>
    <hp>Press Mod+F, then use Enter or Shift+Enter to move between matches.</hp>
  </fragment>
);
