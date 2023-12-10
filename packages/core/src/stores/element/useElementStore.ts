import { TElement } from '@udecode/slate';

import { createAtomStore } from '../../libs';
import { Nullable } from '../../types';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreState = { element: TElement };

const initialState: Nullable<ElementStoreState> = {
  element: null,
};

export const { useElementStore, ElementProvider } = createAtomStore(
  initialState as ElementStoreState,
  { name: 'element' } as const
);
