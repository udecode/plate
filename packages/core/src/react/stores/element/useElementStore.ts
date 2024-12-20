import type { TElement } from '@udecode/slate';
import type { Path } from 'slate';

import type { Nullable } from '../../../lib';

import { createAtomStore } from '../../libs/jotai';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreState = { element: TElement; path: Path };

const initialState: Nullable<ElementStoreState> = {
  element: null,
  path: null,
};

export const { ElementProvider, useElementStore } = createAtomStore(
  initialState as ElementStoreState,
  { name: 'element' } as const
);
