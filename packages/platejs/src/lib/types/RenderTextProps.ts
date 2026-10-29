import type { Path, Text } from '../../facade';

export type RenderTextFn = (props: RenderTextProps) => any;

/**
 * Props of a text renderer. Outside a paged view each text gets one call with
 * its host attributes. In a paged view each piece of a text gets its own call
 * with `piece`, so narrow on `piece` before reading `ref` or the text's
 * identity.
 */
export type RenderTextProps<N extends Text = Text> =
  | RenderTextHostProps<N>
  | RenderTextPieceProps<N>;

/** One call for a whole text, which owns the text's identity. */
export type RenderTextHostProps<N extends Text = Text> = {
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
    ref?:
      | ((element: HTMLSpanElement | null) => void)
      | { current: HTMLSpanElement | null }
      | null;
    className?: string;
    style?: any;
  };
  piece?: undefined;
};

/**
 * One call for one piece of a paged text: a measured run of the text on a
 * drawn page, the lines of a page not drawn yet, or a whole text that no layout
 * measures. One line can hold several runs of a text.
 */
export type RenderTextPieceProps<N extends Text = Text> = {
  /** The whole text node the piece belongs to. */
  text: N;
  /** The leaves of this piece alone. */
  children: any;
  /**
   * HTML attributes to be spread onto the rendered element. Includes
   * `data-editor-text-piece` and the attributes plugins add, never the text's
   * identity or `ref`.
   */
  attributes: {
    [key: string]: unknown;
    'data-editor-node'?: never;
    'data-editor-node-key'?: never;
    'data-editor-path'?: never;
    'data-editor-text-piece': true;
    className?: string;
    ref?: never;
    style?: any;
  };
  path?: never;
  /** The piece's position among the text's pieces. */
  piece: Readonly<{ index: number }>;
};
