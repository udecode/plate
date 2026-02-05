/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const calloutValue: any = (
  <fragment>
    <hh2>Callouts</hh2>
    <hp>
      Use callouts to highlight important information and organize content with
      visual emphasis.
    </hp>
    <hcallout variant="info" icon="💡">
      <htext bold>Tip:</htext> Callouts help draw attention to key information
      without disrupting content flow.
    </hcallout>
    <hcallout variant="warning" icon="⚠️">
      <htext bold>Warning:</htext> Important considerations or potential issues
      users should be aware of.
    </hcallout>
    <hcallout variant="success" icon="✅">
      <htext bold>Success:</htext> Celebrate achievements or highlight positive
      outcomes.
    </hcallout>
    <hp>
      Click on any callout icon to customize it with the emoji picker. Callouts
      support rich formatting and can contain any content.
    </hp>
  </fragment>
);
