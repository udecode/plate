import type { RemarkTextRules } from './types';

export const remarkDefaultTextRules: RemarkTextRules = {
  delete: { mark: ({ editor }) => editor.getType({ key: 'strikethrough' }) },
  emphasis: { mark: ({ editor }) => editor.getType({ key: 'italic' }) },
  html: { transform: (text: string) => text.replaceAll('<br>', '\n') },
  inlineCode: { mark: ({ editor }) => editor.getType({ key: 'code' }) },
  strong: { mark: ({ editor }) => editor.getType({ key: 'bold' }) },
  text: {},
};
