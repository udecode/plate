/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const columnValue: any = (
  <fragment>
    <hh2>Coluna</hh2>
    <hp>Crie colunas e a borda ficará oculta durante a visualização</hp>
    <hcolumngroup layout={[50, 50]}>
      <hcolumn width="50%">
        <hp>esquerda 1</hp>
        <hp>esquerda 2</hp>
      </hcolumn>
      <hcolumn width="50%">
        <hp>direita 1</hp>
        <hp>direita 2</hp>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
