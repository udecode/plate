'use client';

import { cn } from 'cn';
import { CheckIcon, PlusIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { EditorSchemaValidationError } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import {
  FIELD_TESTS,
  fitsField,
  type FieldCondition,
  type FieldConditionTest,
  type FieldKind,
  type FieldOption,
  type FieldPatch,
  type FieldProblem,
  type FieldSettings,
  type FieldTest,
  type FieldValue,
} from 'platejs/field';
import { FieldPlugin, useFieldRead } from 'platejs/field/react';
import { BaseLockPlugin } from 'platejs/lock';
import {
  type EditorElementProps,
  EditorElement,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useModelEditor,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverTrigger,
} from '@/registry/components/editor/floating-popover';
import { inlineSuggestionVariants } from '@/registry/lib/inline-suggestion';

// Dimmed text on a suggestion's tint falls below 4.5:1, so it stays opaque there.
const CHIP_NOTE =
  'text-xs opacity-70 [[data-editor-authored-change]>*>&]:opacity-100';

const KINDS: Record<FieldKind, string> = {
  checkbox: 'Checkbox',
  choice: 'Choice',
  date: 'Date',
  multiple: 'Multiple choice',
  number: 'Number',
  signature: 'Signature',
  text: 'Text',
};
const TEST_LABELS: Record<FieldTest, string> = {
  above: 'is above',
  below: 'is below',
  blank: 'is blank',
  equals: 'is',
  filled: 'is filled',
  includes: 'includes',
  'not-equals': 'is not',
  'not-includes': 'does not include',
};
const PROBLEMS: Record<FieldProblem, string> = {
  'answer-conflict': 'The fields of its name hold different answers.',
  'condition-loop': 'Its condition leads back to this field.',
  'invalid-value': 'A setting or value does not fit this field.',
  'missing-target': 'The field its condition names is gone.',
  'name-conflict':
    'The fields of its name differ in kind, options, counts or condition.',
  'unsupported-test': 'Its condition does not fit the field it names.',
};
const RULE_PROBLEMS: Record<
  'invalid-value' | 'missing-target' | 'unsupported-test',
  string
> = {
  'invalid-value': 'This value does not fit the field it names.',
  'missing-target': 'The field this rule names is gone.',
  'unsupported-test': 'This test does not fit the field it names.',
};

const isKind = (value: string): value is FieldKind =>
  Object.hasOwn(KINDS, value);
const isTest = (value: string): value is FieldTest =>
  Object.hasOwn(TEST_LABELS, value);
const needsValue = (test: FieldTest) => test !== 'filled' && test !== 'blank';
type ScalarFieldValue = boolean | number | string;

const firstValue = ({
  kind,
  options,
}: FieldSettings): ScalarFieldValue | undefined =>
  ({
    checkbox: true,
    choice: options?.[0]?.value,
    date: new Date().toISOString().slice(0, 10),
    multiple: options?.[0]?.value,
    number: 0,
    signature: undefined,
    text: '',
  })[kind];
const fillableTests = (target: FieldSettings) =>
  FIELD_TESTS[target.kind].filter(
    (test) => !needsValue(test) || firstValue(target) !== undefined
  );
const fitsRuleValue = (
  target: FieldSettings,
  test: FieldTest,
  value: ScalarFieldValue | undefined
) =>
  test === 'includes' || test === 'not-includes'
    ? typeof value === 'string' &&
      (target.options ?? []).some((option) => option.value === value)
    : fitsField(target, value);

const isConditionList = (
  condition: FieldCondition
): condition is
  | Readonly<{ all: readonly FieldConditionTest[] }>
  | Readonly<{ any: readonly FieldConditionTest[] }> =>
  Object.hasOwn(condition, 'all') || Object.hasOwn(condition, 'any');

const conditionOn = (
  ref: string,
  target: FieldSettings,
  test = fillableTests(target)[0],
  value?: ScalarFieldValue
): FieldConditionTest => ({
  ref,
  test,
  ...(needsValue(test) ? { value: value ?? firstValue(target) } : {}),
});

const keepExtra = (
  kept: FieldConditionTest | undefined,
  next: FieldConditionTest
): FieldConditionTest => {
  if (!kept) return next;

  return {
    ...Object.fromEntries(
      Object.entries(kept).filter(
        ([key]) => key !== 'ref' && key !== 'test' && key !== 'value'
      )
    ),
    ...next,
  };
};

type FieldNode = EditorElementProps<typeof FieldPlugin>['element'];

const openSettingsGuards = new WeakMap<
  ReturnType<typeof useEditor>,
  { close: () => boolean; fieldId: string }
>();

export const closeFieldSettings = (editor: ReturnType<typeof useEditor>) =>
  openSettingsGuards.get(editor)?.close() ?? true;

const optionLabel = (option: FieldOption, index: number) =>
  option.label.trim().length > 0 ? option.label : `Option ${index + 1}`;

const labelForOption = (
  options: readonly FieldOption[] | undefined,
  entry: unknown
) => {
  if (!options) return undefined;

  const index = options.findIndex((option) => option.value === entry);

  return index === -1 ? undefined : optionLabel(options[index], index);
};

// A stored selection can be a new array, and the field plugin counts two
// selections of the same options in any order as one answer.
const sameFieldValue = (left?: FieldValue, right?: FieldValue) => {
  if (!Array.isArray(left) || !Array.isArray(right)) {
    return Object.is(left, right);
  }
  if (left.length !== right.length) return false;

  const counts = new Map<string, number>();

  for (const entry of left) {
    counts.set(entry, (counts.get(entry) ?? 0) + 1);
  }
  for (const entry of right) {
    const count = counts.get(entry);

    if (!count) return false;
    if (count === 1) counts.delete(entry);
    else counts.set(entry, count - 1);
  }

  return counts.size === 0;
};

const countHint = ({ max, min, required }: FieldNode) => {
  const least = min ?? (required ? 1 : undefined);

  if (least === undefined) {
    return max === undefined ? undefined : `Pick up to ${max}`;
  }
  if (max !== undefined && least > max) return undefined;

  const range =
    max === undefined
      ? `at least ${least}`
      : least === max
        ? `exactly ${max}`
        : `${least} to ${max}`;

  return required ? `Pick ${range}` : `Leave blank, or pick ${range}`;
};

const saveAnswer = (
  editor: ReturnType<typeof useEditor>,
  fieldId: string,
  value?: FieldValue
) =>
  editor.update((tx) => {
    tx.plugin(FieldPlugin).update(fieldId, { value });

    return true;
  }) === true &&
  sameFieldValue(
    editor.plugin(FieldPlugin).read.field(fieldId)?.node.value,
    value
  );

const useWaitsForReview = (element: FieldNode, watches: boolean) => {
  const editor = useEditor();
  const subscribe = React.useCallback(
    (wake: () => void) => (watches ? editor.subscribeCommit(wake) : () => {}),
    [editor, watches]
  );
  const waits = () =>
    watches &&
    editor
      .plugin(AuthoredPlugin)
      .read.reviewOf(element)
      .marks.some((mark) => mark.kind === 'format' && mark.key === 'value');

  return React.useSyncExternalStore(subscribe, waits, waits);
};

export function FieldElement(props: EditorElementProps<typeof FieldPlugin>) {
  const { element } = props;
  const editor = useEditor();
  const modelEditor = useModelEditor();
  const readOnly = useEditorReadOnly();
  const fillRole = usePluginStore(FieldPlugin, 'fillRole') ?? null;
  const field = useFieldRead(element.fieldId);
  const problems = field?.problems ?? [];
  const skipped = field?.applies === false;
  const warning = problems.map((problem) => PROBLEMS[problem]).join(' ');
  const filling = fillRole !== null;
  const ownField = element.role === fillRole;
  const locked = useEditorSelector(
    (current) => {
      const lock = current.plugin(BaseLockPlugin);
      const key = current.key(element);

      return Boolean(lock.installed && key && lock.read.isLocked(key));
    },
    { dependsOn: ['properties', 'structure'] }
  );
  const waitsForReview = useWaitsForReview(
    element,
    (ownField || (!filling && locked)) &&
      editor.plugin(AuthoredPlugin).installed
  );
  const fills =
    (ownField || (!filling && locked)) && !readOnly && !waitsForReview;
  const toggles = fills && element.kind === 'checkbox';
  const ticked = element.value === true;
  const [refusedToggle, setRefusedToggle] = React.useState<{
    role: string | null;
    stored?: FieldValue;
  } | null>(null);

  if (
    refusedToggle &&
    (refusedToggle.role !== fillRole ||
      !sameFieldValue(refusedToggle.stored, element.value))
  ) {
    setRefusedToggle(null);
  }

  const answer = Array.isArray(element.value)
    ? element.value
        .map((entry) => labelForOption(element.options, entry) ?? entry)
        .join(', ')
    : String(
        labelForOption(element.options, element.value) ?? element.value ?? ''
      );
  const beforeClose = React.useRef<() => 'refused' | 'written'>(null);
  let form: React.ReactNode = null;

  if (!filling && !locked && !readOnly) {
    form = <FieldSettingsForm beforeClose={beforeClose} element={element} />;
  }
  if (fills && !toggles) {
    form = <FieldAnswerForm element={element} />;
  }

  const openAtPointerDownRef = React.useRef(false);
  const suppressCloseFocusRef = React.useRef(false);
  const [openAs, setOpenAs] = React.useState<{ role: string | null } | null>(
    null
  );
  const open = form !== null && openAs?.role === fillRole;

  if (openAs && !open) setOpenAs(null);

  React.useEffect(() => {
    if (!open || filling || locked || readOnly) return undefined;

    const guard = {
      close: () => {
        if (beforeClose.current?.() === 'refused') return false;

        suppressCloseFocusRef.current = true;
        setOpenAs(null);

        return true;
      },
      fieldId: element.fieldId,
    };

    openSettingsGuards.set(modelEditor, guard);

    return () => {
      if (openSettingsGuards.get(modelEditor) === guard) {
        openSettingsGuards.delete(modelEditor);
      }
    };
  }, [element.fieldId, filling, locked, modelEditor, open, readOnly]);

  const chip = {
    className: cn(
      'inline-flex w-fit items-baseline gap-1 rounded-sm bg-muted px-1 text-muted-foreground',
      (form || toggles) && 'cursor-pointer',
      skipped && 'opacity-50 [[data-editor-authored-change]>&]:opacity-100',
      inlineSuggestionVariants({ on: 'parent' })
    ),
    contentEditable: false,
    draggable: !filling && !locked,
    onClick: (event: React.MouseEvent) => {
      if (toggles) {
        setRefusedToggle(
          saveAnswer(editor, element.fieldId, !ticked)
            ? null
            : { role: fillRole, stored: element.value }
        );

        return;
      }

      const beganOpen =
        event.detail === 0 ? open : openAtPointerDownRef.current;

      if (!form || beganOpen) return;

      if (!filling && !readOnly) {
        const active = openSettingsGuards.get(modelEditor);

        if (active && active.fieldId !== element.fieldId && !active.close()) {
          event.preventDefault();

          return;
        }
      }

      event.preventDefault();
      setOpenAs({ role: fillRole });
    },
    onPointerDown: () => {
      openAtPointerDownRef.current = open;
    },
  };
  const showAnswer = filling || locked;
  const chipContent = (
    <>
      {showAnswer && element.kind === 'checkbox' && (
        <span
          aria-label={ticked ? 'Ticked' : 'Not ticked'}
          className="flex size-3 items-center justify-center self-center rounded-[3px] border border-current"
          role="img"
        >
          {ticked && <CheckIcon className="size-2.5" />}
        </span>
      )}
      {showAnswer && element.kind !== 'checkbox'
        ? answer || element.label
        : element.label}
      {element.required && (
        <span className="text-destructive [[data-editor-authored-change]>*>&]:text-current">
          *
        </span>
      )}
      <span className={CHIP_NOTE}>{element.role}</span>
      {skipped && <span className={CHIP_NOTE}>skipped</span>}
      {waitsForReview && <span className={CHIP_NOTE}>waits for review</span>}
      {warning && (
        <span
          aria-label={warning}
          className="self-center text-destructive"
          data-slot="field-warning"
          role="img"
          title={warning}
        >
          <TriangleAlertIcon className="size-3" />
        </span>
      )}
    </>
  );

  return (
    <EditorElement
      {...props}
      className="inline-block"
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
    >
      {form ? (
        <FloatingPopover
          open={open}
          onBeforeClose={() => beforeClose.current?.() !== 'refused'}
          onOpenChange={(nextOpen) => {
            setOpenAs(nextOpen ? { role: fillRole } : null);
          }}
        >
          <FloatingPopoverTrigger>
            <button {...chip} type="button">
              {chipContent}
            </button>
          </FloatingPopoverTrigger>
          <FloatingPopoverContent
            className={cn(
              'max-h-[min(80vh,var(--floating-popover-available-height,80vh))] max-w-[calc(100vw-2rem)] overflow-y-auto',
              filling || locked ? 'w-64' : 'w-[26rem]'
            )}
            onFinalFocus={(event) => {
              if (!suppressCloseFocusRef.current) return;

              suppressCloseFocusRef.current = false;
              event.preventDefault();
            }}
          >
            {form}
          </FloatingPopoverContent>
        </FloatingPopover>
      ) : (
        <button {...chip} type="button">
          {chipContent}
        </button>
      )}
      {(ownField || (!filling && locked)) && element.kind === 'checkbox' && (
        <span className="text-xs text-muted-foreground" role="status">
          {refusedToggle && ' Not saved.'}
        </span>
      )}
      {props.children}
    </EditorElement>
  );
}

function FieldAnswerForm({ element }: { element: FieldNode }) {
  const editor = useEditor();
  const { fieldId, kind, label, max, options = [], value } = element;
  const [refusal, setRefusal] = React.useState<{
    stored?: FieldValue;
  } | null>(null);

  if (refusal && !sameFieldValue(refusal.stored, value)) setRefusal(null);

  const setValue = (next?: FieldValue) =>
    setRefusal(saveAnswer(editor, fieldId, next) ? null : { stored: value });
  const selected = Array.isArray(value) ? value : [];
  const selectedSet = new Set(selected);
  const checkedCount = options.filter((entry) =>
    selectedSet.has(entry.value)
  ).length;
  const hint = countHint(element);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          'flex gap-2',
          kind === 'multiple' ? 'items-start' : 'items-center'
        )}
      >
        {kind === 'multiple' ? (
          <div
            aria-describedby={hint ? `${fieldId}-count` : undefined}
            aria-label={label}
            className="flex flex-1 flex-col gap-2"
            role="group"
          >
            {hint && (
              <p
                id={`${fieldId}-count`}
                className="text-xs text-muted-foreground"
              >
                {hint}
              </p>
            )}
            {options.map((option, index) => {
              const checked = selectedSet.has(option.value);

              return (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${fieldId}-pick-${index}`}
                    checked={checked}
                    disabled={
                      !checked && max !== undefined && checkedCount >= max
                    }
                    onCheckedChange={(next) => {
                      const picked = options
                        .filter((entry) =>
                          entry === option
                            ? next === true
                            : selectedSet.has(entry.value)
                        )
                        .map((entry) => entry.value);

                      setValue(picked.length > 0 ? picked : undefined);
                    }}
                  />
                  <Label htmlFor={`${fieldId}-pick-${index}`}>
                    {optionLabel(option, index)}
                  </Label>
                </div>
              );
            })}
          </div>
        ) : (
          <FieldValueInput
            kind={kind}
            label={label}
            options={options}
            value={typeof value === 'object' ? undefined : value}
            onChange={setValue}
          />
        )}
        <Button size="sm" variant="ghost" onClick={() => setValue()}>
          Clear
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" role="status">
        {refusal && 'Not saved.'}
      </p>
    </div>
  );
}

function FieldSettingsForm({
  beforeClose,
  element,
}: {
  beforeClose: React.Ref<() => 'refused' | 'written'>;
  element: FieldNode;
}) {
  const editor = useEditor();
  const { condition, fieldId, kind, options = [] } = element;
  const writeName = React.useRef<() => 'refused' | 'written'>(null);
  const writeCounts =
    React.useRef<(focusOnRefusal: boolean) => 'refused' | 'written'>(null);

  React.useImperativeHandle(beforeClose, () => () => {
    const nameResult = writeName.current?.() ?? 'written';
    const countsResult =
      kind === 'multiple'
        ? (writeCounts.current?.(nameResult !== 'refused') ?? 'written')
        : 'written';

    return nameResult === 'refused' || countsResult === 'refused'
      ? 'refused'
      : 'written';
  });

  const update = (patch: FieldPatch) =>
    editor.update((tx) => tx.plugin(FieldPlugin).update(fieldId, patch));
  const { fields, targetIds } = useEditorSelector(
    (innerEditor) => {
      const { read } = innerEditor.plugin(FieldPlugin);

      return {
        fields: read.fields(),
        targetIds: read.conditionTargets(fieldId),
      };
    },
    { dependsOn: ['properties', 'structure'] }
  );
  const byId = new Map<string, (typeof fields)[number]>();

  for (const entry of fields) {
    if (!byId.has(entry.fieldId)) byId.set(entry.fieldId, entry);
  }

  const choices = targetIds.flatMap((id) => byId.get(id) ?? []);
  const targets = fields.filter((entry) => entry.fieldId !== fieldId);
  const rules = condition
    ? isConditionList(condition)
      ? Object.hasOwn(condition, 'all')
        ? (condition as Readonly<{ all: readonly FieldConditionTest[] }>).all
        : (condition as Readonly<{ any: readonly FieldConditionTest[] }>).any
      : [condition]
    : [];
  const listed = rules.length > 1;
  const match = condition && Object.hasOwn(condition, 'any') ? 'any' : 'all';
  const writeRules = (next: readonly FieldConditionTest[], form = match) => {
    const rest =
      condition && isConditionList(condition)
        ? Object.fromEntries(
            Object.entries(condition).filter(
              ([key]) => key !== 'all' && key !== 'any'
            )
          )
        : {};

    update({
      condition:
        next.length > 1
          ? form === 'all'
            ? { ...rest, all: next }
            : { ...rest, any: next }
          : next[0],
    });
  };
  const addable = choices.filter((entry) => entry.fieldId !== fieldId);
  const unusedTarget = addable.find(
    (entry) => !rules.some((rule) => rule.ref === entry.fieldId)
  );
  const nextAddedRule = (): FieldConditionTest | undefined => {
    if (unusedTarget) {
      return conditionOn(unusedTarget.fieldId, unusedTarget.node);
    }

    const copied = rules.find(
      (rule) => rule.ref !== fieldId && byId.has(rule.ref)
    );

    if (copied) return copied;
    if (addable[0]) return conditionOn(addable[0].fieldId, addable[0].node);

    return undefined;
  };
  const canAddRule = addable.length > 0;
  const rows: ReadonlyArray<FieldConditionTest | undefined> =
    rules.length > 0 ? rules : [undefined];
  const targetSelect = (index: number, rule?: FieldConditionTest) => (
    <NativeSelect
      {...(listed
        ? { 'aria-label': `Rule ${index + 1} field` }
        : { id: `${fieldId}-condition` })}
      size="sm"
      value={rule ? `#${rule.ref}` : ''}
      onChange={(event) => {
        const entry = choices.find(
          (choice) => `#${choice.fieldId}` === event.target.value
        );
        const next = entry && conditionOn(entry.fieldId, entry.node);

        if (!listed) {
          update({ condition: next ? keepExtra(rule, next) : undefined });
        } else if (next) {
          writeRules(
            rules.map((kept, at) =>
              at === index ? keepExtra(kept, next) : kept
            )
          );
        }
      }}
    >
      {!listed && <NativeSelectOption value="">Always</NativeSelectOption>}
      {rule && !byId.has(rule.ref) && (
        <NativeSelectOption value={`#${rule.ref}`}>
          Missing field
        </NativeSelectOption>
      )}
      {choices.map((entry) => {
        const named =
          entry.node.name === undefined
            ? entry.node.label
            : `${entry.node.label} (${entry.node.name})`;

        return (
          <NativeSelectOption key={entry.fieldId} value={`#${entry.fieldId}`}>
            {entry.node.role === element.role
              ? named
              : `${named} · ${entry.node.role}`}
          </NativeSelectOption>
        );
      })}
    </NativeSelect>
  );

  return (
    <div className="grid grid-cols-[5rem_1fr] items-center gap-2 text-sm">
      <Label htmlFor={`${fieldId}-label`}>Label</Label>
      <Input
        id={`${fieldId}-label`}
        className="h-8"
        value={element.label}
        onChange={(event) => update({ label: event.target.value })}
      />
      <FieldNameInput element={element} writeName={writeName} />
      <Label htmlFor={`${fieldId}-kind`}>Kind</Label>
      <NativeSelect
        id={`${fieldId}-kind`}
        size="sm"
        value={kind}
        onChange={(event) => {
          if (isKind(event.target.value)) update({ kind: event.target.value });
        }}
      >
        {Object.entries(KINDS).map(([value, label]) => (
          <NativeSelectOption key={value} value={value}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Label htmlFor={`${fieldId}-role`}>Role</Label>
      <Input
        id={`${fieldId}-role`}
        className="h-8"
        list={`${fieldId}-roles`}
        value={element.role}
        onChange={(event) => update({ role: event.target.value })}
      />
      <datalist id={`${fieldId}-roles`}>
        {[...new Set(targets.map((entry) => entry.node.role))].map((role) => (
          <option key={role}>{role}</option>
        ))}
      </datalist>
      <Label htmlFor={`${fieldId}-required`}>Required</Label>
      <Checkbox
        id={`${fieldId}-required`}
        checked={element.required === true}
        onCheckedChange={(checked) =>
          update({ required: checked === true || undefined })
        }
      />
      {(kind === 'choice' || kind === 'multiple') && (
        <>
          <Label className="self-start pt-2">Options</Label>
          <div className="flex flex-col gap-1">
            {options.map((option, index) => (
              <div key={option.value} className="flex gap-1">
                <Input
                  aria-label={`Option ${index + 1}`}
                  className="h-8"
                  value={option.label}
                  onChange={(event) =>
                    update({
                      options: options.map((entry) =>
                        entry === option
                          ? { ...entry, label: event.target.value }
                          : entry
                      ),
                    })
                  }
                />
                <Button
                  aria-label={`Remove option ${index + 1}`}
                  size="icon-sm"
                  variant="ghost"
                  onClick={() =>
                    update({
                      options: options.filter((entry) => entry !== option),
                    })
                  }
                >
                  <XIcon />
                </Button>
              </div>
            ))}
            <Button
              className="w-fit"
              size="sm"
              variant="ghost"
              onClick={() =>
                update({
                  options: [
                    ...options,
                    {
                      label: `Option ${options.length + 1}`,
                      value: crypto.randomUUID().slice(0, 8),
                    },
                  ],
                })
              }
            >
              <PlusIcon />
              Add option
            </Button>
          </div>
        </>
      )}
      {kind === 'multiple' && (
        <FieldCountsInput element={element} writeCounts={writeCounts} />
      )}
      <Label
        className="self-start pt-1.5"
        htmlFor={listed ? undefined : `${fieldId}-condition`}
      >
        Show when
      </Label>
      {listed && (
        <NativeSelect
          aria-label="Match"
          size="sm"
          value={match}
          onChange={(event) => {
            const form = event.target.value;

            if (form === 'all' || form === 'any') writeRules(rules, form);
          }}
        >
          <NativeSelectOption value="all">Match all</NativeSelectOption>
          <NativeSelectOption value="any">Match any</NativeSelectOption>
        </NativeSelect>
      )}
      {rows.map((rule, index) => {
        const target = rule ? byId.get(rule.ref)?.node : undefined;
        const tests = target ? fillableTests(target) : [];
        const problem = !rule
          ? undefined
          : !target
            ? 'missing-target'
            : !FIELD_TESTS[target.kind].includes(rule.test)
              ? 'unsupported-test'
              : (
                    needsValue(rule.test)
                      ? !fitsRuleValue(target, rule.test, rule.value)
                      : rule.value !== undefined
                  )
                ? 'invalid-value'
                : undefined;
        const setRule = (next: FieldConditionTest) =>
          writeRules(
            rules.map((kept, at) =>
              at === index ? keepExtra(kept, next) : kept
            )
          );

        return (
          <div
            // oxlint-disable-next-line react-doctor/no-array-index-as-key -- Rules may repeat, and an edited rule keeps its row so its input keeps focus.
            key={index}
            className="col-start-2 flex min-w-0 flex-col gap-1"
          >
            <div className="flex gap-1 *:data-[slot=native-select-wrapper]:min-w-0 *:data-[slot=native-select-wrapper]:flex-1">
              {targetSelect(index, rule)}
              {listed && (
                <Button
                  aria-label={`Remove rule ${index + 1}`}
                  size="icon-sm"
                  variant="ghost"
                  onClick={() =>
                    writeRules(rules.filter((_, at) => at !== index))
                  }
                >
                  <XIcon />
                </Button>
              )}
            </div>
            {rule && target && (
              <div className="flex items-center gap-1">
                <NativeSelect
                  aria-label={listed ? `Rule ${index + 1} test` : 'Test'}
                  size="sm"
                  value={rule.test}
                  onChange={(event) => {
                    if (!isTest(event.target.value)) return;

                    setRule(
                      conditionOn(
                        rule.ref,
                        target,
                        event.target.value,
                        fitsRuleValue(target, event.target.value, rule.value)
                          ? rule.value
                          : undefined
                      )
                    );
                  }}
                >
                  {[...new Set([...tests, rule.test])].map((test) => (
                    <NativeSelectOption key={test} value={test}>
                      {TEST_LABELS[test]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {needsValue(rule.test) && tests.includes(rule.test) && (
                  <FieldValueInput
                    key={`${rule.ref}:${rules.length}`}
                    clearable={false}
                    kind={target.kind}
                    label={
                      listed ? `Rule ${index + 1} value` : 'Compared value'
                    }
                    options={target.options}
                    value={rule.value}
                    onChange={(value) =>
                      setRule(conditionOn(rule.ref, target, rule.test, value))
                    }
                  />
                )}
              </div>
            )}
            {problem && (
              <p className="text-xs text-destructive">
                {RULE_PROBLEMS[problem]}
              </p>
            )}
          </div>
        );
      })}
      {rules.length > 0 && canAddRule && (
        <Button
          className="col-start-2 w-fit"
          size="sm"
          variant="ghost"
          onClick={() => {
            const nextRule = nextAddedRule();

            if (nextRule) writeRules([...rules, nextRule]);
          }}
        >
          <PlusIcon />
          Add rule
        </Button>
      )}
    </div>
  );
}

function FieldNameInput({
  element,
  writeName,
}: {
  element: FieldNode;
  writeName: React.Ref<() => 'refused' | 'written'>;
}) {
  const editor = useEditor();
  const { fieldId, name } = element;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [draft, setDraft] = React.useState<{
    refused: 'invalid' | 'write' | false;
    stored?: string;
    text: string;
  } | null>(null);

  if (draft && draft.stored !== name) setDraft(null);

  const write = (focusOnRefusal = false) => {
    if (!draft) return 'written';

    const next = draft.text === '' ? undefined : draft.text;

    if (next === name) {
      setDraft(null);

      return 'written';
    }

    try {
      const committed =
        editor.update((tx) => {
          tx.plugin(FieldPlugin).update(fieldId, { name: next });

          return true;
        }) === true;

      if (!committed) {
        setDraft({ ...draft, refused: 'write' });
        if (focusOnRefusal) inputRef.current?.focus();

        return 'refused';
      }

      setDraft(null);

      return 'written';
    } catch (error) {
      if (!(error instanceof EditorSchemaValidationError)) throw error;

      setDraft({ ...draft, refused: 'invalid' });
      if (focusOnRefusal) inputRef.current?.focus();

      return 'refused';
    }
  };

  React.useImperativeHandle(writeName, () => () => write(true));

  return (
    <>
      <Label htmlFor={`${fieldId}-name`}>Name</Label>
      <Input
        ref={inputRef}
        id={`${fieldId}-name`}
        className="h-8"
        aria-describedby={draft?.refused ? `${fieldId}-name-error` : undefined}
        aria-invalid={Boolean(draft?.refused) || undefined}
        value={draft?.text ?? name ?? ''}
        onBlur={() => write(false)}
        onChange={(event) =>
          setDraft({ refused: false, stored: name, text: event.target.value })
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            write(true);
          }
        }}
      />
      {draft?.refused && (
        <p
          id={`${fieldId}-name-error`}
          className="col-start-2 text-xs text-destructive"
          role="alert"
        >
          {draft.refused === 'write'
            ? 'Not saved.'
            : 'A name cannot start or end with a space or hold a tab, a line break or another control character.'}
        </p>
      )}
    </>
  );
}

type CountDraft = Readonly<{ badInput: boolean; text: string }>;

const parseCount = (
  draft: CountDraft | null,
  stored: number | undefined
): { invalid: boolean; value?: number } => {
  if (!draft || draft.badInput) return { invalid: false, value: stored };
  if (draft.text.trim() === '') return { invalid: false, value: undefined };

  const parsed = Number(draft.text);

  return Number.isInteger(parsed)
    ? { invalid: false, value: parsed }
    : { invalid: true };
};

const evaluateCounts = (
  minDraft: CountDraft | null,
  maxDraft: CountDraft | null,
  storedMin: number | undefined,
  storedMax: number | undefined,
  target?: 'max' | 'min'
) => {
  const minParsed = parseCount(minDraft, storedMin);
  const maxParsed = parseCount(maxDraft, storedMax);
  const minOwnBad =
    minParsed.invalid || (minParsed.value !== undefined && minParsed.value < 2);
  const maxOwnBad =
    maxParsed.invalid || (maxParsed.value !== undefined && maxParsed.value < 1);
  const minAgainst = maxOwnBad ? storedMax : maxParsed.value;
  const maxAgainst = minOwnBad ? storedMin : minParsed.value;
  const minCrossed =
    !minOwnBad &&
    minParsed.value !== undefined &&
    minAgainst !== undefined &&
    minParsed.value > minAgainst;
  const maxCrossed =
    !maxOwnBad &&
    maxParsed.value !== undefined &&
    maxAgainst !== undefined &&
    maxParsed.value < maxAgainst;
  const bothValidIndividually = !minOwnBad && !maxOwnBad;
  const onlyMinEdited = minDraft !== null && maxDraft === null;
  const onlyMaxEdited = maxDraft !== null && minDraft === null;
  const blameMin = onlyMinEdited || (!onlyMaxEdited && target !== 'max');
  const minBad =
    minOwnBad || (bothValidIndividually ? minCrossed && blameMin : minCrossed);
  const maxBad =
    maxOwnBad || (bothValidIndividually ? minCrossed && !blameMin : maxCrossed);

  return {
    maxBad,
    maxCrossed,
    maxOwnBad,
    maxValue: maxParsed.value,
    minBad,
    minCrossed,
    minOwnBad,
    minValue: minParsed.value,
  };
};

type CountError = 'invalid' | 'write' | false;

function FieldCountsInput({
  element,
  writeCounts,
}: {
  element: FieldNode;
  writeCounts: React.Ref<(focusOnRefusal: boolean) => 'refused' | 'written'>;
}) {
  const editor = useEditor();
  const { fieldId, max, min } = element;
  const minInputRef = React.useRef<HTMLInputElement>(null);
  const maxInputRef = React.useRef<HTMLInputElement>(null);
  const focusAfterResetRef = React.useRef<'max' | 'min' | null>(null);
  const [drafts, setDrafts] = React.useState<{
    max: CountDraft | null;
    min: CountDraft | null;
    storedMax?: number;
    storedMin?: number;
  }>({ max: null, min: null, storedMax: max, storedMin: min });
  const [errors, setErrors] = React.useState<{
    max: CountError;
    min: CountError;
  }>({
    max: false,
    min: false,
  });
  const [resets, setResets] = React.useState<{ max: number; min: number }>({
    max: 0,
    min: 0,
  });

  React.useLayoutEffect(() => {
    const target = focusAfterResetRef.current;

    if (!target) return;

    focusAfterResetRef.current = null;
    (target === 'min' ? minInputRef : maxInputRef).current?.focus();
  }, [resets]);

  if (!Object.is(drafts.storedMin, min) || !Object.is(drafts.storedMax, max)) {
    const minChanged = !Object.is(drafts.storedMin, min);
    const maxChanged = !Object.is(drafts.storedMax, max);
    const nextMinDraft = minChanged ? null : drafts.min;
    const nextMaxDraft = maxChanged ? null : drafts.max;

    setDrafts({
      max: nextMaxDraft,
      min: nextMinDraft,
      storedMax: max,
      storedMin: min,
    });
    if (errors.min || errors.max) {
      const check = evaluateCounts(nextMinDraft, nextMaxDraft, min, max);

      setErrors({
        max: maxChanged
          ? false
          : errors.max === 'invalid' && (check.maxOwnBad || check.maxCrossed)
            ? 'invalid'
            : false,
        min: minChanged
          ? false
          : errors.min === 'invalid' && (check.minOwnBad || check.minCrossed)
            ? 'invalid'
            : false,
      });
    }
  }

  const commit = (
    reason: 'blur' | 'close' | 'enter',
    target?: 'max' | 'min',
    focusOnRefusal = false
  ): 'refused' | 'written' => {
    const clearMinBad =
      drafts.min?.badInput === true && (reason !== 'blur' || target === 'min');
    const clearMaxBad =
      drafts.max?.badInput === true && (reason !== 'blur' || target === 'max');

    if (clearMinBad || clearMaxBad) {
      if (reason === 'enter' && target) {
        focusAfterResetRef.current = target;
      }
      setResets((current) => ({
        max: current.max + (clearMaxBad ? 1 : 0),
        min: current.min + (clearMinBad ? 1 : 0),
      }));
    }

    const nextMinDraft = clearMinBad ? null : drafts.min;
    const nextMaxDraft = clearMaxBad ? null : drafts.max;

    if (!nextMinDraft && !nextMaxDraft) {
      if (clearMinBad || clearMaxBad) {
        setDrafts({ max: null, min: null, storedMax: max, storedMin: min });
      }
      if (errors.min || errors.max) setErrors({ max: false, min: false });

      return 'written';
    }

    const check = evaluateCounts(nextMinDraft, nextMaxDraft, min, max, target);

    if (check.minBad || check.maxBad) {
      if (clearMinBad || clearMaxBad) {
        setDrafts({
          max: nextMaxDraft,
          min: nextMinDraft,
          storedMax: max,
          storedMin: min,
        });
      }
      setErrors({
        max: check.maxBad ? 'invalid' : false,
        min: check.minBad ? 'invalid' : false,
      });
      if (focusOnRefusal) {
        (check.minBad ? minInputRef : maxInputRef).current?.focus();
      }

      return 'refused';
    }

    const patch: { max?: number; min?: number } = {};

    if (!Object.is(check.minValue, min)) patch.min = check.minValue;
    if (!Object.is(check.maxValue, max)) patch.max = check.maxValue;

    if ('min' in patch || 'max' in patch) {
      const committed =
        editor.update((tx) => {
          tx.plugin(FieldPlugin).update(fieldId, patch);

          return true;
        }) === true;

      if (!committed) {
        const minFailed = 'min' in patch;
        const maxFailed = 'max' in patch;

        setErrors({
          max: maxFailed ? 'write' : false,
          min: minFailed ? 'write' : false,
        });
        if (focusOnRefusal) {
          (minFailed ? minInputRef : maxInputRef).current?.focus();
        }

        return 'refused';
      }
    }

    setDrafts({
      max: null,
      min: null,
      storedMax: check.maxValue,
      storedMin: check.minValue,
    });
    setErrors({ max: false, min: false });

    return 'written';
  };

  React.useImperativeHandle(
    writeCounts,
    () => (focusOnRefusal) => commit('close', undefined, focusOnRefusal)
  );

  const renderInput = (setting: 'max' | 'min') => {
    const id = `${fieldId}-${setting}`;
    const draft = drafts[setting];
    const stored = setting === 'min' ? min : max;
    const refused = errors[setting];

    return (
      <React.Fragment key={setting}>
        <Label htmlFor={id}>{setting === 'min' ? 'Min' : 'Max'}</Label>
        <Input
          key={resets[setting]}
          ref={setting === 'min' ? minInputRef : maxInputRef}
          id={id}
          className="h-8"
          aria-describedby={refused ? `${id}-error` : undefined}
          aria-invalid={Boolean(refused) || undefined}
          min={setting === 'min' ? 2 : 1}
          step={1}
          type="number"
          value={draft?.text ?? (stored === undefined ? '' : String(stored))}
          onBlur={() => commit('blur', setting, false)}
          onInput={(event) => {
            const input = event.currentTarget;
            const nextDraft: CountDraft = {
              badInput: input.validity.badInput,
              text: input.value,
            };
            const nextMinDraft = setting === 'min' ? nextDraft : drafts.min;
            const nextMaxDraft = setting === 'max' ? nextDraft : drafts.max;

            setDrafts((current) => ({
              ...current,
              [setting]: nextDraft,
            }));
            setErrors((current) => {
              if (!current.min && !current.max) return current;

              const other = setting === 'min' ? 'max' : 'min';
              const check = evaluateCounts(
                nextMinDraft,
                nextMaxDraft,
                min,
                max
              );
              const keepOther: CountError =
                current[other] === 'invalid' &&
                (other === 'min'
                  ? check.minOwnBad || check.minCrossed
                  : check.maxOwnBad || check.maxCrossed)
                  ? 'invalid'
                  : current[other] === 'write'
                    ? 'write'
                    : false;

              return {
                max: setting === 'max' ? false : keepOther,
                min: setting === 'min' ? false : keepOther,
              };
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              commit('enter', setting, true);
            }
          }}
        />
        {refused && (
          <p
            id={`${id}-error`}
            className="col-start-2 text-xs text-destructive"
            role="alert"
          >
            {refused === 'write'
              ? 'Not saved.'
              : setting === 'min'
                ? 'Min takes a whole number of at least 2 and no more than Max, or tick Required for at least 1.'
                : 'Max takes a whole number of at least 1 and no less than Min.'}
          </p>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      {renderInput('min')}
      {renderInput('max')}
    </>
  );
}

const NO_OPTION = '';
const optionToken = (option: FieldOption) => `option:${option.value}`;

const entryOf = (
  kind: FieldKind,
  input: HTMLInputElement,
  clearable: boolean
): { value?: ScalarFieldValue } | null => {
  // The browser reports a number or date typed in part as bad input.
  if (input.validity.badInput) return null;
  if (input.value === '') {
    if (clearable) return { value: undefined };

    return kind === 'text' ? { value: '' } : null;
  }

  const value = kind === 'number' ? input.valueAsNumber : input.value;

  return fitsField({ kind }, value) ? { value } : null;
};

function FieldValueInput({
  clearable = true,
  kind,
  label,
  onChange,
  options,
  value,
}: {
  clearable?: boolean;
  kind: FieldKind;
  label: string;
  onChange: (value: ScalarFieldValue | undefined) => void;
  options?: readonly FieldOption[];
  value?: ScalarFieldValue;
}) {
  const [draft, setDraft] = React.useState<{
    kind: FieldKind;
    stored?: ScalarFieldValue;
    text: string;
  } | null>(null);
  const [resets, setResets] = React.useState(0);

  if (draft && (draft.kind !== kind || !Object.is(draft.stored, value))) {
    setDraft(null);
  }

  if (kind === 'checkbox') {
    return (
      <Checkbox
        aria-label={label}
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
    );
  }
  if (kind === 'choice' || kind === 'multiple') {
    const picked = options?.find((option) => option.value === value);

    return (
      <NativeSelect
        aria-label={label}
        size="sm"
        value={picked ? optionToken(picked) : NO_OPTION}
        onChange={(event) => {
          const option = options?.find(
            (entry) => optionToken(entry) === event.target.value
          );

          if (option) onChange(option.value);
          else if (event.target.value === NO_OPTION && clearable) {
            onChange(undefined);
          }
        }}
      >
        {(clearable || !picked) && (
          <NativeSelectOption value={NO_OPTION}>None</NativeSelectOption>
        )}
        {options?.map((option, index) => (
          <NativeSelectOption key={option.value} value={optionToken(option)}>
            {optionLabel(option, index)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  }

  return (
    <Input
      key={resets}
      aria-label={label}
      className="h-8"
      type={kind === 'number' || kind === 'date' ? kind : 'text'}
      value={draft?.text ?? (value === undefined ? '' : String(value))}
      onBlur={(event) => {
        // A partial number or date reads as an empty value, so React never
        // clears it from an input whose stored answer is empty, and WebKit
        // keeps a partial date through an empty value write.
        if (event.currentTarget.validity.badInput) {
          setResets((count) => count + 1);
        }
        setDraft(null);
      }}
      onInput={(event) => {
        const entry = entryOf(kind, event.currentTarget, clearable);

        if (entry) onChange(entry.value);
        setDraft({
          kind,
          stored: entry ? entry.value : value,
          text: event.currentTarget.value,
        });
      }}
    />
  );
}

export const FieldKit = [FieldPlugin.configure({ component: FieldElement })];
