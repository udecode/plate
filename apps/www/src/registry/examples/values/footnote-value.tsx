/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const footnoteValue: any = (
  <fragment>
    <hh2>Footnotes</hh2>
    <hp>Type [^ to open the inline footnote combobox.</hp>
    <hp>
      Footnote references stay inline like this
      <hfootnoteReference identifier="1">
        <htext>1</htext>
      </hfootnoteReference>
      .
    </hp>
    <hfootnoteDefinition identifier="1">
      <hp>
        <htext>
          Footnote definitions keep block content and their identifier.
        </htext>
      </hp>
    </hfootnoteDefinition>
    <hp>
      Unresolved references can still exist during editing like
      <hfootnoteReference identifier="2">
        <htext>2</htext>
      </hfootnoteReference>
      .
    </hp>
    <hp>
      Multiple references can point to the same definition
      <hfootnoteReference identifier="1">
        <htext>1</htext>
      </hfootnoteReference>
      .
    </hp>
    <hp>
      Duplicate identifiers are detectable too
      <hfootnoteReference identifier="3">
        <htext>3</htext>
      </hfootnoteReference>
      .
    </hp>
    <hfootnoteDefinition identifier="3">
      <hp>
        <htext>First definition for duplicate id 3.</htext>
      </hp>
    </hfootnoteDefinition>
    <hfootnoteDefinition identifier="3">
      <hp>
        <htext>Second definition for duplicate id 3.</htext>
      </hp>
    </hfootnoteDefinition>
  </fragment>
);
