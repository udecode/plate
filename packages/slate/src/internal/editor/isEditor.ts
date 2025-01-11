import { isEditor as isEditorBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

export const isEditor = (value: any): value is Editor => isEditorBase(value);
