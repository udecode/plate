import {
  type AuthoredMark,
  AuthoredPlugin,
  type AuthoredReview,
} from '../../../authored';
import {
  type Editor,
  type Element as EditorElement,
  ElementApi,
  type Descendant,
  type EditorDocumentRecords,
  type EditorDocumentValue,
  type Path,
  type Value,
} from '../../../core';
import { BaseTablePlugin, type TableElement } from '../../../features/table';
import type { DocxDiagnostic } from '../../internal/types';
import {
  type DocxHostIndex,
  getDocxHosts,
  getFirstDocxHost,
  readDocxElementRoot,
} from './hostIndex';

/** A change as Word stores it; `id` numbers the change across the file. */
export type DocxRevision = Readonly<{ at: number; author: string; id: number }>;

export type ReviewRun = Readonly<{
  deletion: DocxRevision | null;
  format:
    | (DocxRevision & Readonly<{ previous: AuthoredReview['accepted'] }>)
    | null;
  insertionsOuterFirst: readonly DocxRevision[];
}>;

type ReviewHostTarget = Readonly<{
  node: 'element' | 'text';
  path: Path;
  root: string;
}>;

export type ReviewRunEntry = ReviewHostTarget &
  Readonly<{
    run: ReviewRun;
  }>;

export type ReviewStructureEntry = ReviewHostTarget &
  Readonly<{
    revision: DocxRevision;
  }>;

export type ReviewProjection = Readonly<{
  /** Top-level blocks of the main root that hold review marks. */
  bound: readonly number[];
  diagnostics: readonly DocxDiagnostic[];
  document: EditorDocumentValue;
  runs: readonly ReviewRunEntry[];
  stored: EditorDocumentValue;
  structures: readonly ReviewStructureEntry[];
}>;

/** A review export's Word revisions and the stored blocks its part keeps. */
export type PreparedDocxReview = Readonly<{
  bindings: ReadonlyArray<
    Readonly<{ end: string; nodes: Value; start: string }>
  >;
  diagnostics: readonly DocxDiagnostic[];
  records: EditorDocumentRecords | undefined;
  runs: readonly ReviewRun[];
}>;

/** Prefix of the tokens that mark where a bound block starts and ends. */
export const REVIEW_TOKEN = '\uE000PDXR_';

const holdsMarks = (node: Descendant): boolean =>
  'authored' in node ||
  (ElementApi.isElement(node) && node.children.some(holdsMarks));

/**
 * Read the review marks of a stored document as Word revisions. Paths are the
 * stored document's, so ranges into it need no mapping.
 */
export const createReviewProjection = (
  editor: Editor,
  stored: EditorDocumentValue
): ReviewProjection => {
  const reviewOf = (node: Descendant) =>
    editor.plugin(AuthoredPlugin).read.reviewOf(node);
  const tablePlugin = editor.plugin(BaseTablePlugin);
  const { schema } = editor.read;
  const isInlineVoid = (node: Descendant) =>
    schema.isVoid(node) && schema.isInline(node);
  const gridRoleOf = (node: EditorElement) => {
    const structure = schema.element(node.type)?.structure;

    return structure?.kind === 'grid' ? structure.role : null;
  };
  const marksOf = (node: Descendant) =>
    'authored' in node && node.authored ? reviewOf(node).marks : [];
  const isPlacement = ({ kind }: AuthoredMark) =>
    kind === 'insert' || kind === 'delete';
  const placementOf = ({ at, change, inc, kind }: AuthoredMark) =>
    JSON.stringify([kind, change, inc ?? at]);
  const partsOf = (node: EditorElement): EditorElement[] =>
    node.children.flatMap((child) => {
      if (!ElementApi.isElement(child)) return [];
      const role = gridRoleOf(child);

      if (role === 'cell') return [child];
      if (role === 'row') return [child, ...partsOf(child)];

      return role === null ? partsOf(child) : [];
    });
  const holdsGridChange = (table: EditorElement) => {
    const wholeTableChanges = new Set(
      marksOf(table).filter(isPlacement).map(placementOf)
    );

    return [table, ...partsOf(table)].some((element) =>
      marksOf(element).some((mark) =>
        isPlacement(mark)
          ? !wholeTableChanges.has(placementOf(mark))
          : mark.kind === 'format'
      )
    );
  };
  const diagnostics: DocxDiagnostic[] = [];
  const revisionIds = new Map<string, number>();
  const runs: ReviewRunEntry[] = [];
  const structures: ReviewStructureEntry[] = [];
  const revisionOf = ({ at, author, change }: AuthoredMark): DocxRevision => {
    let id = revisionIds.get(change);

    if (id === undefined) {
      id = revisionIds.size + 1;
      revisionIds.set(change, id);
    }

    return { at, author, id };
  };
  const build = (
    nodes: readonly Descendant[],
    root: string,
    parentPath: Path
  ): Descendant[] =>
    nodes.map((node, index) => {
      const path = [...parentPath, index];
      const { authored, ...plain } = node as Descendant & {
        authored?: readonly AuthoredMark[];
      };
      const review = authored ? reviewOf(node) : null;
      const marks = review?.marks ?? [];
      const isText = !ElementApi.isElement(node);

      if (isText || isInlineVoid(node)) {
        const insertions = marks.filter(({ kind }) => kind === 'insert');
        const deletion = marks.find(({ kind }) => kind === 'delete');
        const format = isText
          ? marks.find(({ kind }) => kind === 'format')
          : undefined;

        if (insertions.length > 0 || deletion || format) {
          runs.push({
            node: isText ? 'text' : 'element',
            path,
            root,
            run: {
              deletion: deletion ? revisionOf(deletion) : null,
              format:
                format && review
                  ? { ...revisionOf(format), previous: review.accepted }
                  : null,
              insertionsOuterFirst: insertions.map(revisionOf),
            },
          });
        }
      }
      if (!ElementApi.isElement(node)) return plain;
      if (
        root === 'main' &&
        gridRoleOf(node) === 'grid' &&
        holdsGridChange(node)
      ) {
        diagnostics.push({
          code: 'lossy-content',
          feature: 'authored-review',
          message: `The table at ${path.join('.')} holds a pending row, column or table format change that Word's revisions cannot carry, so deciding it in Word gives a different table.`,
          path,
          root,
          severity: 'warning',
        });
      }
      const structure = marks.find(
        (mark) =>
          mark.kind !== 'insert' &&
          mark.kind !== 'delete' &&
          mark.kind !== 'joined'
      );

      if (structure) {
        structures.push({
          node: 'element',
          path,
          revision: revisionOf(structure),
          root,
        });
      }

      // The projection drops the marks the table plugin reads, so a table whose
      // column change waits keeps the widths the editor shows.
      const shownWidths =
        tablePlugin.installed &&
        node.type === tablePlugin.schema.type &&
        marks.some(
          (mark) => mark.kind === 'format' && mark.key === 'columnWidths'
        )
          ? { columnWidths: tablePlugin.api.columnWidths(node as TableElement) }
          : {};

      return {
        ...plain,
        ...shownWidths,
        children: build(node.children, root, path),
      };
    });
  const rootValue = (nodes: Descendant[]): Value =>
    nodes.filter((node) => ElementApi.isElement(node));
  const roots = Object.fromEntries(
    Object.entries(stored.roots ?? {}).map(([root, nodes]) => [
      root,
      rootValue(build(nodes, root, [])),
    ])
  );
  const children = rootValue(build(stored.children, 'main', []));

  return Object.freeze({
    bound: stored.children.flatMap((node, index) =>
      holdsMarks(node) ? [index] : []
    ),
    diagnostics: Object.freeze(diagnostics),
    document: Object.freeze({
      children,
      ...(Object.keys(roots).length > 0 ? { roots } : {}),
    }),
    runs,
    stored,
    structures,
  });
};

const setStructureAttributes = (element: Element, revision: DocxRevision) => {
  element.setAttribute('data-editor-change-kind', 'structure');
  element.setAttribute('data-editor-revision-id', String(revision.id));
  element.setAttribute('data-editor-author-id', revision.author);
  if (revision.at > 0) {
    element.setAttribute(
      'data-editor-created-at',
      new Date(revision.at).toISOString()
    );
  }
};

const MISSING_ELEMENT_HOST =
  'A configured static element renderer omitted its Plate path attributes.';

const missingHost = (
  feature: string,
  target: ReviewHostTarget,
  message: string
): DocxDiagnostic => ({
  action: 'replaced',
  code: 'unsupported-content',
  feature,
  impact: 'lossy',
  message,
  path: target.path,
  root: target.root,
  severity: 'warning',
});

const isForeignRootElement = (element: Element, root: string): boolean => {
  const elementRoot = readDocxElementRoot(element);

  return elementRoot !== undefined && elementRoot !== root;
};

const hasForeignRootInSubtree = (node: Node, root: string): boolean => {
  if (node.nodeType !== 1) return false;
  const element = node as Element;

  if (isForeignRootElement(element, root)) return true;
  for (const child of element.querySelectorAll(
    '[data-editor-root], [data-editor-root-json]'
  )) {
    if (isForeignRootElement(child, root)) return true;
  }

  return false;
};

const hasForeignRootAncestor = (element: Element, root: string): boolean => {
  let current = element.parentElement;

  while (current) {
    if (isForeignRootElement(current, root)) return true;
    current = current.parentElement;
  }

  return false;
};

const enclosesForeignRoot = (
  first: HTMLElement,
  last: HTMLElement,
  root: string
): boolean => {
  if (
    hasForeignRootAncestor(first, root) ||
    hasForeignRootAncestor(last, root)
  ) {
    return true;
  }
  if (first === last || first.contains(last)) {
    return hasForeignRootInSubtree(first, root);
  }
  if (last.contains(first)) {
    return hasForeignRootInSubtree(last, root);
  }
  if (
    hasForeignRootInSubtree(first, root) ||
    hasForeignRootInSubtree(last, root)
  ) {
    return true;
  }

  let current: Node | null = first;

  while (current && current !== last) {
    if (current.nextSibling) {
      current = current.nextSibling;
      while (current && current !== last && current.contains(last)) {
        if (
          current.nodeType === 1 &&
          isForeignRootElement(current as Element, root)
        ) {
          return true;
        }
        current = current.firstChild;
      }
      if (!current || current === last) break;
      if (hasForeignRootInSubtree(current, root)) return true;
    } else {
      current = current.parentNode;
      if (
        current &&
        current.nodeType === 1 &&
        isForeignRootElement(current as Element, root)
      ) {
        return true;
      }
    }
  }

  return false;
};

const topLevelBlockOfPath = (path: string | null): number | null => {
  if (!path) return null;
  const firstSegment = path.split(',')[0] ?? '';
  const block = Number(firstSegment);

  return firstSegment.length > 0 && Number.isSafeInteger(block) && block >= 0
    ? block
    : null;
};

const outermostTableAncestor = (element: Element): Element | null => {
  let table: Element | null = null;
  let current: Element | null = element;

  while (current) {
    if (current.tagName === 'TABLE') {
      table = current;
    }
    current = current.parentElement;
  }

  return table;
};

const directChildOfValue = (element: Element): Element | null => {
  let current: Element | null = element;

  while (current?.parentElement) {
    if (current.parentElement.getAttribute('data-editor-node') === 'value') {
      return current;
    }
    current = current.parentElement;
  }

  return null;
};

const hasForeignOrSiblingBlockInSubtree = (
  container: Element,
  index: number
): boolean => {
  if (hasForeignRootInSubtree(container, 'main')) return true;

  const containerBlock = topLevelBlockOfPath(
    container.getAttribute('data-editor-path')
  );

  if (containerBlock !== null && containerBlock !== index) return true;

  for (const child of container.querySelectorAll('[data-editor-path]')) {
    const root = readDocxElementRoot(child) ?? 'main';

    if (root !== 'main') return true;
    const block = topLevelBlockOfPath(child.getAttribute('data-editor-path'));

    if (block !== null && block !== index) return true;
  }

  return false;
};

const hasUnsafeBindingContainer = (
  blockElements: readonly HTMLElement[],
  first: HTMLElement,
  last: HTMLElement,
  index: number
): boolean => {
  if (blockElements.length !== 1) return true;

  const containers = new Set<Element>([blockElements[0]]);

  for (const host of [blockElements[0], first, last]) {
    const table = outermostTableAncestor(host);

    if (table) containers.add(table);
    const valueChild = directChildOfValue(host);

    if (valueChild) containers.add(valueChild);
  }

  for (const container of containers) {
    if (hasForeignOrSiblingBlockInSubtree(container, index)) {
      return true;
    }
  }

  return false;
};

const hasRepeatedMainBlock = (
  blockElements: readonly HTMLElement[],
  blockTexts: readonly HTMLElement[]
): boolean => {
  if (blockElements.length > 1) return true;

  const seenPaths = new Set<string>();

  for (const textHost of blockTexts) {
    const path = textHost.dataset.editorPath ?? '';

    if (seenPaths.has(path)) return true;
    seenPaths.add(path);
  }

  return false;
};

/**
 * Mark each reviewed run and structural revision after configured feature
 * components render, and put tokens around each main-root block the part binds.
 */
export const applyReviewProjection = (
  document: Document,
  hosts: DocxHostIndex,
  projection: ReviewProjection
): PreparedDocxReview => {
  const diagnostics: DocxDiagnostic[] = [...projection.diagnostics];
  const runs: ReviewRun[] = [];

  for (const entry of projection.runs) {
    if (entry.root !== 'main' && !hosts.renderedRoots.has(entry.root)) continue;

    const matchedHosts = getDocxHosts(
      hosts,
      entry.root,
      entry.node,
      entry.path.join(',')
    );

    if (matchedHosts.length === 0) {
      diagnostics.push(
        entry.node === 'text'
          ? missingHost(
              'review-text-wrapper',
              entry,
              'A configured static text renderer omitted its Plate path attributes.'
            )
          : missingHost('review-structure-wrapper', entry, MISSING_ELEMENT_HOST)
      );
      continue;
    }
    const runId = String(runs.length);

    runs.push(entry.run);
    for (const host of matchedHosts) {
      const wrapper = document.createElement('span');

      wrapper.dataset.docxReviewRun = runId;
      wrapper.append(...host.childNodes);
      host.append(wrapper);
    }
  }
  for (const entry of projection.structures) {
    if (entry.root !== 'main' && !hosts.renderedRoots.has(entry.root)) continue;

    const matchedHosts = getDocxHosts(
      hosts,
      entry.root,
      entry.node,
      entry.path.join(',')
    );

    if (matchedHosts.length === 0) {
      diagnostics.push(
        missingHost('review-structure-wrapper', entry, MISSING_ELEMENT_HOST)
      );
      continue;
    }
    for (const host of matchedHosts) {
      setStructureAttributes(host, entry.revision);
    }
  }
  const nonce =
    globalThis.crypto?.randomUUID?.().replaceAll('-', '') ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const bindings = projection.bound.flatMap((index) => {
    const blockElements = getDocxHosts(hosts, 'main', 'element', `${index}`);
    const blockTexts = hosts.mainBlockTexts.get(index) ?? [];
    const first =
      blockTexts[0] ?? getFirstDocxHost(hosts, 'main', 'element', `${index}`);
    const last = blockTexts.at(-1) ?? first;

    if (!first || !last) {
      diagnostics.push({
        code: 'lossy-content',
        feature: 'authored-review',
        message: `The review marks of block ${index} have no rendered host to bind them to.`,
        path: [index],
        severity: 'warning',
      });

      return [];
    }
    if (
      hasRepeatedMainBlock(blockElements, blockTexts) ||
      hasUnsafeBindingContainer(blockElements, first, last, index) ||
      enclosesForeignRoot(first, last, 'main')
    ) {
      return [];
    }
    const token = `${REVIEW_TOKEN}${nonce}_${index}_`;
    const start = `${token}start\uE001`;
    const end = `${token}end\uE001`;

    first.prepend(document.createTextNode(start));
    last.append(document.createTextNode(end));

    return [{ end, nodes: [projection.stored.children[index]], start }];
  });

  return Object.freeze({
    bindings: Object.freeze(bindings),
    diagnostics: Object.freeze(diagnostics),
    records: projection.stored.records,
    runs: Object.freeze(runs),
  });
};
