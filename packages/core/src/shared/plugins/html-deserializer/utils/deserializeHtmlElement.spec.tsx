/** @jsx jsx */

import { createBoldPlugin } from '@udecode/plate-basic-marks';
import { createPlateEditor } from '@udecode/plate-common';
import { createLinkPlugin } from '@udecode/plate-link';
import { createImagePlugin } from '@udecode/plate-media';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createTablePlugin } from '@udecode/plate-table';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';

import { deserializeHtmlElement } from './deserializeHtmlElement';

jsx;

describe('when element has class and attribute, and plugin has deserialize type, getNode and className', () => {
  const html = '<html><body><div class="poll" data-id="456" /></body></html>';
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <element id="456" type="poll">
        <htext />
      </element>
    </editor>
  ) as any;

  it('should have type and attribute', () => {
    expect(
      deserializeHtmlElement(
        createPlateEditor({
          plugins: [
            {
              deserializeHtml: {
                getNode: (el) => ({
                  id: el.dataset.id,
                  type: 'poll',
                }),
                isElement: true,
                rules: [
                  {
                    validClassName: 'poll',
                  },
                ],
                withoutChildren: true,
              },
              key: 'a',
              type: 'poll',
            },
          ],
        }),
        element
      )
    ).toEqual(output.children);
  });
});

describe('when plugin has deserialize attributeNames', () => {
  const html =
    '<html><body><table><tbody><tr><th colspan="2" bgcolor="#CCC">header</th></tr><tr><td>cell 1</td><td>cell 2</td></tr></tbody></table></body></html>';
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htable>
        <htr>
          <hth attributes={{ colspan: '2' }}>header</hth>
        </htr>
        <htr>
          <htd>cell 1</htd>
          <htd>cell 2</htd>
        </htr>
      </htable>
    </editor>
  ) as any;

  it('should have "attributes" field', () => {
    expect(
      deserializeHtmlElement(
        createPlateEditor({
          plugins: [createTablePlugin()],
        }),
        element
      )
    ).toEqual(output.children);
  });
});

describe('when element has a comment node', () => {
  const html = `<html><body>test<!-- You will not be able to see this text. --></body></html>`;
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test</htext>
    </editor>
  ) as any;

  it('should ignore the comment node', () => {
    expect(
      deserializeHtmlElement(
        createPlateEditor({
          plugins: [],
        }),
        element
      )
    ).toEqual(output.children);
  });
});

describe('when element has pre without child', () => {
  const html = `<html><body>test<pre /></body></html>`;
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test</htext>
    </editor>
  ) as any;

  it('should ignore pre', () => {
    expect(deserializeHtmlElement(createPlateEditor(), element)).toEqual(
      output.children
    );
  });
});

describe('when there is no plugins', () => {
  const html = `<html><body><h1>test</h1></body></html>`;
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test</htext>
    </editor>
  ) as any;

  it('should not deserialize the tags without plugins', () => {
    expect(
      deserializeHtmlElement(
        createPlateEditor({
          plugins: [],
        }),
        element
      )
    ).toEqual(output.children);
  });
});

describe('when plugin has deserialize.attributeNames', () => {
  const html = `<html><body><img alt="removed" src="https://i.imgur.com/removed.png" /></body></html>`;

  const editor = createPlateEditor({
    plugins: [
      createImagePlugin({
        deserializeHtml: {
          attributeNames: ['alt'],
        },
      }),
    ],
  });

  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <himg
        attributes={{ alt: 'removed' }}
        url="https://i.imgur.com/removed.png"
      >
        <htext />
      </himg>
    </editor>
  ) as any;

  it('should set these in node "attributes"', () => {
    expect(deserializeHtmlElement(editor, element)).toEqual(output.children);
  });
});

describe('when plugin has deserialize.getNode', () => {
  const html = `<html><body><p><a href="http://google.com" target="_blank">a</a></p></body></html>`;

  const editor = createPlateEditor({
    plugins: [
      createParagraphPlugin(),
      createLinkPlugin({
        deserializeHtml: {
          getNode: (el) => ({
            opener: el.getAttribute('target') === '_blank',
            type: 'a',
            url: el.getAttribute('href'),
          }),
        },
      }),
    ],
  });

  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <hp>
        <ha opener url="http://google.com">
          a
        </ha>
      </hp>
    </editor>
  ) as any;

  it('should be', () => {
    expect(deserializeHtmlElement(editor, element)).toEqual(output.children);
  });
});

describe('when plugin has deserialize.rules.validNodeName', () => {
  const html = `<html><body><p><b>strong</b></p></body></html>`;

  const editor = createPlateEditor({
    plugins: [
      createParagraphPlugin(),
      createBoldPlugin({
        deserializeHtml: { rules: [{ validNodeName: ['B'] }] },
      }),
    ],
  });

  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <hp>
        <htext bold>strong</htext>
      </hp>
    </editor>
  ) as any;

  it('should be', () => {
    expect(deserializeHtmlElement(editor, element)).toEqual(output.children);
  });
});
