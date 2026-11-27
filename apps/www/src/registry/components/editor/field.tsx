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
import {
  type EditorElementProps,
  EditorElement,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  'invalid-value': 'A value does not fit this kind of field.',
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

const saveAnswer = (
  editor: ReturnType<typeof useEditor>,
  fieldId: string,
  value?: FieldValue
) =>
  editor.update((tx) => {
    tx.plugin(FieldPlugin).update(fieldId, { value });

    return true;
  }) === true &&
  Object.is(editor.plugin(FieldPlugin).read.field(fieldId)?.node.value, value);

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
  const readOnly = useEditorReadOnly();
  const fillRole = usePluginStore(FieldPlugin, 'fillRole') ?? null;
  const field = useFieldRead(element.fieldId);
  const problems = field?.problems ?? [];
  const skipped = field?.applies === false;
  const warning = problems.map((problem) => PROBLEMS[problem]).join(' ');
  const filling = fillRole !== null;
  const ownField = element.role === fillRole;
  const waitsForReview = useWaitsForReview(
    element,
    ownField && editor.plugin(AuthoredPlugin).installed
  );
  const fills = ownField && !readOnly && !waitsForReview;
  const toggles = fills && element.kind === 'checkbox';
  const ticked = element.value === true;
  const [refusedToggle, setRefusedToggle] = React.useState<{
    role: string | null;
    stored?: FieldValue;
  } | null>(null);

  if (
    refusedToggle &&
    (refusedToggle.role !== fillRole ||
      !Object.is(refusedToggle.stored, element.value))
  ) {
    setRefusedToggle(null);
  }

  const answer = Array.isArray(element.value)
    ? element.value
        .map(
          (entry) =>
            element.options?.find((option) => option.value === entry)?.label ??
            entry
        )
        .join(', ')
    : String(
        element.options?.find((option) => option.value === element.value)
          ?.label ??
          element.value ??
          ''
      );
  const writeName = React.useRef<() => 'refused' | 'written'>(null);
  let form: React.ReactNode = null;

  if (!filling && !readOnly) {
    form = <FieldSettingsForm element={element} writeName={writeName} />;
  }
  if (fills && !toggles && element.kind !== 'multiple') {
    form = <FieldAnswerForm element={element} />;
  }

  const openAtPointerDownRef = React.useRef(false);
  const [openAs, setOpenAs] = React.useState<{ role: string | null } | null>(
    null
  );
  const open = form !== null && openAs?.role === fillRole;

  if (openAs && !open) setOpenAs(null);

  const chip = {
    className: cn(
      'inline-flex w-fit items-baseline gap-1 rounded-sm bg-muted px-1 text-muted-foreground',
      (form || toggles) && 'cursor-pointer',
      skipped && 'opacity-50 [[data-editor-authored-change]>&]:opacity-100',
      inlineSuggestionVariants({ on: 'parent' })
    ),
    contentEditable: false,
    draggable: !filling,
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

      event.preventDefault();
      setOpenAs({ role: fillRole });
    },
    onPointerDown: () => {
      openAtPointerDownRef.current = open;
    },
  };
  const chipContent = (
    <>
      {filling && element.kind === 'checkbox' && (
        <span
          aria-label={ticked ? 'Ticked' : 'Not ticked'}
          className="flex size-3 items-center justify-center self-center rounded-[3px] border border-current"
          role="img"
        >
          {ticked && <CheckIcon className="size-2.5" />}
        </span>
      )}
      {filling && element.kind !== 'checkbox'
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
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && writeName.current?.() === 'refused') return;

            setOpenAs(nextOpen ? { role: fillRole } : null);
          }}
        >
          <PopoverTrigger asChild>
            <button {...chip} type="button">
              {chipContent}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={
              filling
                ? 'w-64'
                : 'max-h-[min(80vh,var(--radix-popover-content-available-height,80vh))] w-[26rem] max-w-[calc(100vw-2rem)] overflow-y-auto'
            }
          >
            {form}
          </PopoverContent>
        </Popover>
      ) : (
        <button {...chip} type="button">
          {chipContent}
        </button>
      )}
      {ownField && element.kind === 'checkbox' && (
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
  const { fieldId, kind, label, options, value } = element;
  const [refusal, setRefusal] = React.useState<{
    stored?: FieldValue;
  } | null>(null);

  if (refusal && !Object.is(refusal.stored, value)) setRefusal(null);

  const setValue = (next?: FieldValue) =>
    setRefusal(saveAnswer(editor, fieldId, next) ? null : { stored: value });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <FieldValueInput
          kind={kind}
          label={label}
          options={options}
          value={typeof value === 'object' ? undefined : value}
          onChange={setValue}
        />
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
  element,
  writeName,
}: {
  element: FieldNode;
  writeName: React.Ref<() => 'refused' | 'written'>;
}) {
  const editor = useEditor();
  const { condition, fieldId, kind, options = [] } = element;
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
        {Object.entries(KINDS)
          .filter(([value]) => value !== 'multiple' || kind === 'multiple')
          .map(([value, label]) => (
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
      {kind === 'choice' && (
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
  const [draft, setDraft] = React.useState<{
    refused: boolean;
    text: string;
  } | null>(null);
  const write = () => {
    if (!draft) return 'written';

    const next = draft.text === '' ? undefined : draft.text;

    if (next === name) {
      setDraft(null);

      return 'written';
    }

    try {
      editor.update((tx) =>
        tx.plugin(FieldPlugin).update(fieldId, { name: next })
      );
      setDraft(null);

      return 'written';
    } catch (error) {
      if (!(error instanceof EditorSchemaValidationError)) throw error;

      setDraft({ ...draft, refused: true });

      return 'refused';
    }
  };

  React.useImperativeHandle(writeName, () => write);

  return (
    <>
      <Label htmlFor={`${fieldId}-name`}>Name</Label>
      <Input
        id={`${fieldId}-name`}
        className="h-8"
        aria-describedby={draft?.refused ? `${fieldId}-name-error` : undefined}
        aria-invalid={draft?.refused || undefined}
        value={draft?.text ?? name ?? ''}
        onBlur={write}
        onChange={(event) =>
          setDraft({ refused: false, text: event.target.value })
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) write();
        }}
      />
      {draft?.refused && (
        <p
          id={`${fieldId}-name-error`}
          className="col-start-2 text-xs text-destructive"
          role="alert"
        >
          A name cannot start or end with a space or hold a tab, a line break or
          another control character.
        </p>
      )}
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
        {options?.map((option) => (
          <NativeSelectOption key={option.value} value={optionToken(option)}>
            {option.label}
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
