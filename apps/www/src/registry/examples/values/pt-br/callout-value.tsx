/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const calloutValue: any = (
  <fragment>
    <hh2>Destaques (Callouts)</hh2>
    <hp>
      Use destaques para chamar a atenção para informações importantes e organizar o conteúdo com
      ênfase visual.
    </hp>
    <hcallout variant="info" icon="💡">
      <htext bold>Dica:</htext> Destaques ajudam a chamar a atenção para informações chave
      sem interromper o fluxo do conteúdo.
    </hcallout>
    <hcallout variant="warning" icon="⚠️">
      <htext bold>Aviso:</htext> Considerações importantes ou problemas potenciais dos quais os
      usuários devem estar cientes.
    </hcallout>
    <hcallout variant="success" icon="✅">
      <htext bold>Sucesso:</htext> Celebre conquistas ou destaque resultados
      positivos.
    </hcallout>
    <hp>
      Clique em qualquer ícone de destaque para personalizá-lo com o seletor de emojis. Destaques
      suportam formatação rica e podem conter qualquer conteúdo.
    </hp>
  </fragment>
);
