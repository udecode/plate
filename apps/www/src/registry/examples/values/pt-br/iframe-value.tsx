/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const iframeValue: any = (
  <fragment>
    <hp>
      Neste exemplo, o documento é renderizado em um{' '}
      <htext code>iframe</htext> controlado. Isso é <htext italic>particularmente</htext>{' '}
      útil quando você precisa separar os estilos do conteúdo do editor
      daqueles que endereçam sua interface de usuário.
    </hp>
    <hp>
      Este também é o único método confiável para visualizar quaisquer{' '}
      <htext bold>consultas de mídia (media queries)</htext>
      em seu CSS.
    </hp>
  </fragment>
);
