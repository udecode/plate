import katex, { type KatexOptions } from 'katex';

import type { TEquationElement } from '../../lib';

export const getEquationHtml = ({
  element,
  options,
}: {
  element: TEquationElement;
  options?: KatexOptions;
}) => katex.renderToString(element.texExpression, options);
