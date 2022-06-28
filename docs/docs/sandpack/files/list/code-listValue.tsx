export const listValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const listValue: any = (
  <fragment>
    <hh2>✍️ List</hh2>
    <hp>
      <htext />
    </hp>
    <hul>
      <hli>
        <hlic>Bulleted list</hlic>
        <hul>
          <hli>
            <hlic>support</hlic>
            <hul>
              <hli>
                <hlic>a</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>nesting</hlic>
            <hul>
              <hli>
                <hlic>b</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
      <hli>
        <hlic>c</hlic>
      </hli>
    </hul>
    <hol>
      <hli>
        <hlic>Numbered list'</hlic>
      </hli>
    </hol>
    <hp>
      With Slate you can build complex block types that have their own embedded
      content and behaviors, like rendering checkboxes inside check list items!
    </hp>
    <htodoli checked>Slide to the left.</htodoli>
    <htodoli checked>Slide to the right.</htodoli>
    <htodoli>Criss-cross.</htodoli>
    <htodoli checked>Criss-cross.</htodoli>
    <htodoli>Cha cha real smooth…</htodoli>
    <htodoli>Let's go to work!</htodoli>
    <hp>Try it out for yourself!</hp>
  </fragment>
);
`;

export const listValueFile = {
  '/list/listValue.tsx': listValueCode,
};
