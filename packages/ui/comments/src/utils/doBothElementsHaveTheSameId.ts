interface Identifyable {
  id: any;
}

export const doBothElementsHaveTheSameId = (
  elementA: Identifyable,
  elementB: Identifyable
): boolean => {
  return elementA.id === elementB.id;
};
