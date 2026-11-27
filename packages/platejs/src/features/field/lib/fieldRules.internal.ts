import {
  getActiveEditorTransaction,
  getActiveEditorUpdateId,
  getEditorRuntimeOwner,
  getMutationVersion,
  getSnapshotVersion,
  readShownDocument,
  type RuntimeAnyEditor,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import type {
  FieldCondition,
  FieldConditionTest,
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

const isConditionRecord = (
  value: unknown
): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFieldConditionTest = (value: unknown): value is FieldConditionTest => {
  if (!isConditionRecord(value)) return false;
  if (Object.hasOwn(value, 'all') || Object.hasOwn(value, 'any')) return false;

  const { ref, test, value: compared } = value;

  return (
    typeof ref === 'string' &&
    Object.values(FIELD_TESTS).some((tests) =>
      tests.some((known) => known === test)
    ) &&
    (compared === undefined || isFieldValue(compared))
  );
};

export const isFieldCondition = (value: unknown): value is FieldCondition => {
  if (!isConditionRecord(value)) return false;

  const hasAll = Object.hasOwn(value, 'all');
  const hasAny = Object.hasOwn(value, 'any');

  if (hasAll && hasAny) return false;
  if (hasAll || hasAny) {
    if (Object.hasOwn(value, 'ref')) return false;

    const list = hasAll ? value.all : value.any;

    if (!Array.isArray(list) || list.length < 2) return false;

    for (const entry of list) {
      if (!isFieldConditionTest(entry)) return false;
    }

    return true;
  }

  return isFieldConditionTest(value);
};

export const conditionTests = (
  condition: FieldCondition | undefined
): readonly FieldConditionTest[] => {
  if (!condition) return [];
  if (Object.hasOwn(condition, 'all')) {
    return (condition as Readonly<{ all: readonly FieldConditionTest[] }>).all;
  }
  if (Object.hasOwn(condition, 'any')) {
    return (condition as Readonly<{ any: readonly FieldConditionTest[] }>).any;
  }

  return [condition as FieldConditionTest];
};

const conditionForm = (condition: FieldCondition): 'all' | 'any' | 'one' =>
  Object.hasOwn(condition, 'all')
    ? 'all'
    : Object.hasOwn(condition, 'any')
      ? 'any'
      : 'one';

const conditionValueKey = (value: boolean | number | string | undefined) =>
  value === undefined
    ? null
    : Object.is(value, -0)
      ? '-0'
      : [typeof value, value];

export const conditionTestKey = ({ ref, test, value }: FieldConditionTest) =>
  JSON.stringify([ref, test, conditionValueKey(value)]);

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
  { test, value }: FieldConditionTest,
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
  { test, value }: FieldConditionTest,
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

type ConditionEdge = Readonly<{
  target: FieldElement | undefined;
  test: FieldConditionTest;
}>;

type Chain = Readonly<{
  edges: readonly ConditionEdge[];
  loop: boolean;
}>;

type Verdict =
  | Readonly<{ applies: boolean }>
  | Readonly<{ applies: null; waitsOn: readonly string[] }>;

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
  link: Chain
): FieldProblem[] => {
  const problems: FieldProblem[] =
    unfitSettings(field).length === 0 ? [] : ['invalid-value'];

  for (const { target, test } of link.edges) {
    const problem = conditionProblem(test, target);

    if (problem && !problems.includes(problem)) problems.push(problem);
  }
  if (link.loop) problems.push('condition-loop');

  return problems;
};

type Held = (fieldId: string) => FieldElement | undefined;
type AnswerOf = (field: FieldElement) => FieldValue | undefined;

const judgeTest = (
  test: FieldConditionTest,
  target: FieldElement,
  reached: Verdict,
  settled: boolean,
  answer: FieldValue | undefined
): Verdict => {
  if (reached.applies === null) return reached;
  if (!reached.applies) return verdictOf(holds(test, target, undefined));
  if (fitsField(target, answer)) {
    return verdictOf(holds(test, target, answer));
  }
  if (!settled) return { applies: null, waitsOn: [target.role] };

  return verdictOf(
    holds(test, target, target.kind === 'checkbox' ? false : undefined)
  );
};

const foldEdges = (
  condition: FieldCondition,
  edges: readonly ConditionEdge[],
  verdictOfTarget: (target: FieldElement) => Verdict,
  settled: (role: string) => boolean,
  answerOf: AnswerOf
): Verdict => {
  const form = conditionForm(condition);

  if (form === 'one') {
    const [edge] = edges;

    if (!edge?.target) {
      failInvariant('A field was judged with no condition edge.');
    }

    return judgeTest(
      edge.test,
      edge.target,
      verdictOfTarget(edge.target),
      settled(edge.target.role),
      answerOf(edge.target)
    );
  }

  const stop = form === 'any';
  let waitingRoles: Set<string> | undefined;

  for (const { target, test } of edges) {
    if (!target) {
      failInvariant('A field was judged with no condition edge.');
    }

    const verdict = judgeTest(
      test,
      target,
      verdictOfTarget(target),
      settled(target.role),
      answerOf(target)
    );

    if (verdict.applies === stop) return verdict;
    if (verdict.applies === null) {
      waitingRoles ??= new Set();
      for (const role of verdict.waitsOn) waitingRoles.add(role);
    }
  }

  if (waitingRoles) {
    return { applies: null, waitsOn: [...waitingRoles].sort() };
  }

  return form === 'all' ? APPLIES : SKIPS;
};

export const conditionRefs = (
  condition: FieldCondition | undefined
): readonly string[] => conditionTests(condition).map((entry) => entry.ref);

export const conditionTargets = (
  fieldId: string,
  nodes: readonly FieldElement[],
  held: Held
): string[] => {
  const self = held(fieldId);

  if (!self) return [];

  const canonical = nodes.filter((node) => held(node.fieldId) === node);
  const namers = new Map<string, string[]>();

  for (const node of canonical) {
    for (const ref of conditionRefs(node.condition)) {
      const named = namers.get(ref);

      if (named) named.push(node.fieldId);
      else namers.set(ref, [node.fieldId]);
    }
  }

  const leadsHere = new Set([fieldId]);

  for (const id of leadsHere) {
    for (const namer of namers.get(id) ?? []) leadsHere.add(namer);
  }

  const alreadyNamed = new Set(conditionRefs(self.condition));

  return canonical
    .filter(
      (node) => alreadyNamed.has(node.fieldId) || !leadsHere.has(node.fieldId)
    )
    .map((node) => node.fieldId);
};

export const fieldLinkWork = { judgments: 0, lookups: 0, loopVisits: 0 };

const conditionEdges = (
  condition: FieldCondition | undefined,
  held: Held
): readonly ConditionEdge[] =>
  conditionTests(condition).map((test) => {
    fieldLinkWork.lookups += 1;

    return { target: held(test.ref), test };
  });

export const conditionGraph = (held: Held) => {
  const edgesById = new Map<string, readonly ConditionEdge[]>();
  const loopById = new Map<string, boolean>();
  const loopKnown = (target: FieldElement) => loopById.has(target.fieldId);

  const edges = (field: FieldElement) => {
    const known = edgesById.get(field.fieldId);

    if (known) return known;

    const resolved = conditionEdges(field.condition, held);

    edgesById.set(field.fieldId, resolved);

    return resolved;
  };

  const loop = (start: FieldElement): boolean => {
    const known = loopById.get(start.fieldId);

    if (known !== undefined) return known;
    if (edges(start).every(({ target }) => !target || loopKnown(target))) {
      fieldLinkWork.loopVisits += 1;
      loopById.set(start.fieldId, false);

      return false;
    }

    const orders = new Map<string, { index: number; low: number }>();
    const sccStack: string[] = [];
    const selfLoop = new Set<string>();
    const frames: Array<{
      edges: readonly ConditionEdge[];
      field: FieldElement;
      nextEdge: number;
      order: { index: number; low: number };
    }> = [];

    const visit = (field: FieldElement) => {
      fieldLinkWork.loopVisits += 1;
      const order = { index: orders.size, low: orders.size };

      orders.set(field.fieldId, order);
      sccStack.push(field.fieldId);
      frames.push({ edges: edges(field), field, nextEdge: 0, order });
    };

    visit(start);

    for (let frame = frames.at(-1); frame; frame = frames.at(-1)) {
      const id = frame.field.fieldId;

      if (frame.nextEdge < frame.edges.length) {
        const { target } = frame.edges[frame.nextEdge];

        frame.nextEdge += 1;
        if (!target || loopKnown(target)) continue;
        if (target.fieldId === id) {
          selfLoop.add(id);
          continue;
        }

        const reached = orders.get(target.fieldId);

        if (!reached) visit(target);
        else frame.order.low = Math.min(frame.order.low, reached.index);
        continue;
      }

      frames.pop();

      if (frame.order.low === frame.order.index) {
        const single = sccStack.at(-1) === id;

        for (
          let member = sccStack.pop();
          member !== undefined;
          member = sccStack.pop()
        ) {
          loopById.set(member, single ? selfLoop.has(id) : true);
          if (member === id) break;
        }
      }

      const parent = frames.at(-1);

      if (parent) {
        parent.order.low = Math.min(parent.order.low, frame.order.low);
      }
    }

    return (
      loopById.get(start.fieldId) ??
      failInvariant('A field was read before its link.')
    );
  };

  const reaches = (
    start: FieldElement,
    targetId: string,
    added: ReadonlySet<string>
  ): boolean => {
    fieldLinkWork.loopVisits += 1;

    const seen = new Set<string>();
    const queue: FieldElement[] = [];

    for (const { target, test } of edges(start)) {
      if (!added.has(test.ref)) continue;
      if (test.ref === targetId) return true;
      if (target && !seen.has(target.fieldId)) {
        seen.add(target.fieldId);
        queue.push(target);
      }
    }

    for (const node of queue) {
      fieldLinkWork.loopVisits += 1;

      for (const { target } of edges(node)) {
        if (!target) continue;
        if (target.fieldId === targetId) return true;
        if (!seen.has(target.fieldId)) {
          seen.add(target.fieldId);
          queue.push(target);
        }
      }
    }

    return false;
  };

  return {
    edges,
    link: (field: FieldElement): Chain => ({
      edges: edges(field),
      loop: loop(field),
    }),
    loop,
    reaches,
  };
};

type ConditionGraph = ReturnType<typeof conditionGraph>;

const judgmentsOver = (
  graph: ConditionGraph,
  settled: (role: string) => boolean,
  answerOf: AnswerOf = ({ value }) => value,
  decided = new Map<string, Verdict>()
) => {
  const waiting = new Map<string, Verdict>();
  const read = (id: string) => decided.get(id) ?? waiting.get(id);
  const remember = (id: string, result: Verdict) => {
    (result.applies === null ? waiting : decided).set(id, result);
  };

  return (start: FieldElement): Verdict => {
    const cached = read(start.fieldId);

    if (cached) return cached;

    const frames: Array<{
      edges: readonly ConditionEdge[];
      field: FieldElement;
      nextEdge: number;
    }> = [];
    const push = (field: FieldElement) => {
      const raw = graph.loop(field) ? [] : graph.edges(field);

      if (
        raw.length === 0 ||
        raw.some(
          ({ target, test }) => !target || conditionProblem(test, target)
        )
      ) {
        fieldLinkWork.judgments += 1;
        remember(field.fieldId, APPLIES);

        return;
      }

      frames.push({ edges: raw, field, nextEdge: 0 });
    };

    push(start);

    for (let frame = frames.at(-1); frame; frame = frames.at(-1)) {
      if (frame.nextEdge < frame.edges.length) {
        const { target } = frame.edges[frame.nextEdge];

        frame.nextEdge += 1;
        if (target && !read(target.fieldId)) push(target);
        continue;
      }

      frames.pop();
      const { condition } = frame.field;

      if (!condition) {
        failInvariant('A field was judged with no condition edge.');
      }

      fieldLinkWork.judgments += 1;
      remember(
        frame.field.fieldId,
        foldEdges(
          condition,
          frame.edges,
          (target) =>
            read(target.fieldId) ??
            failInvariant('A field was judged before its condition target.'),
          settled,
          answerOf
        )
      );
    }

    return (
      read(start.fieldId) ??
      failInvariant('A field was read before its judgment.')
    );
  };
};

export const fieldVerdicts = (graph: ConditionGraph) => {
  const decided = new Map<string, Verdict>();

  return (roles: ReadonlySet<string>, answerOf?: AnswerOf) => {
    const copy = new Set(roles);

    return judgmentsOver(graph, (role) => copy.has(role), answerOf, decided);
  };
};

export const fieldLinks = () => {
  let resolve: Held = () => undefined;
  const graph = conditionGraph((id) => resolve(id));
  const byRole = new Map<
    string,
    Readonly<{
      copies: WeakMap<FieldElement, FieldLink>;
      verdict: ReturnType<typeof judgmentsOver>;
    }>
  >();
  const roleOf = (role: string) => {
    let kept = byRole.get(role);

    if (!kept) {
      kept = {
        copies: new WeakMap(),
        verdict: judgmentsOver(graph, (r) => r === role),
      };
      byRole.set(role, kept);
    }

    return kept;
  };
  const withHeld = <T>(held: Held, read: () => T) => {
    const previous = resolve;

    resolve = held;
    try {
      return read();
    } finally {
      resolve = previous;
    }
  };

  return {
    link: (field: FieldElement, held: Held): FieldLink =>
      withHeld(held, () => ({
        ...graph.link(field),
        ...roleOf(field.role).verdict(field),
      })),
    linkCopy: (field: FieldElement, held: Held): FieldLink =>
      withHeld(held, () => {
        const { copies, verdict } = roleOf(field.role);
        const known = copies.get(field);

        if (known) return known;

        const { condition } = field;
        const edges = conditionEdges(condition, held);
        const result =
          !condition ||
          edges.length === 0 ||
          edges.some(
            ({ target, test }) => !target || conditionProblem(test, target)
          )
            ? APPLIES
            : foldEdges(
                condition,
                edges,
                verdict,
                (role) => role === field.role,
                ({ value }) => value
              );

        fieldLinkWork.judgments += 1;

        const link: FieldLink = { ...result, edges, loop: false };

        copies.set(field, link);

        return link;
      }),
  };
};

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
  const shown = readShownDocument(editor);

  if (shown) return linksOf(shown);

  const active = getActiveEditorTransaction(editor);
  const owner = getEditorRuntimeOwner(editor);

  if (active) return linksOf(active, getMutationVersion(owner));
  if (getActiveEditorUpdateId(editor)) return fieldLinks();

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

type NameGroup = Readonly<{ key: string; name: string; role: string }>;

export const nameProblems = (
  field: FieldElement,
  index: NameIndex,
  held: Held
): FieldProblem[] => {
  if (field.name === undefined) return [];

  const members = (role: string, name: string) =>
    (index.byRole.get(role)?.get(name) ?? []).flatMap((id) => held(id) ?? []);
  const sameConditionDeps = (
    left: FieldCondition | undefined,
    right: FieldCondition | undefined
  ): readonly NameGroup[] | null => {
    if (!left || !right) return left === right ? [] : null;
    if (conditionForm(left) !== conditionForm(right)) return null;

    const leftTests = conditionTests(left);
    const rightTests = conditionTests(right);

    if (leftTests.length !== rightTests.length) return null;

    const unmatchedRight = new Map<string, number[]>();

    for (const [at, entry] of rightTests.entries()) {
      const key = conditionTestKey(entry);
      const list = unmatchedRight.get(key);

      if (list) list.push(at);
      else unmatchedRight.set(key, [at]);
    }

    const leftRest: FieldConditionTest[] = [];

    for (const entry of leftTests) {
      const indices = unmatchedRight.get(conditionTestKey(entry));

      if (indices && indices.length > 0) indices.pop();
      else leftRest.push(entry);
    }

    if (leftRest.length === 0) return [];

    const rightRest = [...unmatchedRight.values()]
      .flat()
      .map((at) => rightTests[at]);
    const buckets = new Map<string, number>();
    const deps = new Map<string, NameGroup>();

    for (const entry of leftRest) {
      const target = held(entry.ref);

      if (target?.name === undefined) return null;

      const bucketKey = JSON.stringify([
        entry.test,
        conditionValueKey(entry.value),
        target.role,
        target.name,
      ]);

      buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + 1);

      const groupKey = JSON.stringify([target.role, target.name]);

      deps.set(groupKey, {
        key: groupKey,
        name: target.name,
        role: target.role,
      });
    }

    for (const entry of rightRest) {
      const target = held(entry.ref);

      if (target?.name === undefined) return null;

      const bucketKey = JSON.stringify([
        entry.test,
        conditionValueKey(entry.value),
        target.role,
        target.name,
      ]);
      const count = buckets.get(bucketKey) ?? 0;

      if (count === 0) return null;
      buckets.set(bucketKey, count - 1);
    }

    return [...deps.values()];
  };
  const inspect = (
    role: string,
    name: string
  ): { deps: readonly NameGroup[]; intrinsic: boolean } => {
    const [first, ...rest] = members(role, name);

    if (!first || rest.length === 0) {
      return { deps: [], intrinsic: false };
    }

    const firstOptions = optionValues(first);
    const deps = new Map<string, NameGroup>();

    for (const other of rest) {
      if (first.kind !== other.kind) {
        return { deps: [], intrinsic: true };
      }

      const otherOptions = optionValues(other);

      if (
        firstOptions.size !== otherOptions.size ||
        [...firstOptions].some((value) => !otherOptions.has(value))
      ) {
        return { deps: [], intrinsic: true };
      }

      const needed = sameConditionDeps(first.condition, other.condition);

      if (needed === null) {
        return { deps: [], intrinsic: true };
      }
      for (const dep of needed) deps.set(dep.key, dep);
    }

    return { deps: [...deps.values()], intrinsic: false };
  };
  const conflicts = (startRole: string, startName: string): boolean => {
    const startKey = JSON.stringify([startRole, startName]);
    const knownStart = index.settingConflicts.get(startKey);

    if (knownStart !== undefined) return knownStart;

    const orders = new Map<string, { index: number; low: number }>();
    const sccStack: string[] = [];
    const selfLoop = new Set<string>();
    const frames: Array<{
      conflict: boolean;
      deps: readonly NameGroup[];
      key: string;
      nextDep: number;
      order: { index: number; low: number };
    }> = [];
    const visit = (group: NameGroup) => {
      const { deps, intrinsic } = inspect(group.role, group.name);

      if (intrinsic) {
        index.settingConflicts.set(group.key, true);

        return true;
      }

      const order = { index: orders.size, low: orders.size };

      orders.set(group.key, order);
      sccStack.push(group.key);
      frames.push({
        conflict: false,
        deps,
        key: group.key,
        nextDep: 0,
        order,
      });

      return false;
    };

    if (visit({ key: startKey, name: startName, role: startRole })) return true;

    for (let frame = frames.at(-1); frame; frame = frames.at(-1)) {
      if (frame.nextDep < frame.deps.length) {
        const dep = frame.deps[frame.nextDep];

        frame.nextDep += 1;

        const known = index.settingConflicts.get(dep.key);

        if (known !== undefined) {
          if (known) frame.conflict = true;
          continue;
        }
        if (dep.key === frame.key) {
          selfLoop.add(frame.key);
          continue;
        }

        const reached = orders.get(dep.key);

        if (!reached) {
          if (visit(dep)) frame.conflict = true;
        } else {
          frame.order.low = Math.min(frame.order.low, reached.index);
        }
        continue;
      }

      frames.pop();

      if (frame.order.low === frame.order.index) {
        const single = sccStack.at(-1) === frame.key;
        const sccConflict =
          !single || selfLoop.has(frame.key) || frame.conflict;

        frame.conflict = sccConflict;

        for (
          let member = sccStack.pop();
          member !== undefined;
          member = sccStack.pop()
        ) {
          index.settingConflicts.set(member, sccConflict);
          if (member === frame.key) break;
        }
      }

      const parent = frames.at(-1);

      if (parent) {
        parent.order.low = Math.min(parent.order.low, frame.order.low);
        parent.conflict ||= frame.conflict;
      }
    }

    return (
      index.settingConflicts.get(startKey) ??
      failInvariant('A field name group was read before its check.')
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
