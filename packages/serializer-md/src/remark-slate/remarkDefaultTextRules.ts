import { MARK_BOLD, MARK_CODE, MARK_ITALIC } from '@udecode/plate-basic-marks';
import { type Value, getPluginType } from '@udecode/plate-common/server';

import type { RemarkTextRules } from './types';

export const remarkDefaultTextRules: RemarkTextRules<Value> = {
  emphasis: { mark: ({ editor }) => getPluginType(editor, MARK_ITALIC) },
  html: { transform: (text: string) => text.replaceAll('<br>', '\n') },
  inlineCode: { mark: ({ editor }) => getPluginType(editor, MARK_CODE) },
  strong: { mark: ({ editor }) => getPluginType(editor, MARK_BOLD) },
  text: {},
};
