import type { AuthoredMark, AuthoredReview } from '../../../authored';
import {
  ElementApi,
  type Descendant,
  type EditorDocumentRecords,
  type EditorDocumentValue,
  type Path,
  type Value,
} from '../../../core';
import { parseDocxHtml } from '../../internal/domParser';
import type { DocxDiagnostic } from '../../internal/types';

/** A change as Word stores it; `id` numbers the change across the file. */
export type DocxRevision = Readonly<{ at: number; author: string; id: number }>;

/**
 * What a text leaf's run writes as Word revisions: its pending insertions,
 * outer to inner, one deletion inside them, and its formatting suggestion
 * with each formatted key's accepted value.
 */
export type ReviewRun = Readonly<{
  deletion: DocxRevision | null;
  format:
    | (DocxRevision & Readonly<{ previous: AuthoredReview['accepted'] }>)
    | null;
  insertions: readonly DocxRevision[];
}>;

export type ReviewProjection = Readonly<{
  /** Top-level blocks of the main root that hold review marks. */
  bound: readonly number[];
  diagnostics: readonly DocxDiagnostic[];
  document: EditorDocumentValue;
  runs: ReadonlyMap<string, ReviewRun>;
  stored: EditorDocumentValue;
  structures: ReadonlyMap<string, DocxRevision>;
}>;

/** A review export's Word revisions and the stored blocks its part keeps. */
export type PreparedDocxReview = Readonly<{
  bindings: ReadonlyArray<
    Readonly<{ end: string; nodes: Value; start: string }>
  >;
  diagnostics: readonly DocxDiagnostic[];
  html: string;
  records: EditorDocumentRecords | undefined;
  runs: readonly ReviewRun[];
}>;

/** Prefix of the tokens that mark where a bound block starts and ends. */
export const REVIEW_TOKEN = '\uE000PDXR_';

const renderKey = (node: string, root: string, path: string) =>
  `${node}:${root}:${path}`;

const holdsMarks = (node: Descendant): boolean =>
  'authored' in node ||
  (ElementApi.isElement(node) && node.children.some(holdsMarks));

/**
 * Read the review marks of a stored document as Word revisions. Paths are the
 * stored document's, so ranges into it need no mapping.
 */
export const createReviewProjection = (
  stored: EditorDocumentValue,
  reviewOf: (node: Descendant) => AuthoredReview
): ReviewProjection => {
  const revisionIds = new Map<string, number>();
  const runs = new Map<string, ReviewRun>();
  const structures = new Map<string, DocxRevision>();
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
      const key = path.join(',');
      const { authored, ...plain } = node as Descendant & {
        authored?: readonly AuthoredMark[];
      };
      const review = authored ? reviewOf(node) : null;
      const marks = review?.marks ?? [];

      if (!ElementApi.isElement(node)) {
        const insertions = marks.filter(({ kind }) => kind === 'insert');
        const deletion = marks.find(({ kind }) => kind === 'delete');
        const format = marks.find(({ kind }) => kind === 'format');

        if (insertions.length > 0 || deletion || format) {
          runs.set(renderKey('text', root, key), {
            deletion: deletion ? revisionOf(deletion) : null,
            format:
              format && review
                ? { ...revisionOf(format), previous: review.accepted }
                : null,
            insertions: insertions.map(revisionOf),
          });
        }

        return plain;
      }
      const structure = marks.find(
        (mark) => mark.kind !== 'insert' && mark.kind !== 'delete'
      );

      if (structure) {
        structures.set(renderKey('element', root, key), revisionOf(structure));
      }

      return {
        ...plain,
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

  return Object.freeze({
    bound: stored.children.flatMap((node, index) =>
      holdsMarks(node) ? [index] : []
    ),
    diagnostics: Object.freeze([]),
    document: Object.freeze({
      children: rootValue(build(stored.children, 'main', [])),
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

const missingHost = (
  feature: string,
  key: string,
  message: string
): DocxDiagnostic => {
  const [, root, path] = key.split(':');

  return {
    action: 'replaced',
    code: 'unsupported-content',
    feature,
    message,
    path: path ? path.split(',').map(Number) : [],
    root,
    severity: 'warning',
  };
};

/**
 * Mark each reviewed run and structural revision after configured feature
 * components render, and put tokens around each block the part binds.
 */
export const applyReviewProjection = (
  html: string,
  projection: ReviewProjection
): PreparedDocxReview => {
  const document = parseDocxHtml(html);
  const diagnostics: DocxDiagnostic[] = [...projection.diagnostics];
  const hosts = new Map<string, HTMLElement>();
  const texts = new Map<number, HTMLElement[]>();

  for (const host of document.querySelectorAll<HTMLElement>(
    '[data-editor-node]'
  )) {
    const {
      editorNode = '',
      editorPath = '',
      editorRoot = 'main',
    } = host.dataset;

    hosts.set(renderKey(editorNode, editorRoot, editorPath), host);
    if (editorNode === 'text' && editorRoot === 'main') {
      const block = Number(editorPath.split(',')[0]);

      texts.set(block, [...(texts.get(block) ?? []), host]);
    }
  }
  const runs: ReviewRun[] = [];

  for (const [key, run] of projection.runs) {
    const host = hosts.get(key);

    if (!host) {
      diagnostics.push(
        missingHost(
          'review-text-wrapper',
          key,
          'A configured static text renderer omitted its Plate path attributes.'
        )
      );
      continue;
    }
    const wrapper = document.createElement('span');

    wrapper.dataset.docxReviewRun = String(runs.length);
    wrapper.append(...host.childNodes);
    host.append(wrapper);
    runs.push(run);
  }
  for (const [key, structure] of projection.structures) {
    const host = hosts.get(key);

    if (!host) {
      diagnostics.push(
        missingHost(
          'review-structure-wrapper',
          key,
          'A configured static element renderer omitted its Plate path attributes.'
        )
      );
      continue;
    }
    setStructureAttributes(host, structure);
  }
  const nonce =
    globalThis.crypto?.randomUUID?.().replaceAll('-', '') ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const bindings = projection.bound.flatMap((index) => {
    const blockTexts = texts.get(index) ?? [];
    const first =
      blockTexts[0] ?? hosts.get(renderKey('element', 'main', `${index}`));
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
    html: document.body.innerHTML,
    records: projection.stored.records,
    runs: Object.freeze(runs),
  });
};
