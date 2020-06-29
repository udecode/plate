/**
 * Get a deserializer by type and/or tag names with a common element creator.
 */
export type CreateNode = (
  el: HTMLElement
) => {
  [key: string]: unknown;
};

/**
 * Get a deserializer by type and/or tag names with a common node creator.
 */
export const getNodeDeserializer = <T extends CreateNode>(
  type: string,
  {
    createNode,
    tagNames,
  }: {
    createNode: T;
    tagNames: string[];
  }
) => {
  const deserializer = {
    [type]: createNode,
  };

  return tagNames.reduce((obj: Record<string, T>, tagName) => {
    obj[tagName] = createNode;
    return obj;
  }, deserializer);
};
