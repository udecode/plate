import { type Element, type Text, TextApi } from '@platejs/plite';
import kebabCase from 'lodash/kebabCase.js';

export const getNodeDataAttributeKeys = (node: Element | Text) =>
  Object.keys(node)
    .filter(
      (key) =>
        typeof node[key] !== 'object' &&
        (!TextApi.isText(node) || key !== 'text')
    )
    .map((key) => keyToDataAttribute(key));

export const keyToDataAttribute = (key: string) =>
  `data-plite-${kebabCase(key)}`;
