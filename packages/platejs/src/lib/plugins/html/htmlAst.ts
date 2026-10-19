import {
  defaultTreeAdapter,
  ErrorCodes,
  parse,
  parseFragment,
  type DefaultTreeAdapterMap,
  type DefaultTreeAdapterTypes,
  type ParserError,
  type TreeAdapter,
} from 'parse5';

import {
  decideHtmlAttribute,
  decideHtmlElement,
  type HtmlUnsafeRemoval,
} from './htmlSafety';
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
    diagnostics: Object.freeze<
      readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]]
    >([
      Object.freeze({
        actual,
        code: 'html-limit-exceeded' as const,
        limit,
        maximum,
        message: `HTML ${limit} limit ${maximum} was exceeded by ${actual}.`,
        severity: 'error' as const,
      }),
    ]),
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
      getChildNodes(node).forEach((child) => {
        attach(child, depth + 1);
      });
    }
    if (
      defaultTreeAdapter.isElementNode(node) &&
      node.tagName === 'template' &&
      'content' in node
    ) {
      attach(defaultTreeAdapter.getTemplateContent(node), depth + 1);
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

// An author who hides a subtree from assistive technology declares it
// decorative, as icon sets do for inline SVG.
const isAriaHidden = (node: HtmlAstElement) => {
  for (
    let current: HtmlAstNode | null = node;
    current && defaultTreeAdapter.isElementNode(current);
    current = current.parentNode
  ) {
    if (
      current.attrs.some(
        ({ name, value }) =>
          name === 'aria-hidden' && value.trim().toLowerCase() === 'true'
      )
    ) {
      return true;
    }
  }

  return false;
};

const unsafeDiagnostic = (
  source: string,
  node: HtmlAstNode,
  { action, impact, kind, message }: HtmlUnsafeRemoval
): HtmlWarningDiagnostic =>
  Object.freeze({
    action,
    code: 'html-unsafe-content' as const,
    impact,
    kind,
    message,
    severity: 'warning' as const,
    source: sourceLocation(source, node),
  });

// Rebuilds each child list once, so hostile input with many removals stays
// linear.
const applySafetyPolicy = (
  source: string,
  parent: HtmlAstParentNode,
  removals: HtmlWarningDiagnostic[]
) => {
  const children = getChildNodes(parent);
  const kept: HtmlAstChildNode[] = [];

  for (const node of children) {
    if (defaultTreeAdapter.isCommentNode(node)) continue;
    if (!defaultTreeAdapter.isElementNode(node)) {
      kept.push(node);
      continue;
    }
    const tag = node.tagName.toLowerCase();
    const removal = decideHtmlElement(node.namespaceURI, tag, () =>
      isAriaHidden(node)
    );

    if (removal) {
      removals.push(unsafeDiagnostic(source, node, removal));
      continue;
    }
    const attributes = node.attrs;
    let removedSource = false;

    node.attrs = [];
    for (const attribute of attributes) {
      const decision = decideHtmlAttribute(
        tag,
        attribute.name,
        attribute.value
      );

      if (decision && 'removal' in decision) {
        removals.push(unsafeDiagnostic(source, node, decision.removal));
        removedSource ||= attribute.name.toLowerCase() === 'src';
        continue;
      }
      if (decision) attribute.value = decision.value;
      node.attrs.push(attribute);
    }
    // An image that cannot load shows its alt text instead.
    if (removedSource && tag === 'img') {
      const alt = node.attrs.find(({ name }) => name === 'alt')?.value;

      if (alt) {
        const text = defaultTreeAdapter.createTextNode(alt);

        text.parentNode = parent;
        kept.push(text);
      }
      continue;
    }
    kept.push(node);
    applySafetyPolicy(source, node, removals);
    if (tag === 'template') {
      applySafetyPolicy(
        source,
        defaultTreeAdapter.getTemplateContent(
          node as DefaultTreeAdapterTypes.Template
        ),
        removals
      );
    }
  }
  children.length = 0;
  for (const node of kept) children.push(node);
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
    if (error.code === ErrorCodes.missingDoctype) return;

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

    const removals: HtmlWarningDiagnostic[] = [];

    applySafetyPolicy(source, tree, removals);
    const sourceDiagnostics = [...removals, ...diagnostics];

    if (kind === 'document') {
      findEditorRoots(tree, roots);

      if (roots.length > 1) {
        return Object.freeze({
          diagnostics: Object.freeze<
            readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]]
          >([
            Object.freeze({
              code: 'html-multiple-editor-roots' as const,
              count: roots.length,
              message: `HTML contains ${roots.length} elements marked data-editor="true".`,
              severity: 'error' as const,
            }),
            ...sourceDiagnostics,
          ]),
          ok: false as const,
        });
      }
      const root = roots[0] ?? findBody(tree);

      nodes = root ? getChildNodes(root) : getChildNodes(tree);
    } else nodes = getChildNodes(tree);

    const container = { childNodes: [...nodes] } as HtmlAstParentNode;

    return Object.freeze({
      ast: Object.freeze({
        diagnostics: Object.freeze(sourceDiagnostics),
        nodes: Object.freeze(getChildNodes(container)),
      }),
      ok: true as const,
    });
  } catch (error) {
    if (error instanceof HtmlParseLimitExceededError) {
      return limitError(error.limit, error.maximum, error.actual);
    }

    return Object.freeze({
      diagnostics: Object.freeze<
        readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]]
      >([
        Object.freeze({
          code: 'html-invalid-source' as const,
          message:
            error instanceof Error ? error.message : 'HTML parsing failed.',
          reason: 'parser-failure' as const,
          severity: 'error' as const,
        }),
      ]),
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
