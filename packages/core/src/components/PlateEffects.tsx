import React from 'react';
import { Value } from '@udecode/slate';

import { usePlateEffects, UsePlateEffectsProps } from '../hooks';
import { PlateEditor } from '../types';

export interface PlateEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends UsePlateEffectsProps<V, E> {
  children: React.ReactNode;
}

export function PlateEffects<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({ children, ...props }: PlateEffectsProps<V, E>) {
  usePlateEffects<V, E>(props);

  return <>{children}</>;
}
