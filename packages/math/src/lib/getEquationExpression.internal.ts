// Older HTML imports stored numeric and boolean attributes as primitives.
export const getEquationExpression = (element: { texExpression?: unknown }) =>
  typeof element.texExpression === 'string' ||
  typeof element.texExpression === 'number' ||
  typeof element.texExpression === 'boolean'
    ? String(element.texExpression)
    : '';
