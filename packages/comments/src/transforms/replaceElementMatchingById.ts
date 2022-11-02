import { replaceElement } from './replaceElement';

export const replaceElementMatchingById = <T extends { id: any }>(
  elements: T[],
  newElement: T
): T[] => {
  return replaceElement(elements, newElement, (A, B) => A.id === B.id);
};
