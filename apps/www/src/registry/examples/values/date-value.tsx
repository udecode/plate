/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

const today = new Date().toISOString().split('T')[0];

export const dateValue: Value = (
  <fragment>
    <hheading level={2}>Date</hheading>
    <hp>
      Insert and display dates within your text using inline date elements.
      These dates can be easily selected and modified using a calendar
      interface.
    </hp>
    <hp>
      Try selecting{' '}
      <hdate value="2024-01-01">
        <htext />
      </hdate>{' '}
      or{' '}
      <hdate value={today}>
        <htext />
      </hdate>
      .
    </hp>
  </fragment>
);
