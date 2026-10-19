export declare const jsx: <
  S extends
    | 'anchor'
    | 'cursor'
    | 'editor'
    | 'element'
    | 'focus'
    | 'fragment'
    | 'selection'
    | 'text',
>(
  tagName: S,
  attributes?: object,
  ...children: any[]
) => ReturnType<
  ({
    anchor: typeof import('../../src/hyperscript/creators').createAnchor;
    cursor: typeof import('../../src/hyperscript/creators').createCursor;
    editor: (
      _tagName: string,
      attributes: import('../../src/hyperscript/creators').HyperscriptAttributes,
      children: any[]
    ) => import('platejs').Editor;
    element: typeof import('../../src/hyperscript/creators').createElement;
    focus: typeof import('../../src/hyperscript/creators').createFocus;
    fragment: typeof import('../../src/hyperscript/creators').createFragment;
    selection: typeof import('../../src/hyperscript/creators').createSelection;
    text: typeof import('..').createText;
  } & {})[S]
>;
declare global {
  // JSX ambient declarations require a namespace.
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
