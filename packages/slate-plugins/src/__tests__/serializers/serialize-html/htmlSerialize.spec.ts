import { htmlSerialize } from 'serializers/serialize-html';
import { Node as SlateNode } from 'slate';
import { BoldPlugin, htmlDeserialize, SlatePlugin } from '../../..';

const plugins: SlatePlugin[] = [BoldPlugin()];

const escapeHtml = (rawHtml: string): string =>
  rawHtml.replace(/(\r\n|\n|\r|\t)/gm, '');

const htmlStringToDOMNode = (rawHtml: string): HTMLElement => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml.replace(/(\r\n|\n|\r|\t)/gm, '');
  return node;
};

const htmlToSlateFormat = (rawHtml: string): SlateNode[] => {
  return htmlDeserialize(plugins)(htmlStringToDOMNode(rawHtml));
};

const exampleHTML = `
  Some paragraph of text with <strong>bold</strong> part.
`;

it('serialize to html', () => {
  expect(htmlSerialize(htmlToSlateFormat(exampleHTML))).toEqual(
    escapeHtml(exampleHTML)
  );
});
