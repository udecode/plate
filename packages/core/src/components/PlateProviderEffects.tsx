import React, { ReactNode } from 'react';
import { Value } from '@udecode/slate';

import { usePlateEffects, UsePlateEffectsProps } from '../hooks';
import { PlateEditor } from '../types';

export interface PlateProviderEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends UsePlateEffectsProps<V, E> {
  children: ReactNode;
}

export function PlateProviderEffects<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({ children, ...props }: PlateProviderEffectsProps<V, E>) {
  usePlateEffects<V, E>(props);

  return <>{children}</>;
}
