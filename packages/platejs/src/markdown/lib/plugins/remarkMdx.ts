import baseRemarkMdx from 'remark-mdx';

import type { MarkdownSyncPlugin } from '../types';
import { REMARK_MDX_TAG, tagRemarkPlugin } from '../utils';

export const remarkMdx = tagRemarkPlugin(
  baseRemarkMdx as MarkdownSyncPlugin,
  REMARK_MDX_TAG
);
