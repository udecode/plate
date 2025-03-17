import type { ElementEntry, Path, TElement } from '@udecode/slate';
import type { Nullable } from '@udecode/utils';

import { createAtomStore } from '../../libs/jotai';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreState = {
  element: TElement;
  entry: ElementEntry;
  path: Path;
};

const initialState: Nullable<ElementStoreState> = {
  element: null,
  entry: null,
  path: null,
};

export const { ElementProvider, elementStore, useElementStore } =
  createAtomStore(
    initialState as ElementStoreState,
    { name: 'element', suppressWarnings: true } as const
  );
