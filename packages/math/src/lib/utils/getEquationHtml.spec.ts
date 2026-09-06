import { getEquationHtml } from './getEquationHtml';

describe('getEquationHtml', () => {
  it.each([
    { texExpression: undefined },
    { texExpression: null },
    { texExpression: {} },
    { texExpression: [] },
  ])('renders an empty equation for $texExpression', ({ texExpression }) => {
    expect(getEquationHtml({ element: { texExpression } as any })).toBe(
      getEquationHtml({ element: { texExpression: '' } as any })
    );
  });

  it.each([
    0,
    42,
    -3.5,
    false,
    true,
  ])('renders primitive TeX content: %s', (texExpression) => {
    expect(getEquationHtml({ element: { texExpression } as any })).toBe(
      getEquationHtml({
        element: { texExpression: String(texExpression) } as any,
      })
    );
  });

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
