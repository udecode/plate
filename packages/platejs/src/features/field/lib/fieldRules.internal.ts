import {
  getActiveEditorUpdateId,
  getEditorRuntimeOwner,
  getSnapshotVersion,
  readShownDocument,
  type RuntimeAnyEditor,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import type {
  FieldCondition,
  FieldElement,
  FieldKind,
  FieldOption,
  FieldProblem,
  FieldSettings,
  FieldTest,
  FieldValue,
} from './BaseFieldPlugin';

export type FieldShape = Pick<
  FieldSettings,
  'defaultValue' | 'kind' | 'options' | 'value'
>;

export const FIELD_KINDS = [
  'checkbox',
  'choice',
  'date',
  'number',
  'signature',
  'text',
] as const;

/**
 * The tests a condition may use on a field of each kind. `insert` and `update`
 * refuse any other test, and a read reports it as `unsupported-test`.
 */
export const FIELD_TESTS: Readonly<Record<FieldKind, readonly FieldTest[]>> = {
  checkbox: ['equals', 'not-equals'],
  choice: ['filled', 'blank', 'equals', 'not-equals'],
  date: ['filled', 'blank', 'equals', 'not-equals', 'above', 'below'],
  number: ['filled', 'blank', 'equals', 'not-equals', 'above', 'below'],
  signature: ['filled', 'blank'],
  text: ['filled', 'blank', 'equals', 'not-equals'],
};

export const isFieldValue = (value: unknown): value is FieldValue =>
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value));

export const isFieldOptions = (
  value: unknown
): value is readonly FieldOption[] =>
  Array.isArray(value) &&
  value.every(
    (option) =>
      typeof option?.label === 'string' && typeof option.value === 'string'
  ) &&
  new Set(value.map((option) => option.value)).size === value.length;

export const isFieldCondition = (value: unknown): value is FieldCondition => {
  if (!value || typeof value !== 'object') return false;

  const { ref, test, value: compared } = value as Record<string, unknown>;

  return (
    typeof ref === 'string' &&
    Object.values(FIELD_TESTS).some((tests) =>
      tests.some((known) => known === test)
    ) &&
    (compared === undefined || isFieldValue(compared))
  );
};

export const isFieldName = (value: unknown): value is string =>
  typeof value === 'string' &&
  value !== '' &&
  value.trim() === value &&
  !/[\p{Cc}\p{Cs}\p{Zl}\p{Zp}]/u.test(value);

export const isFieldKind = (value: unknown): value is FieldKind =>
  FIELD_KINDS.some((kind) => kind === value);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isIsoDate = (value: string) => {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  // A day past its month's end parses to a later date.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

/**
 * Whether a value fits a field's kind: a boolean for a checkbox, one of its
 * options' values for a choice, an ISO date string for a date, a finite number
 * other than -0 for a number, a string with no line break for a text field,
 * and a string for a signature field.
 */
export const fitsField = (
  { kind, options = [] }: FieldShape,
  value: unknown
): value is FieldValue => {
  switch (kind) {
    case 'checkbox': {
      return typeof value === 'boolean';
    }
    case 'choice': {
      return options.some((option) => option.value === value);
    }
    case 'date': {
      return typeof value === 'string' && isIsoDate(value);
    }
    case 'number': {
      return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        !Object.is(value, -0)
      );
    }
    case 'text': {
      return typeof value === 'string' && !/[\n\r]/.test(value);
    }
    default: {
      return typeof value === 'string';
    }
  }
};

export const conditionProblem = (
  { test, value }: FieldCondition,
  named: FieldShape | undefined
): FieldProblem | undefined => {
  if (!named) return 'missing-target';
  if (!FIELD_TESTS[named.kind].includes(test)) return 'unsupported-test';

  const fits =
    test === 'filled' || test === 'blank'
      ? value === undefined
      : fitsField(named, value);

  return fits ? undefined : 'invalid-value';
};

/**
 * Whether a value is a filled answer for a field: a ticked checkbox, or for
 * any other field a value that fits its kind and, for a text or signature
 * field, holds a character that `\s` does not match.
 */
export const fillsField = (field: FieldShape, value: unknown): boolean =>
  field.kind === 'checkbox'
    ? value === true
    : fitsField(field, value) &&
      ((field.kind !== 'text' && field.kind !== 'signature') ||
        /\S/.test(String(value)));

const holds = (
  { test, value }: FieldCondition,
  target: FieldShape,
  answer: FieldValue | undefined
) => {
  const before = (a: unknown, b: unknown) =>
    target.kind === 'number' ? Number(a) < Number(b) : String(a) < String(b);

  switch (test) {
    case 'above':
    case 'below': {
      if (answer === undefined) return false;

      return test === 'above' ? before(value, answer) : before(answer, value);
    }
    case 'blank': {
      return !fillsField(target, answer);
    }
    case 'equals': {
      return answer === value;
    }
    case 'filled': {
      return fillsField(target, answer);
    }
    default: {
      return answer !== value;
    }
  }
};

type Chain = Readonly<{ loop: boolean; target: FieldElement | undefined }>;

type Verdict =
  | Readonly<{ applies: boolean }>
  | Readonly<{ applies: null; waitsOn: string }>;

const APPLIES: Verdict = { applies: true };
const SKIPS: Verdict = { applies: false };
const verdictOf = (applies: boolean) => (applies ? APPLIES : SKIPS);

export type FieldLink = Chain & Verdict;

const SHAPED_SETTINGS = ['defaultValue', 'options', 'value'] as const;

const fitsSetting = (
  field: FieldShape,
  setting: (typeof SHAPED_SETTINGS)[number]
) =>
  field[setting] === undefined ||
  (setting === 'options'
    ? field.kind === 'choice'
    : fitsField(field, field[setting]));

export const unfitSettings = (field: FieldShape) =>
  SHAPED_SETTINGS.filter((setting) => !fitsSetting(field, setting));

export const fieldProblems = (
  field: FieldElement,
  link: FieldLink
): FieldProblem[] => {
  const own: FieldProblem[] =
    unfitSettings(field).length === 0 ? [] : ['invalid-value'];
  const conditioned =
    field.condition && conditionProblem(field.condition, link.target);
  const problems =
    conditioned && !own.includes(conditioned) ? [...own, conditioned] : own;

  return link.loop ? [...problems, 'condition-loop'] : problems;
};

type Held = (fieldId: string) => FieldElement | undefined;

const judge = (
  condition: FieldCondition,
  target: FieldElement,
  reached: Verdict,
  settled: boolean
): Verdict => {
  if (reached.applies === null) return reached;
  if (!reached.applies) return verdictOf(holds(condition, target, undefined));
  if (fitsField(target, target.value)) {
    return verdictOf(holds(condition, target, target.value));
  }
  if (!settled) return { applies: null, waitsOn: target.role };

  return verdictOf(
    holds(condition, target, target.kind === 'checkbox' ? false : undefined)
  );
};

const linksWith = (settles: (role: string, readingRole: string) => boolean) => {
  const chains = new Map<string, Chain>();
  const byReadingRole = new Map<string, Map<string, Verdict>>();
  const chainOf = (field: FieldElement, held: Held): Chain => {
    const path: FieldElement[] = [];
    const places = new Map<string, number>();
    let next: FieldElement | undefined = field;

    while (next && !chains.has(next.fieldId) && !places.has(next.fieldId)) {
      places.set(next.fieldId, path.length);
      path.push(next);
      next = next.condition && held(next.condition.ref);
    }

    const loopStart = next ? places.get(next.fieldId) : undefined;

    for (let index = path.length - 1; index >= 0; index--) {
      chains.set(path[index].fieldId, {
        loop: loopStart !== undefined && index >= loopStart,
        target: path[index + 1] ?? next,
      });
    }

    return (
      chains.get(field.fieldId) ??
      failInvariant('A field was read before its link.')
    );
  };
  const appliesOf = (
    field: FieldElement,
    held: Held,
    readingRole = field.role
  ) => {
    const known = byReadingRole.get(readingRole) ?? new Map<string, Verdict>();

    byReadingRole.set(readingRole, known);

    const waiting: Array<readonly [FieldElement, FieldCondition]> = [];
    let at = field;
    let reached = known.get(at.fieldId);

    while (reached === undefined) {
      const { loop, target } = chainOf(at, held);

      if (
        loop ||
        !at.condition ||
        !target ||
        conditionProblem(at.condition, target)
      ) {
        reached = APPLIES;
        known.set(at.fieldId, reached);
        break;
      }

      waiting.push([at, at.condition]);
      at = target;
      reached = known.get(at.fieldId);
    }

    for (let index = waiting.length - 1; index >= 0; index--) {
      const [next, condition] = waiting[index];

      reached = judge(condition, at, reached, settles(at.role, readingRole));
      known.set(next.fieldId, reached);
      at = next;
    }

    return reached;
  };

  return {
    link: (field: FieldElement, held: Held): FieldLink => ({
      ...chainOf(field, held),
      ...appliesOf(field, held),
    }),
    linkCopy: (field: FieldElement, held: Held): FieldLink => {
      const { condition } = field;
      const target = condition && held(condition.ref);
      const verdict =
        !condition || !target || conditionProblem(condition, target)
          ? APPLIES
          : judge(
              condition,
              target,
              appliesOf(target, held, field.role),
              settles(target.role, field.role)
            );

      return { ...verdict, loop: false, target };
    },
  };
};

export const fieldLinks = () =>
  linksWith((role, readingRole) => role === readingRole);

export const submittedFieldLinks = (roles: ReadonlySet<string>) =>
  linksWith((role) => roles.has(role));

const shared = new WeakMap<
  object,
  Readonly<{ links: ReturnType<typeof fieldLinks>; version?: number }>
>();

const linksOf = (key: object, version?: number) => {
  const kept = shared.get(key);

  if (kept && kept.version === version) return kept.links;

  const links = fieldLinks();

  shared.set(key, { links, version });

  return links;
};

export const sharedFieldLinks = (editor: RuntimeAnyEditor) => {
  if (getActiveEditorUpdateId(editor)) return fieldLinks();

  const shown = readShownDocument(editor);

  if (shown) return linksOf(shown);

  const owner = getEditorRuntimeOwner(editor);

  return linksOf(owner, getSnapshotVersion(owner));
};

export const fieldNameWork = { walks: 0 };

type NameIndex = Readonly<{
  byRole: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>;
  settingConflicts: Map<string, boolean>;
}>;

export const indexFieldNames = (fields: readonly FieldElement[]): NameIndex => {
  fieldNameWork.walks += 1;

  const byRole = new Map<string, Map<string, string[]>>();

  for (const { fieldId, name, role } of fields) {
    if (name === undefined) continue;

    const names = byRole.get(role) ?? new Map<string, string[]>();
    const ids = names.get(name);

    byRole.set(role, names);
    if (ids) ids.push(fieldId);
    else names.set(name, [fieldId]);
  }

  return { byRole, settingConflicts: new Map() };
};

const nameIndexes = new WeakMap<
  object,
  Readonly<{ index: NameIndex; version?: number }>
>();

export const sharedFieldNames = (
  editor: RuntimeAnyEditor,
  fields: () => readonly FieldElement[]
) => {
  const shown = readShownDocument(editor);
  const owner = getEditorRuntimeOwner(editor);
  const key = shown ?? owner;
  const version = shown ? undefined : getSnapshotVersion(owner);
  const kept = nameIndexes.get(key);

  if (kept && kept.version === version) return kept.index;

  const index = indexFieldNames(fields());

  nameIndexes.set(key, { index, version });

  return index;
};

export const holdsFieldNames = (editor: RuntimeAnyEditor) => {
  const owner = getEditorRuntimeOwner(editor);

  return nameIndexes.get(owner)?.version === getSnapshotVersion(owner);
};

export const carryFieldNames = (
  editor: RuntimeAnyEditor,
  from: number,
  to: number
) => {
  const owner = getEditorRuntimeOwner(editor);
  const kept = nameIndexes.get(owner);

  if (kept?.version === from) {
    nameIndexes.set(owner, { index: kept.index, version: to });
  }
};

export const dropFieldNames = (editor: RuntimeAnyEditor, from: number) => {
  const owner = getEditorRuntimeOwner(editor);

  if (nameIndexes.get(owner)?.version === from) nameIndexes.delete(owner);
};

const optionValues = ({ options = [] }: FieldElement) =>
  new Set(options.map((option) => option.value));

export const nameProblems = (
  field: FieldElement,
  index: NameIndex,
  held: Held
): FieldProblem[] => {
  if (field.name === undefined) return [];

  const members = (role: string, name: string) =>
    (index.byRole.get(role)?.get(name) ?? []).flatMap((id) => held(id) ?? []);
  const onConditionPath = new Set<string>();
  const conflicts = (role: string, name: string): boolean => {
    const key = JSON.stringify([role, name]);
    const known = index.settingConflicts.get(key);

    if (known !== undefined) return known;
    if (onConditionPath.has(key)) return true;

    onConditionPath.add(key);

    const [first, ...rest] = members(role, name);
    const conflict = rest.some((other) => !sameQuestion(first, other));

    onConditionPath.delete(key);
    index.settingConflicts.set(key, conflict);

    return conflict;
  };
  const sameCondition = (
    left: FieldCondition | undefined,
    right: FieldCondition | undefined
  ) => {
    if (!left || !right) return left === right;
    if (left.test !== right.test || !Object.is(left.value, right.value)) {
      return false;
    }
    if (left.ref === right.ref) return true;

    const [a, b] = [held(left.ref), held(right.ref)];

    return (
      a?.name !== undefined &&
      a.name === b?.name &&
      a.role === b.role &&
      !conflicts(a.role, a.name)
    );
  };
  const sameQuestion = (left: FieldElement, right: FieldElement) => {
    const [a, b] = [optionValues(left), optionValues(right)];

    return (
      left.kind === right.kind &&
      a.size === b.size &&
      [...a].every((value) => b.has(value)) &&
      sameCondition(left.condition, right.condition)
    );
  };
  const own = members(field.role, field.name);
  const problems: FieldProblem[] = [];

  if (conflicts(field.role, field.name)) problems.push('name-conflict');
  if (own.some(({ value }) => !Object.is(value, own[0].value))) {
    problems.push('answer-conflict');
  }

  return problems;
};
