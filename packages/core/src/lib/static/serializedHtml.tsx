import React from 'react';

import { decode } from 'html-entities';

import type { SlateEditor } from '../editor';

import { type StaticComponents, PlateStatic } from './components';

const getReactDOMServer = async () => {
  const ReactDOMServer = (await import('react-dom/server')).default;

  return ReactDOMServer;
};

export const serializePlateStatic = async (
  editor: SlateEditor,
  staticComponents: StaticComponents
) => {
  const ReactDOMServer = await getReactDOMServer();

  return renderComponentToHtml(ReactDOMServer, PlateStatic, {
    editor,
    staticComponents,
  });
};

export const renderComponentToHtml = <P extends {}>(
  ReactDOMServer: any,
  type: React.ComponentType<P>,
  props: P
): string => {
  return decode(
    ReactDOMServer.renderToStaticMarkup(React.createElement(type, props))
  );
};
