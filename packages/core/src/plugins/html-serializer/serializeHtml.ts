import { Text } from 'slate';
import { PlateEditor } from '../../types/PlateEditor';
import { SlateProps } from '../../types/slate/SlateProps';
import { TDescendant } from '../../types/slate/TDescendant';
import { isEncoded } from './utils/isEncoded';
import { stripSlateDataAttributes } from './utils/stripSlateDataAttributes';
import { trimWhitespace } from './utils/trimWhitespace';
import { elementToHtml } from './elementToHtml';
import { leafToHtml } from './leafToHtml';

/**
 * Convert Slate Nodes into HTML string
 */
export const serializeHtml = (
  editor: PlateEditor,
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
    nodes: TDescendant[];

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
      if (Text.isText(node)) {
        return leafToHtml(editor, {
          props: {
            leaf: node,
            text: node,
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

      return elementToHtml(editor, {
        props: {
          element: node,
          children: encodeURIComponent(
            serializeHtml(editor, {
              nodes: node.children,
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
