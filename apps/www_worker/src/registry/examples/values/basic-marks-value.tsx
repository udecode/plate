/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const basicMarksValue: any = (
  <fragment>
    <hh2>Text Formatting</hh2>
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
      Format mathematical expressions with <htext subscript>subscript</htext>{' '}
      and <htext superscript>superscript</htext> text.
    </hp>
    <hp>
      Show keyboard shortcuts like <htext kbd>⌘ + B</htext> for bold or{' '}
      <htext kbd>⌘ + I</htext> for italic formatting.
    </hp>
  </fragment>
);
