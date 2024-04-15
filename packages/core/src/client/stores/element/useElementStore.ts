import { TElement } from '@udecode/slate';

import { Nullable } from '../../../types';
import { createAtomStore } from '../../libs/jotai';

export const SCOPE_ELEMENT = 'element';

export type ElementStoreState = { element: TElement };

const initialState: Nullable<ElementStoreState> = {
  element: null,
};

export const { useElementStore, ElementProvider } = createAtomStore(
  initialState as ElementStoreState,
  { name: 'element' } as const
);
