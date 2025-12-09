/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const copilotValue: any = (
  <fragment>
    <hh2>Copilot</hh2>
    <hp indent={1} listStyleType="decimal">
      <htext>Posicione seu cursor no</htext>
      <htext bold> final de um parágrafo </htext>
      <htext>onde você deseja adicionar ou modificar texto.</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Pressione Control + Espaço para acionar o Copilot</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>O Copilot irá</htext>
      <htext bold> automaticamente</htext>
      <htext> sugerir conclusões enquanto você digita.</htext>
    </hp>
    <hp indent={1} listStart={4} listStyleType="decimal">
      <htext>Escolha entre as conclusões sugeridas:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext bold>Tab</htext>:
      <htext>Aceita toda a conclusão sugerida</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext bold>Command + Seta Direita</htext>
      <htext>: Completa um caractere de cada vez</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext bold>Esc</htext>
      <htext>: Cancela o Copilot</htext>
    </hp>
  </fragment>
);
