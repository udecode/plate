/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const dndValue: any = (
  <fragment>
    <hh2>Arrastar e Soltar</hh2>
    <hp>
      Reorganize facilmente o conteúdo do seu documento usando arrastar e
      soltar.
    </hp>
    <hp>Como usar:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Passe o mouse sobre o lado esquerdo de um bloco para ver a alça de
        arrasto (seis pontos).
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Clique e segure a alça, depois arraste o bloco para um novo local.
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Solte para colocar o bloco em sua nova posição.</htext>
    </hp>
    <hp>Experimente! Arraste estes itens para reordená-los:</hp>
    <hp indent={1} listStyleType="decimal">
      <htext>Primeiro item</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Segundo item</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Terceiro item</htext>
    </hp>
  </fragment>
);
