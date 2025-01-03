import { fragment, getFragment as getFragmentBase } from 'slate';

import type { At } from '../../types';
import type { ElementOrTextOf } from '../../interfaces/element/TElement';
import type { TEditor } from '../../interfaces/editor/TEditor';

import { getAt } from '../../utils';

/**
 * Get the fragment at a location. If no location is provided, get the fragment
 * at the current selection.
 */
export const getFragment = <E extends TEditor>(
  editor: E,
  at?: At
): ElementOrTextOf<E>[] => {
  try {
    if (at === undefined) {
      return getFragmentBase(editor as any) as any;
    }

    return fragment(editor as any, getAt(editor, at)!) as any;
  } catch {
    return [];
  }
};
