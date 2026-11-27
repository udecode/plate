'use client';

import { cn } from 'cn';
import { CheckIcon, PlusIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { EditorSchemaValidationError } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import {
  FIELD_TESTS,
  fitsField,
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
  'not-equals': 'is not',
};
const PROBLEMS: Record<FieldProblem, string> = {
  'answer-conflict': 'The fields of its name hold different answers.',
  'condition-loop': 'Its condition leads back to this field.',
  'invalid-value': 'A value does not fit this kind of field.',
  'missing-target': 'The field its condition names is gone.',
  'name-conflict':
    'The fields of its name differ in kind, options or condition.',
  'unsupported-test': 'Its condition does not fit the field it names.',
};

const isKind = (value: string): value is FieldKind => value in KINDS;
const isTest = (value: string): value is FieldTest => value in TEST_LABELS;
const needsValue = (test: FieldTest) => test !== 'filled' && test !== 'blank';
const firstValue = ({ kind, options }: FieldSettings) =>
  ({
    checkbox: true,
    choice: options?.[0]?.value,
    date: new Date().toISOString().slice(0, 10),
    number: 0,
    signature: undefined,
    text: '',
  })[kind];
const fillableTests = (target: FieldSettings) =>
  FIELD_TESTS[target.kind].filter(
    (test) => !needsValue(test) || firstValue(target) !== undefined
  );
const conditionOn = (
  ref: string,
  target: FieldSettings,
  test: FieldTest,
  value?: FieldValue
) => ({
  ref,
  test,
  ...(needsValue(test) ? { value: value ?? firstValue(target) } : {}),
});

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

  const answer = String(
    element.options?.find((option) => option.value === element.value)?.label ??
      element.value ??
      ''
  );
  const writeName = React.useRef<() => 'refused' | 'written'>(null);
  let form: React.ReactNode = null;

  if (!filling && !readOnly) {
    form = <FieldSettingsForm element={element} writeName={writeName} />;
  }
  if (fills && !toggles) form = <FieldAnswerForm element={element} />;

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
          <PopoverContent className={filling ? 'w-64' : 'w-80'}>
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
          value={value}
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
  const fields = useEditorSelector(
    (innerEditor) => innerEditor.plugin(FieldPlugin).read.fields(),
    {
      shouldUpdate: (commit) =>
        !commit ||
        commit.changed.hasAny('properties') ||
        commit.changed.hasAny('structure'),
    }
  );
  const targets = fields.filter((entry) => entry.fieldId !== fieldId);
  const target = fields.find((entry) => entry.fieldId === condition?.ref)?.node;
  const namers = new Map<string, string[]>();

  for (const { fieldId: namer, node } of fields) {
    if (!node.condition) continue;

    const named = namers.get(node.condition.ref) ?? [];

    named.push(namer);
    namers.set(node.condition.ref, named);
  }

  const leadsHere = new Set([fieldId]);

  for (const id of leadsHere) {
    for (const namer of namers.get(id) ?? []) leadsHere.add(namer);
  }

  const choices = fields.filter(
    (entry) => entry.fieldId === condition?.ref || !leadsHere.has(entry.fieldId)
  );
  const tests = target ? fillableTests(target) : [];

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
      {kind !== 'signature' && (
        <>
          <Label>Default</Label>
          <FieldValueInput
            kind={kind}
            label="Default"
            options={options}
            value={element.defaultValue}
            onChange={(defaultValue) => update({ defaultValue })}
          />
        </>
      )}
      <Label htmlFor={`${fieldId}-condition`}>Show when</Label>
      <NativeSelect
        id={`${fieldId}-condition`}
        size="sm"
        value={condition ? `#${condition.ref}` : ''}
        onChange={(event) => {
          const next = choices.find(
            (entry) => `#${entry.fieldId}` === event.target.value
          );

          update({
            condition:
              next &&
              conditionOn(next.fieldId, next.node, fillableTests(next.node)[0]),
          });
        }}
      >
        <NativeSelectOption value="">Always</NativeSelectOption>
        {condition && !target && (
          <NativeSelectOption value={`#${condition.ref}`}>
            Missing field
          </NativeSelectOption>
        )}
        {choices.map((entry) => (
          <NativeSelectOption key={entry.fieldId} value={`#${entry.fieldId}`}>
            {entry.node.name === undefined
              ? entry.node.label
              : `${entry.node.label} (${entry.node.name})`}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {condition && target && (
        <div className="col-start-2 flex gap-1">
          <NativeSelect
            aria-label="Test"
            size="sm"
            value={condition.test}
            onChange={(event) => {
              if (!isTest(event.target.value)) return;

              update({
                condition: conditionOn(
                  condition.ref,
                  target,
                  event.target.value,
                  fitsField(target, condition.value)
                    ? condition.value
                    : undefined
                ),
              });
            }}
          >
            {[...new Set([...tests, condition.test])].map((test) => (
              <NativeSelectOption key={test} value={test}>
                {TEST_LABELS[test]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {needsValue(condition.test) && tests.includes(condition.test) && (
            <FieldValueInput
              clearable={false}
              kind={target.kind}
              label="Compared value"
              options={target.options}
              value={condition.value}
              onChange={(value) =>
                update({
                  condition: conditionOn(
                    condition.ref,
                    target,
                    condition.test,
                    value
                  ),
                })
              }
            />
          )}
        </div>
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
): { value?: FieldValue } | null => {
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
  onChange: (value: FieldValue | undefined) => void;
  options?: readonly FieldOption[];
  value?: FieldValue;
}) {
  const [draft, setDraft] = React.useState<{
    kind: FieldKind;
    stored?: FieldValue;
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
  if (kind === 'choice') {
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
