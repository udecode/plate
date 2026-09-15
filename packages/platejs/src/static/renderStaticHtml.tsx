import React from 'react';

import type { Editor } from '../lib';
import type { EditorStaticProps } from './components/PlateStatic';
import { EditorStatic } from './components/PlateStatic';
import { stripHtmlClassNames } from './utils/stripHtmlClassNames.internal';
import { stripPliteDataAttributes } from './utils/stripPliteDataAttributes.internal';

export type RenderStaticHtmlOptions<
  T extends EditorStaticProps = EditorStaticProps,
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
  T extends EditorStaticProps = EditorStaticProps,
>(
  editor: Editor,
  {
    editorComponent: EditorComponent = EditorStatic,
    preserveClassNames,
    props = {},
    stripClassNames = false,
    stripDataAttributes = false,
  }: RenderStaticHtmlOptions<T> = {}
): Promise<string> => {
  const ReactDOMServer = await import('react-dom/server');

  let htmlString = ReactDOMServer.renderToStaticMarkup(
    React.createElement(EditorComponent, { editor, ...props } as T)
  );

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
