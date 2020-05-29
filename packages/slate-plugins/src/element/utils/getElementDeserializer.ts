import { getNodeDeserializer } from '../../common/utils/getNodeDeserializer';

export type CreateElement = (
  el: HTMLElement
) => {
  type: string;
  [key: string]: unknown;
};

/**
 * Get a deserializer by type and/or tag names with a common element creator.
 */
export const getElementDeserializer = (
  type: string,
  {
    createElement = () => ({ type }),
    tagNames = [],
  }: {
    createElement?: CreateElement;
    tagNames?: string[];
  }
) => getNodeDeserializer(type, { createNode: createElement, tagNames });
