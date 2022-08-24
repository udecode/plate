import 'examples/src/styles.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import '../styles/styles.scss';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/router';
import { Sidebar } from '../components/Sidebar';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: any) {
  const router = useRouter();

  return (
    <div className="app">
      <Sidebar />

      <div style={{ width: '100%', overflow: 'scroll' }}>
        <DndProvider backend={HTML5Backend}>
          <Component key={router.asPath} {...pageProps} />
        </DndProvider>
      </div>
    </div>
  );
}
