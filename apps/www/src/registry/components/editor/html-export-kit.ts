import { ElementIdPlugin } from 'platejs';

import { BaseEditorKit } from './plugins-static';

export const HtmlExportKit = [ElementIdPlugin, ...BaseEditorKit] as const;
