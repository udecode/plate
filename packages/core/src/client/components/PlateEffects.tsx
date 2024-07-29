import React from 'react';

import { type UsePlateEffectsProps, usePlateEffects } from '../hooks';

export interface PlateEffectsProps extends UsePlateEffectsProps {
  children: React.ReactNode;
}

export function PlateEffects({ children, ...props }: PlateEffectsProps) {
  usePlateEffects(props);

  return <>{children}</>;
}
