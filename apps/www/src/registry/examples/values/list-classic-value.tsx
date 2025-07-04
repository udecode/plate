/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import { KEYS } from 'platejs';

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
            <hul type={KEYS.taskList}>
              <hli checked>
                <hlic>Navy blue</hlic>
              </hli>
              <hli>
                <hlic>Turquoise blue</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
      <hli>
        <hlic>Green</hlic>
      </hli>
    </hol>
  </fragment>
);
