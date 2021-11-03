import { castArray } from 'lodash';
import { Path } from 'slate';

export const getLevel = (path: Path): number =>
  (castArray(path).length - 1) / 2;
