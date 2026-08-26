'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, PlusIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  type SelectItem,
  SelectEditor,
  SelectEditorCombobox,
  SelectEditorContent,
  SelectEditorInput,
} from '@/registry/components/editor/select-editor';

const LABELS = [
  { url: '/docs/components/editor', value: 'Editor' },
  { url: '/docs/components/select-editor', value: 'Select Editor' },
  { url: '/docs/plite/api/locations/selection', value: 'Node Selection' },
  { url: '/docs/components/button', value: 'Button' },
  { url: '/docs/components/command', value: 'Command' },
  { url: '/docs/components/dialog', value: 'Dialog' },
  { url: '/docs/components/field', value: 'Field' },
  { url: '/docs/components/input', value: 'Input' },
  { url: '/docs/components/label', value: 'Label' },
  { url: '/docs/components/popover', value: 'Popover' },
  { url: '/docs/components/tag', value: 'Tag Element' },
] satisfies Array<SelectItem & { url: string }>;

const formSchema = z.object({
  labels: z
    .array(
      z.object({
        value: z.string(),
      })
    )
    .min(1, 'Select at least one label')
    .max(10, 'Select up to 10 labels'),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditorSelectForm() {
  const [readOnly, setReadOnly] = React.useState(false);
  const form = useForm<FormValues>({
    defaultValues: {
      labels: [LABELS[0]],
    },
    resolver: zodResolver(formSchema),
  });

  const labels = useWatch({ control: form.control, name: 'labels' });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-11 pt-24 pl-2">
      <div className="space-y-6">
        <Controller
          name="labels"
          control={form.control}
          render={({ field, fieldState }) => (
            <div data-invalid={fieldState.invalid}>
              <div className="flex items-start gap-2">
                <Button
                  variant="ghost"
                  className="h-10"
                  onClick={() => {
                    setReadOnly(!readOnly);
                  }}
                  type="button"
                >
                  {readOnly ? (
                    <PlusIcon className="size-4" />
                  ) : (
                    <CheckIcon className="size-4" />
                  )}
                </Button>

                {readOnly && labels.length === 0 ? (
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-10"
                    onClick={() => {
                      setReadOnly(false);
                    }}
                    type="button"
                  >
                    Add labels
                  </Button>
                ) : (
                  <SelectEditor
                    value={field.value}
                    onValueChange={readOnly ? undefined : field.onChange}
                    items={LABELS}
                  >
                    <SelectEditorContent>
                      <SelectEditorInput
                        readOnly={readOnly}
                        placeholder={readOnly ? 'Empty' : 'Select labels...'}
                      />
                      {!readOnly && <SelectEditorCombobox />}
                    </SelectEditorContent>
                  </SelectEditor>
                )}
              </div>
              {fieldState.error?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />
      </div>
    </div>
  );
}
