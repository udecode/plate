export type RangeDirection = 'backward' | 'collapsed' | 'forward';

export const getRangeEndpointAssociations = (
  direction: RangeDirection,
  association: 'backward' | 'forward' | 'inward' | 'outward' | undefined
): readonly [-1 | 1, -1 | 1] => {
  if (association === 'backward') return [-1, -1];
  if (association === 'forward' || direction === 'collapsed') return [1, 1];

  const inward = association !== 'outward';

  if (direction === 'forward') return inward ? [1, -1] : [-1, 1];

  return inward ? [-1, 1] : [1, -1];
};
