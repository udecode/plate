import { createSlateEditor } from '@udecode/plate';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { MarkdownKit } from '../../../../../apps/www/src/registry/components/editor/plugins/markdown-kit';
import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';

export const createTestEditor = (plugins: any[] = []) =>
  createSlateEditor({
    plugins: [
      ...MarkdownKit,
      BaseSuggestionPlugin,
      BasicMarksPlugin,
      ...plugins,
    ],
  });
