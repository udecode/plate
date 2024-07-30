import {
  type PlateEditor,
  type TText,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK } from '../LinkPlugin';

export interface CreateLinkNodeOptions {
  url: string;
  children?: TText[];
  target?: string;
  text?: string;
}

export const createLinkNode = (
  editor: PlateEditor,
  { children, target, text = '', url }: CreateLinkNodeOptions
): TLinkElement => {
  const type = getPluginType(editor, ELEMENT_LINK);

  return {
    children: children ?? [{ text }],
    target,
    type,
    url,
  };
};
