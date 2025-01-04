import type { TElement } from '../interfaces';

export const unwrapStructuralNodes = (
  nodes: TElement[],
  { structuralTypes }: { structuralTypes?: string[] } = {}
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
