/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

const today = new Date().toISOString().split('T')[0];

export const dateValue: any = (
  <fragment>
    <hh2>🕐 Date</hh2>
    <hp>
      Insert and display dates within your text using inline date elements.
      These dates can be easily selected and modified using a calendar
      interface.
    </hp>
    <hp>
      Try selecting{' '}
      <hinlinedate date="2024-01-01">
        <htext />
      </hinlinedate>{' '}
      or{' '}
      <hinlinedate date={today}>
        <htext />
      </hinlinedate>
      .
    </hp>
  </fragment>
);
