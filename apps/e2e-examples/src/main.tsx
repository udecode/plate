import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { TableApp } from './TableApp.js';

const router = createBrowserRouter([
  {
    element: <TableApp />,
    path: '/table/:variant',
  },
]);

const rootElement = document.querySelector('#root');

// eslint-disable-next-line react/no-deprecated
ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  rootElement
);
