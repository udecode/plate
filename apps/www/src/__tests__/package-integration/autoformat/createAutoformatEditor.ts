import { createSlateEditor } from 'platejs';

import { AutoformatPlugin } from '../../../../../../packages/autoformat/src/lib/AutoformatPlugin';

import type { AutoformatRule } from '../../../../../../packages/autoformat/src/lib/types';

export const createAutoformatEditor = ({
  enableUndoOnDelete,
  plugins = [],
  rules,
  value,
}: {
  enableUndoOnDelete?: boolean;
  plugins?: any[];
  rules: AutoformatRule[];
  value: any;
}) =>
  createSlateEditor({
    plugins: [
      ...plugins,
      AutoformatPlugin.configure({
        options: {
          enableUndoOnDelete,
          rules,
        },
      }),
    ],
    value,
  });
