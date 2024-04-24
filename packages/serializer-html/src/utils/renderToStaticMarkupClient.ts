import React from 'react';
import ReactDOM from 'react-dom';
import ReactClient from 'react-dom/client';

import { createElementWithSlate } from './createElementWithSlate';

const REACT_API_UPDATE_VERSION = 18;

/**
 * See https://react.dev/reference/react-dom/server/renderToString#removing-rendertostring-from-the-client-code
 */
const renderToStaticNew = (elem: ReturnType<typeof createElementWithSlate>) => {
  const div = document.createElement('div');
  const root = ReactClient.createRoot(div);
  ReactDOM.flushSync(() => {
    root.render(elem);
  });
  return div.innerHTML;
};

const renderToStaticOld = (elem: ReturnType<typeof createElementWithSlate>) => {
  const div = document.createElement('div');
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(elem, div);
  return div.innerHTML;
};

const createRenderToStaticMarkup = () => {
  const reactMajorVersion = +React.version.slice(0, 2);
  return reactMajorVersion >= REACT_API_UPDATE_VERSION
    ? renderToStaticNew
    : renderToStaticOld;
};

export const renderToStaticMarkup = createRenderToStaticMarkup();
