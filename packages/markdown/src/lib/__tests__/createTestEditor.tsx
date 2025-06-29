import { createSlateEditor } from 'platejs';
import { BasicMarksPlugin } from '@platejs/basic-nodes/react';
import { BaseEditorKit } from '../../../../../apps/www/src/registry/components/editor/editor-base-kit';

import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { createPlateEditor } from 'platejs/react';

export const createTestEditor = (plugins: any[] = []) =>
  createPlateEditor({
    plugins: [...BaseEditorKit, ...plugins],
  });
