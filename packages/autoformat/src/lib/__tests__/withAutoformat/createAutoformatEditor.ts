import { createSlateEditor } from 'platejs';

import type { AutoformatRule } from '../../types';

import { AutoformatPlugin } from '../../AutoformatPlugin';

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
  } as any);
