import React from 'react';

import type { Editor } from '../lib';
import type { PlateStaticProps } from './components/PlateStatic';
import { PlateStatic } from './components/PlateStatic';
import { stripHtmlClassNames } from './utils/stripHtmlClassNames.internal';
import { stripPliteDataAttributes } from './utils/stripPliteDataAttributes.internal';

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
  editor: Editor,
  {
    editorComponent: EditorComponent = PlateStatic,
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
