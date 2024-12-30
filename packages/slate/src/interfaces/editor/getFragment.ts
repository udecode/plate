import { fragment } from 'slate';

import type { At } from '../../types';
import type { ElementOrTextOf } from '../element/TElement';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils';

export const getFragment = <E extends TEditor>(
  editor: E,
  at: At
): ElementOrTextOf<E>[] | undefined => {
  try {
    return fragment(editor as any, getAt(editor, at)!) as any;
  } catch {}
};
