export const findReplaceValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const findReplaceValue: any = (
  <fragment>
    <hp>
      This is editable text that you can search. As you search, it looks for
      matching strings of text, and adds <htext bold>decorations</htext> to them
      in realtime.
    </hp>
    <hp>Try it out for yourself by typing in the search box above!</hp>
  </fragment>
);
`;

export const findReplaceValueFile = {
  '/find-replace/findReplaceValue.tsx': findReplaceValueCode,
};
