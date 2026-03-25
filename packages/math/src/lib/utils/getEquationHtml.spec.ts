import { getEquationHtml } from './getEquationHtml';

describe('getEquationHtml', () => {
  it('renders KaTeX html for the equation expression', () => {
    const html = getEquationHtml({
      element: { texExpression: 'x^2' } as any,
    });

    expect(html).toContain('katex');
    expect(html).toContain('x');
  });

  it('forwards KaTeX options to the rendered output', () => {
    const html = getEquationHtml({
      element: { texExpression: 'x^2' } as any,
      options: { displayMode: true },
    });

    expect(html).toContain('katex-display');
  });
});
