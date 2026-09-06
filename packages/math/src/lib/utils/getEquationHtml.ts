import type { TEquationElement } from 'platejs';

import katex, { type KatexOptions } from 'katex';

import { getEquationExpression } from '../getEquationExpression.internal';

export const getEquationHtml = ({
  element,
  options,
}: {
  element: TEquationElement;
  options?: KatexOptions;
}) => katex.renderToString(getEquationExpression(element), options);
