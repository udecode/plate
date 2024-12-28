import type { TElement, TElementEntry } from '@udecode/slate';
import type { Path } from 'slate';

import type { Nullable } from '../../../lib';

import { createAtomStore } from '../../libs/jotai';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreState = {
  element: TElement;
  entry: TElementEntry;
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
    { name: 'element' } as const
  );
