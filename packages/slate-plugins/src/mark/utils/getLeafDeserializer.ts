import { getNodeDeserializer } from '../../common/utils/getNodeDeserializer';

export type CreateLeaf = (
  el: HTMLElement
) => {
  [key: string]: unknown;
};

/**
 * Get a deserializer by type and/or tag names with a common leaf creator.
 */
export const getLeafDeserializer = (
  type: string,
  {
    createLeaf = () => ({ [type]: true }),
    tagNames = [],
  }: {
    createLeaf?: CreateLeaf;
    tagNames?: string[];
  } = {}
) => getNodeDeserializer(type, { createNode: createLeaf, tagNames });
