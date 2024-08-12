import { getPluginType } from '@udecode/plate-common';

import type { RemarkTextRules } from './types';

export const remarkDefaultTextRules: RemarkTextRules = {
  emphasis: { mark: ({ editor }) => getPluginType(editor, 'italic') },
  html: { transform: (text: string) => text.replaceAll('<br>', '\n') },
  inlineCode: { mark: ({ editor }) => getPluginType(editor, 'code') },
  strong: { mark: ({ editor }) => getPluginType(editor, 'bold') },
  text: {},
};
