/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const equationValue: any = (
  <fragment>
    <hh2>
      <htext>Equação</htext>
    </hh2>
    <hp indent={1} listStyleType="decimal">
      <htext>
        Equações permitem que você expresse conceitos matemáticos complexos em
        formatos inline e bloco.
      </htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Principais características:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Suporte à sintaxe LaTeX</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Formatos de equação inline e bloco</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Exemplo de equação inline: </htext>
      <hinlineequation texExpression="E=mc^2">
        <htext />
      </hinlineequation>
      <htext> (Famosa equação de Einstein)</htext>
    </hp>
    <hp indent={1} listStart={4} listStyleType="decimal">
      <htext>Exemplos de equação em bloco:</htext>
    </hp>
    <hequation texExpression="\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}">
      <htext />
    </hequation>
    <hp>
      <htext>A fórmula quadrática para resolver </htext>
      <hinlineequation texExpression="ax^2 + bx + c = 0">
        <htext />
      </hinlineequation>
      <htext>.</htext>
    </hp>
    <hequation texExpression="\int_{a}^{b} f(x) \, dx = F(b) - F(a)">
      <htext />
    </hequation>
    <hp>
      <htext>O teorema fundamental do cálculo.</htext>
    </hp>
    <hp indent={1} listStart={5} listStyleType="decimal">
      <htext>Tente estas ações:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>
        Clique em qualquer equação para editá-la. Pressione Esc para fechar o
        menu sem editar.
      </htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Você pode navegar pela equação usando as teclas de seta</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>
        Use o comando de barra (/equation) para inserir uma nova equação
      </htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>
        Use o comando de barra (/inline equation) para equações inline
      </htext>
    </hp>
    <hp>
      <htext>
        Uso avançado: Combine equações com outros elementos como tabelas ou
        blocos de código para documentação científica abrangente. Por exemplo:
      </htext>
    </hp>
    <hp>
      <htext>A equação de Schrödinger, </htext>
      <hinlineequation texExpression="i\hbar\frac{\partial}{\partial t}\Psi = \hat{H}\Psi">
        <htext />
      </hinlineequation>
      <htext>, é fundamental na mecânica quântica.</htext>
    </hp>
    <hp>
      <htext>
        Experimente diferentes tipos de equações e formatações para criar
        conteúdo matemático rico em seus documentos.
      </htext>
    </hp>
  </fragment>
);
