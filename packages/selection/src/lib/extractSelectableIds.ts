export const extractSelectableIds = (els: Element[]): any[] => {
  return els.map((v) => (v as HTMLElement).dataset.key);
};

export const extractSelectableId = (el: Element) =>
  (el as HTMLElement).dataset.key;
