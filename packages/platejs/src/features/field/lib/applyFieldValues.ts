import type { EditorDocumentValue, Path, Value } from '../../../facade';
import type {
  FieldElement,
  FieldProblem,
  FieldSubmission,
} from './BaseFieldPlugin';
import {
  fieldProblems,
  fillsField,
  fitsField,
  isFieldCondition,
  isFieldKind,
  isFieldName,
  isFieldOptions,
  isFieldValue,
  submittedFieldLinks,
} from './fieldRules.internal';

/** Why `applyFieldValues` refused a template or a submission. */
export type FieldRefusal =
  | Readonly<{ code: 'duplicate-role'; role: string }>
  | Readonly<{
      code: 'invalid-template';
      fieldId?: string;
      path: Path;
      problem: FieldProblem | 'answered' | 'duplicate-id' | 'malformed';
      root?: string;
    }>
  | Readonly<{ code: 'invalid-submission'; index: number }>
  | Readonly<{ code: 'invalid-value'; fieldId: string; role: string }>
  | Readonly<{ code: 'missing-required'; fieldId: string; role: string }>
  | Readonly<{ code: 'skipped'; fieldId: string; role: string }>
  | Readonly<{ code: 'unknown-field'; fieldId: string; role: string }>
  | Readonly<{ code: 'unknown-role'; role: string }>
  | Readonly<{
      code: 'waiting';
      fieldId: string;
      role: string;
      waitsOn: string;
    }>
  | Readonly<{ code: 'wrong-role'; fieldId: string; role: string }>;

/**
 * The filled document, or the refusals. `pending` lists each role that has not
 * submitted and holds a required field that applies or waits, and the role
 * whose answer each such waiting field needs next.
 */
export type FieldApplyResult<D extends EditorDocumentValue | Value> =
  | Readonly<{ document: D; ok: true; pending: readonly string[] }>
  | Readonly<{
      ok: false;
      refusals: readonly [FieldRefusal, ...FieldRefusal[]];
    }>;

type Place = Readonly<{
  node: Readonly<Record<string, unknown>>;
  path: Path;
  root?: string;
}>;

const isChildren = (template: EditorDocumentValue | Value): template is Value =>
  Array.isArray(template);

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): boolean =>
  isRecord(value) && typeof value.text === 'string' && !('children' in value);

const placesIn = (
  nodes: readonly unknown[],
  type: string,
  root: string | undefined,
  path: Path = []
): Place[] =>
  nodes.flatMap((node, index) => {
    if (!isRecord(node) || isText(node)) return [];

    const at = [...path, index];

    if (node.type === type) {
      return [{ node, path: at, ...(root === undefined ? {} : { root }) }];
    }

    return Array.isArray(node.children)
      ? placesIn(node.children, type, root, at)
      : [];
  });

const isWellFormed = (
  node: Readonly<Record<string, unknown>>
): node is FieldElement =>
  !('text' in node) &&
  Array.isArray(node.children) &&
  node.children.length === 1 &&
  isText(node.children[0]) &&
  typeof node.fieldId === 'string' &&
  isFieldKind(node.kind) &&
  typeof node.label === 'string' &&
  (node.name === undefined || isFieldName(node.name)) &&
  typeof node.role === 'string' &&
  (node.required === undefined || typeof node.required === 'boolean') &&
  (node.condition === undefined || isFieldCondition(node.condition)) &&
  (node.defaultValue === undefined || isFieldValue(node.defaultValue)) &&
  (node.options === undefined || isFieldOptions(node.options)) &&
  (node.value === undefined || isFieldValue(node.value));

const fillNodes = (
  nodes: readonly unknown[],
  type: string,
  held: ReadonlyMap<string, FieldElement>
): readonly unknown[] => {
  let changed = false;
  const next = nodes.map((node) => {
    const filled = fillNode(node, type, held);

    changed ||= filled !== node;

    return filled;
  });

  return changed ? next : nodes;
};

const fillNode = (
  node: unknown,
  type: string,
  held: ReadonlyMap<string, FieldElement>
): unknown => {
  if (!isRecord(node) || !Array.isArray(node.children)) return node;
  if (node.type === type) {
    const answer =
      typeof node.fieldId === 'string'
        ? held.get(node.fieldId)?.value
        : undefined;

    return answer === undefined ? node : { ...node, value: answer };
  }

  const children = fillNodes(node.children, type, held);

  return children === node.children ? node : { ...node, children };
};

/**
 * Check each role's answers against a frozen template and build the filled
 * document from the answers alone. `type` names the field element's type when
 * the app renamed it with `schema.override`. `submissions` are in the order
 * the roles submitted, and each is checked against the roles before it plus
 * its own answers. A submitted role's checkbox with no answer reads as `false`
 * while it applies.
 *
 * Refuses a template whose fields hold an answer, lack or repeat a `fieldId`,
 * break the schema or have a problem a read reports, a condition loop
 * included. Then refuses, at the first submission that has any: a malformed
 * submission, a role that submitted before or owns no field, an answer for a
 * field that is missing, of another role or does not fit it, a field of the
 * role that waits on another role, a filled answer on a skipped field, and a
 * required field that applies without a filled answer.
 */
export function applyFieldValues<D extends EditorDocumentValue | Value>(
  template: D,
  submissions: readonly FieldSubmission[],
  options?: Readonly<{ type?: string }>
): FieldApplyResult<D extends Value ? Value : EditorDocumentValue> {
  const type = options?.type ?? 'field';
  const document: EditorDocumentValue = isChildren(template)
    ? { children: template }
    : template;
  const roots = Object.entries(document.roots ?? {});
  const places = [
    ...placesIn(document.children, type, undefined),
    ...roots.flatMap(([root, nodes]) => placesIn(nodes, type, root)),
  ];
  const first = new Map<string, Place>();

  for (const place of places) {
    const { fieldId } = place.node;

    if (typeof fieldId === 'string' && !first.has(fieldId)) {
      first.set(fieldId, place);
    }
  }

  const held = new Map<string, FieldElement>();

  for (const [fieldId, { node }] of first) {
    if (isWellFormed(node)) held.set(fieldId, node);
  }

  const lookup = (fieldId: string) => held.get(fieldId);
  const templateLinks = submittedFieldLinks(new Set());
  const [templateRefusal, ...templateRefusals] = places.flatMap(
    (place): FieldRefusal[] => {
      const { node, path, root } = place;
      const invalid = (
        problem: FieldProblem | 'answered' | 'duplicate-id' | 'malformed'
      ): FieldRefusal => ({
        code: 'invalid-template',
        ...(typeof node.fieldId === 'string' ? { fieldId: node.fieldId } : {}),
        path,
        problem,
        ...(root === undefined ? {} : { root }),
      });

      const duplicate =
        typeof node.fieldId === 'string' && first.get(node.fieldId) !== place
          ? [invalid('duplicate-id')]
          : [];

      if (!isWellFormed(node)) return [invalid('malformed'), ...duplicate];

      const answered = node.value === undefined ? [] : [invalid('answered')];

      if (duplicate.length > 0) return [...answered, ...duplicate];

      return [
        ...answered,
        ...fieldProblems(node, templateLinks.link(node, lookup)).map(
          (problem) => invalid(problem)
        ),
      ];
    }
  );

  if (templateRefusal) {
    return { ok: false, refusals: [templateRefusal, ...templateRefusals] };
  }

  const fields = [...held.values()];
  const roles = [...new Set(fields.map(({ role }) => role))];
  const settled = new Set<string>();

  for (const [index, submission] of submissions.entries()) {
    if (
      !isRecord(submission) ||
      typeof submission.role !== 'string' ||
      !isRecord(submission.values)
    ) {
      return { ok: false, refusals: [{ code: 'invalid-submission', index }] };
    }

    const { role, values } = submission;

    if (settled.has(role)) {
      return { ok: false, refusals: [{ code: 'duplicate-role', role }] };
    }
    if (!roles.includes(role)) {
      return { ok: false, refusals: [{ code: 'unknown-role', role }] };
    }

    const refusals: FieldRefusal[] = [];
    const refusedIds = new Set<string>();

    for (const [fieldId, value] of Object.entries(values)) {
      const field = lookup(fieldId);
      const code = !field
        ? 'unknown-field'
        : field.role !== role
          ? 'wrong-role'
          : fitsField(field, value)
            ? undefined
            : 'invalid-value';

      if (code) {
        refusals.push({ code, fieldId, role });
        refusedIds.add(fieldId);
      } else if (field) {
        held.set(fieldId, { ...field, value });
      }
    }

    settled.add(role);

    const links = submittedFieldLinks(settled);

    for (const field of fields) {
      if (field.role !== role) continue;

      const verdict = links.link(field, lookup);
      const { fieldId } = field;

      if (verdict.applies === null) {
        refusals.push({
          code: 'waiting',
          fieldId,
          role,
          waitsOn: verdict.waitsOn,
        });
        continue;
      }
      if (refusedIds.has(fieldId)) continue;

      const filled = fillsField(field, held.get(fieldId)?.value);

      if (!verdict.applies && filled) {
        refusals.push({ code: 'skipped', fieldId, role });
      } else if (verdict.applies && field.required && !filled) {
        refusals.push({ code: 'missing-required', fieldId, role });
      }
    }

    const [refusal, ...rest] = refusals;

    if (refusal) return { ok: false, refusals: [refusal, ...rest] };
  }

  const links = submittedFieldLinks(settled);
  const pending = new Set<string>();

  for (const field of fields) {
    if (settled.has(field.role) || !field.required) continue;

    const verdict = links.link(field, lookup);

    if (verdict.applies === false) continue;

    pending.add(field.role);

    if (verdict.applies === null) pending.add(verdict.waitsOn);
  }

  const children = fillNodes(document.children, type, held) as Value;
  const filled = isChildren(template)
    ? children
    : {
        ...document,
        children,
        ...(document.roots
          ? {
              roots: Object.fromEntries(
                roots.map(([root, nodes]) => [
                  root,
                  fillNodes(nodes, type, held) as Value,
                ])
              ),
            }
          : {}),
      };

  return {
    document: filled as D extends Value ? Value : EditorDocumentValue,
    ok: true,
    pending: roles.filter((role) => pending.has(role)),
  };
}
