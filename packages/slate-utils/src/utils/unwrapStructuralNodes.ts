import type { TElement } from '@udecode/slate';

import type { GetSelectionFragmentOptions } from '../queries/getSelectionFragment';

export const unwrapStructuralNodes = (
  nodes: TElement[],
  { structuralTypes }: GetSelectionFragmentOptions = {}
) => {
  const unwrap = (nodes: TElement[], acc: TElement[] = []): TElement[] => {
    nodes.forEach((node) => {
      if (structuralTypes?.includes(node.type)) {
        return unwrap(node.children as TElement[], acc);
      }

      acc.push(node);
    });

    return acc;
  };

  return unwrap(nodes);
};
