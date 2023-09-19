/** @jsxRuntime classic */
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
        <hlic>Cats</hlic>
      </hli>
      <hli>
        <hlic>Dogs</hlic>
      </hli>
      <hli>
        <hlic>Birds</hlic>
        <hul>
          <hli>
            <hlic>Parrots</hlic>
          </hli>
          <hli>
            <hlic>Owls</hlic>
            <hul>
              <hli>
                <hlic>Barn Owls</hlic>
              </hli>
              <hli>
                <hlic>Snowy Owls</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
    </hul>
    <hol>
      <hli>
        <hlic>Red</hlic>
      </hli>
      <hli>
        <hlic>Blue</hlic>
        <hul>
          <hli>
            <hlic>Light blue</hlic>
          </hli>
          <hli>
            <hlic>Dark blue</hlic>
            <hol>
              <hli>
                <hlic>Navy blue</hlic>
              </hli>
              <hli>
                <hlic>Turquoise blue</hlic>
              </hli>
            </hol>
          </hli>
        </hul>
      </hli>
      <hli>
        <hlic>Green</hlic>
      </hli>
    </hol>
  </fragment>
);

export const todoListValue: any = (
  <fragment>
    <hp>Each block is a React component in which you can manage the state:</hp>
    <htodoli checked>Create a "banana language" translation plugin</htodoli>
    <htodoli checked>
      Create a "detect sarcasm" plugin (good luck with that)
    </htodoli>
    <htodoli>Create an AI auto-complete plugin</htodoli>
  </fragment>
);
