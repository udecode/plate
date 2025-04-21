import baseRemarkMdx from 'remark-mdx';

import { REMARK_MDX_TAG, tagRemarkPlugin } from '../utils';

export const remarkMdx = tagRemarkPlugin(
  baseRemarkMdx,
  REMARK_MDX_TAG
) as typeof baseRemarkMdx;
