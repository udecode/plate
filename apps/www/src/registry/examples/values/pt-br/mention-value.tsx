/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const mentionValue: any = (
  <fragment>
    <hh2>Menção</hh2>
    <hp>
      Mencione e referencie outros usuários ou entidades em seu texto usando
      @-menções.
    </hp>
    <hp>
      Tente mencionar{' '}
      <hmention key="mention_id_1" value="BB-8">
        <htext />
      </hmention>{' '}
      ou{' '}
      <hmention key="mention_id_2" value="Boba Fett">
        <htext />
      </hmention>
      .
    </hp>
  </fragment>
);
