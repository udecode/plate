export const tabbableValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const tabbableValue: any = (
  <fragment>
    <hh1>Tabbable</hh1>
    <hp>
      This plugin ensures that the tab order works as you would expect when
      tabbing into and out of void nodes. Without this plugin, DOM elements
      inside void nodes come after the editor in the tab order.
    </hp>
    <element type="tabbable_element">
      <htext />
    </element>
    <element type="tabbable_element">
      <htext />
    </element>
    <hp>Place your cursor here and try pressing tab or shift+tab.</hp>
    <hul>
      <hli>
        <hlic>List item 1</hlic>
      </hli>
      <hli>
        <hlic>List item 2</hlic>
      </hli>
      <hli>
        <hlic>List item 3</hlic>
      </hli>
    </hul>
    <hcodeblock>
      <hcodeline>if (true) {'{'}</hcodeline>
      <hcodeline>
        {'// <-'} Place cursor at start of line and press tab
      </hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
    <hp>
      In this example, the plugin is disabled when the cursor is inside a list
      or a code block. You can customise this using the{' '}
      <htext code>query</htext> option.
    </hp>
    <element type="tabbable_element">
      <htext />
    </element>
    <hp>
      When you press tab at the end of the editor, the focus should go to the
      button below.
    </hp>
  </fragment>
);
`;

export const tabbableValueFile = {
  '/tabbable/tabbableValue.tsx': tabbableValueCode,
};
