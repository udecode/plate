'use client';

import { dequal } from 'dequal';
import mammoth from 'mammoth';

import { type AuthoredMark, projectAuthoredDocument } from '../../../authored';
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
import {
  type CompiledEditorSchema,
  type InternalEditorSchemaApi,
  normalizeSetValues,
  type RuntimePluginReference,
} from '../../../facade';
import { withPlateFormatCompilation } from '../../../lib/editor/withPlite';
import {
  coalesceAdjacentText,
  compileHtmlElementDecoder,
  followsLossPolicy,
  HtmlPlugin,
  type HtmlMappingLoss,
} from '../../../lib/plugins/html/HtmlPlugin';
import { cleanWordHtml } from '../../html/cleanWordHtml.internal';
import { throwIfDocxAborted } from '../../internal/abort';
import { captureDocxDomParsers } from '../../internal/domParser';
import {
  type DocxListItem,
  readDocxNumbering,
} from '../../internal/readDocxNumbering';
import {
  CONTENT_REVISIONS,
  isCustomXmlItem,
  parseReviewPart,
  REVIEW_PART_NAMESPACE,
  reviewBindingBookmarks,
  reviewBindingFingerprints,
  reviewPackageKeys,
  wordAttribute,
  type ReviewPart,
  type ReviewPartBinding,
} from '../../internal/reviewPart';
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
const CONTENT_REVISION_ELEMENTS = new Set(CONTENT_REVISIONS);
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
  /**
   * Whether the proposed projection of `review`, built through the schema as
   * a decision builds it and fitted to it, equals `proposed`. Fitting each
   * document makes its own generated values, so the comparison leaves them
   * out.
   */
  decidesTo: (
    review: EditorDocumentValue,
    proposed: EditorDocumentValue
  ) => boolean;
  dom: DocxDomRealm;
  fitDocument: (document: EditorDocumentValue) => EditorDocumentValue<V>;
  fitReportedDocument: (document: EditorDocumentValue) => Readonly<{
    document: EditorDocumentValue<V>;
    repairs: readonly DocxSchemaRepairDiagnostic[];
  }>;
  hasElement: (type: string) => boolean;
  markerNonce: string;
  /** `document` with the spares its pending changes need, as a load stores them. */
  repairDocument: <D extends EditorDocumentValue>(document: D) => D;
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
    | 'binding-end'
    | 'binding-start'
    | 'comment-end'
    | 'comment-start'
    | 'list-item'
    | 'revision-end'
    | 'revision-start';
  mode?: 'delete' | 'insert';
  token: string;
}>;

type ActiveRevision = Readonly<{
  id: string;
  mode: 'delete' | 'insert';
}>;

const captureDocxDomRealm = (): DocxDomRealm => {
  const parsers = captureDocxDomParsers();
  const Serializer = globalThis.XMLSerializer;
  const AbortException = globalThis.DOMException;
  const HtmlElement = globalThis.HTMLElement;
  const textNodeType = globalThis.Node?.TEXT_NODE;

  if (
    !parsers ||
    !Serializer ||
    !AbortException ||
    !HtmlElement ||
    textNodeType === undefined
  ) {
    throw new TypeError('DOCX import requires a complete browser DOM realm.');
  }
  const decoder = new TextDecoder();
  const parseXml = (source: string, part: string) =>
    parsers.parseXml(
      source,
      () =>
        new DocxPackageError({
          code: 'invalid-package',
          message: 'DOCX contains malformed XML.',
          part,
          severity: 'error',
        })
    );
  const serializeXml = (document: Document) =>
    new Serializer().serializeToString(document);

  return Object.freeze({
    abortError: () => new AbortException('Aborted', 'AbortError'),
    decodeUtf8: (source) => decoder.decode(source),
    isHtmlElement: (value: unknown): value is HTMLElement =>
      value instanceof HtmlElement,
    parseHtml: parsers.parseHtml,
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

const generatedKeysOf = (schema: CompiledEditorSchema) => {
  const keys = { element: new Set<string>(), text: new Set<string>() };

  for (const {
    descriptor,
    key,
    placement,
  } of schema.properties.byId.values()) {
    if (typeof descriptor.generate === 'function' && typeof key === 'string') {
      keys[placement].add(key);
    }
  }

  return keys;
};

const withoutKeys = (
  nodes: readonly Descendant[],
  keys: ReturnType<typeof generatedKeysOf>
): Descendant[] =>
  nodes.map((node) => {
    const own = TextApi.isText(node) ? keys.text : keys.element;
    const kept = Object.fromEntries(
      Object.entries(node).filter(([key]) => !own.has(key))
    );

    return (
      ElementApi.isElement(node)
        ? { ...kept, children: withoutKeys(node.children, keys) }
        : kept
    ) as Descendant;
  });

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
    ({ authored, editor, readState, schema: compiled }) =>
      readState((state) => {
        const editorSchema: EditorStateSchemaApi = state.schema;
        const decodeHtml = compileHtmlElementDecoder(editor, state);
        const generated = generatedKeysOf(compiled);
        const comparable = (document: EditorDocumentValue) =>
          coalesceAdjacentText(withoutKeys(document.children, generated));

        return Object.freeze({
          assertDocument: (document) => editorSchema.assertDocument(document),
          decidesTo: (review, proposed) => {
            const projected = authored
              ? authored.projectDecided(review, 'proposed', compiled)
              : projectAuthoredDocument(review, { projection: 'proposed' });

            return (
              projected.ok &&
              dequal(
                comparable(editorSchema.fitDocument(projected.document)),
                comparable(proposed)
              )
            );
          },
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
          repairDocument: (document) =>
            (authored?.repair(document, compiled) ??
              document) as typeof document,
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

const mappingLossDiagnostics = (
  losses: readonly HtmlMappingLoss[],
  part: 'word/comments.xml' | 'word/document.xml'
): DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = [];
  const properties = new Map<
    string,
    { count: number; feature: string; message: string }
  >();

  for (const loss of losses) {
    const warns = loss.removal
      ? loss.removal.impact === 'lossy' && !followsLossPolicy(loss.removal)
      : loss.kind !== 'element';

    if (!warns) {
      diagnostics.push(
        Object.freeze({
          action: loss.action,
          code: 'unsupported-content',
          ...(loss.source?.kind === 'tree' && loss.source.tag === 'input'
            ? { feature: 'checkbox' }
            : {}),
          impact: loss.removal?.impact ?? 'lossy',
          message: loss.message,
          part,
          severity: 'warning',
        })
      );
      continue;
    }
    const attribute =
      loss.source?.kind === 'tree' ? loss.source.attribute : undefined;
    const key = attribute ?? `${loss.kind}\u0000${loss.message}`;
    const counted = properties.get(key);

    properties.set(key, {
      count: (counted?.count ?? 0) + 1,
      feature: attribute ?? loss.kind,
      message: counted?.message ?? loss.message,
    });
  }
  for (const { count, feature, message } of properties.values()) {
    diagnostics.push(
      Object.freeze({
        code: 'property-dropped',
        count,
        feature,
        impact: 'lossy',
        message,
        part,
        severity: 'warning',
      })
    );
  }

  return diagnostics;
};

const localAttributeNode = (element: Element, name: string) =>
  Array.from(element.attributes).find(
    (attribute) =>
      attribute.localName === name || attribute.name.split(':').at(-1) === name
  );

const localAttribute = (element: Element, name: string) =>
  localAttributeNode(element, name)?.value ?? null;

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
        impact: 'lossy',
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
    `${prefix}(binding-end|binding-start|comment-end|comment-start|revision-end|revision-start)_(delete|insert|none)_([^${suffix}]+)${suffix}`,
    'g'
  );
  const listPattern = new RegExp(
    `${prefix}list-item_none_[^${suffix}]+${suffix}`,
    'g'
  );

  return {
    equation: Object.freeze({
      block: `${prefix}equation-block${suffix}`,
      end: `${prefix}equation-end${suffix}`,
      inline: `${prefix}equation-inline${suffix}`,
    }),
    listMarkers: (text: string) => text.match(listPattern) ?? [],
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

const RUN_CONTAINERS = new Set([
  ...CONTENT_REVISION_ELEMENTS,
  'hyperlink',
  'p',
]);

const markerFor = (element: Element, token: string) => {
  if (
    element.localName === 'r' ||
    RUN_CONTAINERS.has(element.parentElement?.localName ?? '')
  ) {
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

const parsedPart = (
  dom: DocxDomRealm,
  entries: BoundedDocxPackage['entries'],
  name: string
) => {
  const source = entries.get(name);

  if (!source) return undefined;
  try {
    return dom.parseXml(dom.decodeUtf8(source), name);
  } catch {
    return undefined;
  }
};

type DocxParts = Readonly<{
  numbering?: Document;
  styles?: Document;
}>;

// Mammoth drops a paragraph's list identity, so each numbered paragraph
// carries a marker run to the item Mammoth renders for it.
const instrumentNumbering = (
  document: Document,
  codec: ReturnType<typeof createMarkerCodec>,
  parts: DocxParts
) => {
  const items = new Map<string, DocxListItem>();

  for (const [paragraph, item] of readDocxNumbering(document, parts)) {
    const { token } = codec.marker('list-item', String(items.size));
    const properties = Array.from(paragraph.children).find(
      (child) => child.localName === 'pPr'
    );
    const run = markerRun(document, token);

    if (properties) properties.after(run);
    else paragraph.prepend(run);
    items.set(token, item);
  }

  return items;
};

const applyListMarkers = (
  node: Node,
  codec: ReturnType<typeof createMarkerCodec>,
  items: ReadonlyMap<string, DocxListItem>,
  dom: DocxDomRealm
) => {
  if (node.nodeType !== dom.textNodeType) {
    for (const child of Array.from(node.childNodes)) {
      applyListMarkers(child, codec, items, dom);
    }

    return;
  }

  const text = node.textContent ?? '';
  const tokens = codec.listMarkers(text);

  if (tokens.length === 0) return;

  const element =
    node.parentElement?.closest('li') ??
    node.parentElement?.closest('p, h1, h2, h3, h4, h5, h6');

  for (const token of tokens) {
    const item = items.get(token);

    if (!(item && dom.isHtmlElement(element))) continue;

    const { dataset, style } = element;

    dataset.indent = String(item.indent);
    dataset.listId = item.listId;
    dataset.listType = item.listType;
    if (item.checked !== undefined) dataset.checked = String(item.checked);
    if (item.listLevels) dataset.listLevels = JSON.stringify(item.listLevels);
    if (item.listRestart !== undefined) {
      dataset.listRestart = String(item.listRestart);
    }
    if (item.listStyle) style.listStyleType = item.listStyle;
  }
  node.textContent = tokens.reduce(
    (remaining, token) => remaining.replace(token, ''),
    text
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
        impact: 'lossy',
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
        impact: 'lossy',
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
      impact: 'lossy',
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

/**
 * The document with every revision's runs kept, each run marked by the
 * revisions around it: a deletion keeps its text under a delete mark.
 */
const reviewNodes = (
  nodes: readonly Descendant[],
  revisions: readonly DocxRevision[],
  codec: ReturnType<typeof createMarkerCodec>
) => {
  const byId = new Map(revisions.map((revision) => [revision.id, revision]));
  const active: ActiveRevision[] = [];
  const activeMarks = () =>
    active.flatMap(({ id, mode }): AuthoredMark[] => {
      const revision = byId.get(id);

      return revision
        ? [
            {
              author: revision.authorId,
              at: revision.createdAt,
              change: `docx-${id}`,
              kind: mode,
            },
          ]
        : [];
    });
  // Nested revisions stack their marks, which the document stores in set order.
  const withMarks = (node: Descendant, marks: readonly AuthoredMark[]) =>
    marks.length
      ? ({ ...node, authored: normalizeSetValues(marks) } as Descendant)
      : node;
  let sawMarker = false;
  const visit = (node: Descendant): Descendant[] => {
    if (!TextApi.isText(node)) {
      // A paragraph property revision wraps whole copies of the paragraph
      // between marker paragraphs: each copy is inserted or deleted whole.
      const enclosing = activeMarks();
      const outer = sawMarker;

      sawMarker = false;
      const children = node.children.flatMap(visit);
      const markerOnly = sawMarker && children.length === 0;

      sawMarker ||= outer;
      if (markerOnly) return [];

      return [
        withMarks(
          { ...node, children: children.length ? children : [{ text: '' }] },
          enclosing
        ),
      ];
    }
    const pieces: Descendant[] = [];
    let cursor = 0;
    let text = '';
    const flush = () => {
      const marks = activeMarks();

      if (text) pieces.push(withMarks({ ...node, text }, marks));
      text = '';
    };

    for (const marker of codec.parse(node.text)) {
      text += node.text.slice(cursor, marker.start);
      cursor = marker.end;

      if (marker.kind === 'revision-start' && marker.mode) {
        flush();
        sawMarker = true;
        active.push({ id: marker.id, mode: marker.mode });
      } else if (marker.kind === 'revision-end') {
        flush();
        sawMarker = true;
        const index = active.findLastIndex(
          ({ id, mode }) => id === marker.id && mode === marker.mode
        );

        if (index !== -1) active.splice(index, 1);
      } else {
        text += marker.token;
      }
    }
    text += node.text.slice(cursor);
    flush();

    return pieces;
  };

  return nodes.flatMap(visit);
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

type ReviewBindings = Readonly<{
  bindings: ReadonlyMap<string, ReviewPartBinding>;
  records: ReviewPart['records'];
}>;

const reviewLoss = (message: string): DocxDiagnostic => ({
  code: 'lossy-content',
  feature: 'authored-review',
  message,
  part: 'word/document.xml',
  severity: 'warning',
});

const readReviewPart = (
  dom: DocxDomRealm,
  entries: BoundedDocxPackage['entries']
) => {
  for (const [name, source] of entries) {
    if (!isCustomXmlItem(name)) continue;
    let root: Element;

    try {
      root = dom.parseXml(dom.decodeUtf8(source), name).documentElement;
    } catch {
      continue;
    }
    if (
      root.namespaceURI === REVIEW_PART_NAMESPACE &&
      root.localName === 'review'
    ) {
      return parseReviewPart(root.textContent ?? '');
    }
  }

  return undefined;
};

const instrumentReviewBindings = (
  dom: DocxDomRealm,
  entries: BoundedDocxPackage['entries'],
  document: Document,
  codec: ReturnType<typeof createMarkerCodec>,
  parts: DocxParts,
  diagnostics: DocxDiagnostic[]
): ReviewBindings | null => {
  const part = readReviewPart(dom, entries);

  if (part === undefined) return null;
  if (part === null) {
    diagnostics.push(
      reviewLoss(
        'The DOCX review part cannot be read, so its review facts are lost.'
      )
    );

    return null;
  }
  const names = new Set(part.bindings.map(({ name }) => name));
  const bookmarks = reviewBindingBookmarks(document, names);
  const fingerprints = reviewBindingFingerprints(
    bookmarks,
    reviewPackageKeys(
      document,
      {
        ...parts,
        relationships: parsedPart(dom, entries, 'word/_rels/document.xml.rels'),
      },
      (path) => entries.get(path)
    )
  );
  const bindings = new Map<string, ReviewPartBinding>();

  part.bindings.forEach((binding, index) => {
    const { end, start } = bookmarks.get(binding.name) ?? {};

    if (
      start &&
      end &&
      fingerprints.get(binding.name) === binding.fingerprint
    ) {
      start.replaceWith(
        markerFor(start, codec.marker('binding-start', String(index)).token)
      );
      end.replaceWith(
        markerFor(end, codec.marker('binding-end', String(index)).token)
      );
      bindings.set(String(index), binding);

      return;
    }
    start?.remove();
    end?.remove();
    diagnostics.push(
      reviewLoss(
        `The DOCX changed the block that review binding ${binding.name} keeps, so its review facts are lost.`
      )
    );
  });

  return { bindings, records: part.records };
};

const textsOf = (nodes: readonly Descendant[]): string[] =>
  nodes.flatMap((node) =>
    TextApi.isText(node) ? [node.text] : textsOf(node.children)
  );

const isBindingMarker = ({ kind }: Marker) =>
  kind === 'binding-end' || kind === 'binding-start';

const withoutBindingMarkers = (
  nodes: readonly Descendant[],
  codec: ReturnType<typeof createMarkerCodec>
): Descendant[] =>
  nodes.map((node) => {
    if (!TextApi.isText(node)) {
      return {
        ...node,
        children: withoutBindingMarkers(node.children, codec),
      };
    }
    const markers = codec.parse(node.text).filter(isBindingMarker);

    return markers.length === 0
      ? node
      : {
          ...node,
          text: markers.reduce(
            (text, { token }) => text.replace(token, ''),
            node.text
          ),
        };
  });

const startsIn = (from: number, length: number, offset: number) =>
  from <= offset && offset < from + length;

const endsIn = (from: number, length: number, offset: number) =>
  from < offset && offset <= from + length;

const moveCommentMarkers = (
  converted: readonly Descendant[],
  stored: readonly Descendant[],
  codec: ReturnType<typeof createMarkerCodec>
) => {
  const anchors: Array<{ end: boolean; offset: number; token: string }> = [];
  let convertedText = '';

  for (const text of textsOf(converted)) {
    let cursor = 0;

    for (const marker of codec.parse(text)) {
      convertedText += text.slice(cursor, marker.start);
      cursor = marker.end;
      if (marker.kind === 'comment-end' || marker.kind === 'comment-start') {
        anchors.push({
          end: marker.kind === 'comment-end',
          offset: convertedText.length,
          token: marker.token,
        });
      }
    }
    convertedText += text.slice(cursor);
  }
  const texts = textsOf(stored);

  if (anchors.length === 0 || convertedText !== texts.join('')) return stored;
  const starts = texts.map((_, index) =>
    texts.slice(0, index).reduce((length, text) => length + text.length, 0)
  );
  const inserts = new Map<number, Array<{ at: number; token: string }>>();

  for (const { end, offset, token } of anchors) {
    const found = starts.findIndex((from, index) =>
      (end ? endsIn : startsIn)(from, texts[index].length, offset)
    );
    const index = found === -1 ? (end ? 0 : texts.length - 1) : found;

    inserts.set(index, [
      ...(inserts.get(index) ?? []),
      { at: offset - starts[index], token },
    ]);
  }
  let leaf = -1;
  const visit = (node: Descendant): Descendant => {
    if (!TextApi.isText(node)) {
      return { ...node, children: node.children.map(visit) };
    }
    leaf += 1;
    let text = '';
    let cursor = 0;

    for (const { at, token } of inserts.get(leaf) ?? []) {
      text += node.text.slice(cursor, at) + token;
      cursor = at;
    }

    return cursor === 0 && text === ''
      ? node
      : { ...node, text: text + node.text.slice(cursor) };
  };

  return stored.map(visit);
};

const substituteBindings = (
  nodes: readonly Descendant[],
  review: ReviewBindings,
  codec: ReturnType<typeof createMarkerCodec>,
  diagnostics: DocxDiagnostic[]
) => {
  const starts = new Map<string, number>();
  const ends = new Map<string, number>();

  nodes.forEach((node, index) => {
    for (const text of textsOf([node])) {
      for (const marker of codec.parse(text)) {
        if (marker.kind === 'binding-start' && !starts.has(marker.id)) {
          starts.set(marker.id, index);
        } else if (marker.kind === 'binding-end') {
          ends.set(marker.id, index);
        }
      }
    }
  });
  const ranges = [...review.bindings].flatMap(([id, binding]) => {
    const from = starts.get(id);
    const to = ends.get(id);

    if (from !== undefined && to !== undefined && from <= to) {
      return [{ from, nodes: binding.nodes, to }];
    }
    diagnostics.push(
      reviewLoss(
        `The DOCX conversion lost the place of review binding ${binding.name}, so its review facts are lost.`
      )
    );

    return [];
  });
  const groups: Array<{ from: number; nodes: Descendant[]; to: number }> = [];

  for (const range of ranges.toSorted(
    (left, right) => left.from - right.from
  )) {
    const last = groups.at(-1);

    if (last && range.from <= last.to) {
      last.nodes.push(...range.nodes);
      last.to = Math.max(last.to, range.to);
    } else {
      groups.push({ ...range, nodes: [...range.nodes] });
    }
  }
  const result: Descendant[] = [];
  let cursor = 0;

  for (const group of groups) {
    result.push(
      ...nodes.slice(cursor, group.from),
      ...moveCommentMarkers(
        nodes.slice(group.from, group.to + 1),
        group.nodes,
        codec
      )
    );
    cursor = group.to + 1;
  }
  result.push(...nodes.slice(cursor));

  return withoutBindingMarkers(result, codec);
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

const stripNoteMarkers = (
  document: Document,
  kinds: ReadonlyArray<'endnote' | 'footnote'>
) => {
  if (kinds.length === 0) return;
  for (const note of Array.from(
    document.querySelectorAll(
      kinds
        .flatMap((kind) => [`a[id^="${kind}-ref-"]`, `li[id^="${kind}-"]`])
        .join(', ')
    )
  )) {
    const list = note.localName === 'li' ? note.parentElement : null;

    (note.closest('sup') ?? note).remove();
    if (list && list.children.length === 0) list.remove();
  }
};

const DOCX_STYLE_MAP = [
  'comment-reference => sup',
  "p[style-name='Quote'] => blockquote > p:fresh",
  "r[style-name='HTML Code Keyboard'] => kbd > code",
  "r[style-name='HTML Code'] => code",
  "r[style-name='HTML Keyboard'] => kbd",
  "r[style-name='Plate Look'] =>",
];

const RUN_STYLE_FAMILIES = new Map(
  ['HTML Code', 'HTML Code Keyboard', 'HTML Keyboard', 'Plate Look'].map(
    (name) => [name.toUpperCase(), name]
  )
);

// Mammoth compares style names without case.
const canonicalizeRunStyles = (styles: Document) => {
  let renamed = false;

  for (const style of documentElements(styles)) {
    if (
      style.localName !== 'style' ||
      wordAttribute(style, 'type') !== 'character'
    ) {
      continue;
    }
    const name = Array.from(style.children).find(
      (child) => child.localName === 'name'
    );
    const value = name ? localAttributeNode(name, 'val') : undefined;
    const family = value
      ? RUN_STYLE_FAMILIES.get(value.value.toUpperCase().replace(/ \d+$/u, ''))
      : undefined;

    if (value && family && family !== value.value) {
      value.value = family;
      renamed = true;
    }
  }

  return renamed;
};

const importProjection = async (
  target: DocxImportTarget<Value>,
  arrayBuffer: ArrayBuffer,
  codec: ReturnType<typeof createMarkerCodec>,
  lists: ReadonlyMap<string, DocxListItem>,
  diagnostics: DocxDiagnostic[],
  signal?: AbortSignal
) => {
  throwIfDocxAborted(signal, target.dom.abortError);
  const mammothResult = await target.toHtml(
    { arrayBuffer, buffer: arrayBuffer as never },
    { styleMap: DOCX_STYLE_MAP }
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

  applyListMarkers(mammothDocument.body, codec, lists, target.dom);
  // Mammoth wraps a list that skips a level in an item no paragraph stands
  // behind; the nested items carry their own levels.
  for (const item of lists.size > 0
    ? Array.from(mammothDocument.body.querySelectorAll('li'))
    : []) {
    if (
      !item.hasAttribute('data-list-type') &&
      item.children.length > 0 &&
      Array.from(item.childNodes).every((child) =>
        target.dom.isHtmlElement(child)
          ? ['OL', 'UL'].includes(child.tagName)
          : !child.textContent?.trim()
      )
    ) {
      item.replaceWith(...Array.from(item.childNodes));
    }
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
  const reportedNotes = (['endnote', 'footnote'] as const).filter((kind) =>
    diagnostics.some(
      (diagnostic) =>
        diagnostic.code === 'unsupported-content' && diagnostic.feature === kind
    )
  );

  stripNoteMarkers(mammothDocument, reportedNotes);
  const commentLosses: HtmlMappingLoss[] = [];

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
            materializeEquations(nodes, codec.equation, {
              block: false,
              inline: false,
            })
          )
        );
        commentLosses.push(...losses);
      }
    }
    dl.remove();
  }
  diagnostics.push(
    ...mappingLossDiagnostics(commentLosses, 'word/comments.xml')
  );
  for (const reference of Array.from(
    mammothDocument.querySelectorAll('a[id^="comment-ref-"]')
  )) {
    const parent = reference.closest('sup');

    if (parent) parent.remove();
    else reference.remove();
  }
  const cleanedHtml = cleanWordHtml(
    mammothDocument.body.innerHTML,
    '',
    target.dom.parseHtml
  );
  const element = target.dom.parseHtml(cleanedHtml).body;
  const losses: HtmlMappingLoss[] = [];
  const nodes = target.decodeHtml(element, (loss) => losses.push(loss));

  if (!nodes) throw new Error('DOCX HTML could not be decoded.');
  diagnostics.push(...mappingLossDiagnostics(losses, 'word/document.xml'));

  return {
    bodyById,
    nodes: materializeEquations(nodes, codec.equation, {
      block: target.hasElement('equation'),
      inline: target.hasElement('inlineEquation'),
    }),
  };
};

// Word writes its separator lines, and the continuation notice it leaves empty
// by default, as notes that hold nothing a reader sees.
const NOTE_SEPARATORS = new Set(['continuationSeparator', 'separator']);
const VISIBLE_PARAGRAPH_PROPERTIES = new Set(['numPr', 'pBdr', 'shd']);
const INVISIBLE_PARAGRAPH_MARKERS = new Set([
  'bookmarkEnd',
  'bookmarkStart',
  'proofErr',
]);

const ON_VALUES = new Set(['1', 'on', 'true']);

type ParagraphStyleDrawing = (id: string | undefined) => boolean;

const drawsProperties = (properties: Element | undefined) =>
  Array.from(properties?.children ?? []).some((property) =>
    VISIBLE_PARAGRAPH_PROPERTIES.has(property.localName)
  );

const drawsParagraph = (
  properties: Element | undefined,
  mayDraw: ParagraphStyleDrawing
) => {
  const style = Array.from(properties?.children ?? []).find(
    (property) => property.localName === 'pStyle'
  );

  return (
    mayDraw(style ? (wordAttribute(style, 'val') ?? '') : undefined) ||
    drawsProperties(properties)
  );
};

const paragraphStyleDrawing = (
  source: Document | undefined
): ParagraphStyleDrawing => {
  const styles = new Map<string, Element>();
  let defaultId: string | undefined;

  for (const element of source ? documentElements(source) : []) {
    if (
      element.localName === 'pPr' &&
      element.parentElement?.localName === 'pPrDefault' &&
      drawsProperties(element)
    ) {
      return () => true;
    }
    const id =
      element.localName === 'style' && wordAttribute(element, 'styleId');

    if (!id) continue;
    styles.set(id, element);
    if (
      wordAttribute(element, 'type') === 'paragraph' &&
      ON_VALUES.has(wordAttribute(element, 'default') ?? '')
    ) {
      defaultId = id;
    }
  }
  const drawn = new Map<string, boolean>();
  // A basedOn chain can be as long as the styles part, so it is walked in a
  // loop.
  const mayDraw = (id: string) => {
    const chain = new Set<string>();
    let current: string | undefined = id;
    let draws = false;

    while (current !== undefined && !chain.has(current)) {
      const known = drawn.get(current);

      if (known !== undefined) {
        draws = known;
        break;
      }
      const style = styles.get(current);

      if (!style) {
        draws = true;
        break;
      }
      chain.add(current);
      const children = Array.from(style.children);

      if (
        drawsProperties(children.find((child) => child.localName === 'pPr'))
      ) {
        draws = true;
        break;
      }
      const basedOn = children.find((child) => child.localName === 'basedOn');

      current = basedOn ? (wordAttribute(basedOn, 'val') ?? '') : undefined;
    }
    for (const link of chain) drawn.set(link, draws);

    return draws;
  };

  return (id) =>
    id === undefined
      ? defaultId !== undefined && mayDraw(defaultId)
      : mayDraw(id);
};

const isEmptyRun = (run: Element) =>
  Array.from(run.children).every(
    (child) =>
      child.localName === 'rPr' ||
      (child.localName === 't' && child.textContent === '')
  );

const isEmptyStory = (story: Element, mayDraw: ParagraphStyleDrawing) =>
  Array.from(story.children).every((paragraph) => {
    if (paragraph.localName !== 'p') return false;
    const children = Array.from(paragraph.children);

    return (
      !drawsParagraph(
        children.find((child) => child.localName === 'pPr'),
        mayDraw
      ) &&
      children.every(
        (child) =>
          child.localName === 'pPr' ||
          INVISIBLE_PARAGRAPH_MARKERS.has(child.localName) ||
          (child.localName === 'r' && isEmptyRun(child))
      )
    );
  });

const holdsNotes = (part: Document, mayDraw: ParagraphStyleDrawing) =>
  documentElements(part).some((element) => {
    if (element.localName !== 'footnote' && element.localName !== 'endnote') {
      return false;
    }
    const type = wordAttribute(element, 'type');

    if (type && NOTE_SEPARATORS.has(type)) return false;

    return type !== 'continuationNotice' || !isEmptyStory(element, mayDraw);
  });

const unsupportedPackageDiagnostics = (
  pkg: BoundedDocxPackage,
  dom: DocxDomRealm,
  parts: DocxParts
): readonly DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = pkg.xmlInventory.map(
    ({ action, feature, location, lossy }) => ({
      action,
      code: 'unsupported-content' as const,
      feature,
      impact: lossy ? 'lossy' : 'lossless',
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
  const mayDraw = paragraphStyleDrawing(parts.styles);

  for (const [prefix, feature] of families) {
    const notes = feature === 'footnote' || feature === 'endnote';
    const part = [...pkg.entries.keys()].find((name) => {
      if (!name.startsWith(prefix)) return false;
      if (!pkg.xmlRoots.has(name)) return true;
      const story = parsedPart(dom, pkg.entries, name);

      if (!story) return true;

      return notes
        ? holdsNotes(story, mayDraw)
        : !isEmptyStory(story.documentElement, mayDraw);
    });

    if (!part) continue;
    diagnostics.push({
      action: 'dropped',
      code: 'unsupported-content',
      feature,
      impact: 'lossy',
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
  (diagnostic.code === 'unsupported-content' && diagnostic.impact === 'lossy');

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
  const documentXml = target.dom.decodeUtf8(source);
  const codec = createMarkerCodec(documentXml, target.markerNonce);
  const document = target.dom.parseXml(documentXml, 'word/document.xml');
  const parts: DocxParts = {
    numbering: parsedPart(target.dom, pkg.entries, 'word/numbering.xml'),
    styles: parsedPart(target.dom, pkg.entries, 'word/styles.xml'),
  };
  const diagnostics: DocxDiagnostic[] = [
    ...unsupportedPackageDiagnostics(pkg, target.dom, parts),
  ];
  const rewritten = new Map<string, string>();
  const commentsSource = pkg.entries.get('word/comments.xml');
  const review = instrumentReviewBindings(
    target.dom,
    pkg.entries,
    document,
    codec,
    parts,
    diagnostics
  );

  instrumentWordMath(
    document,
    codec.equation,
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
      codec.equation,
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
  const lists = instrumentNumbering(document, codec, parts);

  instrumentPropertyRevisions(document, codec, diagnostics);
  instrumentContentRevisions(document, codec, diagnostics);
  instrumentComments(document, codec);
  throwIfDocxAborted(signal, target.dom.abortError);
  rewritten.set('word/document.xml', target.dom.serializeXml(document));
  if (parts.styles && canonicalizeRunStyles(parts.styles)) {
    rewritten.set('word/styles.xml', target.dom.serializeXml(parts.styles));
  }
  const normalized = await pkg.toArrayBuffer(rewritten);
  throwIfDocxAborted(signal, target.dom.abortError);
  let projection: Awaited<ReturnType<typeof importProjection>>;

  try {
    projection = await importProjection(
      target,
      normalized,
      codec,
      lists,
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
  let stripped = stripCommentMarkers(
    withoutBindingMarkers(proposedWithMarkers, codec),
    codec
  );
  let proposed: EditorDocumentValue<V>;
  let repairs: readonly DocxSchemaRepairDiagnostic[];

  try {
    ({ document: proposed, repairs } = target.fitReportedDocument({
      children: rootValue(stripped.nodes),
    }));
  } catch {
    return failed(decodeFailure(), diagnostics);
  }
  let resultDocument = proposed;

  if (revisions.length > 0 || review) {
    const reviewedWithMarkers = reviewNodes(projection.nodes, revisions, codec);
    const reviewed = stripCommentMarkers(
      withoutBindingMarkers(reviewedWithMarkers, codec),
      codec
    );

    try {
      const native = target.fitReportedDocument({
        children: rootValue(reviewed.nodes),
      });
      const nativeDocument = target.repairDocument(native.document);

      // A schema without review marks would keep deleted runs as live text.
      if (!target.decidesTo(nativeDocument, proposed)) {
        throw new Error('Tracked revisions do not decide to the document.');
      }
      resultDocument = nativeDocument;
      ({ repairs } = native);
      stripped = reviewed;
      if (
        review &&
        (review.bindings.size > 0 || review.records !== undefined)
      ) {
        const restored = stripCommentMarkers(
          substituteBindings(reviewedWithMarkers, review, codec, diagnostics),
          codec
        );
        const fitted = target.fitReportedDocument({
          children: rootValue(restored.nodes),
          ...(review.records === undefined ? {} : { records: review.records }),
        });

        resultDocument = target.repairDocument(fitted.document);
        ({ repairs } = fitted);
        stripped = restored;
      }
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

  for (const repair of repairs) {
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
