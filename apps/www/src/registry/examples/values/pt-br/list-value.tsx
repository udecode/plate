/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const listValue: any = (
  <fragment>
    <hh2>Lista</hh2>

    <hp>
      Crie listas indentadas com múltiplos níveis de indentação e personalize o
      tipo de estilo de lista para cada nível.
    </hp>
    <hp checked={true} indent={1} listStyleType="todo">
      Tarefa 1
    </hp>

    <hp indent={1} listStyleType="disc">
      Disco 1
    </hp>
    <hp indent={2} listStyleType="disc">
      Disco 2
    </hp>
    <hp checked={false} indent={3} listStyleType="todo">
      Tarefa 2
    </hp>
    <hp indent={1} listStyleType="upper-roman">
      Romano 1
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 11
    </hp>
    <hp indent={3} listStart={2} listStyleType="decimal">
      Decimal 111
    </hp>
    <hp indent={3} listStart={2} listStyleType="decimal">
      Decimal 112
    </hp>
    <hp indent={2} listStart={2} listStyleType="decimal">
      Decimal 12
    </hp>
    <hp indent={2} listStart={3} listStyleType="decimal">
      Decimal 13
    </hp>
    <hp indent={1} listStart={2} listStyleType="upper-roman">
      Romano 2
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 11
    </hp>
    <hp indent={2} listStart={2} listStyleType="decimal">
      Decimal 12
    </hp>
    <hp indent={1} listStart={3} listStyleType="upper-roman">
      Romano 3
    </hp>
    <hp indent={1} listStart={4} listStyleType="upper-roman">
      Romano 4
    </hp>
  </fragment>
);
