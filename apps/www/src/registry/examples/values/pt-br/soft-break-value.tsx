/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const softBreakValue: any = (
  <fragment>
    <hh2>Quebra Suave</hh2>
    <hp>
      Personalize como quebras suaves (quebras de linha dentro de um parágrafo)
      são tratadas usando regras configuráveis
    </hp>
    <hp indent={1} listStyleType="disc">
      hotkey – Use teclas de atalho como ⇧⏎ para inserir uma quebra suave em
      qualquer lugar dentro de um parágrafo.
    </hp>
    <hp indent={1} listStyleType="disc">
      query – Defina regras personalizadas para limitar quebras suaves a tipos
      de blocos específicos.
    </hp>
    <hblockquote>Tente aqui ⏎</hblockquote>
    <hcodeblock>
      <hcodeline>E aqui ⏎ também.</hcodeline>
    </hcodeblock>
  </fragment>
);
