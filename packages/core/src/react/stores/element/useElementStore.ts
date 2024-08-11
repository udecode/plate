import type { TElement } from '@udecode/slate';

import type { Nullable } from '../../../lib/types';

import { createAtomStore } from '../../libs/jotai';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreState = { element: TElement };

const initialState: Nullable<ElementStoreState> = {
  element: null,
};

export const { ElementProvider, useElementStore } = createAtomStore(
  initialState as ElementStoreState,
  { name: 'element' } as const
);
