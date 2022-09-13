import React, { ReactNode } from 'react';
import { usePlateEffects, UsePlateEffectsProps } from '../../hooks/index';
import { Value } from '../../slate/index';
import { PlateEditor } from '../../types/index';

export interface PlateProviderEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends UsePlateEffectsProps<V, E> {
  children: ReactNode;
}

export const PlateProviderEffects = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  children,
  ...props
}: PlateProviderEffectsProps<V, E>) => {
  usePlateEffects<V, E>(props);

  return <>{children}</>;
};
