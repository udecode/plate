export const replaceElement = <T>(
  elements: T[],
  newElement: T,
  doesMatch: (element: T, newElement: T) => boolean
): T[] => {
  return elements.map((element) =>
    doesMatch(element, newElement) ? newElement : element
  );
};
