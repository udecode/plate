import React from 'react';

import katex, { type KatexOptions } from 'katex';

import type { TInlineEquationElement } from '../types';

export interface useInlineEquationState {
  element: TInlineEquationElement;
  katexRef: React.MutableRefObject<HTMLDivElement | null>;
  options?: KatexOptions;
}

export const useInlineEquationState = ({
  element,
  katexRef,
  options,
}: useInlineEquationState) => {
  React.useEffect(() => {
    if (!katexRef.current) return;

    katex.render(element.texExpression, katexRef.current, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.texExpression]);
};

export const useInlineEquationElement = () => {};
