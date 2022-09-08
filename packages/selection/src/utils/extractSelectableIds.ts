export const extractSelectableIds = (els: Element[]): any[] => {
  return els.map((v) => v.getAttribute('data-key'));
};
