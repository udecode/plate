/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const mentionValue: any = (
  <fragment>
    <hh2>💬 Mention</hh2>
    <hp>
      This example shows how you might implement a simple @-mentions feature
      that lets users autocomplete mentioning a user by their username. Which,
      in this case means Star Wars characters. The mentions are rendered as void
      inline elements inside the document.
    </hp>
    <hp>
      Try mentioning characters, like{' '}
      <hmention value="R2-D2">
        <htext />
      </hmention>{' '}
      or{' '}
      <hmention value="Mace Windu">
        <htext />
      </hmention>
      <htext />
    </hp>
  </fragment>
);
