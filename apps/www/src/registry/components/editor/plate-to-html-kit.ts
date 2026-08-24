import { ElementIdPlugin } from 'platejs';

import { BaseEditorKit } from './plugins-static';

export const PlateToHtmlEditorKit = [
  ElementIdPlugin,
  ...BaseEditorKit,
] as const;
