/**
 * Props of the root component of the component to render.
 */
export interface RenderNodePropsOptions {
  /**
   * Additional class name to provide on the root element.
   */
  className?: string;

  as?: any;
}

/**
 * `renderElement` and `renderLeaf` option values
 */
export interface RenderNodeOptions extends RootProps<RenderNodePropsOptions> {
  /**
   * Type of the node.
   */
  type?: string;

  /**
   * React component of the node.
   */
  component?: any;
}

export interface RootProps<T> {
  /**
   * Props of the root component of the React component to render. Falsy props are ignored.
   */
  rootProps?: T;
}
