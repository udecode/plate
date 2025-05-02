/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const iframeValue: any = (
  <fragment>
    <hp>
      In this example, the document gets rendered into a controlled{' '}
      <htext code>iframe</htext>. This is <htext italic>particularly</htext>{' '}
      useful, when you need to separate the styles for your editor contents from
      the ones addressing your UI.
    </hp>
    <hp>
      This also the only reliable method to preview any{' '}
      <htext bold>media queries</htext>
      in your CSS.
    </hp>
  </fragment>
);
