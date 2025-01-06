import { fragment, getFragment as getFragmentBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { ElementOrTextOf } from '../../interfaces/element';
import type { EditorFragmentOptions } from '../../interfaces/index';
import type { At } from '../../types';

import { getAt } from '../../utils';
import { unwrapStructuralNodes } from '../../utils/unwrapStructuralNodes';

export const getFragment = <E extends Editor>(
  editor: E,
  at?: At | null,
  options?: EditorFragmentOptions
): ElementOrTextOf<E>[] => {
  if (at === null) return [];

  try {
    const result =
      at === undefined
        ? (getFragmentBase(editor as any) as any)
        : (fragment(editor as any, getAt(editor, at)!) as any);

    if (result.length > 0 && options?.structuralTypes) {
      return unwrapStructuralNodes(result, options) as any;
    }

    return result;
  } catch {
    return [];
  }
};
