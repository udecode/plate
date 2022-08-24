import { SomethingWithAnId } from '../types';

export const doBothElementsHaveTheSameId = (
  elementA: SomethingWithAnId,
  elementB: SomethingWithAnId
): boolean => {
  return elementA.id === elementB.id;
};
