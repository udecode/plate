/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const findReplaceValue: any = (
  <fragment>
    <hp>
      Este é um texto editável que você pode pesquisar. Enquanto você pesquisa,
      ele procura por sequências de texto correspondentes e adiciona{' '}
      <htext bold>decorações</htext> a elas em tempo real.
    </hp>
    <hp>Experimente você mesmo digitando na caixa de pesquisa acima!</hp>
  </fragment>
);
