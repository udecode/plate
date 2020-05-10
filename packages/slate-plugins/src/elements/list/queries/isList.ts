import { Node } from 'slate';
import { defaultListTypes } from '../types';

export const isList = (options = defaultListTypes) => (n: Node) =>
  [options.typeOl, options.typeUl].includes(n.type as string);
