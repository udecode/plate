import { Value } from '../../slate/editor/TEditor';
import { EElement } from '../../slate/element/TElement';
import { EDescendant } from '../../slate/node/TDescendant';
import { isText } from '../../slate/text/isText';
import { EText } from '../../slate/text/TText';
import { SlateProps } from '../../slate/types/SlateProps';
import { PlateEditor } from '../../types/PlateEditor';
import { isEncoded } from './utils/isEncoded';
import { stripSlateDataAttributes } from './utils/stripSlateDataAttributes';
import { trimWhitespace } from './utils/trimWhitespace';
import { elementToHtml } from './elementToHtml';
import { leafToHtml } from './leafToHtml';

/**
 * Convert Slate Nodes into HTML string
 */
export const serializeHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    nodes,
    slateProps,
    stripDataAttributes = true,
    preserveClassNames,
    stripWhitespace = true,
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
  }
): string => {
  let result = nodes
    .map((node) => {
      if (isText(node)) {
        return leafToHtml(editor, {
          props: {
            leaf: node as EText<V>,
            text: node as EText<V>,
            children: isEncoded(node.text)
              ? node.text
              : encodeURIComponent(node.text),
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
          children: encodeURIComponent(
            serializeHtml(editor, {
              nodes: node.children as EDescendant<V>[],
              preserveClassNames,
              stripWhitespace,
            })
          ) as any,
          attributes: { 'data-slate-node': 'element', ref: null },
          editor,
        },
        slateProps,
        preserveClassNames,
      });
    })
    .map((e) => (isEncoded(e) ? decodeURIComponent(e) : e))
    .join('');

  if (stripWhitespace) {
    result = trimWhitespace(result);
  }

  if (stripDataAttributes) {
    result = stripSlateDataAttributes(result);
  }

  return result;
};
