export declare const jsx: <
  S extends (
    | 'anchor'
    | 'cursor'
    | 'editor'
    | 'element'
    | 'focus'
    | 'fragment'
    | 'selection'
    | 'text'
  ) &
    string,
>(
  tagName: S,
  attributes?: Object,
  ...children: any[]
) => ReturnType<
  ({
    anchor: typeof import('../src/creators').createAnchor;
    cursor: typeof import('../src/creators').createCursor;
    editor: (
      _tagName: string,
      attributes: {
        [key: string]: any;
      },
      children: any[]
    ) => import('platejs').Editor;
    element: typeof import('../src/creators').createElement;
    focus: typeof import('../src/creators').createFocus;
    fragment: typeof import('../src/creators').createFragment;
    selection: typeof import('../src/creators').createSelection;
    text: typeof import('..').createText;
  } & {})[S]
>;
declare global {
  // biome-ignore lint/style/noNamespace: JSX ambient declarations require a namespace.
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
