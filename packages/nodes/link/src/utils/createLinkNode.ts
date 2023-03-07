import {
  getPluginType,
  PlateEditor,
  TText,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_LINK } from '../createLinkPlugin';
import { TLinkElement } from '../types';

export interface CreateLinkNodeOptions {
  url: string;
  text?: string;
  target?: string;
  children?: TText[];
}

export const createLinkNode = <V extends Value>(
  editor: PlateEditor<V>,
  { url, text = '', target, children }: CreateLinkNodeOptions
): TLinkElement => {
  const type = getPluginType(editor, ELEMENT_LINK);

  return {
    type,
    url,
    target,
    children: children ?? [{ text }],
  };
};
