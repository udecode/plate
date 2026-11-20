'use client';

import { cn } from 'cn';
import { PlusIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
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
  useElement,
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
  'invalid-value': 'A value does not fit this kind of field.',
  'missing-target': 'The field its condition names is gone.',
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

export function FieldElement(props: EditorElementProps<typeof FieldPlugin>) {
  const { element } = props;
  const readOnly = useEditorReadOnly();
  const field = useFieldRead(element.fieldId);
  const problems = field?.problems ?? [];
  const warning = problems.map((problem) => PROBLEMS[problem]).join(' ');
  const openRef = React.useRef(false);
  const openAtPointerDownRef = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const setOpenState = React.useCallback((nextOpen: boolean) => {
    openRef.current = nextOpen;
    setOpen(nextOpen);
  }, []);

  const trigger = (
    <button
      className={cn(
        'inline-flex w-fit cursor-pointer items-baseline gap-1 rounded-sm bg-muted px-1 text-muted-foreground',
        inlineSuggestionVariants({ on: 'parent' })
      )}
      contentEditable={false}
      draggable
      onClick={(event) => {
        const beganOpen =
          event.detail === 0 ? openRef.current : openAtPointerDownRef.current;

        if (readOnly || beganOpen) return;

        event.preventDefault();
        setOpenState(true);
      }}
      onPointerDown={() => {
        openAtPointerDownRef.current = openRef.current;
      }}
      type="button"
    >
      {element.label}
      {element.required && <span className="text-destructive">*</span>}
      <span className="text-xs opacity-70">{element.role}</span>
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
    </button>
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
      {readOnly ? (
        trigger
      ) : (
        <Popover open={open} onOpenChange={setOpenState}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-80">
            <FieldSettingsForm />
          </PopoverContent>
        </Popover>
      )}
      {props.children}
    </EditorElement>
  );
}

function FieldSettingsForm() {
  const editor = useEditor();
  const element = useElement(FieldPlugin);
  const { condition, fieldId, kind, options = [] } = element;
  const update = (patch: FieldPatch) =>
    editor.update((tx) => tx.plugin(FieldPlugin).update(fieldId, patch));
  const targets = editor
    .plugin(FieldPlugin)
    .read.fields()
    .filter((entry) => entry.fieldId !== fieldId);
  const target = targets.find(
    (entry) => entry.fieldId === condition?.ref
  )?.node;
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
        value={condition?.ref ?? ''}
        onChange={(event) => {
          const next = targets.find(
            (entry) => entry.fieldId === event.target.value
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
          <NativeSelectOption value={condition.ref}>
            Missing field
          </NativeSelectOption>
        )}
        {targets.map((entry) => (
          <NativeSelectOption key={entry.fieldId} value={entry.fieldId}>
            {entry.node.label}
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

function FieldValueInput({
  kind,
  label,
  onChange,
  options,
  value,
}: {
  kind: FieldKind;
  label: string;
  onChange: (value: FieldValue | undefined) => void;
  options?: readonly FieldOption[];
  value?: FieldValue;
}) {
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
    return (
      <NativeSelect
        aria-label={label}
        size="sm"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <NativeSelectOption value="">None</NativeSelectOption>
        {options?.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  }

  return (
    <Input
      aria-label={label}
      className="h-8"
      type={kind === 'number' || kind === 'date' ? kind : 'text'}
      value={value === undefined ? '' : String(value)}
      onChange={(event) => {
        const { value: next, valueAsNumber } = event.target;

        onChange(
          next === '' ? undefined : kind === 'number' ? valueAsNumber : next
        );
      }}
    />
  );
}

export const FieldKit = [FieldPlugin.configure({ component: FieldElement })];
