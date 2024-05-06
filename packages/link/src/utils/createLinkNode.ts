import {
  type PlateEditor,
  type TText,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK } from '../createLinkPlugin';

export interface CreateLinkNodeOptions {
  url: string;
  children?: TText[];
  target?: string;
  text?: string;
}

export const createLinkNode = <V extends Value>(
  editor: PlateEditor<V>,
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
