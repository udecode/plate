/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const detailsValue: Value = (
  <fragment>
    <hheading level={2}>Details</hheading>
    <hp>Use a summary to disclose one or more body blocks.</hp>
    <hdetails>
      <hsummary>Why use semantic Details?</hsummary>
      <hp>
        The document model matches native HTML and keeps body blocks nested.
      </hp>
      <hdetails>
        <hsummary>Can Details be nested?</hsummary>
        <hp>Yes. Nested Details are ordinary body blocks.</hp>
      </hdetails>
    </hdetails>
    <hp>Content after Details remains an ordinary sibling block.</hp>
  </fragment>
);
