import {
  type SlateEditor,
  type StaticComponents,
  type TDescendant,
  isText,
} from '@udecode/plate-common';
import { encode } from 'html-entities';

import { newLinesToHtmlBr } from './newLinesToHtmlBr';
import { staticElementToHtml } from './staticElementToHtml';
import { staticLeafToHtml } from './staticLeafToHtml';

const getReactDOMServer = async () => {
  const ReactDOMServer = (await import('react-dom/server')).default;

  return ReactDOMServer;
};

type SerializeHtmlOptions = {
  components: StaticComponents;
  nodes: TDescendant[];
};

export const serializeHtml = async (
  editor: SlateEditor,
  { components, nodes }: SerializeHtmlOptions
): Promise<string> => {
  const ReactDOMServer = await getReactDOMServer();

  const results = await Promise.all(
    nodes.map(async (node) => {
      if (isText(node)) {
        return staticLeafToHtml(editor, {
          ReactDOMServer,
          components,
          props: {
            attributes: { 'data-slate-leaf': true },
            children: newLinesToHtmlBr(encode(node.text)),
            leaf: node,
            text: node,
          },
        });
      }

      const childrenHtml = await serializeHtml(editor, {
        components,
        nodes: node.children as TDescendant[],
      });

      return staticElementToHtml(editor, {
        ReactDOMServer,
        components,
        props: {
          attributes: {
            'data-slate-node': 'element',
            ref: null,
          },
          children: childrenHtml,
          editor,
          element: node,
        },
      });
    })
  );

  const result = results.join('');

  return result.trim();
};
