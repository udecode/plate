/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const blockSelectionValue: any = (
  <fragment>
    <hh2>Seleção de Bloco</hh2>
    <hp>
      <htext>
        A seleção de bloco permite selecionar vários blocos de uma vez. Você
        pode iniciar uma seleção clicando e arrastando a partir do preenchimento
        do editor.
      </htext>
    </hp>
    <hp>Principais recursos da seleção de bloco:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Selecionar múltiplos blocos.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      Mantenha Shift pressionado para manter a seleção anterior. Dessa forma,
      você pode selecionar blocos não contíguos.
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Executar ações em massa nos blocos selecionados</htext>
    </hp>
  </fragment>
);
