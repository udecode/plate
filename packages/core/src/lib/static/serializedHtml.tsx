import React from 'react';

import { decode } from 'html-entities';

import type { SlateEditor } from '../editor';

import { type StaticComponents, PlateStatic } from './components';
import { stripHtmlClassNames } from './utils/stripHtmlClassNames';
import { stripSlateDataAttributes } from './utils/stripSlateDataAttributes';

const getReactDOMServer = async () => {
  const ReactDOMServer = (await import('react-dom/server')).default;

  return ReactDOMServer;
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

export const serializePlateStatic = async (
  editor: SlateEditor,
  staticComponents: StaticComponents,
  options: {
    /** List of className prefixes to preserve from being stripped out */
    preserveClassNames?: string[];

    /** Enable stripping class names */
    stripClassNames?: boolean;

    /** Enable stripping data attributes */
    stripDataAttributes?: boolean;
  } = {}
) => {
  const ReactDOMServer = await getReactDOMServer();

  let htmlString = renderComponentToHtml(ReactDOMServer, PlateStatic, {
    editor,
    staticComponents,
  });

  const {
    preserveClassNames,
    stripClassNames = false,
    stripDataAttributes = false,
  } = options;

  if (stripClassNames) {
    htmlString = stripHtmlClassNames(htmlString, {
      preserveClassNames: preserveClassNames,
    });
  }
  if (stripDataAttributes) {
    htmlString = stripSlateDataAttributes(htmlString);
  }

  return htmlString;
};
