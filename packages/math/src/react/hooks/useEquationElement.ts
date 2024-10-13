import React from 'react';

import katex, { type KatexOptions } from 'katex';

import type { TEquationElement } from '../../lib';

export const useEquationElement = ({
  element,
  katexRef,
  options,
}: {
  element: TEquationElement;
  katexRef: React.MutableRefObject<HTMLDivElement | null>;
  options?: KatexOptions;
}) => {
  React.useEffect(() => {
    if (!katexRef.current) return;

    katex.render(element.texExpression, katexRef.current, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.texExpression]);
};
