import React from 'react';

import { decode } from 'html-entities';

import type { SlateEditor } from '../editor';
import type { NodeComponents } from '../plugin';
import type { PlateStaticProps } from './components/PlateStatic';

import { PlateStatic } from './components/PlateStatic';
import { stripHtmlClassNames } from './utils/stripHtmlClassNames';
import { stripSlateDataAttributes } from './utils/stripSlateDataAttributes';

const getReactDOMServer = async () => {
  const ReactDOMServer = (await import('react-dom/server')).default;

  return ReactDOMServer;
};

const renderComponentToHtml = <P extends {}>(
  ReactDOMServer: any,
  Component: React.ComponentType<P>,
  props: P
): string => {
  return decode(
    ReactDOMServer.renderToStaticMarkup(React.createElement(Component, props))
  );
};

/**
 * Serialize the editor content to HTML. By default, uses `PlateStatic` as the
 * editor component, but you can provide a custom component (e.g.
 * `EditorStatic`).
 */
export const serializeHtml = async <
  T extends PlateStaticProps = PlateStaticProps,
>(
  editor: SlateEditor,
  {
    components,
    editorComponent: EditorComponent = PlateStatic,
    preserveClassNames,
    props = {},
    stripClassNames = false,
    stripDataAttributes = false,
  }: {
    /** Node components to render the HTML */
    components: NodeComponents;

    /** The component used to render the editor content */
    editorComponent?: React.ComponentType<T>;

    /** List of className prefixes to preserve from being stripped out */
    preserveClassNames?: string[];

    /** Props to pass to the editor component */
    props?: Partial<T>;

    /** Enable stripping class names */
    stripClassNames?: boolean;

    /** Enable stripping data attributes */
    stripDataAttributes?: boolean;
  }
): Promise<string> => {
  const ReactDOMServer = await getReactDOMServer();

  let htmlString = renderComponentToHtml(ReactDOMServer, EditorComponent, {
    components,
    editor,
    ...props,
  } as T);

  if (stripClassNames) {
    htmlString = stripHtmlClassNames(htmlString, {
      preserveClassNames,
    });
  }
  if (stripDataAttributes) {
    htmlString = stripSlateDataAttributes(htmlString);
  }

  return htmlString;
};
