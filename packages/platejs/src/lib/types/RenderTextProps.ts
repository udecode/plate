import type { Path, Text } from '../../facade';

export type RenderTextFn = (props: RenderTextProps) => any;
export type RenderTextProps<N extends Text = Text> = {
  /** The text node being rendered. */
  text: N;
  /** Pre-computed path for static rendering. */
  path?: Path;
  /** The children (leaves) rendered within this text node. */
  children: any;
  /**
   * HTML attributes to be spread onto the rendered container element. Includes
   * `data-editor-node="text"` and `ref`.
   */
  attributes: {
    [key: string]: unknown;
    'data-editor-node': 'text';
    ref?: any;
    className?: string;
    style?: any;
  };
};
