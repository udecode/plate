import { BaseParagraphPlugin, definePlugin, property, schema, target } from '../../../../packages/platejs/src/core';
import { serializeHtml } from '../../../../packages/platejs/src/html';
import { serializeMarkdown } from '../../../../packages/platejs/src/markdown';
import { parseHtmlSlice } from '../../../../packages/platejs/src/html/server';
import { createEditor } from '../../../../packages/platejs/src/core';
import { MarkdownPlugin } from '../../../../packages/platejs/src/markdown';
import { BaseTextAlignPlugin } from '../../../../packages/platejs/src/features/basic-styles';

for (const read of [false, true]) {
  const Probe = definePlugin('probe', {
    schema: { element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { label: property.string() },
    } },
    formats: ({ defineFormats }) => defineFormats({
      html: {
        match: [{ tag: 'section' }],
        decode: () => ({}),
        encode: ({ content, node }) => {
          if (read) void node.label;
          return { tag: 'section', children: content };
        },
      },
      markdown: {
        tag: 'probe',
        decode: () => ({ type: 'probe', children: [{ text: '' }] }),
        encode: ({ node, encodePhrasing }) => {
          if (read) void node.label;
          return { type: 'mdxJsxFlowElement', name: 'probe', attributes: [], children: [{ type: 'paragraph', children: encodePhrasing(node.children) }] };
        },
      },
    }),
  });
  const document = { children: [{ type: 'probe', label: 'must survive', children: [{ text: 'hello' }] }] };
  for (const lossPolicy of ['reject', 'allow'] as const) {
    console.log(JSON.stringify({ read, lossPolicy, html: serializeHtml(document, { plugins: [Probe], lossPolicy }), markdown: serializeMarkdown(document, { plugins: [Probe], lossPolicy }) }));
  }
}

const ClosedGrammar = definePlugin('closedGrammar', {
  schema: { element: { content: schema.content.text({ default: 'text', min: 1 }) } },
  formats: ({ defineFormats }) => defineFormats({
    html: { match: [{ tag: 'section' }], decode: () => ({ children: [{ type: 'paragraph', children: [{ text: 'nested' }] }] }), decodeOnly: true },
    markdown: { tag: 'closedGrammar', decode: () => ({ type: 'closedGrammar', children: [{ type: 'paragraph', children: [{ text: 'nested' }] }] }) },
  }),
});
const editor = createEditor({ plugins: [ClosedGrammar, MarkdownPlugin] });
const capture = (operation: () => unknown) => {
  try { return operation(); } catch (error) { return { throws: error instanceof Error ? error.message : String(error) }; }
};
console.log(JSON.stringify({ closedGrammar: {
  html: capture(() => parseHtmlSlice('<section>x</section>', { plugins: [ClosedGrammar] })),
  markdown: capture(() => editor.api.markdown.parseSlice('<closedGrammar>x</closedGrammar>')),
} }));

for (const value of ['default', 'different']) {
  const Extra = definePlugin('extra', {
    targetPlugins: [BaseParagraphPlugin],
    schema: ({ targetElementTypes }) => ({ properties: {
      label: schema.elementProperty(property.string({ default: 'default', omitDefault: false }), { target: target.types(targetElementTypes) }),
    } }),
  });
  const document = { children: [{ type: 'paragraph', label: value, children: [{ text: 'hello' }] }] };
  console.log(JSON.stringify({ foreignProperty: value, html: serializeHtml(document, { plugins: [Extra] }), markdown: serializeMarkdown(document, { plugins: [Extra] }) }));
}
const aligned = { children: [{ type: 'paragraph', textAlign: 'center', children: [{ text: 'hello' }] }] };
console.log(JSON.stringify({ legitimateDifference: 'textAlign', html: serializeHtml(aligned, { plugins: [BaseTextAlignPlugin] }), markdown: serializeMarkdown(aligned, { plugins: [BaseTextAlignPlugin] }) }));
