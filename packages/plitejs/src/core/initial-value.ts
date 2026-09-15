import type { Descendant } from '../interfaces/node';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { isOwnedJsonValue } from './clone';
import {
  assertEditorDocumentShape,
  type EditorDocumentShapeIssue,
} from './document-shape';
import {
  getEditorJsonRecordEntries,
  snapshotEditorJsonValue,
} from './value-codec';

export type NormalizedInitialValue = {
  children: Descendant[];
  explicit: boolean;
  meta: Record<string, unknown> | undefined;
  roots: Record<string, Descendant[]>;
};

const rejectInitialDocumentShape = (issue: EditorDocumentShapeIssue): never => {
  switch (issue.kind) {
    case 'document':
    case 'children': {
      throw new Error(
        '[Plite] initialValue is invalid! Expected a list of elements or a document value with children.'
      );
    }
    case 'meta': {
      throw new Error(
        '[Plite] initialValue.meta is invalid! Expected an object.'
      );
    }
    case 'roots': {
      throw new Error(
        '[Plite] initialValue.roots is invalid! Expected an object.'
      );
    }
    case 'primary-root': {
      throw new Error(
        '[Plite] initialValue.roots.main is invalid. Use initialValue.children for the primary document.'
      );
    }
    case 'root': {
      throw new Error(
        `[Plite] initialValue.roots.${issue.root} is invalid! Expected a list of elements.`
      );
    }
  }
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
      roots: Object.freeze({ [MAIN_ROOT_KEY]: children }),
    };
  }

  if (Array.isArray(input)) {
    const children = snapshotEditorJsonValue(
      input,
      '[Plite] initialValue'
    ) as Descendant[];

    return {
      children,
      explicit: true,
      meta: undefined,
      roots: Object.freeze({ [MAIN_ROOT_KEY]: children }),
    };
  }

  const entries = getEditorJsonRecordEntries(input);

  if (!entries) {
    // Preserve shape errors for valid JSON scalars while classifying unsafe
    // containers, accessors, and other noncanonical objects at the JSON boundary.
    snapshotEditorJsonValue(input, '[Plite] initialValue');
    return rejectInitialDocumentShape({ kind: 'document' });
  }
  const value = Object.fromEntries(entries);
  assertEditorDocumentShape(value, rejectInitialDocumentShape);
  const children = snapshotEditorJsonValue(
    value.children,
    '[Plite] initialValue.children'
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
        `[Plite] initialValue.roots.${key}`
      ) as Descendant[],
    ])
  );
  for (const [key, nested] of entries) {
    if (key !== 'children' && key !== 'meta' && key !== 'roots') {
      snapshotEditorJsonValue(nested, `[Plite] initialValue.${key}`);
    }
  }

  return {
    children,
    explicit: true,
    meta,
    roots: Object.freeze({
      [MAIN_ROOT_KEY]: children,
      ...roots,
    }),
  };
};
