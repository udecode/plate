'use client';

import { ElementIdPlugin } from 'platejs';
import { toPlatePlugin } from 'platejs/react';

export const PlateToHtmlClientSchemaKit = [
  toPlatePlugin(ElementIdPlugin),
] as const;
