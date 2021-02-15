import { setDefaults, unwrapNodes } from '@udecode/slate-plugins-common';
import { Editor } from 'slate';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

export const unwrapList = (editor: Editor, options?: ListOptions) => {
  const { li, ul, ol } = setDefaults(options, DEFAULTS_LIST);

  unwrapNodes(editor, { match: { type: li.type } });
  unwrapNodes(editor, { match: { type: [ul.type, ol.type] }, split: true });
};
