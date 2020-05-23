import { htmlSerialize } from 'serializers/serialize-html';
import { Node as SlateNode } from 'slate';
import {
  BoldPlugin,
  htmlDeserialize,
  ItalicPlugin,
  ListPlugin,
  SlatePlugin,
} from '../../..';

const plugins: SlatePlugin[] = [BoldPlugin(), ItalicPlugin(), ListPlugin()];

const trimWhitespace = (rawHtml: string): string =>
  rawHtml.replace(/(\r\n|\n|\r|\t)/gm, '');

const htmlStringToDOMNode = (rawHtml: string): HTMLElement => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml.replace(/(\r\n|\n|\r|\t)/gm, '');
  return node;
};

const htmlToSlateFormat = (rawHtml: string): SlateNode[] => {
  return htmlDeserialize(plugins)(htmlStringToDOMNode(rawHtml));
};

const exampleHTMLInput = `
  Some paragraph of text with <strong>bold</strong> part and <em>italic</em> part.
  <ul>
    <li>Item one</li>
    <li>Item two</li>
  </ul>
`;

const exampleHTMLOutput = `
  Some paragraph of text with <strong>bold</strong> part and <em>italic</em> part.
  <ul data-slate-type="ul" data-slate-node="element" class="sc-fzqNJr hcIsGR">
    <li data-slate-type="li" data-slate-node="element">Item one</li>
    <li data-slate-type="li" data-slate-node="element">Item two</li>
  </ul>
`;

it('serialize to html', () => {
  expect(htmlSerialize(plugins)(htmlToSlateFormat(exampleHTMLInput))).toEqual(
    trimWhitespace(exampleHTMLOutput)
  );
});
