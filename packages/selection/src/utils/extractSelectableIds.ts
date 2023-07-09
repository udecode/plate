export const extractSelectableIds = (els: Element[]): any[] => {
  return els.map((v) => (v as HTMLElement).dataset.key);
};
