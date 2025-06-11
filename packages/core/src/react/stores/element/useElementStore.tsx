import React from 'react';

import type { Nullable } from '@udecode/utils';

import {
  type ElementEntry,
  type Path,
  type TElement,
  PathApi,
} from '@udecode/slate';

import { createAtomStore } from '../../libs/jotai';
import { useComposing, useReadOnly } from '../../slate-react';
import { useEditorRef, usePlateStore } from '../plate';
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

  if (path && PathApi.equals(path, [0])) {
    return <FirstBlockEffect />;
  }

  return null;
}

function FirstBlockEffect() {
  const editor = useEditorRef();
  const store = usePlateStore();
  const composing = useComposing();
  const readOnly = useReadOnly();

  editor.dom.readOnly = readOnly;
  editor.dom.composing = composing;

  React.useLayoutEffect(() => {
    store.set('composing', composing);
  }, [composing, store]);

  return null;
}
