/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const linkValue: any = (
  <fragment>
    <hh2>Link</hh2>
    <hp>
      Adicione{' '}
      <ha target="_blank" url="https://pt.wikipedia.org/wiki/Hiperligação">
        hiperlinks
      </ha>{' '}
      ao seu texto para referenciar fontes externas ou fornecer informações
      adicionais usando o plugin Link.
    </hp>
    <hp>
      Crie hiperlinks facilmente usando a barra de ferramentas ou colando uma URL enquanto
      seleciona o texto desejado.
    </hp>
  </fragment>
);
