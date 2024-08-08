import React from 'react';

import { usePlateEffects } from '../hooks';

export interface PlateEffectsProps {
  children: React.ReactNode;
}

export function PlateEffects({ children }: PlateEffectsProps) {
  usePlateEffects();

  return <>{children}</>;
}
