import {
  projectEditorView,
  type EditorDocumentValue,
  readAuthoredView,
} from '../../facade';
import type { Editor } from '../../lib';
import { inheritStaticPresentation } from './staticPresentation';

type RootReader = Readonly<{
  authored: unknown;
  readOnly: boolean;
  view: Editor;
}>;

const views = new WeakMap<object, WeakMap<EditorDocumentValue, Editor>>();
const lastProjected = new WeakMap<
  object,
  Readonly<{ input: EditorDocumentValue; projected: EditorDocumentValue }>
>();
const rootReaders = new WeakMap<Editor, Map<string, RootReader>>();
const rootViewBases = new WeakMap<Editor, Editor>();

const collectIds = (
  nodes: readonly unknown[],
  out: Set<string>
): Set<string> => {
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || 'text' in node) continue;
    const element = node as { children?: readonly unknown[]; id?: unknown };

    if (typeof element.id === 'string') out.add(element.id);
    if (Array.isArray(element.children)) collectIds(element.children, out);
  }

  return out;
};

const reuseUnchangedPrefix = (
  previousInput: readonly unknown[],
  previousProjected: readonly unknown[],
  nextInput: readonly unknown[],
  usedIds: Set<string>
): readonly unknown[] => {
  let prefix = 0;

  while (
    prefix < previousInput.length &&
    prefix < previousProjected.length &&
    prefix < nextInput.length &&
    previousInput[prefix] === nextInput[prefix]
  ) {
    prefix += 1;
  }
  if (prefix === 0) return nextInput;

  const reused: unknown[] = [];

  for (let index = 0; index < prefix; index += 1) {
    const candidate = previousProjected[index];
    const candidateIds = collectIds([candidate], new Set());
    let collides = false;

    for (const id of candidateIds) {
      if (usedIds.has(id)) {
        collides = true;
        break;
      }
    }
    if (collides) break;
    for (const id of candidateIds) usedIds.add(id);
    reused.push(candidate);
  }

  return reused.length > 0
    ? [...reused, ...nextInput.slice(reused.length)]
    : nextInput;
};

const withReusedStaticBlocks = (
  editor: Editor,
  document: EditorDocumentValue
): EditorDocumentValue => {
  const previous = lastProjected.get(editor);

  if (!previous) return document;

  const usedIds = new Set<string>();
  const prefixLen = (a: readonly unknown[], b: readonly unknown[]) => {
    let i = 0;

    while (i < a.length && i < b.length && a[i] === b[i]) i += 1;

    return i;
  };
  const mainPrefix = prefixLen(previous.input.children, document.children);

  collectIds(document.children.slice(mainPrefix), usedIds);
  const prevRoots = previous.input.roots ?? {};
  const nextRoots = document.roots ?? {};

  for (const [root, nodes] of Object.entries(nextRoots)) {
    const pLen = prevRoots[root] ? prefixLen(prevRoots[root], nodes) : 0;

    collectIds(nodes.slice(pLen), usedIds);
  }

  const children = reuseUnchangedPrefix(
    previous.input.children,
    previous.projected.children,
    document.children,
    usedIds
  );
  let rootsChanged = false;
  const roots = document.roots
    ? Object.fromEntries(
        Object.entries(document.roots).map(([root, nodes]) => {
          const prevIn = prevRoots[root];
          const prevProj = previous.projected.roots?.[root];
          const next =
            prevIn && prevProj
              ? reuseUnchangedPrefix(prevIn, prevProj, nodes, usedIds)
              : nodes;

          if (next !== nodes) rootsChanged = true;

          return [root, next];
        })
      )
    : undefined;

  if (children === document.children && !rootsChanged) return document;

  return {
    ...document,
    children: children as EditorDocumentValue['children'],
    ...(roots ? { roots: roots as EditorDocumentValue['roots'] } : {}),
  };
};

/**
 * The read-only view that renders `document` through `editor`'s plugins,
 * projected once per document object; without a document, the editor itself.
 */
export const getStaticDocumentView = (
  editor: Editor,
  document: EditorDocumentValue | undefined
): Editor => {
  if (!document) return editor;

  let byDocument = views.get(editor);

  if (!byDocument) {
    byDocument = new WeakMap();
    views.set(editor, byDocument);
  }

  let view = byDocument.get(document);

  if (!view) {
    view = projectEditorView(editor, {
      document: withReusedStaticBlocks(editor, document),
    });
    inheritStaticPresentation(editor, view);
    byDocument.set(document, view);
  }
  lastProjected.set(editor, { input: document, projected: view.read.value() });

  return view;
};

/**
 * The reader of content root `root` of what `reader` renders. Readers of the
 * same rendered document share one view per root, at any nesting depth, until
 * the rendering view's authored mode or read-only state changes.
 */
export const getStaticRootView = (reader: Editor, root: string): Editor => {
  const base = rootViewBases.get(reader) ?? reader;
  const authored = readAuthoredView(base);
  const readOnly = base.read.view.isReadOnly();
  let byRoot = rootReaders.get(base);

  if (!byRoot) {
    byRoot = new Map();
    rootReaders.set(base, byRoot);
  }

  const cached = byRoot.get(root);

  if (cached && cached.authored === authored && cached.readOnly === readOnly) {
    return cached.view;
  }

  const view = projectEditorView(base, { root }) as unknown as Editor;

  inheritStaticPresentation(base, view);
  byRoot.set(root, { authored, readOnly, view });
  rootViewBases.set(view, base);

  return view;
};
