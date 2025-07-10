/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const mentionValue: any = (
  <fragment>
    <hh2>Mention</hh2>
    <hp>
      Mention and reference other users or entities within your text using
      @-mentions.
    </hp>
    <hp>
      Try mentioning{' '}
      <hmention key="mention_id_1" value="BB-8">
        <htext />
      </hmention>{' '}
      or{' '}
      <hmention key="mention_id_2" value="Boba Fett">
        <htext />
      </hmention>
      .
    </hp>
  </fragment>
);
