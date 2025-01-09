import { isEditor as isEditorBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const isEditor = (value: any): value is Editor => isEditorBase(value);
