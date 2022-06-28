import 'examples/src/styles.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import React from 'react';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}
