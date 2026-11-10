import type { Descendant } from '../interfaces/node';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { freezeOwnedJsonValue, isOwnedJsonValue } from './clone';
import {
  type EditorDocumentShapeIssue,
  readEditorDocument,
} from './document-shape';
import {
  EMPTY_RECORD_STORE,
  type RecordStore,
  recordStoreFromJson,
} from './record-store';
import {
  cloneEditorJsonValue,
  getEditorJsonRecordEntries,
  snapshotEditorJsonValue,
} from './value-codec';

export type NormalizedInitialValue = {
  children: Descendant[];
  explicit: boolean;
  meta: Record<string, unknown> | undefined;
  records: RecordStore;
  roots: Record<string, Descendant[]>;
};

const rejectInitialDocumentShape = (issue: EditorDocumentShapeIssue): never => {
  switch (issue.kind) {
    case 'record':
    case 'children':
    case 'missing': {
      throw new Error(
        'initialValue is invalid! Expected a list of elements or a document value with children.'
      );
    }
    case 'json': {
      throw new Error('initialValue must encode to JSON-compatible data.');
    }
    case 'field': {
      throw new Error(
        `initialValue.${issue.field} is not supported. Store application data in initialValue.meta.`
      );
    }
    case 'meta': {
      throw new Error('initialValue.meta is invalid! Expected an object.');
    }
    case 'records': {
      throw new Error(
        'initialValue.records is invalid! Expected each record set to map record ids to objects.'
      );
    }
    case 'roots': {
      throw new Error('initialValue.roots is invalid! Expected an object.');
    }
    case 'primary-root': {
      throw new Error(
        'initialValue.roots.main is invalid. Use initialValue.children for the primary document.'
      );
    }
    case 'root': {
      throw new Error(
        `initialValue.roots.${issue.root} is invalid! Expected a list of elements.`
      );
    }
  }
};

// A node's key belongs to its object, and an owned value comes in by
// reference, so one node object can stand at two places in it. Each place
// after the first gets a copy of its own.
const copyRepeatedNodes = (
  children: Descendant[],
  named: Record<string, Descendant[]> = {}
) => {
  const placed = new Set<Descendant>();
  const place = (node: Descendant): Descendant => {
    if (placed.has(node)) {
      return snapshotEditorJsonValue(
        cloneEditorJsonValue(node),
        'initialValue'
      );
    }
    placed.add(node);
    if (!('children' in node) || !Array.isArray(node.children)) return node;

    const nodes = placeList(node.children);

    return nodes === node.children
      ? node
      : freezeOwnedJsonValue({ ...node, children: nodes });
  };
  const placeList = (nodes: Descendant[]) => {
    let copied: Descendant[] | undefined;
    let index = 0;

    for (const item of nodes) {
      const node = place(item);

      if (copied) copied.push(node);
      else if (node !== item) copied = [...nodes.slice(0, index), node];
      index += 1;
    }

    return copied ? freezeOwnedJsonValue(copied) : nodes;
  };
  const main = placeList(children);

  return {
    children: main,
    roots: Object.freeze({
      [MAIN_ROOT_KEY]: main,
      ...Object.fromEntries(
        Object.entries(named).map(([key, nodes]) => [key, placeList(nodes)])
      ),
    }),
  };
};

export const normalizeEditorValue = (
  input: unknown
): NormalizedInitialValue => {
  if (input === undefined) {
    const children = Object.freeze([]) as unknown as Descendant[];

    return {
      children,
      explicit: false,
      meta: undefined,
      records: EMPTY_RECORD_STORE,
      roots: Object.freeze({ [MAIN_ROOT_KEY]: children }),
    };
  }

  if (Array.isArray(input)) {
    return {
      ...copyRepeatedNodes(
        snapshotEditorJsonValue(input, 'initialValue') as Descendant[]
      ),
      explicit: true,
      meta: undefined,
      records: EMPTY_RECORD_STORE,
    };
  }

  const value = readEditorDocument(input, rejectInitialDocumentShape);
  const children = snapshotEditorJsonValue(
    value.children,
    'initialValue.children'
  ) as Descendant[];
  const meta =
    value.meta === undefined
      ? undefined
      : (() => {
          const metaEntries = isOwnedJsonValue(value.meta)
            ? Object.entries(value.meta)
            : getEditorJsonRecordEntries(value.meta);

          if (!metaEntries) return rejectInitialDocumentShape({ kind: 'meta' });

          return Object.freeze(Object.fromEntries(metaEntries));
        })();
  const roots = Object.fromEntries(
    Object.entries(value.roots ?? {}).map(([key, root]) => [
      key,
      snapshotEditorJsonValue(
        root,
        `initialValue.roots.${key}`
      ) as Descendant[],
    ])
  );

  return {
    ...copyRepeatedNodes(children, roots),
    explicit: true,
    meta,
    records: recordStoreFromJson(value.records),
  };
};
