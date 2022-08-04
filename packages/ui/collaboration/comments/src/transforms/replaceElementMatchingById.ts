import { doBothElementsHaveTheSameId } from '../utils/doBothElementsHaveTheSameId';
import { replaceElement } from './replaceElement';

export const replaceElementMatchingById = <T extends { id: any }>(
  elements: T[],
  newElement: T
): T[] => {
  return replaceElement(elements, newElement, doBothElementsHaveTheSameId);
};
