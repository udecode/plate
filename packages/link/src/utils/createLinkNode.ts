import {
  type PlateEditor,
  type TText,
  getPluginType,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';

import { LinkPlugin } from '../LinkPlugin';

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
  const type = getPluginType(editor, LinkPlugin.key);

  return {
    children: children ?? [{ text }],
    target,
    type,
    url,
  };
};
