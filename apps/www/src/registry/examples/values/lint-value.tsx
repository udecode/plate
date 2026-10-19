/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const lintValue: Value = (
  <fragment>
    <hheading level={2}>Linting</hheading>
    <hp>
      This editor really checks each paragraph while you type. Filler words get
      a wavy underline , and so does a space before a comma.
    </hp>
    <hp>
      Put the caret on an underlined word to see its fixes, or press F8 and
      Shift+F8 to move between findings. Each fix is basically one undo step.
    </hp>
    <hp>
      Check with server adds a slower rule that flags e-mail and web site, and
      its answer arrives after a short delay.
    </hp>
    <hblockquote>
      Quotes are really checked too , like any paragraph.
    </hblockquote>
    <hp>Code blocks are skipped:</hp>
    <hcodeblock language="javascript">
      {'const really = true , very = false; // e-mail'}
    </hcodeblock>
  </fragment>
);
