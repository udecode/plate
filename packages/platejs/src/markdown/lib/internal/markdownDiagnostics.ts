import type { Node as UnistNode, Position } from 'unist';

import { ElementApi, type Descendant } from '../../../core';
import type {
  MarkdownDiagnostic,
  MarkdownErrorDiagnostic,
  MarkdownModelLocation,
  MarkdownParseLimits,
  MarkdownSourceLocation,
  MarkdownWarningDiagnostic,
} from '../types';

export const DEFAULT_MARKDOWN_PARSE_LIMITS: MarkdownParseLimits = Object.freeze(
  {
    maxBytes: 5 * 1024 * 1024,
    maxDepth: 256,
    maxNodes: 100_000,
  }
);

const freezeSourceLocation = (
  source: MarkdownSourceLocation
): MarkdownSourceLocation =>
  Object.freeze({
    ...(source.end ? { end: Object.freeze({ ...source.end }) } : {}),
    ...(source.excerpt === undefined ? {} : { excerpt: source.excerpt }),
    ...(source.nodeType === undefined ? {} : { nodeType: source.nodeType }),
    ...(source.start ? { start: Object.freeze({ ...source.start }) } : {}),
  });

const freezeModelLocation = (
  model: MarkdownModelLocation
): MarkdownModelLocation =>
  Object.freeze({
    ...(model.path ? { path: Object.freeze([...model.path]) } : {}),
    ...(model.property === undefined ? {} : { property: model.property }),
    ...(model.root === undefined ? {} : { root: model.root }),
  });

const freezeDiagnostic = (
  diagnostic: MarkdownDiagnostic
): MarkdownDiagnostic => {
  const contextual = diagnostic as MarkdownDiagnostic & {
    model?: MarkdownModelLocation;
    source?: MarkdownSourceLocation;
  };

  return Object.freeze({
    ...diagnostic,
    ...(contextual.model
      ? { model: freezeModelLocation(contextual.model) }
      : {}),
    ...(contextual.source
      ? { source: freezeSourceLocation(contextual.source) }
      : {}),
  }) as MarkdownDiagnostic;
};

export class MarkdownDiagnostics {
  readonly #diagnostics: MarkdownDiagnostic[] = [];
  readonly #keys = new Set<string>();

  constructor(initial: readonly MarkdownDiagnostic[] = []) {
    initial.forEach(this.report);
  }

  readonly report = (diagnostic: MarkdownDiagnostic): void => {
    const frozen = freezeDiagnostic(diagnostic);
    const key = JSON.stringify(frozen);

    if (this.#keys.has(key)) return;
    this.#keys.add(key);
    this.#diagnostics.push(frozen);
  };

  all(): readonly MarkdownDiagnostic[] {
    return Object.freeze([...this.#diagnostics]);
  }

  failure():
    | readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]]
    | null {
    const errorIndex = this.#diagnostics.findIndex(
      (diagnostic) => diagnostic.severity === 'error'
    );

    if (errorIndex === -1) return null;
    return Object.freeze([
      ...this.#diagnostics.filter(
        (diagnostic): diagnostic is MarkdownErrorDiagnostic =>
          diagnostic.severity === 'error'
      ),
      ...this.#diagnostics.filter(
        (diagnostic): diagnostic is MarkdownWarningDiagnostic =>
          diagnostic.severity === 'warning'
      ),
    ]) as readonly [MarkdownErrorDiagnostic, ...MarkdownDiagnostic[]];
  }

  warnings(): readonly MarkdownWarningDiagnostic[] {
    return Object.freeze(
      this.#diagnostics.filter(
        (diagnostic): diagnostic is MarkdownWarningDiagnostic =>
          diagnostic.severity === 'warning'
      )
    );
  }
}

const pointFromPosition = (point: Position['start']) =>
  Object.freeze({
    column: point.column,
    line: point.line,
    ...(point.offset === undefined ? {} : { offset: point.offset }),
  });

export const createMarkdownSourceLocation = (
  node: UnistNode,
  source: string,
  positionsReferToSource: boolean
): MarkdownSourceLocation | undefined => {
  if (!positionsReferToSource || !node.position) return undefined;
  const { end, start } = node.position;
  const excerpt =
    start.offset === undefined || end.offset === undefined
      ? undefined
      : source.slice(start.offset, end.offset);

  return Object.freeze({
    end: pointFromPosition(end),
    ...(excerpt === undefined ? {} : { excerpt }),
    nodeType: node.type,
    start: pointFromPosition(start),
  });
};

export const createMarkdownModelLocator = (
  document: Readonly<{
    children: readonly Descendant[];
    roots?: Readonly<Record<string, readonly Descendant[]>>;
  }>
): ((node: Descendant) => MarkdownModelLocation | undefined) => {
  const locations = new WeakMap<object, MarkdownModelLocation>();
  const visit = (
    nodes: readonly Descendant[],
    path: readonly number[],
    root?: string
  ) => {
    nodes.forEach((node, index) => {
      const nodePath = Object.freeze([...path, index]);

      locations.set(
        node,
        Object.freeze({
          path: nodePath,
          ...(root === undefined ? {} : { root }),
        })
      );
      if (ElementApi.isElement(node)) visit(node.children, nodePath, root);
    });
  };

  visit(document.children, []);
  Object.entries(document.roots ?? {}).forEach(([root, nodes]) =>
    visit(nodes, [], root)
  );

  return (node) => locations.get(node);
};

type TreeNode = UnistNode & { children?: readonly UnistNode[] };

export const checkMarkdownTreeLimits = (
  root: UnistNode,
  limits: MarkdownParseLimits,
  report: (diagnostic: MarkdownDiagnostic) => void
): boolean => {
  const stack: Array<Readonly<{ depth: number; node: TreeNode }>> = [
    { depth: 0, node: root as TreeNode },
  ];
  let nodes = 0;

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current) break;
    nodes += 1;
    if (nodes > limits.maxNodes) {
      report({
        actual: nodes,
        code: 'markdown-limit-exceeded',
        limit: 'maxNodes',
        maximum: limits.maxNodes,
        message: `Markdown contains more than ${limits.maxNodes} syntax nodes.`,
        severity: 'error',
      });

      return false;
    }
    if (current.depth > limits.maxDepth) {
      report({
        actual: current.depth,
        code: 'markdown-limit-exceeded',
        limit: 'maxDepth',
        maximum: limits.maxDepth,
        message: `Markdown syntax depth exceeds ${limits.maxDepth}.`,
        severity: 'error',
      });

      return false;
    }
    current.node.children?.forEach((child) => {
      stack.push({ depth: current.depth + 1, node: child as TreeNode });
    });
  }

  return true;
};

export class ReportedMarkdownFailureError extends Error {
  override name = 'ReportedMarkdownFailureError';
}

export class MarkdownPluginConfigurationError extends TypeError {
  override name = 'MarkdownPluginConfigurationError';
}
