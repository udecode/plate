import { isEditor as isEditorBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const isEditor = (value: any): value is TEditor => isEditorBase(value);
