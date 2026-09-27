import {
  defaultTreeAdapter,
  parse,
  parseFragment,
  type DefaultTreeAdapterMap,
  type DefaultTreeAdapterTypes,
  type ParserError,
  type TreeAdapter,
} from 'parse5';

import type {
  HtmlDiagnostic,
  HtmlErrorDiagnostic,
  HtmlParseLimits,
  HtmlSourceLocation,
  HtmlWarningDiagnostic,
} from './htmlTypes';

const DEFAULT_HTML_PARSE_LIMITS: HtmlParseLimits = Object.freeze({
  maxBytes: 5 * 1024 * 1024,
  maxDepth: 256,
  maxNodes: 100_000,
});

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const UNSAFE_ELEMENTS = new Set([
  'base',
  'embed',
  'link',
  'meta',
  'object',
  'script',
  'style',
]);
const URL_ATTRIBUTES = new Set([
  'action',
  'formaction',
  'href',
  'poster',
  'src',
  'xlink:href',
]);
const UNSAFE_URL = /^(?:javascript|vbscript):/iu;
const CSS_RESOURCE = /(?:\burl\s*\(|@import\b)/iu;
const SAFE_IMAGE_DATA_URL =
  /^data:image\/(?:avif|bmp|gif|jpeg|png|webp);base64,[a-z0-9+/]*={0,2}$/iu;

type HtmlAstNode = DefaultTreeAdapterTypes.Node;
type HtmlAstChildNode = DefaultTreeAdapterTypes.ChildNode;
type HtmlAstElement = DefaultTreeAdapterTypes.Element;
type HtmlAstParentNode = DefaultTreeAdapterTypes.ParentNode;

class HtmlParseLimitExceededError extends Error {
  readonly actual: number;
  readonly limit: 'maxDepth' | 'maxNodes';
  readonly maximum: number;

  constructor(limit: 'maxDepth' | 'maxNodes', maximum: number, actual: number) {
    super(`HTML ${limit} limit ${maximum} was exceeded by ${actual}.`);
    this.name = 'HtmlParseLimitExceededError';
    this.actual = actual;
    this.limit = limit;
    this.maximum = maximum;
  }
}

export type ParsedHtmlAst = Readonly<{
  diagnostics: readonly HtmlWarningDiagnostic[];
  nodes: readonly HtmlAstChildNode[];
}>;

export type HtmlAstParseResult =
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>
  | Readonly<{
      ast: ParsedHtmlAst;
      ok: true;
    }>;

/** Return text only when the parsed HTML contains no element nodes. @internal */
export const getHtmlAstPlainText = (ast: ParsedHtmlAst): string | null => {
  let text = '';

  for (const node of ast.nodes) {
    if (!defaultTreeAdapter.isTextNode(node)) return null;
    text += node.value;
  }

  return text;
};

const sourceLocation = (
  source: string,
  node: HtmlAstNode
): HtmlSourceLocation => {
  const location = defaultTreeAdapter.getNodeSourceCodeLocation(node);

  if (
    location &&
    typeof location.startOffset === 'number' &&
    typeof location.endOffset === 'number'
  ) {
    return Object.freeze({
      endCodeUnit: location.endOffset,
      excerpt: source.slice(
        location.startOffset,
        Math.min(location.endOffset, location.startOffset + 160)
      ),
      kind: 'source' as const,
      startCodeUnit: location.startOffset,
    });
  }

  return Object.freeze({ kind: 'tree' as const, path: Object.freeze([]) });
};

const parserLocation = (
  source: string,
  error: ParserError
): HtmlSourceLocation | undefined => {
  if (
    typeof error.startOffset !== 'number' ||
    typeof error.endOffset !== 'number'
  ) {
    return undefined;
  }

  return Object.freeze({
    endCodeUnit: error.endOffset,
    excerpt: source.slice(
      error.startOffset,
      Math.min(error.endOffset, error.startOffset + 160)
    ),
    kind: 'source' as const,
    startCodeUnit: error.startOffset,
  });
};

const limitError = (
  limit: keyof HtmlParseLimits,
  maximum: number,
  actual: number
): HtmlAstParseResult =>
  Object.freeze({
    diagnostics: Object.freeze([
      Object.freeze({
        actual,
        code: 'html-limit-exceeded' as const,
        limit,
        maximum,
        message: `HTML ${limit} limit ${maximum} was exceeded by ${actual}.`,
        severity: 'error' as const,
      }),
    ]) as readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]],
    ok: false as const,
  });

const getChildNodes = (node: HtmlAstParentNode) =>
  defaultTreeAdapter.getChildNodes(node);

const createCountingTreeAdapter = (
  limits: HtmlParseLimits
): TreeAdapter<DefaultTreeAdapterMap> => {
  const depths = new WeakMap<object, number>();
  const nodes = new WeakSet<object>();
  let nodeCount = 0;

  const register = <T extends HtmlAstNode>(node: T): T => {
    if (nodes.has(node)) return node;
    nodes.add(node);
    nodeCount += 1;

    if (nodeCount > limits.maxNodes) {
      throw new HtmlParseLimitExceededError(
        'maxNodes',
        limits.maxNodes,
        nodeCount
      );
    }

    return node;
  };
  const attach = (node: HtmlAstNode, depth: number): void => {
    register(node);

    if (depth > limits.maxDepth) {
      throw new HtmlParseLimitExceededError('maxDepth', limits.maxDepth, depth);
    }
    depths.set(node, depth);

    if ('childNodes' in node) {
      getChildNodes(node as HtmlAstParentNode).forEach((child) => {
        attach(child, depth + 1);
      });
    }
    if (
      defaultTreeAdapter.isElementNode(node) &&
      node.tagName === 'template' &&
      'content' in node
    ) {
      attach(
        defaultTreeAdapter.getTemplateContent(
          node as DefaultTreeAdapterTypes.Template
        ),
        depth + 1
      );
    }
  };
  const childDepth = (parent: HtmlAstParentNode) =>
    (depths.get(parent) ?? 0) + 1;

  return {
    ...defaultTreeAdapter,
    appendChild: (parent, node) => {
      defaultTreeAdapter.appendChild(parent, node);
      attach(node, childDepth(parent));
    },
    createCommentNode: (data) =>
      register(defaultTreeAdapter.createCommentNode(data)),
    createDocument: () => {
      const document = register(defaultTreeAdapter.createDocument());

      depths.set(document, 0);

      return document;
    },
    createDocumentFragment: () => {
      const fragment = register(defaultTreeAdapter.createDocumentFragment());

      depths.set(fragment, 0);

      return fragment;
    },
    createElement: (tagName, namespaceURI, attributes) =>
      register(
        defaultTreeAdapter.createElement(tagName, namespaceURI, attributes)
      ),
    createTextNode: (value) =>
      register(defaultTreeAdapter.createTextNode(value)),
    detachNode: (node) => {
      defaultTreeAdapter.detachNode(node);
      depths.delete(node);
    },
    insertBefore: (parent, node, referenceNode) => {
      defaultTreeAdapter.insertBefore(parent, node, referenceNode);
      attach(node, childDepth(parent));
    },
    insertText: (parent, value) => {
      const previousLength = getChildNodes(parent).length;

      defaultTreeAdapter.insertText(parent, value);

      if (getChildNodes(parent).length > previousLength) {
        attach(
          getChildNodes(parent)[getChildNodes(parent).length - 1],
          childDepth(parent)
        );
      }
    },
    insertTextBefore: (parent, value, referenceNode) => {
      const previousLength = getChildNodes(parent).length;

      defaultTreeAdapter.insertTextBefore(parent, value, referenceNode);

      if (getChildNodes(parent).length > previousLength) {
        const referenceIndex = getChildNodes(parent).indexOf(referenceNode);

        attach(getChildNodes(parent)[referenceIndex - 1], childDepth(parent));
      }
    },
    setDocumentType: (document, name, publicId, systemId) => {
      defaultTreeAdapter.setDocumentType(document, name, publicId, systemId);
      const documentType = getChildNodes(document).find((node) =>
        defaultTreeAdapter.isDocumentTypeNode(node)
      );

      if (documentType) attach(documentType, childDepth(document));
    },
    setTemplateContent: (template, content) => {
      defaultTreeAdapter.setTemplateContent(template, content);
      attach(content, childDepth(template));
    },
  };
};

const isSafeUrl = (tag: string, name: string, value: string) => {
  const normalized = value.trim();

  if (UNSAFE_URL.test(normalized)) return false;
  if (!normalized.toLowerCase().startsWith('data:')) return true;

  return (
    tag === 'img' && name === 'src' && SAFE_IMAGE_DATA_URL.test(normalized)
  );
};

const unsafeDiagnostic = (
  source: string,
  node: HtmlAstNode,
  kind: 'attribute' | 'element' | 'style' | 'url',
  message: string
): HtmlWarningDiagnostic =>
  Object.freeze({
    action: 'removed' as const,
    code: 'html-unsafe-content' as const,
    kind,
    message,
    severity: 'warning' as const,
    source: sourceLocation(source, node),
  });

const applySafetyPolicy = (
  source: string,
  parent: HtmlAstParentNode,
  diagnostics: HtmlWarningDiagnostic[]
) => {
  const children = getChildNodes(parent);

  for (let index = children.length - 1; index >= 0; index--) {
    const node = children[index];

    if (defaultTreeAdapter.isCommentNode(node)) {
      children.splice(index, 1);
      continue;
    }
    if (!defaultTreeAdapter.isElementNode(node)) continue;
    const tag = node.tagName.toLowerCase();

    if (node.namespaceURI !== HTML_NAMESPACE || UNSAFE_ELEMENTS.has(tag)) {
      diagnostics.unshift(
        unsafeDiagnostic(
          source,
          node,
          'element',
          `Removed unsafe HTML element <${tag}>.`
        )
      );
      children.splice(index, 1);
      continue;
    }

    for (
      let attributeIndex = node.attrs.length - 1;
      attributeIndex >= 0;
      attributeIndex--
    ) {
      const attribute = node.attrs[attributeIndex];
      const name = attribute.name.toLowerCase();
      const kind =
        URL_ATTRIBUTES.has(name) || name === 'srcset' ? 'url' : 'attribute';
      const unsafe =
        name.startsWith('on') ||
        name === 'srcdoc' ||
        name === 'srcset' ||
        (URL_ATTRIBUTES.has(name) && !isSafeUrl(tag, name, attribute.value)) ||
        (name === 'style' && CSS_RESOURCE.test(attribute.value));

      if (!unsafe) continue;
      diagnostics.unshift(
        unsafeDiagnostic(
          source,
          node,
          name === 'style' ? 'style' : kind,
          `Removed unsafe HTML attribute "${attribute.name}" from <${tag}>.`
        )
      );
      node.attrs.splice(attributeIndex, 1);
    }

    applySafetyPolicy(source, node, diagnostics);
    if (tag === 'template') {
      applySafetyPolicy(
        source,
        defaultTreeAdapter.getTemplateContent(
          node as DefaultTreeAdapterTypes.Template
        ),
        diagnostics
      );
    }
  }
};

const findBody = (node: HtmlAstParentNode): HtmlAstElement | undefined => {
  for (const child of getChildNodes(node)) {
    if (defaultTreeAdapter.isElementNode(child)) {
      if (child.tagName === 'body') return child;
      const nested = findBody(child);

      if (nested) return nested;
    }
  }

  return undefined;
};

const findEditorRoots = (node: HtmlAstParentNode, roots: HtmlAstElement[]) => {
  getChildNodes(node).forEach((child) => {
    if (!defaultTreeAdapter.isElementNode(child)) return;
    if (
      child.attrs.some(
        ({ name, value }) => name === 'data-editor' && value === 'true'
      )
    ) {
      roots.push(child);
    }
    findEditorRoots(child, roots);
  });
};

export const parseHtmlAst = (
  source: string,
  kind: 'document' | 'slice',
  limitOverrides: Partial<HtmlParseLimits> = {}
): HtmlAstParseResult => {
  const limits = Object.freeze({
    ...DEFAULT_HTML_PARSE_LIMITS,
    ...limitOverrides,
  });
  const bytes = new TextEncoder().encode(source).byteLength;

  if (bytes > limits.maxBytes) {
    return limitError('maxBytes', limits.maxBytes, bytes);
  }
  const diagnostics: HtmlWarningDiagnostic[] = [];
  const onParseError = (error: ParserError) => {
    if (error.code === 'missing-doctype') return;

    diagnostics.push(
      Object.freeze({
        code: 'html-parser-recovery' as const,
        message: `The HTML parser recovered from ${error.code}.`,
        parserCode: error.code,
        severity: 'warning' as const,
        ...(parserLocation(source, error)
          ? { source: parserLocation(source, error) }
          : {}),
      })
    );
  };

  try {
    const treeAdapter = createCountingTreeAdapter(limits);
    const tree =
      kind === 'document'
        ? parse(source, {
            onParseError,
            sourceCodeLocationInfo: true,
            treeAdapter,
          })
        : parseFragment(source, {
            onParseError,
            sourceCodeLocationInfo: true,
            treeAdapter,
          });
    const roots: HtmlAstElement[] = [];
    let nodes: readonly HtmlAstChildNode[];

    applySafetyPolicy(source, tree, diagnostics);

    if (kind === 'document') {
      findEditorRoots(tree, roots);

      if (roots.length > 1) {
        return Object.freeze({
          diagnostics: Object.freeze([
            Object.freeze({
              code: 'html-multiple-editor-roots' as const,
              count: roots.length,
              message: `HTML contains ${roots.length} elements marked data-editor="true".`,
              severity: 'error' as const,
            }),
            ...diagnostics,
          ]) as readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]],
          ok: false as const,
        });
      }
      const root = roots[0] ?? findBody(tree);

      nodes = root ? getChildNodes(root) : getChildNodes(tree);
    } else nodes = getChildNodes(tree);

    const container = { childNodes: [...nodes] } as HtmlAstParentNode;

    return Object.freeze({
      ast: Object.freeze({
        diagnostics: Object.freeze(diagnostics),
        nodes: Object.freeze(getChildNodes(container)),
      }),
      ok: true as const,
    });
  } catch (error) {
    if (error instanceof HtmlParseLimitExceededError) {
      return limitError(error.limit, error.maximum, error.actual);
    }

    return Object.freeze({
      diagnostics: Object.freeze([
        Object.freeze({
          code: 'html-invalid-source' as const,
          message:
            error instanceof Error ? error.message : 'HTML parsing failed.',
          reason: 'parser-failure' as const,
          severity: 'error' as const,
        }),
      ]) as readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]],
      ok: false as const,
    });
  }
};

const materializeNode = (
  node: HtmlAstChildNode,
  ownerDocument: Document
): globalThis.Node | null => {
  if (defaultTreeAdapter.isTextNode(node)) {
    return ownerDocument.createTextNode(node.value);
  }
  if (!defaultTreeAdapter.isElementNode(node)) return null;
  const element = ownerDocument.createElement(node.tagName);

  node.attrs.forEach(({ name, value }) => {
    element.setAttribute(name, value);
  });
  const target =
    node.tagName === 'template' && 'content' in element
      ? (element as HTMLTemplateElement).content
      : element;
  const children =
    node.tagName === 'template'
      ? getChildNodes(
          defaultTreeAdapter.getTemplateContent(
            node as DefaultTreeAdapterTypes.Template
          )
        )
      : getChildNodes(node);

  children.forEach((child) => {
    const materialized = materializeNode(child, ownerDocument);

    if (materialized) target.append(materialized);
  });

  return element;
};

export const materializeHtmlAst = (
  ast: ParsedHtmlAst,
  ownerDocument: Document
): HTMLElement => {
  const root = ownerDocument.body;

  if (!root) {
    throw new Error('HTML DOM adapter must provide a document body.');
  }
  root.replaceChildren();

  ast.nodes.forEach((node) => {
    const materialized = materializeNode(node, ownerDocument);

    if (materialized) root.append(materialized);
  });

  return root;
};

export const createBrowserHtmlDocument = (): Document => {
  if (typeof document === 'undefined') {
    throw new Error(
      'platejs/html requires a browser DOM. Use platejs/html/server in Node.js.'
    );
  }
  return document.implementation.createHTMLDocument('');
};
