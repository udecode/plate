export const forcedLayoutValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const forcedLayoutValue: any = (
  <fragment>
    <hh1>Plate</hh1>
    <hp>
      This example shows how to enforce your layout with domain-specific
      constraints. This document will always have a title block at the top and a
      trailing paragraph. Try deleting them and see what happens!
    </hp>
    <hp>
      Slate editors can edit complex, nested data structures. And for the most
      part this is great. But in certain cases inconsistencies in the data
      structure can be introduced—most often when allowing a user to paste
      arbitrary richtext content.
    </hp>
    <hp>
      "Normalizing" is how you can ensure that your editor's content is always
      of a certain shape. It's similar to "validating", except instead of just
      determining whether the content is valid or invalid, its job is to fix the
      content to make it valid again.
    </hp>
  </fragment>
);
`;

export const forcedLayoutValueFile = {
  '/forced-layout/forcedLayoutValue.tsx': forcedLayoutValueCode,
};
