import { createSlateEditor } from 'platejs';
import { BasicMarksPlugin } from '@platejs/basic-nodes/react';
import { MarkdownKit } from '../../../../../apps/www/src/registry/components/editor/plugins/markdown-kit';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { createPlateEditor } from 'platejs/react';

export const createTestEditor = (plugins: any[] = []) =>
  createPlateEditor({
    plugins: [
      ...MarkdownKit,
      BaseSuggestionPlugin,
      BasicMarksPlugin,
      ...plugins,
    ],
  });
