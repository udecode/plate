import { type TElement, type TText, TextApi } from '@platejs/slate';
import kebabCase from 'lodash/kebabCase.js';

export const getNodeDataAttributeKeys = (node: TElement | TText) =>
  Object.keys(node)
    .filter(
      (key) =>
        typeof node[key] !== 'object' &&
        (!TextApi.isText(node) || key !== 'text')
    )
    .map((key) => keyToDataAttribute(key));

export const keyToDataAttribute = (key: string) =>
  `data-slate-${kebabCase(key)}`;
