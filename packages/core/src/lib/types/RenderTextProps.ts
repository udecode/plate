import type React from 'react';

import type { TText } from '@udecode/slate';

export type RenderTextFn = (props: RenderTextProps) => React.ReactElement<any>;
export interface RenderTextProps<N extends TText = TText> {
  /** The text node being rendered. */
  text: N;
  /** The children (leaves) rendered within this text node. */
  children: any;
  /**
   * HTML attributes to be spread onto the rendered container element. Includes
   * `data-slate-node="text"` and `ref`.
   */
  attributes: { 'data-slate-node': 'text'; ref: any };
}
