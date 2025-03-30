import { createSlateEditor } from '@udecode/plate';
import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { markdownPlugin } from '../../../../../apps/www/src/registry/default/components/editor/plugins/markdown-plugin';
import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';

export const createTestEditor = (plugins: any[] = []) =>
  createSlateEditor({
    plugins: [
      markdownPlugin,
      BaseSuggestionPlugin,
      BasicMarksPlugin,
      ...plugins,
    ],
  });
