'use client';

import { dequal } from 'dequal';
import mammoth from 'mammoth';

import {
  createAuthoredImportedRevisionChange,
  createAuthoredReviewDocument,
  type AuthoredImportedRevision,
} from '../../../authored';
import {
  ElementApi,
  TextApi,
  type Descendant,
  type EditorApplicationSchema,
  type EditorDocumentValue,
  type EditorSchemaIdentity,
  type EditorStateSchemaApi,
  type Path,
  type Point,
  type Range,
  type Value,
} from '../../../core';
import type {
  InternalEditorSchemaApi,
  RuntimePluginReference,
} from '../../../facade';
import { withPlateFormatCompilation } from '../../../lib/editor/withPlite';
import {
  coalesceAdjacentText,
  compileHtmlElementDecoder,
  HtmlPlugin,
  type HtmlMappingLoss,
} from '../../../lib/plugins/html/HtmlPlugin';
import { cleanWordHtml } from '../../html/cleanWordHtml.internal';
import { throwIfDocxAborted } from '../../internal/abort';
import { retainDocxSource, type DocxSource } from '../../internal/source';
import {
  describeDocxSourceViolation,
  type DocxSourceViolation,
} from '../../internal/sourceEligibility';
import type {
  DocxComment,
  DocxDiagnostic,
  DocxErrorDiagnostic,
  DocxImportLimits,
  DocxSourceLocation,
  DocxWarningDiagnostic,
} from '../../internal/types';
import {
  DocxPackageError,
  readBoundedDocxPackage,
  resolveDocxImportLimits,
  type BoundedDocxPackage,
} from './docxPackage';
import { instrumentWordMath, materializeEquations } from './wordMath';

export { DocxSource } from '../../internal/source';
export type {
  DocxComment,
  DocxDiagnostic,
  DocxErrorDiagnostic,
  DocxImportLimits,
  DocxSourceLocation,
  DocxWarningDiagnostic,
};

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const CONTENT_REVISION_ELEMENTS = new Set(['del', 'ins', 'moveFrom', 'moveTo']);
const PROPERTY_REVISION_ELEMENTS = new Set(['pPrChange', 'rPrChange']);
const TRACKED_REVISION_ELEMENTS = new Set([
  ...CONTENT_REVISION_ELEMENTS,
  ...PROPERTY_REVISION_ELEMENTS,
]);

export type DocxImportOptions<TRetainSource extends boolean = false> =
  Readonly<{
    limits?: Partial<DocxImportLimits>;
    lossPolicy?: 'allow' | 'reject';
    plugins: readonly RuntimePluginReference[];
    schema?: EditorApplicationSchema;
    signal?: AbortSignal;
  }> &
    ([TRetainSource] extends [true]
      ? Readonly<{
          /**
           * Retain the admitted package and import correspondence for later
           * export. `source` is null when a part falls outside the passive
           * vocabulary exact reuse admits; a `source-unavailable` warning
           * names it.
           */
          retainSource: true;
        }>
      : Readonly<{
          /**
           * Retain the admitted package and import correspondence for later
           * export. `source` is null when a part falls outside the passive
           * vocabulary exact reuse admits; a `source-unavailable` warning
           * names it.
           */
          retainSource?: TRetainSource;
        }>);

type DocxImportFailure = Readonly<{
  diagnostics: readonly [DocxErrorDiagnostic, ...DocxDiagnostic[]];
  ok: false;
}>;

type DocxImportSuccess<
  TRetainSource extends boolean,
  V extends Value,
> = Readonly<{
  comments: readonly DocxComment[];
  diagnostics: readonly DocxWarningDiagnostic[];
  document: EditorDocumentValue<V>;
  ok: true;
}> &
  (TRetainSource extends true ? Readonly<{ source: DocxSource | null }> : {});

type DocxImportOutcome<TRetainSource extends boolean, V extends Value> =
  | DocxImportFailure
  | DocxImportSuccess<TRetainSource, V>;

export type DocxImportResult<TRetainSource extends boolean = false> =
  DocxImportOutcome<TRetainSource, Value>;

type DocxDomRealm = Readonly<{
  abortError: () => DOMException;
  decodeUtf8: (source: Uint8Array) => string;
  isHtmlElement: (value: unknown) => value is HTMLElement;
  parseHtml: (source: string) => Document;
  parseXml: (source: string, part: string) => Document;
  serializeXml: (document: Document) => string;
  textNodeType: number;
}>;

type DocxSchemaRepairDiagnostic = Extract<
  DocxDiagnostic,
  { code: 'schema-repair' }
>;

type DocxImportTarget<V extends Value> = Readonly<{
  assertDocument: (document: EditorDocumentValue) => void;
  decodeHtml: (
    element: HTMLElement,
    onLoss: (loss: HtmlMappingLoss) => void
  ) => readonly Descendant[] | null;
  dom: DocxDomRealm;
  fitDocument: (document: EditorDocumentValue) => EditorDocumentValue<V>;
  fitReportedDocument: (document: EditorDocumentValue) => Readonly<{
    document: EditorDocumentValue<V>;
    repairs: readonly DocxSchemaRepairDiagnostic[];
  }>;
  hasElement: (type: string) => boolean;
  markerNonce: string;
  schemaIdentity: EditorSchemaIdentity;
  toHtml: typeof mammoth.convertToHtml;
}>;

type DocxRevision = Readonly<{
  authorId: string;
  createdAt: number;
  id: string;
}>;

type CommentMetadata = Omit<DocxComment, 'body' | 'target'>;

type Marker = Readonly<{
  id: string;
  kind:
    | 'comment-end'
    | 'comment-start'
    | 'equation-block'
    | 'equation-end'
    | 'equation-inline'
    | 'revision-end'
    | 'revision-start';
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

const captureDocxDomRealm = (): DocxDomRealm => {
  const Parser = globalThis.DOMParser;
  const Serializer = globalThis.XMLSerializer;
  const AbortException = globalThis.DOMException;
  const HtmlElement = globalThis.HTMLElement;
  const textNodeType = globalThis.Node?.TEXT_NODE;

  if (
    !Parser ||
    !Serializer ||
    !AbortException ||
    !HtmlElement ||
    textNodeType === undefined
  ) {
    throw new TypeError('DOCX import requires a complete browser DOM realm.');
  }
  const decoder = new TextDecoder();
  const parseHtml = (source: string) =>
    new Parser().parseFromString(source, 'text/html');
  const parseXml = (source: string, part: string) => {
    const document = new Parser().parseFromString(source, 'application/xml');

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
  const serializeXml = (document: Document) =>
    new Serializer().serializeToString(document);

  return Object.freeze({
    abortError: () => new AbortException('Aborted', 'AbortError'),
    decodeUtf8: (source) => decoder.decode(source),
    isHtmlElement: (value: unknown): value is HTMLElement =>
      value instanceof HtmlElement,
    parseHtml,
    parseXml,
    serializeXml,
    textNodeType,
  });
};

const createMarkerNonce = () => {
  const random = globalThis.crypto?.randomUUID?.().replaceAll('-', '');

  return (
    random ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  );
};

const compileDocxImportTarget = <V extends Value>(
  plugins: readonly RuntimePluginReference[],
  schema: EditorApplicationSchema | undefined,
  dom: DocxDomRealm
): DocxImportTarget<V> => {
  const capturedPlugins = Object.freeze([...plugins]);
  const toHtml = mammoth.convertToHtml.bind(mammoth);

  return withPlateFormatCompilation(
    {
      plugins: [HtmlPlugin, ...capturedPlugins],
      ...(schema ? { schema } : {}),
    },
    ({ editor, readState }) =>
      readState((state) => {
        const editorSchema: EditorStateSchemaApi = state.schema;
        const decodeHtml = compileHtmlElementDecoder(editor, state);

        return Object.freeze({
          assertDocument: (document) => editorSchema.assertDocument(document),
          decodeHtml: (element, onLoss) => decodeHtml(element, { onLoss }),
          dom,
          fitDocument: (document) =>
            editorSchema.fitDocument(document) as EditorDocumentValue<V>,
          fitReportedDocument: (document) => {
            // Revision projection splits text runs; merging them first keeps
            // the report about schema repairs rather than projection artifacts.
            const report = (
              editorSchema as InternalEditorSchemaApi
            ).fitDocumentWithReport({
              ...document,
              children: coalesceAdjacentText(document.children),
            });

            return Object.freeze({
              document: report.document as EditorDocumentValue<V>,
              repairs: Object.freeze(report.repairs.map(repairDiagnostic)),
            });
          },
          hasElement: (type) => editorSchema.element(type) !== null,
          markerNonce: createMarkerNonce(),
          schemaIdentity: editorSchema.identity(),
          toHtml,
        });
      })
  );
};

const repairLocation = (
  location: ReturnType<
    InternalEditorSchemaApi['fitDocumentWithReport']
  >['repairs'][number]['inputs'][number]
) =>
  Object.freeze({
    path: location.path,
    ...(location.property ? { property: location.property } : {}),
    root: location.root,
  });

const repairDiagnostic = (
  repair: ReturnType<
    InternalEditorSchemaApi['fitDocumentWithReport']
  >['repairs'][number]
): DocxSchemaRepairDiagnostic =>
  Object.freeze({
    code: 'schema-repair' as const,
    impact: repair.impact,
    inputs: Object.freeze(repair.inputs.map(repairLocation)),
    message: `DOCX schema fitting applied "${repair.code}".`,
    outputs: Object.freeze(repair.outputs.map(repairLocation)),
    owner: repair.owner,
    repair: repair.code,
    severity: 'warning' as const,
  });

const mappingLossDiagnostic = (
  loss: HtmlMappingLoss,
  feature: string
): DocxDiagnostic =>
  Object.freeze({
    action: loss.action,
    code: 'unsupported-content' as const,
    feature,
    message: loss.message,
    severity: 'warning' as const,
  });

const wordAttribute = (element: Element, name: string) =>
  element.getAttributeNS(WORD_NAMESPACE, name) ??
  element.getAttribute(`w:${name}`) ??
  element.getAttribute(name);

const localAttribute = (element: Element, name: string) =>
  Array.from(element.attributes).find(
    (attribute) =>
      attribute.localName === name || attribute.name.split(':').at(-1) === name
  )?.value ?? null;

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
        action: 'replaced',
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

const createMarkerCodec = (documentXml: string, markerNonce: string) => {
  let nonce = markerNonce;

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

const equationMarkers = (codec: ReturnType<typeof createMarkerCodec>) => ({
  block: codec.marker('equation-block', 'math').token,
  end: codec.marker('equation-end', 'math').token,
  inline: codec.marker('equation-inline', 'math').token,
});

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
        action: 'replaced',
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
        action: 'replaced',
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
      action: 'replaced',
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
        action: 'replaced',
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

const createSparseImportedRevisions = (
  target: Pick<DocxImportTarget<Value>, 'fitDocument'>,
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
      : target.fitDocument({
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

  if (!dequal(current, accepted.children)) return null;
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

        if (!dequal(before, after)) {
          sections.push({ after, before, from: childIndex });
        }
        currentUnits[unitIndex] = after;
      }
      childIndex += before.length;
    });
    current = currentUnits.flat();

    if (sections.length === 0) {
      diagnostics.push({
        action: 'dropped',
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

  return dequal(current, proposed.children) ? imported : null;
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
  dom: DocxDomRealm,
  entries: ReadonlyMap<string, Uint8Array>,
  limits: DocxImportLimits
) => {
  const source = entries.get('word/comments.xml');

  if (!source) return new Map<string, CommentMetadata>();
  const comments = dom.parseXml(dom.decodeUtf8(source), 'word/comments.xml');
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
    const extended = dom.parseXml(
      dom.decodeUtf8(extendedSource),
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
    const ids = dom.parseXml(dom.decodeUtf8(idsSource), 'word/commentsIds.xml');

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
  target: DocxImportTarget<Value>,
  arrayBuffer: ArrayBuffer,
  codec: ReturnType<typeof createMarkerCodec>,
  diagnostics: DocxDiagnostic[],
  signal?: AbortSignal
) => {
  throwIfDocxAborted(signal, target.dom.abortError);
  const mammothResult = await target.toHtml(
    { arrayBuffer, buffer: arrayBuffer as never },
    { styleMap: ['comment-reference => sup'] }
  );

  throwIfDocxAborted(signal, target.dom.abortError);

  for (const message of mammothResult.messages) {
    diagnostics.push({
      code: 'converter-message',
      message: message.message,
      severity: 'warning',
    });
  }
  const mammothDocument = target.dom.parseHtml(mammothResult.value);
  const bodyById = new Map<string, Value>();

  for (const dl of Array.from(mammothDocument.querySelectorAll('dl'))) {
    const definitions = Array.from(dl.querySelectorAll('dt[id^="comment-"]'));

    if (definitions.length === 0) continue;
    for (const definition of definitions) {
      const id = (definition.getAttribute('id') ?? '').slice('comment-'.length);
      const description = definition.nextElementSibling;

      if (!(id && description?.matches('dd'))) continue;
      const clone = description.cloneNode(true);

      if (!target.dom.isHtmlElement(clone)) continue;
      clone.querySelectorAll('a[href^="#comment-ref-"]').forEach((node) => {
        const previous = node.previousSibling;

        if (
          previous?.nodeType === target.dom.textNodeType &&
          previous.textContent
        ) {
          previous.textContent = previous.textContent.trimEnd();
        }
        node.remove();
      });
      const wrapper = clone.ownerDocument.createElement('div');

      wrapper.innerHTML = clone.innerHTML;
      let losses: HtmlMappingLoss[] = [];
      let nodes = target.decodeHtml(wrapper, (loss) => losses.push(loss));

      if (!nodes?.every((node) => ElementApi.isElement(node))) {
        const paragraph = clone.ownerDocument.createElement('p');

        paragraph.innerHTML = clone.innerHTML;
        wrapper.replaceChildren(paragraph);
        losses = [];
        nodes = target.decodeHtml(wrapper, (loss) => losses.push(loss));
      }
      if (nodes?.every((node) => ElementApi.isElement(node))) {
        bodyById.set(
          id,
          rootValue(
            materializeEquations(nodes, equationMarkers(codec), {
              block: false,
              inline: false,
            })
          )
        );
        diagnostics.push(
          ...losses.map((loss) => mappingLossDiagnostic(loss, 'comment'))
        );
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
  const cleanedHtml = cleanWordHtml(
    mammothDocument.body.innerHTML,
    '',
    target.dom.parseHtml
  );
  const element = target.dom.parseHtml(cleanedHtml).body;
  const nodes = target.decodeHtml(element, (loss) =>
    diagnostics.push(mappingLossDiagnostic(loss, 'content'))
  );

  if (!nodes) throw new Error('DOCX HTML could not be decoded.');

  return {
    bodyById,
    nodes: materializeEquations(nodes, equationMarkers(codec), {
      block: target.hasElement('equation'),
      inline: target.hasElement('inlineEquation'),
    }),
  };
};

const unsupportedPackageDiagnostics = (
  pkg: BoundedDocxPackage
): readonly DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = pkg.xmlInventory.map(
    ({ action, feature, location }) => ({
      action,
      code: 'unsupported-content' as const,
      feature,
      message: `DOCX ${feature} content was ${action}.`,
      part: location.part,
      severity: 'warning' as const,
      sourceLocation: location,
    })
  );
  const families = [
    ['word/header', 'header'],
    ['word/footer', 'footer'],
    ['word/footnotes.xml', 'footnote'],
    ['word/endnotes.xml', 'endnote'],
  ] as const;

  for (const [prefix, feature] of families) {
    const part = [...pkg.entries.keys()].find((name) =>
      name.startsWith(prefix)
    );

    if (!part) continue;
    diagnostics.push({
      action: 'dropped',
      code: 'unsupported-content',
      feature,
      message: `DOCX ${feature} content is not mapped into the main document.`,
      part,
      severity: 'warning',
      ...(pkg.xmlRoots.get(part)
        ? { sourceLocation: pkg.xmlRoots.get(part) }
        : {}),
    });
  }

  return diagnostics;
};

const failed = (
  diagnostic: DocxErrorDiagnostic,
  diagnostics: readonly DocxDiagnostic[] = []
): DocxImportFailure =>
  Object.freeze({
    diagnostics: Object.freeze<
      readonly [DocxErrorDiagnostic, ...DocxDiagnostic[]]
    >([diagnostic, ...diagnostics]),
    ok: false,
  });

const isVisibleLoss = (diagnostic: DocxDiagnostic) =>
  diagnostic.code === 'lossy-content' ||
  (diagnostic.code === 'schema-repair' && diagnostic.impact === 'lossy') ||
  diagnostic.code === 'resource-omitted' ||
  (diagnostic.code === 'unsupported-content' &&
    diagnostic.action !== 'unwrapped');

const applyLossPolicy = (
  diagnostics: readonly DocxDiagnostic[],
  lossPolicy: 'allow' | 'reject'
): readonly DocxDiagnostic[] =>
  Object.freeze(
    diagnostics.map((diagnostic) =>
      lossPolicy === 'reject' &&
      diagnostic.severity === 'warning' &&
      isVisibleLoss(diagnostic)
        ? (Object.freeze({
            ...diagnostic,
            severity: 'error' as const,
          }) as DocxDiagnostic)
        : diagnostic
    )
  );

const failureFromDiagnostics = (
  diagnostics: readonly DocxDiagnostic[]
): DocxImportFailure | null => {
  const index = diagnostics.findIndex(
    (diagnostic) => diagnostic.severity === 'error'
  );

  if (index === -1) return null;
  const diagnostic = diagnostics[index] as DocxErrorDiagnostic;

  return failed(diagnostic, [
    ...diagnostics.slice(0, index),
    ...diagnostics.slice(index + 1),
  ]);
};

const decodeFailure = (): DocxErrorDiagnostic =>
  Object.freeze({
    code: 'decode-failed',
    message:
      'DOCX content could not be decoded by the installed editor schema.',
    part: 'word/document.xml',
    severity: 'error',
  });

const importBoundedDocx = async <V extends Value>(
  target: DocxImportTarget<V>,
  pkg: BoundedDocxPackage,
  limits: DocxImportLimits,
  lossPolicy: 'allow' | 'reject',
  signal?: AbortSignal
): Promise<DocxImportOutcome<false, V>> => {
  const source = pkg.entries.get('word/document.xml');

  if (!source) {
    return failed({
      code: 'invalid-package',
      message: 'DOCX is missing its main document part.',
      part: 'word/document.xml',
      severity: 'error',
    });
  }
  const diagnostics: DocxDiagnostic[] = [...unsupportedPackageDiagnostics(pkg)];
  const documentXml = target.dom.decodeUtf8(source);
  const codec = createMarkerCodec(documentXml, target.markerNonce);
  const document = target.dom.parseXml(documentXml, 'word/document.xml');
  const rewritten = new Map<string, string>();
  const commentsSource = pkg.entries.get('word/comments.xml');

  instrumentWordMath(
    document,
    equationMarkers(codec),
    diagnostics,
    'word/document.xml'
  );
  if (commentsSource) {
    const commentsDocument = target.dom.parseXml(
      target.dom.decodeUtf8(commentsSource),
      'word/comments.xml'
    );

    instrumentWordMath(
      commentsDocument,
      equationMarkers(codec),
      diagnostics,
      'word/comments.xml'
    );
    rewritten.set(
      'word/comments.xml',
      target.dom.serializeXml(commentsDocument)
    );
  }
  const revisions = collectDocxRevisions(document, limits, diagnostics);
  const comments = commentMetadata(target.dom, pkg.entries, limits);

  instrumentPropertyRevisions(document, codec, diagnostics);
  instrumentContentRevisions(document, codec, diagnostics);
  instrumentComments(document, codec);
  throwIfDocxAborted(signal, target.dom.abortError);
  rewritten.set('word/document.xml', target.dom.serializeXml(document));
  const normalized = await pkg.toArrayBuffer(rewritten);
  throwIfDocxAborted(signal, target.dom.abortError);
  let projection: Awaited<ReturnType<typeof importProjection>>;

  try {
    projection = await importProjection(
      target,
      normalized,
      codec,
      diagnostics,
      signal
    );
  } catch {
    throwIfDocxAborted(signal, target.dom.abortError);

    return failed(decodeFailure(), diagnostics);
  }
  const revisionIds = new Set(revisions.map(({ id }) => id));
  const proposedWithMarkers = projectNodes(
    projection.nodes,
    revisionIds,
    codec
  );
  const stripped = stripCommentMarkers(proposedWithMarkers, codec);
  let proposed: EditorDocumentValue<V>;
  let accepted: EditorDocumentValue<V>;
  let proposedRepairs: readonly DocxSchemaRepairDiagnostic[];
  let acceptedRepairs: readonly DocxSchemaRepairDiagnostic[];
  let imported: readonly AuthoredImportedRevision[] | null;

  try {
    ({ document: proposed, repairs: proposedRepairs } =
      target.fitReportedDocument({ children: rootValue(stripped.nodes) }));
    ({ document: accepted, repairs: acceptedRepairs } =
      target.fitReportedDocument({
        children: rootValue(projectNodes(projection.nodes, new Set(), codec)),
      }));
    imported = createSparseImportedRevisions(
      target,
      projection.nodes,
      revisions,
      codec,
      accepted,
      proposed,
      diagnostics
    );
  } catch {
    return failed(decodeFailure(), diagnostics);
  }
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
      }) as EditorDocumentValue<V>;
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
  const reportedRepairs = new Set<string>();

  for (const repair of resultDocument === proposed
    ? proposedRepairs
    : [...acceptedRepairs, ...proposedRepairs]) {
    const key = JSON.stringify([
      repair.repair,
      repair.owner,
      repair.inputs,
      repair.outputs,
    ]);

    if (reportedRepairs.has(key)) continue;
    reportedRepairs.add(key);
    diagnostics.push(repair);
  }
  const importedComments = [...comments.values()].map((metadata) => {
    const endpoint = stripped.endpoints.get(metadata.id);
    let commentTarget: Readonly<{ range: Range }> | null = null;

    if (endpoint?.start && endpoint.end) {
      const range = { anchor: endpoint.start, focus: endpoint.end };

      commentTarget =
        pointKey(range.anchor) === pointKey(range.focus) ? null : { range };
    }
    if (!commentTarget) {
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
      target: commentTarget,
    });
  });

  throwIfDocxAborted(signal, target.dom.abortError);
  try {
    target.assertDocument(resultDocument);
  } catch {
    return failed(decodeFailure(), diagnostics);
  }
  throwIfDocxAborted(signal, target.dom.abortError);
  const policyDiagnostics = applyLossPolicy(diagnostics, lossPolicy);
  const policyFailure = failureFromDiagnostics(policyDiagnostics);

  if (policyFailure) return policyFailure;

  return Object.freeze({
    comments: Object.freeze(importedComments),
    diagnostics: policyDiagnostics as readonly DocxWarningDiagnostic[],
    document: resultDocument,
    ok: true,
  });
};

const sourceIneligibleDiagnostic = (
  violation: DocxSourceViolation
): DocxWarningDiagnostic =>
  Object.freeze({
    code: 'source-unavailable' as const,
    message: `The DOCX source cannot be retained because ${describeDocxSourceViolation(
      violation
    )}; export will generate the document from editor content.`,
    part: violation.part,
    reason: 'ineligible' as const,
    severity: 'warning' as const,
  });

const runDocxImport = async <V extends Value, TRetainSource extends boolean>(
  target: DocxImportTarget<V>,
  source: ArrayBuffer | Blob,
  options: Readonly<{
    limits: DocxImportLimits;
    lossPolicy: 'allow' | 'reject';
    retainSource: TRetainSource;
    signal: AbortSignal | undefined;
  }>
): Promise<DocxImportOutcome<TRetainSource, V>> => {
  try {
    const pkg = await readBoundedDocxPackage(
      source,
      options.limits,
      options.signal,
      target.dom.abortError
    );

    throwIfDocxAborted(options.signal, target.dom.abortError);
    const result = await importBoundedDocx(
      target,
      pkg,
      options.limits,
      options.lossPolicy,
      options.signal
    );

    throwIfDocxAborted(options.signal, target.dom.abortError);
    if (!result.ok || !options.retainSource) {
      return result;
    }
    const retained = retainDocxSource(pkg, {
      comments: result.comments,
      document: result.document,
      limits: options.limits,
      schema: target.schemaIdentity,
    });

    throwIfDocxAborted(options.signal, target.dom.abortError);

    return Object.freeze({
      ...result,
      diagnostics: retained.violation
        ? Object.freeze([
            ...result.diagnostics,
            sourceIneligibleDiagnostic(retained.violation),
          ])
        : result.diagnostics,
      source: retained.source,
    });
  } catch (error) {
    throwIfDocxAborted(options.signal, target.dom.abortError);
    if (error instanceof DocxPackageError) {
      return failed(error.diagnostic);
    }

    throw error;
  }
};

/** Import a bounded DOCX package against one synchronously captured target. */
export function importDocx<const TRetainSource extends boolean = false>(
  source: ArrayBuffer | Blob,
  options: DocxImportOptions<TRetainSource>
): Promise<DocxImportResult<TRetainSource>> {
  const signal = options?.signal;

  if (signal?.aborted) {
    // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Reject with the caller's AbortSignal.reason, as fetch does.
    return Promise.reject(signal.reason);
  }
  if (!options || !Array.isArray(options.plugins)) {
    throw new TypeError('DOCX import requires a plugins array.');
  }
  if (
    options.lossPolicy !== undefined &&
    options.lossPolicy !== 'allow' &&
    options.lossPolicy !== 'reject'
  ) {
    throw new TypeError('lossPolicy must be "allow" or "reject".');
  }
  if (
    options.retainSource !== undefined &&
    typeof options.retainSource !== 'boolean'
  ) {
    throw new TypeError('retainSource must be a boolean.');
  }
  const dom = captureDocxDomRealm();
  const limits = resolveDocxImportLimits(options.limits);
  const lossPolicy = options.lossPolicy ?? 'reject';
  const retainSource = (options.retainSource ?? false) as TRetainSource;
  const plugins = Object.freeze([...options.plugins]);
  const target = compileDocxImportTarget<Value>(plugins, options.schema, dom);
  const capturedSource =
    source instanceof ArrayBuffer
      ? source.slice(0)
      : source.slice(0, source.size);

  return runDocxImport(target, capturedSource, {
    limits,
    lossPolicy,
    retainSource,
    signal,
  });
}
