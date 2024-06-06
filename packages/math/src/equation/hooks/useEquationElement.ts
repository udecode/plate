import React from 'react';

import katex, { type KatexOptions } from 'katex';

import type { TEquationElement } from '../types';

export interface useEquationState {
  element: TEquationElement;
  katexRef: React.MutableRefObject<HTMLDivElement | null>;
  options?: KatexOptions;
}

export const useEquationState = ({
  element,
  katexRef,
  options,
}: useEquationState) => {
  React.useEffect(() => {
    if (!katexRef.current) return;

    katex.render(element.texExpression, katexRef.current, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.texExpression]);
};

export const useEquationElement = () => {};
