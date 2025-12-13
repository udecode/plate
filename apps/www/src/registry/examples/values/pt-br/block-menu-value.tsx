/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const blockMenuValue: any = (
  <fragment>
    <hh2>Menu de Bloco</hh2>

    <hp>Abrir o menu de bloco:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Clique com o botão direito em qualquer bloco não selecionado para abrir
        o menu de contexto. Se você clicar com o botão direito dentro de um
        bloco selecionado, verá o menu de contexto nativo do navegador.
      </htext>
    </hp>
    <hp>Opções disponíveis no menu de bloco:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Pedir à IA para editar o bloco.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Excluir o bloco.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Duplicar o bloco.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transformar o tipo de bloco em outro tipo de bloco.</htext>
    </hp>
  </fragment>
);
