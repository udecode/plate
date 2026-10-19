/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const mentionValue: Value = (
  <fragment>
    <hheading level={2}>Mention</hheading>
    <hp>
      Mention and reference other users or entities within your text using
      @-mentions.
    </hp>
    <hp>
      Try mentioning{' '}
      <hmention label="BB-8" ref="mention_id_1">
        <htext />
      </hmention>{' '}
      or{' '}
      <hmention label="Boba Fett" ref="mention_id_2">
        <htext />
      </hmention>
      .
    </hp>
  </fragment>
);
