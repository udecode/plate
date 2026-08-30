/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';

jsx;

export const footnoteValue = (
  <fragment>
    <hheading level={2}>Footnotes</hheading>
    <hp>Type [^ to open the inline footnote combobox.</hp>
    <hp>
      Footnote references stay inline like this
      <hfootnoteReference ref="1">
        <htext>1</htext>
      </hfootnoteReference>
      .
    </hp>
    <hfootnoteDefinition ref="1">
      <hp>
        <htext>Footnote definitions keep block content and their ref.</htext>
      </hp>
    </hfootnoteDefinition>
    <hp>
      Unresolved references can still exist during editing like
      <hfootnoteReference ref="2">
        <htext>2</htext>
      </hfootnoteReference>
      .
    </hp>
    <hp>
      Multiple references can point to the same definition
      <hfootnoteReference ref="1">
        <htext>1</htext>
      </hfootnoteReference>
      .
    </hp>
    <hp>
      Duplicate refs are detectable too
      <hfootnoteReference ref="3">
        <htext>3</htext>
      </hfootnoteReference>
      .
    </hp>
    <hfootnoteDefinition ref="3">
      <hp>
        <htext>First definition for duplicate id 3.</htext>
      </hp>
    </hfootnoteDefinition>
    <hfootnoteDefinition ref="3">
      <hp>
        <htext>Second definition for duplicate id 3.</htext>
      </hp>
    </hfootnoteDefinition>
  </fragment>
);
