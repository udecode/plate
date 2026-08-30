// legacy Plite fixture files use a global JSX factory.
declare var jsx: typeof import('platejs/hyperscript').jsx;

// JSX typing requires namespace declarations here.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// jsx.JSX typing supports the legacy imported-factory files.
declare namespace jsx.JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
