import {
  type SlateEditor,
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
  nodes: TDescendant[];
};

export const serializeHtml = async (
  editor: SlateEditor,
  { nodes }: SerializeHtmlOptions
): Promise<string> => {
  const ReactDOMServer = await getReactDOMServer();

  const results = await Promise.all(
    nodes.map(async (node) => {
      if (isText(node)) {
        return staticLeafToHtml(editor, {
          ReactDOMServer,
          props: {
            attributes: { 'data-slate-leaf': true },
            children: newLinesToHtmlBr(encode(node.text)),
            leaf: node,
            text: node,
          },
        });
      }

      const childrenHtml = await serializeHtml(editor, {
        nodes: node.children as TDescendant[],
      });

      return staticElementToHtml(editor, {
        ReactDOMServer,
        props: {
          attributes: {
            'data-slate-node': 'element',
            ref: null,
          },
          children: childrenHtml,
          element: node,
        },
      });
    })
  );

  const result = results.join('');

  return result.trim();
};
