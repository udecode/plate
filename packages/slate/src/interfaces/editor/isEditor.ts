import { isEditor as isEditorBase } from 'slate';

import type { TEditor } from './TEditor';

export const isEditor = (value: any): value is TEditor => isEditorBase(value);
