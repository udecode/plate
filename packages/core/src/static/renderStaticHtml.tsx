import React from 'react';

import { decode } from 'html-entities';

import type { BaseEditor } from '../lib';
import type { PlateStaticProps } from './components/PlateStatic';

import { PlateStatic } from './components/PlateStatic';
import { stripHtmlClassNames } from './utils/stripHtmlClassNames';
import { stripPliteDataAttributes } from './utils/stripPliteDataAttributes';

type ReactDOMServerModule = typeof import('react-dom/server');

const getReactDOMServer = async () => {
  const ReactDOMServer = await import('react-dom/server');

  return ReactDOMServer;
};

const renderComponentToHtml = <P extends {}>(
  ReactDOMServer: ReactDOMServerModule,
  Component: React.ComponentType<P>,
  props: P
): string =>
  decode(
    ReactDOMServer.renderToStaticMarkup(React.createElement(Component, props))
  );

export type RenderStaticHtmlOptions<
  T extends PlateStaticProps = PlateStaticProps,
> = {
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
};

/**
 * Render editor content to static HTML. By default, this uses `PlateStatic` as
 * the editor component. Pass a custom component to control presentation.
 */
export const renderStaticHtml = async <
  T extends PlateStaticProps = PlateStaticProps,
>(
  editor: BaseEditor,
  {
    editorComponent: EditorComponent = PlateStatic,
    preserveClassNames,
    props = {},
    stripClassNames = false,
    stripDataAttributes = false,
  }: RenderStaticHtmlOptions<T> = {}
): Promise<string> => {
  const ReactDOMServer = await getReactDOMServer();

  let htmlString = renderComponentToHtml(ReactDOMServer, EditorComponent, {
    editor,
    ...props,
  } as T);

  if (stripClassNames) {
    htmlString = stripHtmlClassNames(htmlString, {
      preserveClassNames,
    });
  }
  if (stripDataAttributes) {
    htmlString = stripPliteDataAttributes(htmlString);
  }

  return htmlString;
};
