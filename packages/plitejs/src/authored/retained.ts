import { DocumentChange } from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import type { RootChangeJson } from '../core/change/root-change';
import {
  jsonEqual,
  PreparedTokenSlice,
  type JsonEditorValue,
  type JsonRecord,
  type JsonToken,
} from '../core/change/tokens';
import {
  ContentSlice,
  createContentSliceFromFragment,
} from '../core/content-slice';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import { snapshotEditorJsonValue } from '../core/value-codec';
import { ElementApi, type Descendant } from '../interfaces';
import type { ContentSlice as ContentSliceValue } from '../interfaces/editor';
import type { AuthoredRangeProjection } from './anchors';
import {
  authoredPositionSpans,
  createAuthoredPositions,
  replaceAuthoredPositions,
  type AuthoredPositions,
  type AuthoredSpan,
} from './positions';
import { decodeAuthoredSpan } from './positions-codec';
import { readRecord } from './record-tree';
import type { AuthoredTarget } from './steps';

/** Original deletion atoms stay protected; edits may remove their own amendments. */
export const protectAuthoredRetainedContent = (
  change: DocumentChange,
  projection: AuthoredRangeProjection,
  changeId: string
) => {
  const json = change.toJSON();
  let changed = false;
  const filter = (root: string, sections: RootChangeJson): RootChangeJson => {
    const positions = readRecord(projection.positions, root)?.positions;
    if (!positions) return sections;
    const joined: Array<RootChangeJson[number]> = [];
    for (const section of sections) {
      const previous = joined.at(-1);
      if (previous?.replacement && section.replacement) {
        joined[joined.length - 1] = {
          length: previous.length + section.length,
          replacement: [...previous.replacement, ...section.replacement],
        };
      } else joined.push(section);
    }
    let offset = 0;
    return joined.flatMap((section) => {
      const start = offset;
      offset += section.length;
      if (!section.replacement || !section.length) return [section];
      const spans = [...authoredPositionSpans(positions, start, offset)];
      if (!spans.some(({ span }) => span.birth !== changeId)) return [section];
      changed = true;
      return [
        ...(section.replacement.length
          ? [{ length: 0, replacement: section.replacement }]
          : []),
        ...spans.map(({ from, to, span }) => ({
          length: Math.min(offset, to) - Math.max(start, from),
          ...(span.birth === changeId ? { replacement: [] } : {}),
        })),
      ];
    });
  };
  const primary = json.primary && filter('main', json.primary);
  const roots =
    json.roots &&
    Object.fromEntries(
      Object.entries(json.roots).map(([root, sections]) => [
        root,
        filter(root, sections),
      ])
    );
  return changed
    ? DocumentChange.fromJSON({
        ...json,
        ...(primary ? { primary } : {}),
        ...(roots ? { roots } : {}),
      })
    : change;
};

export type AuthoredRetainedContent =
  | Readonly<{
      from: number;
      kind: 'delete' | 'move';
      positions: AuthoredPositions;
      slice: ContentSliceValue;
      to: number;
    }>
  | Readonly<{
      kind: 'properties';
      nodeKind: 'element' | 'text';
      properties: Readonly<JsonRecord>;
      spans: readonly AuthoredSpan[] | null;
    }>;

export type AuthoredRetainedData =
  | Readonly<{
      from: number;
      kind: 'delete' | 'move';
      slice: ContentSliceValue;
      spans: readonly AuthoredSpan[];
      to: number;
    }>
  | Extract<AuthoredRetainedContent, { kind: 'properties' }>;

const RETAINED_CONTENT = new WeakMap<object, AuthoredRetainedContent>();
type RetainedSourceRoots =
  | ContentSliceValue['roots']
  | JsonEditorValue['roots'];

const authoredContentSliceContext = (
  document: DocumentIndex,
  from: number,
  to: number
) => ({
  end: document
    .openContextAt(to)
    .filter((entry) => entry.from < to && to < entry.to),
  start: document
    .openContextAt(from)
    .filter((entry) => entry.from < from && from < entry.to),
});

const authoredContentSlice = (
  document: DocumentIndex,
  from: number,
  to: number,
  context: ReturnType<typeof authoredContentSliceContext>,
  roots?: RetainedSourceRoots
) => {
  const prefix: JsonToken[] = context.start.map((entry) => {
    const {
      children: _children,
      text: _text,
      ...props
    } = document.node(entry.path);
    return { kind: 'open', nodeKind: entry.kind, props };
  });
  const suffix: JsonToken[] = [...context.end].reverse().map((entry) => ({
    kind: 'close',
    nodeKind: entry.kind,
  }));
  const content = DocumentIndex.fromTokens(
    PreparedTokenSlice.concat([
      PreparedTokenSlice.fromTokens(prefix),
      document.slice(from, to),
      PreparedTokenSlice.fromTokens(suffix),
    ])
  ).value;

  return createContentSliceFromFragment(
    content as unknown as readonly Descendant[],
    context.start.filter((entry) => entry.kind === 'element').length,
    context.end.filter((entry) => entry.kind === 'element').length,
    roots as ContentSliceValue['roots']
  );
};

export const createAuthoredContentSlice = (
  document: DocumentIndex,
  from: number,
  to: number
) => {
  const context = authoredContentSliceContext(document, from, to);
  return authoredContentSlice(document, from, to, context);
};

export const createAuthoredRetainedSlice = (
  document: DocumentIndex,
  from: number,
  to: number,
  positions: AuthoredPositions,
  roots?: RetainedSourceRoots
) => {
  const context = authoredContentSliceContext(document, from, to);
  const { end, start } = context;
  const intervals = [
    ...start.map((entry) => ({ from: entry.from, to: entry.from + 1 })),
    { from, to },
    ...[...end].reverse().map((entry) => ({
      from: entry.to - 1,
      to: entry.to,
    })),
  ];
  const spans = intervals.flatMap(({ from: rangeStart, to: rangeEnd }) =>
    [...authoredPositionSpans(positions, rangeStart, rangeEnd)].map(
      (entry) => ({
        ...entry.span,
        offset: entry.span.offset + Math.max(rangeStart - entry.from, 0),
        length: Math.min(rangeEnd, entry.to) - Math.max(rangeStart, entry.from),
      })
    )
  );
  return Object.freeze({
    from: start.length,
    positions: replaceAuthoredPositions(
      createAuthoredPositions(0, ''),
      0,
      0,
      spans
    ),
    slice: authoredContentSlice(document, from, to, context, roots),
    to: start.length + to - from,
  });
};

const selectRetainedRoots = (
  content: readonly Descendant[],
  available: RetainedSourceRoots | undefined,
  schema: CompiledEditorSchema | null | undefined
): ContentSliceValue['roots'] | undefined => {
  if (!schema) return undefined;

  const availableRoots = available as ContentSliceValue['roots'] | undefined;
  const selected: Record<string, readonly Descendant[]> = {};
  const visited = new Set<string>();
  const collect = (children: readonly Descendant[]) => {
    for (const node of children) {
      if (!ElementApi.isElement(node)) continue;

      const type = typeof node.type === 'string' ? node.type : undefined;
      const slots = type
        ? schema.elements.byType.get(type)?.contentRoots
        : undefined;
      const { childRoots } = node as { childRoots?: unknown };

      if (slots && typeof childRoots === 'object' && childRoots !== null) {
        for (const slot of slots.keys()) {
          const root = (childRoots as Readonly<Record<string, unknown>>)[slot];

          if (
            typeof root !== 'string' ||
            root.length === 0 ||
            root === 'main' ||
            visited.has(root)
          ) {
            continue;
          }
          const rootContent = availableRoots?.[root];

          if (!rootContent) {
            throw new Error(`Missing retained source root "${root}".`);
          }
          visited.add(root);
          selected[root] = rootContent;
          collect(rootContent);
        }
      }

      collect(node.children);
    }
  };

  collect(content);

  return Object.keys(selected).length > 0 ? Object.freeze(selected) : undefined;
};

export const captureAuthoredRetainedContent = (
  document: DocumentIndex,
  from: number,
  to: number,
  kind: AuthoredRetainedContent['kind'],
  positions: AuthoredPositions,
  roots?: RetainedSourceRoots,
  schema?: CompiledEditorSchema | null
): AuthoredRetainedData | null => {
  if (from === to) return null;
  if (kind === 'properties') {
    const entry = document.nodeStartingAt(from);
    if (!entry) throw new Error('Missing authored property target.');
    const {
      children: _children,
      text: _text,
      ...properties
    } = document.node(entry.path);
    return snapshotEditorJsonValue(
      {
        kind,
        nodeKind: entry.kind,
        properties,
        spans:
          entry.kind === 'text'
            ? [
                ...authoredPositionSpans(
                  positions,
                  entry.from + 1,
                  entry.to - 1
                ),
              ].map((part) => ({
                ...part.span,
                offset:
                  part.span.offset + Math.max(entry.from + 1 - part.from, 0),
                length:
                  Math.min(entry.to - 1, part.to) -
                  Math.max(entry.from + 1, part.from),
              }))
            : null,
      },
      'Authored retained properties'
    );
  }
  const bare = createAuthoredRetainedSlice(document, from, to, positions);
  const retained = Object.freeze({
    ...bare,
    kind,
    slice: createContentSliceFromFragment(
      bare.slice.content,
      bare.slice.openStart,
      bare.slice.openEnd,
      selectRetainedRoots(bare.slice.content, roots, schema)
    ),
  });
  const data = snapshotEditorJsonValue(
    {
      from: retained.from,
      kind,
      slice: retained.slice,
      spans: [...authoredPositionSpans(retained.positions)].map(
        (entry) => entry.span
      ),
      to: retained.to,
    },
    'Authored retained content'
  );
  RETAINED_CONTENT.set(data, retained);
  return data;
};

export const readAuthoredRetainedContent = (
  target: AuthoredTarget
): AuthoredRetainedContent | null => {
  const data = target.retained;
  if (!data || data.kind === 'properties') return data;
  const previous = RETAINED_CONTENT.get(data);
  if (previous) return previous;
  const { spans, ...content } = data;
  const retained = Object.freeze({
    ...content,
    positions: replaceAuthoredPositions(
      createAuthoredPositions(0, ''),
      0,
      0,
      spans
    ),
  });
  RETAINED_CONTENT.set(data, retained);
  return retained;
};

export const readAuthoredTextBoundary = (
  target: AuthoredTarget,
  section: RootChangeJson[number]
) => {
  const replacement = section.replacement ?? [];
  const inserting = section.length === 0 && replacement.length >= 2;
  const deleting =
    section.length >= 2 &&
    replacement.length === 0 &&
    target.retained &&
    target.retained.kind !== 'properties';
  if (!inserting && !deleting) return null;
  const tokens = inserting
    ? replacement
    : target.retained && target.retained.kind !== 'properties'
      ? DocumentIndex.fromValue(target.retained.slice.content)
          .slice(target.retained.from, target.retained.to)
          .toJSON()
      : [];
  const first = tokens[0];
  const last = tokens.at(-1);
  let opening = false;
  if (
    tokens.length < 2 ||
    !first ||
    first.kind !== 'close' ||
    first.nodeKind !== 'text' ||
    !last ||
    last.kind !== 'open' ||
    last.nodeKind !== 'text' ||
    tokens.slice(1, -1).some((token) => {
      if (token.kind !== 'close' && token.kind !== 'open') return true;
      if (token.nodeKind !== 'element') return true;
      if (token.kind === 'open') {
        opening = true;

        return false;
      }

      return token.kind !== 'close' || opening;
    })
  ) {
    return null;
  }
  const position = inserting ? target.from.right : target.to.right;
  return position
    ? { position, spans: inserting ? target.inserted : target.removed }
    : null;
};

export const decodeAuthoredRetainedData = (
  input: unknown
): AuthoredRetainedData | null => {
  const value = snapshotEditorJsonValue(input, 'Authored retained content');
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid authored retained content.');
  }
  const data = value as Record<string, unknown>;
  const keys =
    data.kind === 'properties'
      ? ['kind', 'nodeKind', 'properties', 'spans']
      : ['from', 'kind', 'slice', 'spans', 'to'];
  if (
    Object.keys(data).length !== keys.length ||
    Object.keys(data).some((key) => !keys.includes(key))
  ) {
    throw new Error('Invalid authored retained fields.');
  }
  if (data.kind === 'properties') {
    if (
      (data.nodeKind !== 'element' && data.nodeKind !== 'text') ||
      !data.properties ||
      typeof data.properties !== 'object' ||
      Array.isArray(data.properties) ||
      Object.hasOwn(data.properties, 'children') ||
      Object.hasOwn(data.properties, 'text') ||
      (data.nodeKind === 'text'
        ? !Array.isArray(data.spans)
        : data.spans !== null)
    ) {
      throw new Error('Invalid authored retained properties.');
    }
    return snapshotEditorJsonValue(
      {
        kind: 'properties',
        nodeKind: data.nodeKind,
        properties: data.properties as JsonRecord,
        spans: Array.isArray(data.spans)
          ? data.spans.map(decodeAuthoredSpan)
          : null,
      },
      'Authored retained properties'
    );
  }
  if (
    (data.kind !== 'delete' && data.kind !== 'move') ||
    !Array.isArray(data.spans) ||
    typeof data.from !== 'number' ||
    !Number.isSafeInteger(data.from) ||
    data.from < 0 ||
    typeof data.to !== 'number' ||
    !Number.isSafeInteger(data.to) ||
    data.to <= data.from
  ) {
    throw new Error('Invalid authored retained slice.');
  }
  const slice = ContentSlice.fromJSON(data.slice);
  const spans = data.spans.map(decodeAuthoredSpan);
  const positions = replaceAuthoredPositions(
    createAuthoredPositions(0, ''),
    0,
    0,
    spans
  );
  const document = DocumentIndex.fromValue(slice.content);
  if (
    document.length !== (positions.root?.length ?? 0) ||
    data.to > document.length
  ) {
    throw new Error('Authored retained positions do not match their content.');
  }
  const retained = createAuthoredRetainedSlice(
    document,
    data.from,
    data.to,
    positions,
    slice.roots
  );
  if (
    retained.from !== data.from ||
    retained.to !== data.to ||
    !jsonEqual(retained.slice, slice)
  ) {
    throw new Error('Invalid authored retained open context.');
  }
  const decoded = snapshotEditorJsonValue(
    {
      kind: data.kind,
      from: data.from,
      to: data.to,
      slice,
      spans,
    } satisfies AuthoredRetainedData,
    'Authored retained content'
  );
  RETAINED_CONTENT.set(
    decoded,
    Object.freeze({ ...retained, kind: data.kind })
  );
  return decoded;
};
