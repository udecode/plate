/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const emojiValue: Value = (
  <fragment>
    <hheading level={2}>Emoji</hheading>
    <hp>Express yourself with a touch of fun 🎉 and emotion 😃.</hp>
    <hp>Pick from the toolbar or type a colon to open the combobox.</hp>
  </fragment>
);
