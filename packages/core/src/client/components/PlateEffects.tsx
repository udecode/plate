import React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../../shared';

import { type UsePlateEffectsProps, usePlateEffects } from '../hooks';

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

  return (
    <div data-id={props.id} id="plate-editor">
      {children}
    </div>
  );
}
