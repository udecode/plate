/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const clearFormattingValue: Value = (
  <fragment>
    <hheading level={2}>Clear Formatting</hheading>
    <hp>
      Select some text and press <htext code>Mod+\</htext> or the toolbar's
      Clear formatting button. Text styles such as <htext bold>bold</htext>,{' '}
      <htext italic>italic</htext>, <htext color="#df4538">color</htext> and{' '}
      <htext backgroundColor="#fff3a3">highlight</htext> go away.
    </hp>
    <hp lineHeight={2} textAlign="center">
      Select this whole paragraph to also reset its alignment and line height.
    </hp>
    <hp indent={1} listType="bulleted">
      A list item keeps its bullet and depth, and loses its{' '}
      <htext bold underline>
        text styles
      </htext>
      .
    </hp>
    <hp>
      Headings and links stay, so{' '}
      <ha url="https://platejs.org">
        <htext bold>this link</htext>
      </ha>{' '}
      keeps its target.
    </hp>
  </fragment>
);
