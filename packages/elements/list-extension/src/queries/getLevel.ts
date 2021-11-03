import { Path } from 'slate';
import { castArray } from 'lodash';

export const getLevel = (path: Path): number =>
  (castArray(path).length - 1) / 2;
