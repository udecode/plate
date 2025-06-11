import type { TEquationElement } from 'platejs';

import katex, { type KatexOptions } from 'katex';

export const getEquationHtml = ({
  element,
  options,
}: {
  element: TEquationElement;
  options?: KatexOptions;
}) => katex.renderToString(element.texExpression, options);
