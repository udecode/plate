import type React from 'react';

import type { Path, Text } from '@platejs/plite';

export type RenderTextFn = (props: RenderTextProps) => React.ReactElement<any>;
export type RenderTextProps<N extends Text = Text> = {
  /** The text node being rendered. */
  text: N;
  /** Pre-computed path for static rendering. */
  path?: Path;
  /** The children (leaves) rendered within this text node. */
  children: any;
  /**
   * HTML attributes to be spread onto the rendered container element. Includes
   * `data-plite-node="text"` and `ref`.
   */
  attributes: {
    'data-plite-node': 'text';
    ref: any;
    className?: string;
    style?: React.CSSProperties;
  };
};
