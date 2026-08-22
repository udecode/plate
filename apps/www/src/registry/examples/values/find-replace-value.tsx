/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const findReplaceValue: Value = (
  <fragment>
    <hp>
      This is editable text that you can search. As you search, it looks for
      matching strings of text, and adds <htext bold>decorations</htext> to them
      in realtime.
    </hp>
    <hp>Try it out for yourself by typing in the search box above!</hp>
  </fragment>
);
