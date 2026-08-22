/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const basicMarksValue: Value = (
  <fragment>
    <hheading level={2}>Text Formatting</hheading>
    <hp>
      Add style and emphasis to your text using various formatting options.
    </hp>
    <hp>
      Make text <htext bold>bold</htext>, <htext italic>italic</htext>,{' '}
      <htext underline>underlined</htext>, or apply a{' '}
      <htext bold italic underline>
        combination
      </htext>{' '}
      of these styles for emphasis.
    </hp>
    <hp>
      Add <htext strikethrough>strikethrough</htext> to indicate deleted
      content, use <htext code>inline code</htext> for technical terms, or{' '}
      <htext highlight>highlight</htext> important information.
    </hp>
    <hp>
      Format mathematical expressions with <htext script="sub">subscript</htext>{' '}
      and <htext script="sup">superscript</htext> text.
    </hp>
    <hp>
      Show keyboard shortcuts like <htext kbd>⌘ + B</htext> for bold or{' '}
      <htext kbd>⌘ + I</htext> for italic formatting.
    </hp>
  </fragment>
);
