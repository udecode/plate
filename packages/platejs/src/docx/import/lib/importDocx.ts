'use client';

import mammoth from 'mammoth';

import {
  createAuthoredImportedRevisionChange,
  createAuthoredReviewDocument,
  deserializeAuthoredJson,
  type AuthoredImportedRevision,
} from '../../../authored';
import {
  ElementApi,
  TextApi,
  type Descendant,
  type Editor,
  type EditorDocumentValue,
  type Path,
  type Point,
  type Range,
  type Value,
} from '../../../core';
import { cleanWordHtml } from '../../html/cleanWordHtml.internal';
import {
  AUTHORED_DOCX_PART,
  docxPartManifestMatches,
  docxProjectionDigestsMatch,
  getDocxPartManifest,
  getDocxProjectionDigests,
  parseAuthoredDocxEnvelope,
} from '../../internal/correspondence';
import { createDocxSource, type DocxSource } from '../../internal/source';
import type {
  DocxComment,
  DocxDiagnostic,
  DocxImportLimits,
} from '../../internal/types';
import {
  DocxPackageError,
  readBoundedDocxPackage,
  resolveDocxImportLimits,
  type BoundedDocxPackage,
} from './docxPackage';

export { DocxSource } from '../../internal/source';
export type { DocxComment, DocxDiagnostic, DocxImportLimits };

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const CONTENT_REVISION_ELEMENTS = new Set(['del', 'ins', 'moveFrom', 'moveTo']);
const PROPERTY_REVISION_ELEMENTS = new Set(['pPrChange', 'rPrChange']);
const TRACKED_REVISION_ELEMENTS = new Set([
  ...CONTENT_REVISION_ELEMENTS,
  ...PROPERTY_REVISION_ELEMENTS,
]);

export type DocxImportOptions<TRetainSource extends boolean = boolean> =
  Readonly<{
    limits?: Partial<DocxImportLimits>;
    /** Retain the admitted package and import correspondence for later export. */
    retainSource?: TRetainSource;
    signal?: AbortSignal;
  }>;

type DocxImportFailure = Readonly<{
  diagnostics: readonly DocxDiagnostic[];
  ok: false;
}>;

type DocxImportSuccess = Readonly<{
  comments: readonly DocxComment[];
  diagnostics: readonly DocxDiagnostic[];
  document: EditorDocumentValue;
  ok: true;
}>;

export type DocxImportResult<TRetainSource extends boolean = false> =
  | DocxImportFailure
  | (TRetainSource extends true
      ? DocxImportSuccess & Readonly<{ source: DocxSource }>
      : DocxImportSuccess);

type DocxRevision = Readonly<{
  authorId: string;
  createdAt: number;
  id: string;
}>;

type CommentMetadata = Omit<DocxComment, 'body' | 'target'>;

type Marker = Readonly<{
  id: string;
  kind: 'comment-end' | 'comment-start' | 'revision-end' | 'revision-start';
  mode?: 'delete' | 'insert';
  token: string;
}>;

type ActiveRevision = Readonly<{
  id: string;
  mode: 'delete' | 'insert';
}>;

type RevisionUnit = Readonly<{
  active: readonly ActiveRevision[];
  node: Descendant;
  revisionIds: ReadonlySet<string>;
}>;

const wordAttribute = (element: Element, name: string) =>
  element.getAttributeNS(WORD_NAMESPACE, name) ??
  element.getAttribute(`w:${name}`) ??
  element.getAttribute(name);

const localAttribute = (element: Element, name: string) =>
  Array.from(element.attributes).find(
    (attribute) =>
      attribute.localName === name || attribute.name.split(':').at(-1) === name
  )?.value ?? null;

const parseXml = (xml: string, part: string) => {
  const document = new DOMParser().parseFromString(xml, 'application/xml');

  if (document.querySelector('parsererror')) {
    throw new DocxPackageError({
      code: 'invalid-package',
      message: 'DOCX contains malformed XML.',
      part,
      severity: 'error',
    });
  }

  return document;
};

const documentElements = (document: Document | Element) =>
  Array.from(document.getElementsByTagName('*'));

const rootValue = (nodes: readonly Descendant[]): Value => {
  if (!nodes.every((node) => ElementApi.isElement(node))) {
    throw new Error('DOCX projection must contain root elements.');
  }

  return [...nodes];
};

const collectDocxRevisions = (
  document: Document,
  limits: DocxImportLimits,
  diagnostics: DocxDiagnostic[]
) => {
  const revisions = new Map<string, DocxRevision>();

  for (const element of documentElements(document)) {
    if (!TRACKED_REVISION_ELEMENTS.has(element.localName)) continue;
    const id = wordAttribute(element, 'id');

    if (!id) {
      diagnostics.push({
        code: 'unsupported-content',
        feature: 'tracked-revision',
        message: `A ${element.localName} revision without an ID was flattened.`,
        part: 'word/document.xml',
        severity: 'warning',
      });
      continue;
    }
    if (revisions.has(id)) continue;
    const authorId = wordAttribute(element, 'author') || 'Unknown';
    const parsedDate = Date.parse(wordAttribute(element, 'date') ?? '');

    if (authorId === 'Unknown' || !Number.isFinite(parsedDate)) {
      diagnostics.push({
        code: 'lossy-content',
        feature: 'revision-metadata',
        message: `Revision ${id} has incomplete author or date metadata.`,
        part: 'word/document.xml',
        severity: 'warning',
        sourceId: id,
      });
    }
    revisions.set(id, {
      authorId,
      createdAt: Number.isFinite(parsedDate) ? parsedDate : 0,
      id,
    });

    if (revisions.size > limits.maxRevisions) {
      throw new DocxPackageError({
        actual: revisions.size,
        code: 'limit-exceeded',
        limit: 'maxRevisions',
        maximum: limits.maxRevisions,
        message: 'DOCX exceeds maxRevisions.',
        severity: 'error',
      });
    }
  }

  return [...revisions.values()];
};

const createMarkerCodec = (documentXml: string) => {
  let nonce = globalThis.crypto?.randomUUID?.().replaceAll('-', '') ?? '';

  if (!nonce) {
    nonce = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }
  while (documentXml.includes(`\uE000PDX_${nonce}_`)) nonce += 'x';
  const prefix = `\uE000PDX_${nonce}_`;
  const suffix = '\uE001';
  const marker = (
    kind: Marker['kind'],
    id: string,
    mode?: Marker['mode']
  ): Marker => ({
    id,
    kind,
    mode,
    token: `${prefix}${kind}_${mode ?? 'none'}_${encodeURIComponent(
      id
    )}${suffix}`,
  });
  const pattern = new RegExp(
    `${prefix}(comment-end|comment-start|revision-end|revision-start)_(delete|insert|none)_([^${suffix}]+)${suffix}`,
    'g'
  );

  return {
    marker,
    parse(
      text: string
    ): ReadonlyArray<Readonly<{ end: number; start: number }> & Marker> {
      return [...text.matchAll(pattern)].map((match) => ({
        end: match.index + match[0].length,
        id: decodeURIComponent(match[3]),
        kind: match[1] as Marker['kind'],
        mode: match[2] === 'none' ? undefined : (match[2] as Marker['mode']),
        start: match.index,
        token: match[0],
      }));
    },
  };
};

const wordElement = (document: Document, name: string) =>
  document.createElementNS(WORD_NAMESPACE, `w:${name}`);

const markerRun = (document: Document, token: string) => {
  const run = wordElement(document, 'r');
  const text = wordElement(document, 't');

  text.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
  text.textContent = token;
  run.append(text);

  return run;
};

const markerFor = (element: Element, token: string) => {
  if (element.localName === 'r' || element.parentElement?.localName === 'p') {
    return markerRun(element.ownerDocument, token);
  }
  const paragraph = wordElement(element.ownerDocument, 'p');

  paragraph.append(markerRun(element.ownerDocument, token));

  return paragraph;
};

const replaceWithMarkedCopies = (
  source: Element,
  accepted: Node,
  proposed: Node,
  id: string,
  codec: ReturnType<typeof createMarkerCodec>
) => {
  source.replaceWith(
    markerFor(source, codec.marker('revision-start', id, 'delete').token),
    accepted,
    markerFor(source, codec.marker('revision-end', id, 'delete').token),
    markerFor(source, codec.marker('revision-start', id, 'insert').token),
    proposed,
    markerFor(source, codec.marker('revision-end', id, 'insert').token)
  );
};

const instrumentPropertyRevisions = (
  document: Document,
  codec: ReturnType<typeof createMarkerCodec>,
  diagnostics: DocxDiagnostic[]
) => {
  for (const change of documentElements(document).filter(
    (element) => element.localName === 'pPrChange'
  )) {
    const id = wordAttribute(change, 'id');
    const properties = change.parentElement;
    const paragraph = properties?.parentElement;
    const previous = Array.from(change.children).find(
      (child) => child.localName === 'pPr'
    );

    if (
      !(
        id &&
        properties?.localName === 'pPr' &&
        paragraph?.localName === 'p' &&
        previous
      )
    ) {
      change.remove();
      diagnostics.push({
        code: 'unsupported-content',
        feature: 'paragraph-property-revision',
        message: 'A malformed paragraph property revision was flattened.',
        part: 'word/document.xml',
        severity: 'warning',
        ...(id ? { sourceId: id } : {}),
      });
      continue;
    }
    const accepted = paragraph.cloneNode(true) as Element;
    const proposed = paragraph.cloneNode(true) as Element;
    const acceptedProperties = Array.from(accepted.children).find(
      (child) => child.localName === 'pPr'
    );

    acceptedProperties?.replaceWith(previous.cloneNode(true));
    for (const nested of Array.from(
      proposed.getElementsByTagNameNS(WORD_NAMESPACE, 'pPrChange')
    )) {
      nested.remove();
    }
    for (const nested of Array.from(
      accepted.getElementsByTagNameNS(WORD_NAMESPACE, 'pPrChange')
    )) {
      nested.remove();
    }
    replaceWithMarkedCopies(paragraph, accepted, proposed, id, codec);
  }

  for (const change of documentElements(document).filter(
    (element) => element.localName === 'rPrChange'
  )) {
    const id = wordAttribute(change, 'id');
    const properties = change.parentElement;
    const run = properties?.parentElement;
    const previous = Array.from(change.children).find(
      (child) => child.localName === 'rPr'
    );

    if (
      !(
        id &&
        properties?.localName === 'rPr' &&
        run?.localName === 'r' &&
        previous
      )
    ) {
      change.remove();
      diagnostics.push({
        code: 'unsupported-content',
        feature: 'run-property-revision',
        message: 'A malformed run property revision was flattened.',
        part: 'word/document.xml',
        severity: 'warning',
        ...(id ? { sourceId: id } : {}),
      });
      continue;
    }
    const accepted = run.cloneNode(true) as Element;
    const proposed = run.cloneNode(true) as Element;
    const acceptedProperties = Array.from(accepted.children).find(
      (child) => child.localName === 'rPr'
    );

    acceptedProperties?.replaceWith(previous.cloneNode(true));
    for (const nested of Array.from(
      proposed.getElementsByTagNameNS(WORD_NAMESPACE, 'rPrChange')
    )) {
      nested.remove();
    }
    for (const nested of Array.from(
      accepted.getElementsByTagNameNS(WORD_NAMESPACE, 'rPrChange')
    )) {
      nested.remove();
    }
    replaceWithMarkedCopies(run, accepted, proposed, id, codec);
  }
};

const instrumentContentRevisions = (
  document: Document,
  codec: ReturnType<typeof createMarkerCodec>,
  diagnostics: DocxDiagnostic[]
) => {
  for (const element of documentElements(document)
    .filter((candidate) => CONTENT_REVISION_ELEMENTS.has(candidate.localName))
    .reverse()) {
    if (!element.parentNode) continue;
    const id = wordAttribute(element, 'id');

    if (!id) {
      while (element.firstChild) element.before(element.firstChild);
      element.remove();
      continue;
    }
    const mode =
      element.localName === 'ins' || element.localName === 'moveTo'
        ? 'insert'
        : 'delete';

    element.before(
      markerFor(element, codec.marker('revision-start', id, mode).token)
    );
    element.after(
      markerFor(element, codec.marker('revision-end', id, mode).token)
    );
    if (mode === 'delete') {
      for (const text of documentElements(element).filter(
        (candidate) => candidate.localName === 'delText'
      )) {
        const replacement = wordElement(document, 't');

        for (const attribute of Array.from(text.attributes)) {
          if (attribute.namespaceURI) {
            replacement.setAttributeNS(
              attribute.namespaceURI,
              attribute.name,
              attribute.value
            );
          } else {
            replacement.setAttribute(attribute.name, attribute.value);
          }
        }
        while (text.firstChild) replacement.append(text.firstChild);
        text.replaceWith(replacement);
      }
    }
    while (element.firstChild) element.before(element.firstChild);
    element.remove();
  }

  for (const element of documentElements(document)) {
    const name = element.localName;

    if (
      TRACKED_REVISION_ELEMENTS.has(name) ||
      !/(?:Change|Ins|Del|moveFrom|moveTo)/.test(name)
    ) {
      continue;
    }
    diagnostics.push({
      code: 'unsupported-content',
      feature: 'tracked-revision',
      message: `Tracked construct ${name} was flattened.`,
      part: 'word/document.xml',
      severity: 'warning',
    });
  }
};

const instrumentComments = (
  document: Document,
  codec: ReturnType<typeof createMarkerCodec>
) => {
  for (const element of documentElements(document)) {
    if (!['commentRangeEnd', 'commentRangeStart'].includes(element.localName)) {
      continue;
    }
    const id = wordAttribute(element, 'id');

    if (!id) {
      element.remove();
      continue;
    }
    const kind =
      element.localName === 'commentRangeStart'
        ? 'comment-start'
        : 'comment-end';

    element.replaceWith(markerFor(element, codec.marker(kind, id).token));
  }
};

const projectNodes = (
  nodes: readonly Descendant[],
  selected: ReadonlySet<string>,
  codec: ReturnType<typeof createMarkerCodec>,
  options: Readonly<{
    active?: readonly ActiveRevision[];
    allowOpenRevisions?: boolean;
  }> = {}
) => {
  const active = [...(options.active ?? [])];
  const isVisible = () =>
    active.every(({ id, mode }) =>
      mode === 'insert' ? selected.has(id) : !selected.has(id)
    );

  const visit = (
    node: Descendant
  ): Readonly<{ hadMarker: boolean; node: Descendant | null }> => {
    const visibleAtStart = isVisible();

    if (TextApi.isText(node)) {
      let cursor = 0;
      let text = '';
      let hadMarker = false;

      for (const marker of codec.parse(node.text)) {
        hadMarker = true;
        if (isVisible()) text += node.text.slice(cursor, marker.start);
        cursor = marker.end;

        if (marker.kind === 'revision-start' && marker.mode) {
          active.push({ id: marker.id, mode: marker.mode });
        } else if (marker.kind === 'revision-end') {
          const index = active.findLastIndex(
            ({ id, mode }) => id === marker.id && mode === marker.mode
          );

          if (index !== -1) active.splice(index, 1);
        } else if (isVisible()) {
          text += marker.token;
        }
      }
      if (isVisible()) text += node.text.slice(cursor);

      return {
        hadMarker,
        node:
          text.length === 0 && (hadMarker || !visibleAtStart)
            ? null
            : { ...node, text },
      };
    }
    const children = node.children.map(visit);
    const projectedChildren = children.flatMap((child) =>
      child.node ? [child.node] : []
    );
    const hadMarker = children.some((child) => child.hadMarker);

    return {
      hadMarker,
      node:
        projectedChildren.length === 0 && (hadMarker || !visibleAtStart)
          ? null
          : { ...node, children: projectedChildren },
    };
  };

  const projected = nodes.flatMap((node) => {
    const result = visit(node);

    return result.node ? [result.node] : [];
  });

  if (!options.allowOpenRevisions && active.length > 0) {
    throw new Error('DOCX revision markers are unbalanced after conversion.');
  }

  return projected;
};

const scanRevisionUnits = (
  nodes: readonly Descendant[],
  codec: ReturnType<typeof createMarkerCodec>
) => {
  const active: ActiveRevision[] = [];
  const dependencies = new Map<string, Set<string>>();
  const modesById = new Map<string, Set<ActiveRevision['mode']>>();
  const nestings: Array<Readonly<{ child: string; parent: ActiveRevision }>> =
    [];
  const units: RevisionUnit[] = [];
  const addDependency = (before: string, after: string) => {
    if (before === after) return;
    const predecessors = dependencies.get(after) ?? new Set<string>();

    predecessors.add(before);
    dependencies.set(after, predecessors);
  };
  const scan = (node: Descendant, revisionIds: Set<string>) => {
    if (!TextApi.isText(node)) {
      node.children.forEach((child) => scan(child, revisionIds));

      return;
    }

    for (const marker of codec.parse(node.text)) {
      if (marker.kind !== 'revision-start' && marker.kind !== 'revision-end') {
        continue;
      }
      revisionIds.add(marker.id);

      if (marker.kind === 'revision-start' && marker.mode) {
        const modes = modesById.get(marker.id) ?? new Set();

        modes.add(marker.mode);
        modesById.set(marker.id, modes);
        for (const parent of active) {
          nestings.push({ child: marker.id, parent });
        }
        active.push({ id: marker.id, mode: marker.mode });
        continue;
      }
      const index = active.findLastIndex(
        ({ id, mode }) => id === marker.id && mode === marker.mode
      );

      if (index === -1) {
        throw new Error(
          'DOCX revision markers are unbalanced after conversion.'
        );
      }
      active.splice(index, 1);
    }
  };

  for (const node of nodes) {
    const initial = Object.freeze([...active]);
    const revisionIds = new Set(active.map(({ id }) => id));

    scan(node, revisionIds);
    active.forEach(({ id }) => revisionIds.add(id));
    units.push(
      Object.freeze({
        active: initial,
        node,
        revisionIds,
      })
    );
  }
  if (active.length > 0) {
    throw new Error('DOCX revision markers are unbalanced after conversion.');
  }
  for (const { child, parent } of nestings) {
    if (modesById.get(parent.id)?.size !== 1) continue;

    if (parent.mode === 'delete') {
      addDependency(child, parent.id);
    } else {
      addDependency(parent.id, child);
    }
  }

  return Object.freeze({ dependencies, units: Object.freeze(units) });
};

const orderDocxRevisions = (
  revisions: readonly DocxRevision[],
  dependencies: ReadonlyMap<string, ReadonlySet<string>>,
  diagnostics: DocxDiagnostic[]
) => {
  const sourceIndex = new Map(
    revisions.map((revision, index) => [revision.id, index] as const)
  );
  const remaining = new Map(
    revisions.map((revision) => [revision.id, revision])
  );
  const ordered: DocxRevision[] = [];
  const emitted = new Set<string>();

  while (remaining.size > 0) {
    const next = [...remaining.values()]
      .filter((revision) =>
        [...(dependencies.get(revision.id) ?? [])].every(
          (id) => emitted.has(id) || !remaining.has(id)
        )
      )
      .sort(
        (left, right) =>
          (sourceIndex.get(left.id) ?? 0) - (sourceIndex.get(right.id) ?? 0)
      )[0];

    if (!next) {
      diagnostics.push({
        code: 'unsupported-content',
        feature: 'revision-order',
        message:
          'Cyclic tracked-revision nesting was flattened in source order.',
        part: 'word/document.xml',
        severity: 'warning',
      });

      return revisions;
    }
    ordered.push(next);
    emitted.add(next.id);
    remaining.delete(next.id);
  }

  return ordered;
};

const jsonEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const createSparseImportedRevisions = (
  editor: Editor,
  nodes: readonly Descendant[],
  revisions: readonly DocxRevision[],
  codec: ReturnType<typeof createMarkerCodec>,
  accepted: EditorDocumentValue,
  proposed: EditorDocumentValue,
  diagnostics: DocxDiagnostic[]
): readonly AuthoredImportedRevision[] | null => {
  if (revisions.length === 0) return Object.freeze([]);
  const analysis = scanRevisionUnits(nodes, codec);
  const ordered = orderDocxRevisions(
    revisions,
    analysis.dependencies,
    diagnostics
  );
  const selected = new Set<string>();
  const fitUnit = (unit: readonly Descendant[]) =>
    unit.length === 0
      ? []
      : editor.read.schema.fitDocument({
          children: rootValue(unit),
        }).children;
  const currentUnits = analysis.units.map((unit) =>
    fitUnit(
      projectNodes([unit.node], selected, codec, {
        active: unit.active,
        allowOpenRevisions: true,
      })
    )
  );
  let current = currentUnits.flat();

  if (!jsonEqual(current, accepted.children)) return null;
  const imported: AuthoredImportedRevision[] = [];

  for (const revision of ordered) {
    const beforeCurrent = current;

    selected.add(revision.id);
    const sections: Array<{
      after: readonly Descendant[];
      before: readonly Descendant[];
      from: number;
    }> = [];
    let childIndex = 0;

    analysis.units.forEach((unit, unitIndex) => {
      const before = currentUnits[unitIndex];

      if (unit.revisionIds.has(revision.id)) {
        const after = fitUnit(
          projectNodes([unit.node], selected, codec, {
            active: unit.active,
            allowOpenRevisions: true,
          })
        );

        if (!jsonEqual(before, after)) {
          sections.push({ after, before, from: childIndex });
        }
        currentUnits[unitIndex] = after;
      }
      childIndex += before.length;
    });
    current = currentUnits.flat();

    if (sections.length === 0) {
      diagnostics.push({
        code: 'unsupported-content',
        feature: 'tracked-revision',
        message: `Revision ${revision.id} did not map to an installed schema change.`,
        part: 'word/document.xml',
        severity: 'warning',
        sourceId: revision.id,
      });
    } else {
      const change = createAuthoredImportedRevisionChange(
        { children: beforeCurrent },
        sections
      );

      imported.push({ ...revision, change });
    }
  }

  return jsonEqual(current, proposed.children) ? imported : null;
};

const pointKey = (point: Point) => `${point.path.join('.')}:${point.offset}`;

const stripCommentMarkers = (
  nodes: readonly Descendant[],
  codec: ReturnType<typeof createMarkerCodec>
) => {
  const endpoints = new Map<string, { end?: Point; start?: Point }>();

  const visit = (node: Descendant, path: Path): Descendant => {
    if (!TextApi.isText(node)) {
      return {
        ...node,
        children: node.children.map((child, index) =>
          visit(child, [...path, index])
        ),
      };
    }
    let cursor = 0;
    let text = '';

    for (const marker of codec.parse(node.text)) {
      text += node.text.slice(cursor, marker.start);
      cursor = marker.end;
      if (marker.kind !== 'comment-end' && marker.kind !== 'comment-start') {
        text += marker.token;
        continue;
      }
      const point = { offset: text.length, path };
      const current = endpoints.get(marker.id) ?? {};

      current[marker.kind === 'comment-start' ? 'start' : 'end'] = point;
      endpoints.set(marker.id, current);
    }

    return { ...node, text: text + node.text.slice(cursor) };
  };

  return {
    endpoints,
    nodes: nodes.map((node, index) => visit(node, [index])),
  };
};

const commentMetadata = (
  entries: ReadonlyMap<string, Uint8Array>,
  limits: DocxImportLimits
) => {
  const source = entries.get('word/comments.xml');

  if (!source) return new Map<string, CommentMetadata>();
  const comments = parseXml(
    new TextDecoder().decode(source),
    'word/comments.xml'
  );
  const records = documentElements(comments).filter(
    (element) => element.localName === 'comment'
  );

  if (records.length > limits.maxComments) {
    throw new DocxPackageError({
      actual: records.length,
      code: 'limit-exceeded',
      limit: 'maxComments',
      maximum: limits.maxComments,
      message: 'DOCX exceeds maxComments.',
      severity: 'error',
    });
  }
  const idByParagraph = new Map<string, string>();

  for (const record of records) {
    const id = wordAttribute(record, 'id');
    const paragraph = documentElements(record).findLast(
      (element) => element.localName === 'p'
    );
    const paragraphId = paragraph ? localAttribute(paragraph, 'paraId') : null;

    if (id && paragraphId) idByParagraph.set(paragraphId, id);
  }
  const extendedByParagraph = new Map<
    string,
    Readonly<{ done: boolean | null; parent: string | null }>
  >();
  const extendedSource = entries.get('word/commentsExtended.xml');

  if (extendedSource) {
    const extended = parseXml(
      new TextDecoder().decode(extendedSource),
      'word/commentsExtended.xml'
    );

    for (const item of documentElements(extended).filter(
      (element) => element.localName === 'commentEx'
    )) {
      const paragraphId = localAttribute(item, 'paraId');

      if (!paragraphId) continue;
      const done = localAttribute(item, 'done');

      extendedByParagraph.set(paragraphId, {
        done: done === null ? null : done === '1' || done === 'true',
        parent: localAttribute(item, 'paraIdParent'),
      });
    }
  }
  const durableByParagraph = new Map<string, string>();
  const idsSource = entries.get('word/commentsIds.xml');

  if (idsSource) {
    const ids = parseXml(
      new TextDecoder().decode(idsSource),
      'word/commentsIds.xml'
    );

    for (const item of documentElements(ids).filter(
      (element) => element.localName === 'commentId'
    )) {
      const paragraphId = localAttribute(item, 'paraId');
      const durableId = localAttribute(item, 'durableId');

      if (paragraphId && durableId) {
        durableByParagraph.set(paragraphId, durableId);
      }
    }
  }
  const result = new Map<string, CommentMetadata>();

  for (const record of records) {
    const id = wordAttribute(record, 'id');

    if (!id) continue;
    const paragraph = documentElements(record).findLast(
      (element) => element.localName === 'p'
    );
    const paragraphId = paragraph ? localAttribute(paragraph, 'paraId') : null;
    const extension = paragraphId
      ? extendedByParagraph.get(paragraphId)
      : undefined;
    const author = wordAttribute(record, 'author');
    const initials = wordAttribute(record, 'initials');
    const date = wordAttribute(record, 'date');
    const parsedDate = date ? Date.parse(date) : Number.NaN;

    result.set(id, {
      author: author
        ? { ...(initials ? { initials } : {}), name: author }
        : null,
      createdAt: Number.isFinite(parsedDate)
        ? new Date(parsedDate).toISOString()
        : null,
      durableId: paragraphId
        ? (durableByParagraph.get(paragraphId) ?? null)
        : null,
      id,
      parentId: extension?.parent
        ? (idByParagraph.get(extension.parent) ?? null)
        : null,
      resolved: extension?.done ?? null,
    });
  }

  return result;
};

const importProjection = async (
  editor: Editor,
  arrayBuffer: ArrayBuffer,
  codec: ReturnType<typeof createMarkerCodec>,
  diagnostics: DocxDiagnostic[]
) => {
  const mammothResult = await mammoth.convertToHtml(
    { arrayBuffer, buffer: arrayBuffer as never },
    { styleMap: ['comment-reference => sup'] }
  );

  for (const message of mammothResult.messages) {
    diagnostics.push({
      code: 'converter-message',
      message: message.message,
      severity: 'warning',
    });
  }
  const mammothDocument = new DOMParser().parseFromString(
    mammothResult.value,
    'text/html'
  );
  const bodyById = new Map<string, Value>();

  for (const dl of Array.from(mammothDocument.querySelectorAll('dl'))) {
    const definitions = Array.from(dl.querySelectorAll('dt[id^="comment-"]'));

    if (definitions.length === 0) continue;
    for (const definition of definitions) {
      const id = (definition.getAttribute('id') ?? '').slice('comment-'.length);
      const description = definition.nextElementSibling;

      if (!(id && description?.matches('dd'))) continue;
      const clone = description.cloneNode(true);

      if (!(clone instanceof HTMLElement)) continue;
      clone.querySelectorAll('a[href^="#comment-ref-"]').forEach((node) => {
        const previous = node.previousSibling;

        if (previous?.nodeType === Node.TEXT_NODE && previous.textContent) {
          previous.textContent = previous.textContent.trimEnd();
        }
        node.remove();
      });
      const wrapper = clone.ownerDocument.createElement('div');

      wrapper.innerHTML = clone.innerHTML;
      let nodes = editor.api.html.deserialize({ element: wrapper });

      if (!nodes?.every((node) => ElementApi.isElement(node))) {
        const paragraph = clone.ownerDocument.createElement('p');

        paragraph.innerHTML = clone.innerHTML;
        wrapper.replaceChildren(paragraph);
        nodes = editor.api.html.deserialize({ element: wrapper });
      }
      if (nodes?.every((node) => ElementApi.isElement(node))) {
        bodyById.set(id, [...nodes]);
      }
    }
    dl.remove();
  }
  for (const reference of Array.from(
    mammothDocument.querySelectorAll('a[id^="comment-ref-"]')
  )) {
    const parent = reference.closest('sup');

    if (parent) parent.remove();
    else reference.remove();
  }
  for (const image of Array.from(mammothDocument.querySelectorAll('img'))) {
    image.remove();
    diagnostics.push({
      code: 'resource-omitted',
      feature: 'image',
      message: 'An embedded image was omitted during DOCX import.',
      severity: 'warning',
    });
  }
  const cleanedHtml = cleanWordHtml(mammothDocument.body.innerHTML, '');
  const element = new DOMParser().parseFromString(
    cleanedHtml,
    'text/html'
  ).body;
  const nodes = editor.api.html.deserialize({ element });

  if (!nodes) throw new Error('DOCX HTML could not be decoded.');

  return { bodyById, nodes };
};

const unsupportedPackageDiagnostics = (
  entries: ReadonlyMap<string, Uint8Array>
): readonly DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = [];
  const families = [
    ['word/header', 'header'],
    ['word/footer', 'footer'],
    ['word/footnotes.xml', 'footnote'],
    ['word/endnotes.xml', 'endnote'],
  ] as const;

  for (const [prefix, feature] of families) {
    if (![...entries.keys()].some((name) => name.startsWith(prefix))) continue;
    diagnostics.push({
      code: 'unsupported-content',
      feature,
      message: `DOCX ${feature} content is not mapped into the main document.`,
      severity: 'warning',
    });
  }

  return diagnostics;
};

const validateNativeDocument = (editor: Editor, value: unknown) => {
  const parsed = deserializeAuthoredJson(JSON.stringify(value));
  const fitted = editor.read.schema.fitDocument(parsed);

  if (JSON.stringify(fitted) !== JSON.stringify(parsed)) {
    throw new Error(
      'Native DOCX document does not match the installed schema.'
    );
  }

  return parsed;
};

const nativeDiagnostic = (
  reason: Extract<DocxDiagnostic, { code: 'native-data-ignored' }>['reason']
): DocxDiagnostic => ({
  code: 'native-data-ignored',
  message: `Native DOCX data was ignored because its ${
    reason === 'unsupported-version'
      ? 'envelope version is unsupported'
      : reason === 'invalid'
        ? 'envelope is invalid'
        : reason === 'digest-mismatch'
          ? 'package correspondence digest does not match'
          : 'visible projection digest does not match'
  }.`,
  part: AUTHORED_DOCX_PART,
  reason,
  severity: 'warning',
});

const readCorrespondingNativeDocument = async (
  editor: Editor,
  pkg: BoundedDocxPackage,
  diagnostics: DocxDiagnostic[]
) => {
  const source = pkg.entries.get(AUTHORED_DOCX_PART);

  if (!source) return null;
  let envelope: ReturnType<typeof parseAuthoredDocxEnvelope>;

  try {
    envelope = parseAuthoredDocxEnvelope(source);
  } catch (error) {
    diagnostics.push(
      nativeDiagnostic(
        error instanceof RangeError ? 'unsupported-version' : 'invalid'
      )
    );

    return null;
  }
  let document: EditorDocumentValue;

  try {
    document = validateNativeDocument(editor, envelope.document);
  } catch {
    diagnostics.push(nativeDiagnostic('invalid'));

    return null;
  }
  const manifest = await getDocxPartManifest(pkg.entries);

  if (!docxPartManifestMatches(envelope.parts, manifest)) {
    diagnostics.push(nativeDiagnostic('digest-mismatch'));

    return null;
  }
  const projections = await getDocxProjectionDigests(pkg.entries);

  if (!docxProjectionDigestsMatch(envelope.projections, projections)) {
    diagnostics.push(nativeDiagnostic('projection-mismatch'));

    return null;
  }

  return document;
};

const importBoundedDocx = async (
  editor: Editor,
  pkg: BoundedDocxPackage,
  limits: DocxImportLimits,
  signal?: AbortSignal
): Promise<DocxImportResult> => {
  const source = pkg.entries.get('word/document.xml');

  if (!source) {
    return {
      diagnostics: [
        {
          code: 'invalid-package',
          message: 'DOCX is missing its main document part.',
          part: 'word/document.xml',
          severity: 'error',
        },
      ],
      ok: false,
    };
  }
  const diagnostics: DocxDiagnostic[] = [
    ...unsupportedPackageDiagnostics(pkg.entries),
  ];
  const documentXml = new TextDecoder().decode(source);
  const codec = createMarkerCodec(documentXml);
  const document = parseXml(documentXml, 'word/document.xml');
  const revisions = collectDocxRevisions(document, limits, diagnostics);
  const comments = commentMetadata(pkg.entries, limits);

  instrumentPropertyRevisions(document, codec, diagnostics);
  instrumentContentRevisions(document, codec, diagnostics);
  instrumentComments(document, codec);
  const normalized = await pkg.toArrayBuffer(
    new Map([
      ['word/document.xml', new XMLSerializer().serializeToString(document)],
    ])
  );
  let projection: Awaited<ReturnType<typeof importProjection>>;

  try {
    projection = await importProjection(editor, normalized, codec, diagnostics);
  } catch {
    if (signal?.aborted) throw signal.reason;

    return {
      diagnostics: [
        ...diagnostics,
        {
          code: 'decode-failed',
          message:
            'DOCX content could not be decoded by the installed editor schema.',
          part: 'word/document.xml',
          severity: 'error',
        },
      ],
      ok: false,
    };
  }
  const revisionIds = new Set(revisions.map(({ id }) => id));
  const proposedWithMarkers = projectNodes(
    projection.nodes,
    revisionIds,
    codec
  );
  const stripped = stripCommentMarkers(proposedWithMarkers, codec);
  const proposed = editor.read.schema.fitDocument({
    children: rootValue(stripped.nodes),
  });
  const accepted = editor.read.schema.fitDocument({
    children: rootValue(projectNodes(projection.nodes, new Set(), codec)),
  });
  const imported = createSparseImportedRevisions(
    editor,
    projection.nodes,
    revisions,
    codec,
    accepted,
    proposed,
    diagnostics
  );
  let resultDocument = proposed;

  if (imported === null) {
    diagnostics.push({
      code: 'lossy-content',
      feature: 'tracked-revision',
      message:
        'Tracked revisions could not be aligned with the installed schema and were flattened into the proposed document.',
      part: 'word/document.xml',
      severity: 'warning',
    });
  } else if (imported.length > 0) {
    try {
      resultDocument = createAuthoredReviewDocument({
        accepted,
        revisions: imported,
      });
    } catch {
      diagnostics.push({
        code: 'lossy-content',
        feature: 'tracked-revision',
        message: 'Tracked revisions were flattened into the proposed document.',
        part: 'word/document.xml',
        severity: 'warning',
      });
    }
  }
  const importedComments = [...comments.values()].map((metadata) => {
    const endpoint = stripped.endpoints.get(metadata.id);
    let target: Readonly<{ range: Range }> | null = null;

    if (endpoint?.start && endpoint.end) {
      const range = { anchor: endpoint.start, focus: endpoint.end };

      target =
        pointKey(range.anchor) === pointKey(range.focus) ? null : { range };
    }
    if (!target) {
      diagnostics.push({
        code: 'lossy-content',
        feature: 'comment-range',
        message: `Comment ${metadata.id} has no complete imported range.`,
        part: 'word/document.xml',
        severity: 'warning',
        sourceId: metadata.id,
      });
    }

    return Object.freeze({
      ...metadata,
      body: projection.bodyById.get(metadata.id) ?? [
        { children: [{ text: '' }], type: 'paragraph' },
      ],
      target,
    });
  });

  const nativeDocument = await readCorrespondingNativeDocument(
    editor,
    pkg,
    diagnostics
  );

  if (nativeDocument) resultDocument = nativeDocument;

  return Object.freeze({
    comments: Object.freeze(importedComments),
    diagnostics: Object.freeze(diagnostics),
    document: resultDocument,
    ok: true,
  });
};

/** Import a bounded DOCX package into one detached editor document. */
export const importDocx = async <const TRetainSource extends boolean = false>(
  editor: Editor,
  source: ArrayBuffer | Blob,
  options: DocxImportOptions<TRetainSource> = {}
): Promise<DocxImportResult<TRetainSource>> => {
  const limits = resolveDocxImportLimits(options.limits);

  try {
    const pkg = await readBoundedDocxPackage(source, limits, options.signal);

    const result = await importBoundedDocx(editor, pkg, limits, options.signal);

    if (!result.ok || options.retainSource !== true) {
      return result as DocxImportResult<TRetainSource>;
    }

    return Object.freeze({
      ...result,
      source: createDocxSource({
        blob: pkg.source,
        comments: result.comments,
        document: result.document,
        limits,
        schema: editor.read.schema.identity(),
      }),
    });
  } catch (error) {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new DOMException('Aborted', 'AbortError');
    }
    if (error instanceof DocxPackageError) {
      return Object.freeze({
        diagnostics: Object.freeze([error.diagnostic]),
        ok: false,
      });
    }

    throw error;
  }
};
