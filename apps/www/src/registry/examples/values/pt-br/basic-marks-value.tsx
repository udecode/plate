/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const basicMarksValue: any = (
  <fragment>
    <hh2>Formatação de Texto</hh2>
    <hp>
      Adicione estilo e ênfase ao seu texto usando várias opções de formatação.
    </hp>
    <hp>
      Faça o texto <htext bold>negrito</htext>, <htext italic>itálico</htext>,{' '}
      <htext underline>sublinhado</htext>, ou aplique uma{' '}
      <htext bold italic underline>
        combinação
      </htext>{' '}
      desses estilos para ênfase.
    </hp>
    <hp>
      Adicione <htext strikethrough>tachado</htext> para indicar conteúdo
      excluído, use <htext code>código inline</htext> para termos técnicos, ou{' '}
      <htext highlight>destaque</htext> informações importantes.
    </hp>
    <hp>
      Formate expressões matemáticas com texto{' '}
      <htext subscript>subscrito</htext> e{' '}
      <htext superscript>sobrescrito</htext>.
    </hp>
    <hp>
      Mostre atalhos de teclado como <htext kbd>⌘ + B</htext> para negrito ou{' '}
      <htext kbd>⌘ + I</htext> para formatação em itálico.
    </hp>
  </fragment>
);
