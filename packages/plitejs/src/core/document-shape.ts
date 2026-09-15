export type EditorDocumentShapeIssue =
  | Readonly<{ kind: 'children' | 'document' | 'meta' | 'roots' }>
  | Readonly<{ kind: 'primary-root' }>
  | Readonly<{ kind: 'root'; root: string }>;

export type EditorDocumentShape = Readonly<{
  children: readonly unknown[];
  meta?: Readonly<Record<string, unknown>>;
  roots?: Readonly<Record<string, readonly unknown[]>>;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const getEditorDocumentShapeIssueMessage = (
  issue: EditorDocumentShapeIssue
): string => {
  switch (issue.kind) {
    case 'document':
    case 'children': {
      return 'Editor document value must be an object with a children array.';
    }
    case 'meta': {
      return 'Editor document metadata must be an object.';
    }
    case 'roots': {
      return 'Editor document roots must be an object.';
    }
    case 'primary-root': {
      return 'Editor document roots cannot redefine the primary root; use children.';
    }
    case 'root': {
      return `Editor document root "${issue.root}" must be an array.`;
    }
  }

  throw new Error('Unknown editor document shape issue.');
};

/** Validate document containers after strict JSON validation or snapshotting. */
export function assertEditorDocumentShape(
  input: unknown,
  reject: (issue: EditorDocumentShapeIssue) => never
): asserts input is EditorDocumentShape {
  if (!isRecord(input)) reject({ kind: 'document' });
  if (!Object.hasOwn(input, 'children') || !Array.isArray(input.children)) {
    reject({ kind: 'children' });
  }
  if (input.meta !== undefined && !isRecord(input.meta)) {
    reject({ kind: 'meta' });
  }
  if (input.roots === undefined) return;
  if (!isRecord(input.roots)) reject({ kind: 'roots' });
  if (Object.hasOwn(input.roots, 'main')) reject({ kind: 'primary-root' });

  for (const [root, children] of Object.entries(input.roots)) {
    if (!Array.isArray(children)) reject({ kind: 'root', root });
  }
}
