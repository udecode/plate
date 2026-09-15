import type {
  AuthoredChange,
  AuthoredFormatSegment,
  AuthoredFormatSnapshot,
} from '../../../authored';
import {
  definePlugin,
  ElementApi,
  property,
  TextApi,
  type Descendant,
  type EditorDocumentValue,
  type Path,
  type Point,
  type Range,
  RangeApi,
  type Value,
} from '../../../core';
import type { DocxDiagnostic } from '../../internal/types';

const SEGMENT_MARK = 'docxReviewSegment';

export const DocxReviewSegmentPlugin = definePlugin(SEGMENT_MARK, {
  component: ({ children }) => children,
  schema: { mark: { property: property.number() } },
});

type RevisionMarkup = Readonly<{
  authorId: string;
  changeId: string;
  createdAt: number;
  kind: 'delete' | 'format' | 'insert' | 'move-from' | 'move-to' | 'structure';
  revisionId: number;
  tag: 'del' | 'ins' | 'span';
}>;

export type ReviewProjection = Readonly<{
  diagnostics: readonly DocxDiagnostic[];
  document: EditorDocumentValue;
  structures: ReadonlyMap<string, RevisionMarkup>;
  textSegments: readonly ReviewTextSegment[];
  wrappers: ReadonlyMap<string, readonly RevisionMarkup[]>;
}>;

type ReviewTextSegment = Readonly<{
  outputPath: Path;
  root: string;
  sourceEnd: number;
  sourcePath: Path;
  sourceStart: number;
}>;

const renderKey = (root: string, path: Path) => `${root}:${path.join(',')}`;

const rootValue = (nodes: Descendant[]): Value => {
  if (!nodes.every((node) => ElementApi.isElement(node))) {
    throw new Error('DOCX review projection must contain root elements.');
  }

  return nodes;
};

const markupFor = (
  change: AuthoredChange,
  revisionId: number,
  kind: RevisionMarkup['kind'],
  tag: RevisionMarkup['tag']
): RevisionMarkup => ({
  authorId: change.authorId,
  changeId: change.id,
  createdAt: change.createdAt,
  kind,
  revisionId,
  tag,
});

export const createReviewProjection = (
  snapshot: AuthoredFormatSnapshot
): ReviewProjection => {
  const changes = new Map(
    snapshot.changes.map((change) => [change.id, change])
  );
  const revisionIds = new Map(
    snapshot.changes.map((change, index) => [change.id, index + 1])
  );
  const propertyChanges = new Map<string, string[]>();

  for (const change of snapshot.properties) {
    const key = renderKey(change.root, change.path);
    const ids = propertyChanges.get(key) ?? [];

    if (!ids.includes(change.changeId)) ids.push(change.changeId);
    propertyChanges.set(key, ids);
  }
  const structuralProperties = new Map(
    snapshot.properties.flatMap((change) =>
      change.nodeKind === 'element'
        ? [[renderKey(change.root, change.path), change.changeId] as const]
        : []
    )
  );
  const moved = new Set<string>();
  const moveTargets = new Map<string, string[]>();
  const findMoves = (segment: AuthoredFormatSegment) => {
    if (segment.retained?.kind === 'move') {
      moved.add(segment.retained.changeId);
      const key = renderKey(segment.root, segment.path);
      const targets = moveTargets.get(key) ?? [];

      if (!targets.includes(segment.retained.changeId)) {
        targets.push(segment.retained.changeId);
      }
      moveTargets.set(key, targets);
    }
    segment.children?.forEach(findMoves);
  };

  Object.values(snapshot.markup).flat().forEach(findMoves);
  const wrappers = new Map<string, readonly RevisionMarkup[]>();
  const structures = new Map<string, RevisionMarkup>();
  const textSegments: ReviewTextSegment[] = [];
  const diagnostics: DocxDiagnostic[] = [];
  let segmentId = 0;
  const build = (
    segments: readonly AuthoredFormatSegment[],
    root: string,
    parentPath: Path
  ): Descendant[] =>
    segments.map((segment, index) => {
      const path = [...parentPath, index];
      const sourceKey = renderKey(segment.root, segment.path);
      const key = renderKey(root, path);

      if (TextApi.isText(segment.node)) {
        const textWrappers: RevisionMarkup[] = [];

        if (!segment.retained && segment.textRange) {
          textSegments.push(
            Object.freeze({
              outputPath: path,
              root,
              sourceEnd: segment.textRange.end,
              sourcePath: segment.path,
              sourceStart: segment.textRange.start,
            })
          );
        }

        if (segment.retained) {
          const change = changes.get(segment.retained.changeId);

          if (change) {
            textWrappers.push(
              markupFor(
                change,
                revisionIds.get(change.id) ?? 0,
                segment.retained.kind === 'move' ? 'move-from' : 'delete',
                'del'
              )
            );
          }
        } else {
          const changeIds = [
            ...new Set([
              ...segment.changeIds,
              ...(propertyChanges.get(sourceKey) ?? []),
              ...(moveTargets.get(sourceKey) ?? []),
            ]),
          ];

          for (const id of changeIds) {
            const change = changes.get(id);

            if (!change) continue;
            if (change.kind === 'format') {
              textWrappers.push(
                markupFor(change, revisionIds.get(id) ?? 0, 'format', 'span')
              );
            } else if (moved.has(id)) {
              textWrappers.push(
                markupFor(change, revisionIds.get(id) ?? 0, 'move-to', 'ins')
              );
            } else if (change.kind === 'insert' || change.kind === 'mixed') {
              textWrappers.push(
                markupFor(change, revisionIds.get(id) ?? 0, 'insert', 'ins')
              );
            }
          }
        }
        if (textWrappers.length > 0) wrappers.set(key, textWrappers);

        segmentId += 1;

        return {
          ...segment.node,
          [SEGMENT_MARK]: segmentId,
        };
      }
      const structureId =
        structuralProperties.get(sourceKey) ??
        segment.changeIds.find((id) => {
          const change = changes.get(id);

          return change?.kind === 'structure' && !moved.has(change.id);
        });

      if (structureId) {
        const change = changes.get(structureId);

        if (change) {
          structures.set(
            key,
            markupFor(
              change,
              revisionIds.get(change.id) ?? 0,
              'structure',
              'span'
            )
          );
        }
      }

      return {
        ...segment.node,
        children: build(segment.children ?? [], root, path),
      };
    });
  const children = rootValue(build(snapshot.markup.main ?? [], 'main', []));
  const roots = Object.fromEntries(
    Object.entries(snapshot.markup)
      .filter(([root]) => root !== 'main')
      .map(([root, segments]) => [root, rootValue(build(segments, root, []))])
  );

  return Object.freeze({
    diagnostics: Object.freeze(diagnostics),
    document: Object.freeze({
      children,
      ...(Object.keys(roots).length > 0 ? { roots } : {}),
    }),
    structures,
    textSegments: Object.freeze(textSegments),
    wrappers,
  });
};

const samePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const projectReviewPoint = (
  projection: ReviewProjection,
  point: Point,
  association: 'backward' | 'forward'
): Point | null => {
  const root = point.root ?? 'main';
  const candidates = projection.textSegments.filter(
    (segment) =>
      segment.root === root &&
      samePath(segment.sourcePath, point.path) &&
      segment.sourceStart <= point.offset &&
      point.offset <= segment.sourceEnd
  );
  const exact =
    association === 'forward'
      ? (candidates.find((segment) => point.offset < segment.sourceEnd) ??
        candidates.at(-1))
      : (candidates.findLast((segment) => segment.sourceStart < point.offset) ??
        candidates[0]);

  if (!exact) return null;

  return Object.freeze({
    offset: point.offset - exact.sourceStart,
    path: exact.outputPath,
    ...(root === 'main' ? {} : { root }),
  });
};

export const projectReviewRange = (
  projection: ReviewProjection,
  range: Range
): Range | null => {
  const backward = RangeApi.isBackward(range);
  const anchor = projectReviewPoint(
    projection,
    range.anchor,
    backward ? 'backward' : 'forward'
  );
  const focus = projectReviewPoint(
    projection,
    range.focus,
    backward ? 'forward' : 'backward'
  );

  return anchor && focus ? Object.freeze({ anchor, focus }) : null;
};

const setRevisionAttributes = (element: Element, markup: RevisionMarkup) => {
  element.setAttribute('data-editor-change-id', markup.changeId);
  element.setAttribute('data-editor-change-kind', markup.kind);
  element.setAttribute('data-editor-revision-id', String(markup.revisionId));
  element.setAttribute('data-editor-author-id', markup.authorId);
  if (markup.createdAt > 0) {
    element.setAttribute(
      'data-editor-created-at',
      new Date(markup.createdAt).toISOString()
    );
  }
};

const findRenderedHost = (
  document: Document,
  node: 'element' | 'text',
  root: string,
  path: string
) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(`[data-editor-node="${node}"]`)
  ).find(
    (element) =>
      (element.dataset.editorRoot ?? 'main') === root &&
      element.dataset.editorPath === path
  );

/** Add private Word revision wrappers after configured feature components render. */
export const applyReviewProjection = (
  html: string,
  projection: ReviewProjection
) => {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const diagnostics: DocxDiagnostic[] = [...projection.diagnostics];

  for (const [key, wrappers] of projection.wrappers) {
    const separator = key.indexOf(':');
    const root = key.slice(0, separator);
    const path = key.slice(separator + 1);
    const host = findRenderedHost(document, 'text', root, path);

    if (!host) {
      diagnostics.push({
        code: 'unsupported-content',
        feature: 'review-text-wrapper',
        message:
          'A configured static text renderer omitted its Plate path attributes.',
        path: path ? path.split(',').map(Number) : [],
        root,
        severity: 'warning',
      });
      continue;
    }
    let content: Node = host.ownerDocument.createDocumentFragment();

    while (host.firstChild) content.appendChild(host.firstChild);
    for (const markup of wrappers) {
      const wrapper = host.ownerDocument.createElement(markup.tag);

      setRevisionAttributes(wrapper, markup);
      wrapper.append(content);
      content = wrapper;
    }
    host.append(content);
  }

  for (const [key, structure] of projection.structures) {
    const separator = key.indexOf(':');
    const root = key.slice(0, separator);
    const path = key.slice(separator + 1);
    const host = findRenderedHost(document, 'element', root, path);

    if (!host) {
      diagnostics.push({
        code: 'unsupported-content',
        feature: 'review-structure-wrapper',
        message:
          'A configured static element renderer omitted its Plate path attributes.',
        path: path ? path.split(',').map(Number) : [],
        root,
        severity: 'warning',
      });
      continue;
    }
    setRevisionAttributes(host, structure);
  }

  return Object.freeze({
    diagnostics: Object.freeze(diagnostics),
    html: document.body.innerHTML,
  });
};
