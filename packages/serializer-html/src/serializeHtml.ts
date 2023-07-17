import { ComponentClass, FunctionComponent } from 'react';
import {
  EDescendant,
  EElement,
  isText,
  PlateEditor,
  SlateProps,
  Value,
} from '@udecode/plate-common';
import { encode } from 'html-entities';

import { elementToHtml } from './elementToHtml';
import { leafToHtml } from './leafToHtml';
import { newLinesToHtmlBr } from './utils/newLinesToHtmlBr';
import { stripSlateDataAttributes } from './utils/stripSlateDataAttributes';
import { trimWhitespace } from './utils/trimWhitespace';

/**
 * Convert Slate Nodes into HTML string.
 */
export const serializeHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    nodes,
    slateProps,
    stripDataAttributes = true,
    preserveClassNames,
    stripWhitespace = true,
    convertNewLinesToHtmlBr = false,
    dndWrapper,
  }: {
    /**
     * Slate nodes to convert to HTML.
     */
    nodes: EDescendant<V>[];

    /**
     * Enable stripping data attributes
     */
    stripDataAttributes?: boolean;

    /**
     * List of className prefixes to preserve from being stripped out
     */
    preserveClassNames?: string[];

    /**
     * Slate props to provide if the rendering depends on slate hooks
     */
    slateProps?: Partial<SlateProps>;

    /**
     * Whether stripping whitespaces from serialized HTML
     * @default true
     */
    stripWhitespace?: boolean;

    /**
     * Optionally convert new line chars (\n) to HTML <br /> tags
     * @default false
     */
    convertNewLinesToHtmlBr?: boolean;

    /**
     *  Drag and drop component
     */
    dndWrapper?: string | FunctionComponent | ComponentClass;
  }
): string => {
  let result = nodes
    .map((node) => {
      if (isText(node)) {
        const children = encode(node.text);

        return leafToHtml(editor, {
          props: {
            leaf: node as any,
            text: node as any,
            children: convertNewLinesToHtmlBr
              ? newLinesToHtmlBr(children)
              : children,
            attributes: { 'data-slate-leaf': true },
            editor,
          },
          slateProps,
          preserveClassNames,
        });
      }

      return elementToHtml<V>(editor, {
        props: {
          element: node as EElement<V>,
          children: serializeHtml(editor, {
            nodes: node.children as EDescendant<V>[],
            preserveClassNames,
            stripWhitespace,
            convertNewLinesToHtmlBr,
          }),
          attributes: { 'data-slate-node': 'element', ref: null },
          editor,
        },
        slateProps,
        preserveClassNames,
        dndWrapper,
      });
    })
    .join('');

  if (stripWhitespace) {
    result = trimWhitespace(result);
  }

  if (stripDataAttributes) {
    result = stripSlateDataAttributes(result);
  }

  return result;
};
