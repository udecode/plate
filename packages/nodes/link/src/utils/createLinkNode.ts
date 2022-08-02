import { getPluginType, PlateEditor, Value } from '@udecode/plate-core';
import { ELEMENT_LINK } from '../createLinkPlugin';
import { TLinkElement } from '../types';

export interface CreateLinkNodeOptions {
  url: string;
  text?: string;
}

export const createLinkNode = <V extends Value>(
  editor: PlateEditor<V>,
  { url, text = '' }: CreateLinkNodeOptions
): TLinkElement => {
  const type = getPluginType(editor, ELEMENT_LINK);

  if (!text.length) text = url;

  return {
    type,
    url,
    children: [{ text }],
  };
};
