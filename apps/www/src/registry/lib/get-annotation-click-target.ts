'use client';

const BLOCK_SUGGESTION_SELECTOR = '[data-block-suggestion="true"]';

const getTargetElement = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) return target;
  if (target instanceof Node) return target.parentElement;

  return null;
};

export const getAnnotationClickTarget = ({
  allowBlockSuggestion = false,
  target,
  type,
}: {
  allowBlockSuggestion?: boolean;
  target: EventTarget | null;
  type: string;
}) => {
  const element = getTargetElement(target);

  if (!element) return null;

  const markElement = element.closest(`.slate-${type}`);

  if (markElement) {
    return {
      element: markElement as HTMLElement,
      isBlockSuggestion: false,
    };
  }

  if (!allowBlockSuggestion) return null;

  const blockSuggestionElement = element.closest(BLOCK_SUGGESTION_SELECTOR);

  if (!blockSuggestionElement) return null;

  return {
    element: blockSuggestionElement as HTMLElement,
    isBlockSuggestion: true,
  };
};
