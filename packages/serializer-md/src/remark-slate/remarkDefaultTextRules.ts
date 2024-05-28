import { type Value, getPluginType } from '@udecode/plate-common/server';

import type { RemarkTextRules } from './types';

export const remarkDefaultTextRules: RemarkTextRules<Value> = {
  emphasis: { mark: ({ editor }) => getPluginType(editor, 'italic') },
  inlineCode: { mark: ({ editor }) => getPluginType(editor, 'code') },
  strong: { mark: ({ editor }) => getPluginType(editor, 'bold') },
  text: {},
};
