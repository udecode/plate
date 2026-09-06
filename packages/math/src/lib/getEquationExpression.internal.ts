export const getEquationExpression = (element: { texExpression?: unknown }) =>
  typeof element.texExpression === 'string' ? element.texExpression : '';
