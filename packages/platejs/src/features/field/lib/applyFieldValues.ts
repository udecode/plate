import type { EditorDocumentValue, Path, Value } from '../../../facade';
import type {
  FieldElement,
  FieldKind,
  FieldProblem,
  FieldSubmission,
  FieldValue,
} from './BaseFieldPlugin';
import {
  fieldProblems,
  fillsField,
  fitsField,
  indexFieldNames,
  isFieldCondition,
  isFieldKind,
  isFieldName,
  isFieldOptions,
  isFieldValue,
  nameProblems,
  submittedFieldLinks,
} from './fieldRules.internal';

/**
 * Why `applyFieldValues` or `startFieldValues` refused a template, a
 * submission or a start. A refusal that names a field also carries that
 * field's `name` when it has one.
 */
export type FieldRefusal =
  /**
   * The fields of one role and name hold different answers once the role's
   * submission applies, or a start gives one name two different values.
   * `fieldIds` lists every field of the name, in document order.
   */
  | Readonly<{
      code: 'answer-conflict';
      fieldIds: readonly string[];
      name: string;
      role: string;
    }>
  | Readonly<{ code: 'duplicate-role'; role: string }>
  | Readonly<{
      code: 'invalid-template';
      fieldId?: string;
      name?: string;
      path: Path;
      problem: FieldProblem | 'answered' | 'duplicate-id' | 'malformed';
      root?: string;
    }>
  | Readonly<{ code: 'invalid-submission'; index: number }>
  | Readonly<{
      code: 'invalid-value';
      fieldId: string;
      name?: string;
      role: string;
    }>
  | Readonly<{
      code: 'missing-required';
      fieldId: string;
      name?: string;
      role: string;
    }>
  | Readonly<{ code: 'skipped'; fieldId: string; name?: string; role: string }>
  | Readonly<{ code: 'unknown-field'; fieldId: string; role: string }>
  | Readonly<{ code: 'unknown-role'; role: string }>
  | Readonly<{
      code: 'waiting';
      fieldId: string;
      name?: string;
      role: string;
      waitsOn: string;
    }>
  | Readonly<{
      code: 'wrong-role';
      fieldId: string;
      name?: string;
      role: string;
    }>;

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

/**
 * One named question's answer as `readFieldAnswers` reads it from a saved
 * document. Check `'problem' in answer` first, then narrow on `kind` to read
 * `value`. A name whose fields agree on no answer, or on a stored value that
 * does not fit its kind, omits `value`.
 */
export type FieldAnswer =
  | Readonly<{ kind: 'checkbox'; value?: boolean }>
  | Readonly<{
      kind: 'choice' | 'date' | 'signature' | 'text';
      value?: string;
    }>
  | Readonly<{ kind: 'number'; value?: number }>
  | Readonly<{ kind: FieldKind; problem: 'answer-conflict' }>
  | Readonly<{ problem: 'name-conflict' }>;

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

const nameOf = ({ name }: Readonly<{ name?: unknown }>) =>
  isFieldName(name) ? { name } : {};

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

const readDocumentFields = (
  input: EditorDocumentValue | Value,
  type: string
) => {
  const document: EditorDocumentValue = isChildren(input)
    ? { children: input }
    : input;
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

  return { document, first, held, places, roots };
};

const answerOf = (field: FieldElement): FieldAnswer => {
  const { kind, value } = field;
  const valid = fitsField(field, value);

  switch (kind) {
    case 'checkbox': {
      return valid && typeof value === 'boolean' ? { kind, value } : { kind };
    }
    case 'number': {
      return valid && typeof value === 'number' ? { kind, value } : { kind };
    }
    default: {
      return valid && typeof value === 'string' ? { kind, value } : { kind };
    }
  }
};

const refused = (refusals: readonly [FieldRefusal, ...FieldRefusal[]]) => ({
  ok: false as const,
  refusals,
});

const checkSubmissionHeader = (
  submission: unknown,
  index: number,
  roles: readonly string[],
  settled: ReadonlySet<string>
):
  | Readonly<{
      ok: true;
      role: string;
      values: Readonly<Record<string, unknown>>;
    }>
  | Readonly<{ ok: false; refusal: FieldRefusal }> => {
  if (
    !isRecord(submission) ||
    typeof submission.role !== 'string' ||
    !isRecord(submission.values)
  ) {
    return { ok: false, refusal: { code: 'invalid-submission', index } };
  }

  const { role, values } = submission;

  if (settled.has(role)) {
    return { ok: false, refusal: { code: 'duplicate-role', role } };
  }
  if (!roles.includes(role)) {
    return { ok: false, refusal: { code: 'unknown-role', role } };
  }

  return { ok: true, role, values };
};

const checkSubmissionValues = (
  role: string,
  values: Readonly<Record<string, unknown>>,
  lookup: (fieldId: string) => FieldElement | undefined
) => {
  const accepted = new Map<string, FieldElement>();
  const refusals: FieldRefusal[] = [];
  const refusedIds = new Set<string>();

  for (const [fieldId, value] of Object.entries(values)) {
    const field = lookup(fieldId);

    if (!field) {
      refusals.push({ code: 'unknown-field', fieldId, role });
      continue;
    }
    if (field.role !== role) {
      refusals.push({ code: 'wrong-role', fieldId, ...nameOf(field), role });
      refusedIds.add(fieldId);
    } else if (fitsField(field, value)) {
      accepted.set(fieldId, { ...field, value });
    } else {
      refusals.push({
        code: 'invalid-value',
        fieldId,
        ...nameOf(field),
        role,
      });
      refusedIds.add(fieldId);
    }
  }

  return { accepted, refusals, refusedIds };
};

const replaySubmissions = (
  template: EditorDocumentValue | Value,
  submissions: readonly FieldSubmission[],
  type: string
) => {
  const { document, first, held, places, roots } = readDocumentFields(
    template,
    type
  );

  const lookup = (fieldId: string) => held.get(fieldId);
  const fields = [...held.values()];
  const names = indexFieldNames(fields);
  const templateLinks = submittedFieldLinks(new Set());
  const [templateRefusal, ...templateRefusals] = places.flatMap(
    (place): FieldRefusal[] => {
      const { node, path, root } = place;
      const invalid = (
        problem: FieldProblem | 'answered' | 'duplicate-id' | 'malformed'
      ): FieldRefusal => ({
        code: 'invalid-template',
        ...(typeof node.fieldId === 'string' ? { fieldId: node.fieldId } : {}),
        ...nameOf(node),
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
        ...nameProblems(node, names, lookup)
          .filter((problem) => problem === 'name-conflict')
          .map((problem) => invalid(problem)),
      ];
    }
  );

  if (templateRefusal) return refused([templateRefusal, ...templateRefusals]);

  const roles = [...new Set(fields.map(({ role }) => role))];
  const settled = new Set<string>();

  for (const [index, submission] of submissions.entries()) {
    const header = checkSubmissionHeader(submission, index, roles, settled);

    if (!header.ok) return refused([header.refusal]);

    const { role, values } = header;
    const { accepted, refusals, refusedIds } = checkSubmissionValues(
      role,
      values,
      lookup
    );

    for (const [fieldId, answered] of accepted) {
      held.set(fieldId, answered);
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
          ...nameOf(field),
          role,
          waitsOn: verdict.waitsOn,
        });
        refusedIds.add(fieldId);
        continue;
      }
      if (refusedIds.has(fieldId)) continue;

      const filled = fillsField(field, held.get(fieldId)?.value);

      if (!verdict.applies && filled) {
        refusals.push({ code: 'skipped', fieldId, ...nameOf(field), role });
        refusedIds.add(fieldId);
      } else if (verdict.applies && field.required && !filled) {
        refusals.push({
          code: 'missing-required',
          fieldId,
          ...nameOf(field),
          role,
        });
      }
    }

    for (const [name, fieldIds] of names.byRole.get(role) ?? []) {
      const member = held.get(fieldIds[0]);

      if (
        member &&
        !fieldIds.some((fieldId) => refusedIds.has(fieldId)) &&
        nameProblems(member, names, lookup).includes('answer-conflict')
      ) {
        refusals.push({ code: 'answer-conflict', fieldIds, name, role });
      }
    }

    const [refusal, ...rest] = refusals;

    if (refusal) return refused([refusal, ...rest]);
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

  return {
    document,
    fields,
    held,
    names,
    ok: true as const,
    pending: roles.filter((role) => pending.has(role)),
    roles,
    roots,
    settled,
    type,
  };
};

const buildFilledDocument = <D extends EditorDocumentValue | Value>(
  template: D,
  document: EditorDocumentValue,
  roots: ReadonlyArray<readonly [string, Value]>,
  type: string,
  held: ReadonlyMap<string, FieldElement>
) => {
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

  return filled as D extends Value ? Value : EditorDocumentValue;
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
 * break the schema or have a problem a read reports, a condition loop and a
 * name conflict between fields of one role and name included. Then refuses, at
 * the first submission that has any: a malformed submission, a role that
 * submitted before or owns no field, an answer for a field that is missing, of
 * another role or does not fit it, a field of the role that waits on another
 * role, a filled answer on a skipped field, a required field that applies
 * without a filled answer, and a name of the role whose fields hold different
 * answers.
 */
export function applyFieldValues<D extends EditorDocumentValue | Value>(
  template: D,
  submissions: readonly FieldSubmission[],
  options?: Readonly<{ type?: string }>
): FieldApplyResult<D extends Value ? Value : EditorDocumentValue> {
  const replayed = replaySubmissions(
    template,
    submissions,
    options?.type ?? 'field'
  );

  if (!replayed.ok) return replayed;

  return {
    document: buildFilledDocument(
      template,
      replayed.document,
      replayed.roots,
      replayed.type,
      replayed.held
    ),
    ok: true,
    pending: replayed.pending,
  };
}

/**
 * Check `submissions` against a frozen template as `applyFieldValues` does,
 * then fill each field of `start.role` that applies with the value `start`
 * gives it, mirrored to every other field of that role and name. Conditions
 * read the submitted answers and `start`'s values as if `start.role` had
 * submitted. A value on a field that skips or waits on another role is dropped
 * without a refusal, and a field `start` gives no value gets none, even with a
 * `defaultValue`. `pending` comes from `submissions` alone, so `start` never
 * takes its role off it. `type` names the field element's type when the app
 * renamed it with `schema.override`.
 *
 * Refuses first what `applyFieldValues` refuses. Then refuses `start` alone
 * when it is malformed, with `index` equal to `submissions.length`, or when its
 * role already submitted or owns no field. Otherwise refuses together each
 * entry for a missing field, another role's field or a value that does not fit
 * it, and each name of `start.role` that `start` gives two different values.
 */
export function startFieldValues<D extends EditorDocumentValue | Value>(
  template: D,
  submissions: readonly FieldSubmission[],
  start: FieldSubmission,
  options?: Readonly<{ type?: string }>
): FieldApplyResult<D extends Value ? Value : EditorDocumentValue> {
  const replayed = replaySubmissions(
    template,
    submissions,
    options?.type ?? 'field'
  );

  if (!replayed.ok) return replayed;

  const {
    document,
    fields,
    held,
    names,
    pending,
    roles,
    roots,
    settled,
    type,
  } = replayed;
  const header = checkSubmissionHeader(
    start,
    submissions.length,
    roles,
    settled
  );

  if (!header.ok) return { ok: false, refusals: [header.refusal] };

  const { role, values } = header;
  const lookup = (fieldId: string) => held.get(fieldId);
  const { accepted, refusals, refusedIds } = checkSubmissionValues(
    role,
    values,
    lookup
  );
  const mirrored = new Map<string, FieldElement>(accepted);

  for (const [name, fieldIds] of names.byRole.get(role) ?? []) {
    if (fieldIds.some((fieldId) => refusedIds.has(fieldId))) continue;

    const given = fieldIds.flatMap((fieldId) => accepted.get(fieldId) ?? []);

    if (given.length === 0) continue;

    const [{ value }] = given;

    if (given.some((other) => !Object.is(other.value, value))) {
      refusals.push({ code: 'answer-conflict', fieldIds, name, role });
      continue;
    }

    for (const fieldId of fieldIds) {
      const member = held.get(fieldId);

      if (member) mirrored.set(fieldId, { ...member, value });
    }
  }

  const [refusal, ...rest] = refusals;

  if (refusal) return { ok: false, refusals: [refusal, ...rest] };

  const stagedLookup = (fieldId: string) =>
    mirrored.get(fieldId) ?? held.get(fieldId);
  const startLinks = submittedFieldLinks(new Set([...settled, role]));

  for (const field of fields) {
    if (field.role !== role) continue;

    const started = mirrored.get(field.fieldId);

    if (started && startLinks.link(started, stagedLookup).applies === true) {
      held.set(field.fieldId, started);
    }
  }

  return {
    document: buildFilledDocument(template, document, roots, type, held),
    ok: true,
    pending,
  };
}

/**
 * Map a record of answers keyed by field `name` into one role's
 * `FieldSubmission`, keyed by `fieldId`. Each field of `role` whose `name` is
 * an own key of `values` receives that key's value, except `null` and
 * `undefined`, which leave the field out. Other keys are ignored. Malformed
 * nodes are skipped, and a duplicated `fieldId` maps from its first holder.
 * `type` names the field element's type when the app renamed it with
 * `schema.override`.
 */
export function fieldSubmission(
  template: EditorDocumentValue | Value,
  role: string,
  values: Readonly<Record<string, FieldValue | null | undefined>>,
  options?: Readonly<{ type?: string }>
): FieldSubmission {
  const { held } = readDocumentFields(template, options?.type ?? 'field');
  const mapped: Record<string, FieldValue> = Object.create(null);

  for (const field of held.values()) {
    if (
      field.role !== role ||
      field.name === undefined ||
      !Object.hasOwn(values, field.name)
    ) {
      continue;
    }

    const value = values[field.name];

    if (value !== null && value !== undefined) {
      mapped[field.fieldId] = value;
    }
  }

  return { role, values: mapped };
}

/**
 * Read each role's named field answers from a saved document, grouped by role
 * and field `name` in records with no prototype. A name whose fields' settings
 * differ reads as `{ problem: 'name-conflict' }`, and otherwise one whose
 * stored values differ reads as `{ kind, problem: 'answer-conflict' }`. Fields
 * that agree read as `{ kind, value }` when the value fits `kind`, and as
 * `{ kind }` when they hold no value or an unfit one. Unnamed fields and
 * malformed nodes are skipped, and a duplicated `fieldId` reads from its first
 * holder. `type` names the field element's type when the app renamed it with
 * `schema.override`.
 */
export function readFieldAnswers(
  document: EditorDocumentValue | Value,
  options?: Readonly<{ type?: string }>
): Readonly<Record<string, Readonly<Record<string, FieldAnswer>>>> {
  const { held } = readDocumentFields(document, options?.type ?? 'field');
  const lookup = (fieldId: string) => held.get(fieldId);
  const names = indexFieldNames([...held.values()]);
  const byRole: Record<string, Record<string, FieldAnswer>> = Object.create(
    null
  );

  for (const [role, roleNames] of names.byRole) {
    const answers: Record<string, FieldAnswer> = Object.create(null);

    for (const [name, fieldIds] of roleNames) {
      const member = held.get(fieldIds[0]);

      if (!member) continue;

      const problems = nameProblems(member, names, lookup);

      if (problems.includes('name-conflict')) {
        answers[name] = { problem: 'name-conflict' };
      } else if (problems.includes('answer-conflict')) {
        answers[name] = { kind: member.kind, problem: 'answer-conflict' };
      } else {
        answers[name] = answerOf(member);
      }
    }

    byRole[role] = answers;
  }

  return byRole;
}
