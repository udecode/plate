import type { TEditor } from './TEditor';

import { isElement } from '../element';

export const isInline = (editor: TEditor, value: any): boolean =>
  isElement(value) && editor.isInline(value);
