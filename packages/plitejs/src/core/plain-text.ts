import type {
  ContentSlice,
  EditorCoreStateView,
  EditorDocumentValue,
  Value,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { TextApi } from '../interfaces/text';

export type StructuralPlainTextDiagnostic = Readonly<{
  code:
    | 'plain-text-unsupported-metadata'
    | 'plain-text-unsupported-node'
    | 'plain-text-unsupported-root';
  message: string;
  path?: Path;
  root?: string;
  severity: 'warning';
}>;

export type StructuralPlainTextEncodeContext<V extends Value = Value> =
  Readonly<{
    children: string;
    node: Descendant;
    path: Path;
    root: string;
    rootText: (slot: string) => string;
    state: EditorCoreStateView<V>;
  }>;

export type StructuralPlainTextEncoder<V extends Value = Value> = (
  context: StructuralPlainTextEncodeContext<V>
) => string | undefined;

export type StructuralPlainTextResult = Readonly<{
  data: string;
  diagnostics: readonly StructuralPlainTextDiagnostic[];
}>;

type StructuralPlainTextInput = Readonly<{
  content: readonly Descendant[];
  meta?: EditorDocumentValue['meta'];
  roots?: Readonly<Record<string, readonly Descendant[]>>;
}>;

export const serializeStructuralPlainText = <V extends Value>(
  input: StructuralPlainTextInput | ContentSlice<V>,
  state: EditorCoreStateView<V>,
  encode?: StructuralPlainTextEncoder<V>
): StructuralPlainTextResult => {
  const diagnostics: StructuralPlainTextDiagnostic[] = [];
  const cyclicRootEdges = new Set<string>();
  const reachedRoots = new Set<string>();
  const roots = input.roots ?? {};
  const serializeNodes = (
    nodes: readonly Descendant[],
    root: string,
    parentPath: Path,
    activeRoots: ReadonlySet<string>
  ) => {
    const output: Array<Readonly<{ block: boolean; text: string }>> = [];

    nodes.forEach((node, index) => {
      const path = [...parentPath, index];

      if (TextApi.isText(node)) {
        output.push({ block: false, text: node.text });

        return;
      }
      if (!ElementApi.isElement(node)) return;
      const contentRoots = state.schema.getElementContentRoots(node);
      const readRoot = (slot: string) => {
        const rootKey = contentRoots[slot];

        if (!rootKey) return '';
        reachedRoots.add(rootKey);

        if (activeRoots.has(rootKey)) {
          const edge = `${root}\u0000${rootKey}`;

          if (!cyclicRootEdges.has(edge)) {
            cyclicRootEdges.add(edge);
            diagnostics.push(
              Object.freeze({
                code: 'plain-text-unsupported-root' as const,
                message: `Plain text omits cyclic reference to document root "${rootKey}".`,
                root: rootKey,
                severity: 'warning' as const,
              })
            );
          }

          return '';
        }

        return serializeNodes(
          roots[rootKey] ?? [],
          rootKey,
          [],
          new Set([...activeRoots, rootKey])
        ).text;
      };
      const children = serializeNodes(
        node.children,
        root,
        path,
        activeRoots
      ).text;
      const encoded = encode?.({
        children,
        node,
        path,
        root,
        rootText: readRoot,
        state,
      });
      const owned = Object.keys(contentRoots)
        .map(readRoot)
        .filter(Boolean)
        .join('\n');
      const fallback = [children, owned].filter(Boolean).join('\n');

      if (
        encoded === undefined &&
        (state.schema.isAtom(node) || state.schema.isVoid(node))
      ) {
        diagnostics.push(
          Object.freeze({
            code: 'plain-text-unsupported-node' as const,
            message: `Plain text has no representation for element "${node.type}".`,
            path,
            root,
            severity: 'warning' as const,
          })
        );
      }
      output.push({
        block: state.schema.isBlock(node),
        text: encoded ?? fallback,
      });
    });

    return {
      text: output.reduce((text, part, index) => {
        const previous = output[index - 1];
        const separator =
          text && part.text && (part.block || previous?.block) ? '\n' : '';

        return text + separator + part.text;
      }, ''),
    };
  };
  const data = serializeNodes(
    input.content,
    'main',
    [],
    new Set(['main'])
  ).text;

  for (const root of Object.keys(roots)) {
    if (root === 'main' || reachedRoots.has(root)) continue;
    diagnostics.push(
      Object.freeze({
        code: 'plain-text-unsupported-root' as const,
        message: `Plain text omits unreachable document root "${root}".`,
        root,
        severity: 'warning' as const,
      })
    );
  }
  for (const key of Object.keys('meta' in input ? (input.meta ?? {}) : {})) {
    if (key === 'authored') continue;
    diagnostics.push(
      Object.freeze({
        code: 'plain-text-unsupported-metadata' as const,
        message: `Plain text omits document metadata "${key}".`,
        severity: 'warning' as const,
      })
    );
  }

  return Object.freeze({
    data,
    diagnostics: Object.freeze(diagnostics),
  });
};
