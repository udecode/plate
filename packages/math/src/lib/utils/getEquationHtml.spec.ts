import { getEquationHtml } from './getEquationHtml';

const equation = {
  children: [{ text: '' }],
  texExpression: 'x^2',
  type: 'equation',
};

describe('getEquationHtml', () => {
  it('renders KaTeX html for the equation expression', () => {
    const html = getEquationHtml({
      element: equation,
    });

    expect(html).toContain('katex');
    expect(html).toContain('x');
  });

  it('forwards KaTeX options to the rendered output', () => {
    const html = getEquationHtml({
      element: equation,
      options: { displayMode: true },
    });

    expect(html).toContain('katex-display');
  });
});
