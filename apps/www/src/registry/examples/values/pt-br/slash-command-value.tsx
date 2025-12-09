/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const slashCommandValue: any = (
  <fragment>
    <hh2>
      <htext>Comando de Barra</htext>
    </hh2>
    <hp>
      <htext>
        O menu de barra fornece acesso rápido a várias opções de formatação e
        tipos de conteúdo.
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Digite '/' em qualquer lugar do seu documento para abrir o menu de barra.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Comece a digitar para filtrar opções ou use as setas para navegar.
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Pressione Enter ou clique para selecionar uma opção.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Pressione Esc para fechar o menu sem selecionar.</htext>
    </hp>
    <hp>Opções disponíveis incluem:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Títulos: Título 1, Título 2, Título 3</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Listas: Lista com marcadores, Lista numerada</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Elementos Inline: Data</htext>
    </hp>
  </fragment>
);
