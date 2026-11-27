export type DocxHostIndex = Readonly<{
  byRoot: ReadonlyMap<
    string,
    ReadonlyMap<string, ReadonlyMap<string, readonly HTMLElement[]>>
  >;
  mainBlockTexts: ReadonlyMap<number, readonly HTMLElement[]>;
  occurrenceOf: ReadonlyMap<HTMLElement, number>;
  orderOf: ReadonlyMap<HTMLElement, number>;
  renderedRoots: ReadonlySet<string>;
}>;

const EMPTY_HOSTS: readonly HTMLElement[] = Object.freeze([]);

export const readDocxElementRoot = (element: Element): string | undefined => {
  const encoded = element.getAttribute('data-editor-root-json');

  if (encoded !== null) {
    try {
      const decoded: unknown = JSON.parse(encoded);

      if (typeof decoded === 'string') return decoded;
    } catch {
      // Fall back to the raw attribute when a custom renderer writes invalid JSON.
    }
  }

  return element.getAttribute('data-editor-root') ?? undefined;
};

const findForeignRootAncestor = (
  element: Element,
  root: string
): Element | null => {
  let current = element.parentElement;

  while (current) {
    const ancestorRoot = readDocxElementRoot(current);

    if (ancestorRoot !== undefined && ancestorRoot !== root) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
};

export const indexDocxHosts = (document: Document): DocxHostIndex => {
  const byRoot = new Map<string, Map<string, Map<string, HTMLElement[]>>>();
  const mainBlockTexts = new Map<number, HTMLElement[]>();
  const occurrenceOf = new Map<HTMLElement, number>();
  const orderOf = new Map<HTMLElement, number>();
  const renderedRoots = new Set<string>();
  const rootOccurrences = new Map<
    string,
    {
      lastOwner: Element | null;
      occurrenceId: number;
      seen: Set<string>;
    }
  >();
  let nextOccurrenceId = 1;
  let order = 0;

  for (const element of document.querySelectorAll<HTMLElement>(
    '[data-editor-node], [data-editor-root], [data-editor-root-json]'
  )) {
    const { editorNode, editorPath } = element.dataset;
    const editorRoot = readDocxElementRoot(element);

    if (editorRoot !== undefined) {
      renderedRoots.add(editorRoot);
    }
    if (editorNode === undefined) continue;

    const root = editorRoot ?? 'main';
    const path = editorPath ?? '';

    renderedRoots.add(root);
    orderOf.set(element, order);
    order += 1;

    const owner = findForeignRootAncestor(element, root);
    const isTopLevelBlock =
      editorNode === 'element' && path.length > 0 && !path.includes(',');
    let occ = rootOccurrences.get(root);

    if (
      !occ ||
      occ.lastOwner !== owner ||
      editorNode === 'value' ||
      (isTopLevelBlock && occ.seen.has(path))
    ) {
      occ = {
        lastOwner: owner,
        occurrenceId: nextOccurrenceId,
        seen: isTopLevelBlock ? new Set([path]) : new Set(),
      };
      nextOccurrenceId += 1;
      rootOccurrences.set(root, occ);
    } else if (isTopLevelBlock) {
      occ.seen.add(path);
    }
    occurrenceOf.set(element, occ.occurrenceId);

    let byKind = byRoot.get(root);

    if (!byKind) {
      byKind = new Map();
      byRoot.set(root, byKind);
    }

    let byPath = byKind.get(editorNode);

    if (!byPath) {
      byPath = new Map();
      byKind.set(editorNode, byPath);
    }

    let hosts = byPath.get(path);

    if (!hosts) {
      hosts = [];
      byPath.set(path, hosts);
    }
    hosts.push(element);

    if (editorNode === 'text' && root === 'main' && path.length > 0) {
      const firstSegment = path.split(',')[0] ?? '';
      const block = Number(firstSegment);

      if (
        firstSegment.length > 0 &&
        Number.isSafeInteger(block) &&
        block >= 0
      ) {
        let texts = mainBlockTexts.get(block);

        if (!texts) {
          texts = [];
          mainBlockTexts.set(block, texts);
        }
        texts.push(element);
      }
    }
  }

  return Object.freeze({
    byRoot,
    mainBlockTexts,
    occurrenceOf,
    orderOf,
    renderedRoots,
  });
};

export const getDocxHosts = (
  index: DocxHostIndex,
  root: string,
  nodeKind: string,
  path: string
): readonly HTMLElement[] =>
  index.byRoot.get(root)?.get(nodeKind)?.get(path) ?? EMPTY_HOSTS;

export const getFirstDocxHost = (
  index: DocxHostIndex,
  root: string,
  nodeKind: string,
  path: string
): HTMLElement | undefined => getDocxHosts(index, root, nodeKind, path)[0];
