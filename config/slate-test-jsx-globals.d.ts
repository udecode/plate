// biome-ignore lint/suspicious/noVar: legacy Slate fixture files use a global JSX factory.
declare var jsx: typeof import('@platejs/slate-hyperscript').jsx;

// biome-ignore lint/style/noNamespace: JSX typing requires namespace declarations here.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// biome-ignore lint/style/noNamespace: jsx.JSX typing supports the legacy imported-factory files.
declare namespace jsx.JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
