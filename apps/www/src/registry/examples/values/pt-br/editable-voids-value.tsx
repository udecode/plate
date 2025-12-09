/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const editableVoidsValue: any = (
  <fragment>
    <hp>
      Além de nós que contêm texto editável, você pode inserir nós vazios (void
      nodes), que também podem conter elementos editáveis, entradas ou até mesmo
      outro editor Slate inteiro.
    </hp>
    <element type="editable-void">
      <htext />
    </element>
    <hp>
      <htext />
    </hp>
  </fragment>
);
