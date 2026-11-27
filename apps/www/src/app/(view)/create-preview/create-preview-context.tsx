'use client';

import * as React from 'react';

import {
  PLATE_DEFAULT_CREATE_CONFIG,
  type PlateCreateConfig,
} from '@/lib/plate-create';

export const CreatePreviewConfigContext =
  React.createContext<PlateCreateConfig>(PLATE_DEFAULT_CREATE_CONFIG);

export function useCreatePreviewConfig() {
  return React.use(CreatePreviewConfigContext);
}
