/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import { KEYS } from 'platejs';

jsx;

export const listValue: any = (
  <fragment>
    <hh2>✍️ Lista</hh2>
    <hp>
      <htext />
    </hp>
    <hul>
      <hli>
        <hlic>Gatos</hlic>
      </hli>
      <hli>
        <hlic>Cães</hlic>
      </hli>
      <hli>
        <hlic>Pássaros</hlic>
        <hul>
          <hli>
            <hlic>Papagaios</hlic>
          </hli>
          <hli>
            <hlic>Corujas</hlic>
            <hul>
              <hli>
                <hlic>Corujas-das-torres</hlic>
              </hli>
              <hli>
                <hlic>Corujas-das-neves</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
    </hul>
    <hol>
      <hli>
        <hlic>Vermelho</hlic>
      </hli>
      <hli>
        <hlic>Azul</hlic>
        <hul>
          <hli>
            <hlic>Azul claro</hlic>
          </hli>
          <hli>
            <hlic>Azul escuro</hlic>
            <hul type={KEYS.taskList}>
              <hli checked>
                <hlic>Azul marinho</hlic>
              </hli>
              <hli>
                <hlic>Azul turquesa</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
      <hli>
        <hlic>Verde</hlic>
      </hli>
    </hol>
  </fragment>
);
