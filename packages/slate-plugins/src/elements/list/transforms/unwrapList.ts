import { unwrapNodes } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

export const unwrapList = (editor: Editor, options: SlatePluginsOptions) => {
  const { li, ul, ol } = options;

  unwrapNodes(editor, { match: { type: li.type } });
  unwrapNodes(editor, { match: { type: [ul.type, ol.type] }, split: true });
};
