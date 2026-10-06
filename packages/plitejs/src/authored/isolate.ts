import type { NativeAuthoredFragment } from '../core/authored-runtime';
import { ChangeDraft } from '../core/change/builder';
import { DocumentChange } from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import { RootChange, type RootChangeJson } from '../core/change/root-change';
import {
  PreparedTokenSlice,
  nodeProps,
  tokenLength,
  type JsonToken,
  type JsonEditorValue,
} from '../core/change/tokens';
import { fillDefaultRootChild } from '../core/editor-commands';
import type { InternalEditorSchemaApi } from '../core/editor-schema';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import type { EditorDocumentValue } from '../interfaces/editor';
import { NodeApi, type Descendant } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import { authoredOriginalLocation } from './counterparts';
import {
  authoredPositionAt,
  authoredPositionSpans,
  replaceAuthoredPositions,
  resolveAuthoredPosition,
  type AuthoredSpan,
} from './positions';
import { readRecord, writeRecord } from './record-tree';
import { createAuthoredContentSlice } from './retained';
import type { AuthoredState } from './state';
import {
  coalesceAuthoredReplacements,
  authoredOperationOrigin,
  authoredRootNodes,
  type AuthoredPositionRoots,
} from './steps';

export const isolateAuthoredInsertion = (input: {
  value: JsonEditorValue;
  accepted: JsonEditorValue;
  acceptedPositions: AuthoredPositionRoots;
  positions: AuthoredPositionRoots;
  change: DocumentChange;
  changeId: string;
  operationId: string;
  state: AuthoredState;
  schema: CompiledEditorSchema | null;
  schemaApi: InternalEditorSchemaApi;
}) => {
  const json = input.change.toJSON();
  const rawRoots = [
    ...(json.primary ? [['main', json.primary] as const] : []),
    ...Object.entries(json.roots ?? {}),
  ];
  const roots = rawRoots.map(
    ([root, sections]) =>
      [root, coalesceAuthoredReplacements(sections)] as const
  );
  const mutations = roots.flatMap(([root, sections]) => {
    let from = 0;
    return sections.flatMap((section, index) => {
      const at = from;
      from += section.length;
      return section.replacement || section.properties
        ? [{ root, sections, section, index, at }]
        : [];
    });
  });
  if (mutations.length !== 1) return null;
  const { root, sections, section, index, at } = mutations[0];
  if (
    !section.replacement?.length ||
    section.replacement.some(
      (token) => token.kind !== 'text' && token.nodeKind !== 'text'
    )
  ) {
    return null;
  }
  const before = readRecord(input.positions, root);
  if (!before) return null;
  const document = DocumentIndex.fromValue(
    authoredRootNodes(input.value, root)
  );
  const contexts = document.openContextAt(at);
  const plainText = section.replacement.every((token) => token.kind === 'text');
  const firstToken = section.replacement[0];
  const lastToken = section.replacement.at(-1);
  if (
    !plainText &&
    (firstToken.kind !== 'close' || lastToken?.kind !== 'open')
  ) {
    return null;
  }
  const content = plainText
    ? section.replacement
    : section.replacement.slice(1, -1);
  if (!content.some((token) => token.kind === 'text' && token.text.length)) {
    return null;
  }

  if (
    section.length &&
    document
      .slice(at, at + section.length)
      .tokens.some((token) => token.kind !== 'text')
  ) {
    return null;
  }
  const first = contexts.findIndex((entry) => {
    if (entry.kind !== 'element') return false;
    const node = document.node(entry.path);
    const type = 'type' in node ? node.type : null;
    if (typeof type !== 'string') return false;
    const span = [
      ...authoredPositionSpans(before.positions, entry.from, entry.from + 1),
    ][0]?.span;
    return (
      span?.birth &&
      ['pending', 'conflicted'].includes(
        readRecord(input.state.changes, span.birth)?.status ?? ''
      )
    );
  });
  if (first === -1) return null;
  const split = contexts.slice(first);
  const { birth } = [
    ...authoredPositionSpans(
      before.positions,
      split[0].from,
      split[0].from + 1
    ),
  ][0].span;
  const gap = authoredPositionAt(before.positions, at);
  const acceptedRoot = readRecord(input.acceptedPositions, root);
  const anchor = gap.right ?? gap.left;
  const location = acceptedRoot
    ? (resolveAuthoredPosition(
        acceptedRoot.positions,
        gap,
        'right',
        'collapse'
      ) ??
      (anchor
        ? (authoredOriginalLocation(input.state, input.acceptedPositions, {
            birth: null,
            placement: null,
            properties: {},
            origin: anchor.origin,
            offset: anchor.offset,
            length: 1,
          })?.offset ?? null)
        : null))
    : null;
  const acceptedDocument = DocumentIndex.fromValue(
    authoredRootNodes(input.accepted, root)
  );
  const acceptedText =
    location === null
      ? null
      : acceptedDocument
          .openContextAt(location)
          .findLast((entry) => entry.kind === 'text');
  const props = acceptedText
    ? nodeProps(acceptedDocument.node(acceptedText.path))
    : {};
  const prefix: JsonToken[] = [...split]
    .reverse()
    .map((entry) => ({ kind: 'close', nodeKind: entry.kind }));
  const suffix: JsonToken[] = split.map((entry) => ({
    kind: 'open' as const,
    nodeKind: entry.kind,
    props: nodeProps(document.node(entry.path)),
  }));
  const parentNode = document.node(split[0].path);
  const inline =
    NodeApi.isElement(parentNode) &&
    typeof parentNode.type === 'string' &&
    input.schema?.elements.byType.get(parentNode.type)?.behavior.inline;
  if (!inline && acceptedText) return null;
  let payload: readonly JsonToken[] = content;
  let conditionalPrefix = prefix.length;
  let conditionalSuffix = suffix.length;
  if (inline && plainText) {
    prefix.push({ kind: 'open', nodeKind: 'text', props });
    suffix.unshift({ kind: 'close', nodeKind: 'text' });
    conditionalPrefix = prefix.length;
    conditionalSuffix = suffix.length;
  } else if (!inline) {
    const textNode = {
      text: content
        .map((token) => (token.kind === 'text' ? token.text : ''))
        .join(''),
    };
    const boundary =
      location === null ? null : acceptedDocument.childBoundaryAt(location);
    if (!boundary) {
      throw new Error(
        'Independent block insertion requires a surviving child boundary'
      );
    }
    let carrier: Descendant | null;
    if (boundary.parentPath.length) {
      const parent = acceptedDocument.node(boundary.parentPath);
      if (!NodeApi.isElement(parent)) {
        throw new Error('Independent text carrier requires a container');
      }
      const wrapping = input.schemaApi.findWrapping(parent, textNode);
      if (!wrapping) throw new Error('No legal independent text carrier');
      carrier = wrapping.reduceRight<Descendant>(
        (child, type) => ({
          ...input.schemaApi.create(type),
          children: [child],
        }),
        textNode
      );
    } else {
      carrier = fillDefaultRootChild(
        input.schemaApi,
        root,
        textNode.text,
        null,
        boundary.index
      );
      if (!carrier) throw new Error('No legal independent root text carrier');
    }
    let carrierDocument = DocumentIndex.fromValue([carrier]);
    if (!plainText) {
      const leaf = [...NodeApi.texts(carrier)][0];
      if (!leaf) throw new Error('Independent carrier requires a text leaf');
      const range = carrierDocument.nodeRange([0, ...leaf[1]]);
      carrierDocument = RootChange.create(carrierDocument, [
        { ...range, insert: PreparedTokenSlice.fromTokens(content) },
      ]).apply(carrierDocument);
    }
    payload = carrierDocument.slice(0).toJSON();
  }
  const replacement = [...prefix, ...payload, ...suffix];
  let offset = 0;
  const inserted: AuthoredSpan[] = replacement.map((token, i) => {
    const length = tokenLength(token);
    const span = {
      birth:
        i < conditionalPrefix ||
        i >= replacement.length - conditionalSuffix ||
        (inline && token.kind !== 'text' && token.nodeKind === 'text')
          ? birth
          : input.changeId,
      origin: authoredOperationOrigin(input.operationId, root),
      offset,
      length,
      placement: null,
      properties: {},
    };
    offset += length;
    return span;
  });
  const changed = sections.map((entry, i) =>
    i === index ? { ...entry, replacement } : entry
  );
  const change = DocumentChange.fromJSON({
    ...json,
    ...(root === 'main'
      ? { primary: changed }
      : { roots: { ...json.roots, [root]: changed } }),
  });
  const draft = new ChangeDraft(input.value).apply(change);
  const after = draft.after as EditorDocumentValue;
  const positions = writeRecord(input.positions, root, {
    ...before,
    positions: replaceAuthoredPositions(
      before.positions,
      at,
      at + section.length,
      inserted
    ),
  });
  return {
    change,
    after,
    positions,
    indexedBefore: draft.indexedBefore,
    indexedAfter: draft.indexedAfter,
  };
};

export const liftAuthoredFragmentInsertion = (input: {
  change: DocumentChange;
  fragment: NativeAuthoredFragment;
  value: JsonEditorValue;
  projected: JsonEditorValue;
}) => {
  const { placement, root } = input.fragment;
  if (placement?.kind !== 'children') return null;
  const json = input.change.toJSON();
  const sections = root === 'main' ? json.primary : json.roots?.[root];
  if (!sections?.some((section) => section.replacement?.length)) return null;
  const insertsContent = (section: RootChangeJson[number]) => {
    const tokens = section.replacement;
    return (
      tokens?.length &&
      !(
        section.length === 0 &&
        tokens.length === 2 &&
        tokens[0].kind === 'close' &&
        tokens[0].nodeKind === 'text' &&
        tokens[1].kind === 'open' &&
        tokens[1].nodeKind === 'text'
      )
    );
  };
  const { after } = new ChangeDraft(input.value).apply(input.change);
  const document = DocumentIndex.fromValue(authoredRootNodes(after, root));
  let offset = 0;
  const carriers = sections.flatMap((section) => {
    if (!section.replacement) {
      offset += section.length;
      return [];
    }
    const length = section.replacement.reduce(
      (total, token) => total + tokenLength(token),
      0
    );
    const start = offset;
    offset += length;
    if (!insertsContent(section)) return [];
    let { content } = createAuthoredContentSlice(document, start, offset);
    for (const _depth of placement.path) {
      if (content.length !== 1 || !NodeApi.isElement(content[0])) {
        throw new Error('Retained insertion has no legal sibling carrier.');
      }
      content = content[0].children;
    }
    return content;
  });
  if (!carriers.length) return null;
  const parent = DocumentIndex.fromValue(
    authoredRootNodes(input.projected, root)
  );
  const at = parent.childPosition(placement.path, placement.index);
  const inserted = DocumentIndex.fromValue(carriers);
  const insertionRoot = RootChange.create(parent, [
    { from: at, insert: inserted.slice(0) },
  ]);
  const createdRoots = new Set(json.createRoots);
  const payloadRoots = Object.fromEntries(
    Object.entries(json.roots ?? {}).filter(([key]) => createdRoots.has(key))
  );
  const insertion = DocumentChange.fromJSON({
    version: 3,
    ...(json.createRoots ? { createRoots: json.createRoots } : {}),
    roots: payloadRoots,
    ...(root === 'main'
      ? { primary: insertionRoot.toJSON() }
      : { roots: { ...payloadRoots, [root]: insertionRoot.toJSON() } }),
  });
  const last = [...NodeApi.texts(getDefined(carriers.at(-1)))].at(-1);
  if (!last) throw new Error('Retained insertion has no editable carrier.');
  const [text, path] = last;
  const point = {
    path: [...placement.path, placement.index + carriers.length - 1, ...path],
    offset: text.text.length,
    ...(root === 'main' ? {} : { root }),
  };
  const { createRoots: _createdRoots, ...removalJson } = json;
  const removeInsertions = (parts: RootChangeJson): RootChangeJson =>
    parts.map((section) =>
      insertsContent(section) ? { ...section, replacement: [] } : section
    );
  return {
    insertion,
    removal: DocumentChange.fromJSON({
      ...removalJson,
      ...(root === 'main' && json.primary
        ? { primary: removeInsertions(json.primary) }
        : {}),
      roots: Object.fromEntries(
        Object.entries(json.roots ?? {})
          .filter(([key]) => !createdRoots.has(key))
          .map(([key, parts]) => [
            key,
            key === root ? removeInsertions(parts) : parts,
          ])
      ),
    }),
    selection: { kind: 'text' as const, anchor: point, focus: point },
  };
};
