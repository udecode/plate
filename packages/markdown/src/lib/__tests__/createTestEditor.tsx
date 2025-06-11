import { createSlateEditor } from 'platejs';
import { BasicMarksPlugin } from '@platejs/basic-nodes/react';
import { MarkdownKit } from '../../../../../apps/www/src/registry/components/editor/plugins/markdown-kit';
import { BaseSuggestionPlugin } from '@platejs/suggestion';

export const createTestEditor = (plugins: any[] = []) =>
  createSlateEditor({
    plugins: [
      ...MarkdownKit,
      BaseSuggestionPlugin,
      BasicMarksPlugin,
      ...plugins,
    ],
  });
