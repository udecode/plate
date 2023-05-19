import 'examples/src/styles.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import '../styles/globals.scss';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/router';
import { Sidebar } from '../components/Sidebar';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: any) {
  const router = useRouter();

  return (
    <div
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className="app"
    >
      <Sidebar />

      <div style={{ position: 'relative', width: '100%' }}>
        <DndProvider backend={HTML5Backend}>
          <Component key={router.asPath} {...pageProps} />
        </DndProvider>
      </div>
    </div>
  );
}
