import { createSlateEditor } from '@udecode/plate';
import { markdownPlugins } from '../../../../../../apps/www/src/registry/default/components/editor/plugins/markdown-plugins';

export const createTestEditor = () =>
  createSlateEditor({
    plugins: [markdownPlugins],
  });
