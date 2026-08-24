import { ElementIdPlugin } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';

import { BaseEditorKit } from './plugins-static';

export const PlateToHtmlSchemaKit = [toPlatePlugin(ElementIdPlugin)] as const;

export const PlateToHtmlEditorKit = [
  ElementIdPlugin,
  ...BaseEditorKit,
] as const;
