/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const floatingToolbarValue: any = (
  <fragment>
    <hh2>Barra de Ferramentas Flutuante</hh2>
    <hp>
      A barra de ferramentas flutuante fornece acesso rápido a opções de
      formatação e ações para o texto selecionado.
    </hp>
    <hp>Como usar a barra de ferramentas flutuante:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Selecione qualquer texto para invocar a barra de ferramentas flutuante.
      </htext>
    </hp>
    <hp>Com a barra de ferramentas flutuante, você pode:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Pedir ajuda à IA</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Adicionar um comentário ao texto selecionado</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transformar um tipo de bloco em outro</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Aplicar formatação de texto: negrito, itálico, sublinhado, tachado,
        código
      </htext>
    </hp>
    <hp>
      <htext>
        Tente selecionar algum texto abaixo para ver a barra de ferramentas
        flutuante em ação:
      </htext>
    </hp>
    <hp>
      <htext bold>Texto em negrito</htext>
      <htext>, </htext>
      <htext italic>texto em itálico</htext>
      <htext>, </htext>
      <htext underline>texto sublinhado</htext>
      <htext>, e </htext>
      <htext bold italic underline>
        formatação combinada
      </htext>
      <htext>.</htext>
    </hp>
  </fragment>
);
