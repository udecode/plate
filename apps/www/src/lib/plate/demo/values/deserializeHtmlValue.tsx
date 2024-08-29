/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const deserializeHtmlValue: any = (
  <fragment>
    <hh2>HTML</hh2>
    <hp>
      By default, when you paste content into the Slate editor, it will utilize
      the clipboard's <htext code>'text/plain'</htext>
      data. While this is suitable for certain scenarios, there are times when
      you want users to be able to paste content while preserving its
      formatting. To achieve this, your editor should be capable of handling{' '}
      <htext code>'text/html'</htext>
      data.
    </hp>
    <hp>
      To experience the seamless preservation of formatting, simply copy and
      paste rendered HTML rich text content (not the source code) from another
      website into this editor. You'll notice that the formatting of the pasted
      content is maintained.
    </hp>
  </fragment>
);
