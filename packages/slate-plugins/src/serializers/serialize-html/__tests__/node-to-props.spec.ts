import { htmlStringToDOMNode, ImagePlugin, LinkPlugin } from '../../../index';
import { serializeHTMLFromNodes } from '../index';

it('serialize link to html with attributes', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        LinkPlugin({
          link: {
            nodeToProps: ({ element }) =>
              /^https?:\/\/slatejs.org\/?/.test(element.url)
                ? {}
                : { target: '_blank' },
          },
        }),
      ],
      nodes: [
        { text: 'An external ' },
        {
          type: 'a',
          url: 'https://theuselessweb.com/',
          children: [{ text: 'link' }],
        },
        { text: ' and an internal ' },
        {
          type: 'a',
          url: 'https://slatejs.org/',
          children: [{ text: 'link' }],
        },
        { text: '.' },
      ],
    })
  ).toBe(
    'An external <a href="https://theuselessweb.com/" class="slate-link" target="_blank">link</a> and an internal <a href="https://slatejs.org/" class="slate-link">link</a>.'
  );
});

it('serialize image with alt to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes({
        plugins: [
          ImagePlugin({
            img: {
              nodeToProps: ({ element }) => ({
                width: element.url.split('/').pop(),
                alt: element.attributes?.alt,
              }),
            },
          }),
        ],
        nodes: [
          {
            type: 'img',
            url: 'https://via.placeholder.com/300',
            attributes: { alt: 'Placeholder' },
            children: [],
          },
        ],
      })
    ).getElementsByTagName('img')[0].outerHTML
  ).toEqual(
    '<img src="https://via.placeholder.com/300" alt="Placeholder" width="300">'
  );
});
