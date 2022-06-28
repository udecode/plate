export const balloonToolbarValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const balloonToolbarValue: any = (
  <fragment>
    <hp>
      This example shows how you can make a hovering menu appear above your
      content, which you can use to make text <htext bold>bold</htext>,{' '}
      <htext italic>italic</htext>, or anything else you might want to do!
    </hp>
    <hp>
      Try it out yourself! Just{' '}
      <htext bold>select any piece of text and the menu will appear</htext>.
    </hp>
    <hp>
      You can enable and customize the tooltip on each toolbar button. Check
      Tippy.js documentation for more info!
    </hp>
  </fragment>
);
`;

export const balloonToolbarValueFile = {
  '/balloon-toolbar/balloonToolbarValue.tsx': balloonToolbarValueCode,
};
