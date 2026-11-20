'use client';

import { cn } from 'cn';
import { PlusIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import type {
  FieldKind,
  FieldOption,
  FieldPatch,
  FieldProblem,
  FieldValue,
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
const ROLES = ['landlord', 'tenant'];
const PROBLEMS: Record<FieldProblem, string> = {
  'invalid-value': 'A value does not fit this kind of field.',
  'missing-target': 'The field its condition names is gone.',
  'unsupported-test': 'Its condition does not fit the field it names.',
};

const isKind = (value: string): value is FieldKind => value in KINDS;

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
  const { fieldId, kind, options = [] } = element;
  const update = (patch: FieldPatch) =>
    editor.update((tx) => tx.plugin(FieldPlugin).update(fieldId, patch));

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
      <NativeSelect
        id={`${fieldId}-role`}
        size="sm"
        value={element.role}
        onChange={(event) => update({ role: event.target.value })}
      >
        {[...new Set([...ROLES, element.role])].map((role) => (
          <NativeSelectOption key={role} value={role}>
            {role}
          </NativeSelectOption>
        ))}
      </NativeSelect>
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
            options={options}
            value={element.defaultValue}
            onChange={(defaultValue) => update({ defaultValue })}
          />
        </>
      )}
    </div>
  );
}

function FieldValueInput({
  kind,
  onChange,
  options,
  value,
}: {
  kind: FieldKind;
  onChange: (value: FieldValue | undefined) => void;
  options?: readonly FieldOption[];
  value?: FieldValue;
}) {
  if (kind === 'checkbox') {
    return (
      <Checkbox
        aria-label="Checked"
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
    );
  }
  if (kind === 'choice') {
    return (
      <NativeSelect
        aria-label="Answer"
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
      aria-label="Answer"
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
