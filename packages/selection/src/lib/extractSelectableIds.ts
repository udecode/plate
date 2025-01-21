export const extractSelectableIds = (els: Element[]) => {
  return els
    .map((v) => (v as HTMLElement).dataset.blockId)
    .filter(Boolean) as string[];
};

export const extractSelectableId = (el: Element) =>
  (el as HTMLElement).dataset.blockId;
