/** @jsx jsxt */

import { BoldPlugin } from '@platejs/basic-nodes/react';
import { LinkPlugin } from '@platejs/link/react';
import { ImagePlugin } from '@platejs/media/react';
import { TablePlugin } from '@platejs/table/react';
import { getHtmlDocument, jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../../../../../packages/core/src/lib/editor';
import { createSlatePlugin } from '../../../../../../packages/core/src/lib/plugin';
import { BaseParagraphPlugin } from '../../../../../../packages/core/src/lib/plugins/paragraph';
import { deserializeHtmlElement } from '../../../../../../packages/core/src/lib/plugins/html/utils/deserializeHtmlElement';

jsxt;

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

  it('parses the custom node type and attributes', () => {
    expect(
      deserializeHtmlElement(
        createSlateEditor({
          plugins: [
            createSlatePlugin({
              key: 'a',
              node: { type: 'poll' },
              parsers: {
                html: {
                  deserializer: {
                    isElement: true,
                    rules: [
                      {
                        validClassName: 'poll',
                      },
                    ],
                    withoutChildren: true,
                    parse: ({ element }) => ({
                      id: element.dataset.id,
                      type: 'poll',
                    }),
                  },
                },
              },
            }),
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

  it('stores allowed DOM attributes on the node', () => {
    expect(
      deserializeHtmlElement(
        createSlateEditor({
          plugins: [TablePlugin],
        }),
        element
      )
    ).toEqual(output.children);
  });
});

describe('when element has a comment node', () => {
  const html =
    '<html><body>test<!-- You will not be able to see this text. --></body></html>';
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test</htext>
    </editor>
  ) as any;

  it('ignore the comment node', () => {
    expect(
      deserializeHtmlElement(
        createSlateEditor({
          plugins: [],
        }),
        element
      )
    ).toEqual(output.children);
  });
});

describe('when element has pre without child', () => {
  const html = '<html><body>test<pre /></body></html>';
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test</htext>
    </editor>
  ) as any;

  it('ignores empty pre tags', () => {
    expect(deserializeHtmlElement(createSlateEditor(), element)).toEqual(
      output.children
    );
  });
});

describe('when there is no plugins', () => {
  const html = '<html><body><h1>test</h1></body></html>';
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test</htext>
    </editor>
  ) as any;

  it('does not deserialize the tags without plugins', () => {
    expect(
      deserializeHtmlElement(
        createSlateEditor({
          plugins: [],
        }),
        element
      )
    ).toEqual(output.children);
  });
});

describe('when plugin has deserializer.attributeNames', () => {
  const html = `<html><body><img alt="removed" src="https://i.imgur.com/removed.png" /></body></html>`;

  const editor = createSlateEditor({
    plugins: [
      ImagePlugin.extend({
        parsers: {
          html: {
            deserializer: {
              attributeNames: ['alt'],
            },
          },
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

  it('copies configured attributes onto the node', () => {
    expect(deserializeHtmlElement(editor, element)).toEqual(output.children);
  });
});

describe('when plugin has deserializer.parse', () => {
  const html = `<html><body><p><a href="http://google.com" target="_blank">a</a></p></body></html>`;

  const editor = createSlateEditor({
    plugins: [
      BaseParagraphPlugin,
      LinkPlugin.extend(() => ({
        parsers: {
          html: {
            deserializer: {
              parse: ({ element }) => ({
                opener: element.getAttribute('target') === '_blank',
                type: 'a',
                url: element.getAttribute('href'),
              }),
            },
          },
        },
      })),
    ],
  });

  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <hp>
        <ha url="http://google.com" opener>
          a
        </ha>
      </hp>
    </editor>
  ) as any;

  it('uses the custom parse function result', () => {
    expect(deserializeHtmlElement(editor, element)).toEqual(output.children);
  });
});

describe('when plugin has deserializer.rules.validNodeName', () => {
  const html = '<html><body><p><b>strong</b></p></body></html>';

  const editor = createSlateEditor({
    plugins: [
      BaseParagraphPlugin,
      BoldPlugin.extend({
        parsers: {
          html: {
            deserializer: {
              rules: [{ validNodeName: ['B'] }],
            },
          },
        },
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

  it('respects validNodeName rules for marks', () => {
    expect(deserializeHtmlElement(editor, element)).toEqual(output.children);
  });
});
