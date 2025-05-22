import React from 'react';

import type { Nullable } from '@udecode/utils';

import {
  type ElementEntry,
  type Path,
  type TElement,
  PathApi,
} from '@udecode/slate';

import { FirstBlockEffect } from '../../../internal/plugin/FirstBlockEffect';
import { createAtomStore } from '../../libs/jotai';
import { usePath } from './usePath';

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
    { effect: Effect, name: 'element', suppressWarnings: true } as const
  );

function Effect() {
  const path = usePath();

  if (PathApi.equals(path, [0])) {
    return <FirstBlockEffect />;
  }

  return null;
}
