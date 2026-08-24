'use client';

import { ElementIdPlugin } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';

export const PlateToHtmlClientSchemaKit = [
  toPlatePlugin(ElementIdPlugin),
] as const;
