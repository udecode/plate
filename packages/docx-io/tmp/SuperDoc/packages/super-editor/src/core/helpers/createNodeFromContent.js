import { DOMParser, Schema, Fragment } from 'prosemirror-model';

const removeWhitespaces = (node) => {
  const children = node.childNodes;

  for (let i = children.length - 1; i >= 0; i -= 1) {
    const child = children[i];

    if (child.nodeType === 3 && child.nodeValue && /^(\n\s\s|\n)$/.test(child.nodeValue)) {
      node.removeChild(child);
    } else if (child.nodeType === 1) {
      removeWhitespaces(child);
    }
  }

  return node;
};

export function elementFromString(value) {
  // add a wrapper to preserve leading and trailing whitespace
  const wrappedValue = `<body>${value}</body>`;
  const html = new window.DOMParser().parseFromString(wrappedValue, 'text/html').body;
  return removeWhitespaces(html);
}

export function createNodeFromContent(content, schema, options) {
  options = {
    slice: true,
    parseOptions: {},
    ...options,
  };

  const isJSONContent = typeof content === 'object' && content !== null;
  const isTextContent = typeof content === 'string';

  if (isJSONContent) {
    try {
      const isArrayContent = Array.isArray(content) && content.length > 0;

      // if the JSON Content is an array of nodes, create a fragment for each node
      if (isArrayContent) {
        return Fragment.fromArray(content.map((item) => schema.nodeFromJSON(item)));
      }

      const node = schema.nodeFromJSON(content);

      if (options.errorOnInvalidContent) {
        node.check();
      }

      return node;
    } catch (error) {
      if (options.errorOnInvalidContent) {
        throw new Error('[super-editor error]: Invalid JSON content', { cause: error });
      }

      console.warn('[super-editor warn]: Invalid content.', 'Passed value:', content, 'Error:', error);

      return createNodeFromContent('', schema, options);
    }
  }

  if (isTextContent) {
    // Check for invalid content
    if (options.errorOnInvalidContent) {
      let hasInvalidContent = false;
      let invalidContent = '';

      // A copy of the current schema with a catch-all node at the end
      const contentCheckSchema = new Schema({
        topNode: schema.spec.topNode,
        marks: schema.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: schema.spec.nodes.append({
          __supereditor__private__unknown__catch__all__node: {
            content: 'inline*',
            group: 'block',
            parseDOM: [
              {
                tag: '*',
                getAttrs: (e) => {
                  // If this is ever called, we know that the content has something that we don't know how to handle in the schema
                  hasInvalidContent = true;
                  // Try to stringify the element for a more helpful error message
                  invalidContent = typeof e === 'string' ? e : e.outerHTML;
                  return null;
                },
              },
            ],
          },
        }),
      });

      if (options.slice) {
        DOMParser.fromSchema(contentCheckSchema).parseSlice(elementFromString(content), options.parseOptions);
      } else {
        DOMParser.fromSchema(contentCheckSchema).parse(elementFromString(content), options.parseOptions);
      }

      if (options.errorOnInvalidContent && hasInvalidContent) {
        throw new Error('[super-editor error]: Invalid HTML content', {
          cause: new Error(`Invalid element found: ${invalidContent}`),
        });
      }
    }

    const parser = DOMParser.fromSchema(schema);

    if (options.slice) {
      return parser.parseSlice(elementFromString(content), options.parseOptions).content;
    }

    return parser.parse(elementFromString(content), options.parseOptions);
  }

  return createNodeFromContent('', schema, options);
}
