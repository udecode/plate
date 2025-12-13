/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const tocValue: any = (
  <fragment>
    <hh1>
      <htext>Índice (Table of Contents)</htext>
    </hh1>
    <hp>
      <htext>
        O recurso de Índice (TOC) permite que você crie uma visão geral
        atualizada automaticamente da estrutura do seu documento.
      </htext>
    </hp>
    <hp>Como usar o Índice:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Digite "/toc" e pressione Enter para criar o TOC.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        O TOC é atualizado automaticamente quando você modifica títulos no
        documento.
      </htext>
    </hp>
    <htoc>
      <htext />
    </htoc>
    <hh2>Conteúdo de Exemplo</hh2>
    <hp>
      <htext>
        Este é um exemplo de conteúdo que seria refletido no Índice.
      </htext>
    </hp>
    <hh3>Subseção</hh3>
    <hp>
      <htext>
        Adicionar ou modificar títulos em seu documento atualizará
        automaticamente o TOC.
      </htext>
    </hp>
    <hh2>Benefícios de Usar TOC</hh2>
    <hp>
      <htext>
        Um Índice melhora a navegação do documento e fornece uma rápida visão
        geral da estrutura do seu conteúdo.
      </htext>
    </hp>
  </fragment>
);

export const tocPlaygroundValue: any = (
  <fragment>
    <htoc>
      <htext />
    </htoc>
    <hp>
      <htext>
        Clique em qualquer título no índice para rolar suavemente para essa
        seção.
      </htext>
    </hp>
  </fragment>
);
