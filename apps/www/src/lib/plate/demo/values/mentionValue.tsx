/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const mentionValue: any = (
  <fragment>
    <hh2>＠ Mention</hh2>
    <hp>
      Mention and reference other users or entities within your text using
      @-mentions.
    </hp>
    <hp>
      Try mentioning
      <hmention value="R2-D2">
        <htext />
      </hmention>{' '}
      or{' '}
      <hmention value="Mace Windu">
        <htext />
      </hmention>
      .
    </hp>
  </fragment>
);
