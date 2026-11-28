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
} from '@/registry/components/editor/select-editor';

const LABELS: ReadonlyArray<SelectItem & { url: string }> = [
  { url: '/docs/components/editor', value: 'Editor' },
  { url: '/docs/components/select-editor', value: 'Select Editor' },
  { url: '/docs/api/selection', value: 'Node Selection' },
  { url: '/docs/components/button', value: 'Button' },
  { url: '/docs/components/command', value: 'Command' },
  { url: '/docs/components/dialog', value: 'Dialog' },
  { url: '/docs/components/field', value: 'Field' },
  { url: '/docs/components/input', value: 'Input' },
  { url: '/docs/components/label', value: 'Label' },
  { url: '/docs/components/popover', value: 'Popover' },
];

const formSchema = z.object({
  labels: z
    .array(
      z.object({
        url: z.string().optional(),
        value: z.string(),
      })
    )
    .min(1, 'Select at least one label')
    .max(10, 'Select up to 10 labels'),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditorSelectForm() {
  const [readOnly, setReadOnly] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<
    readonly SelectItem[] | null
  >(null);
  const form = useForm<FormValues>({
    defaultValues: {
      labels: [LABELS[0]],
    },
    resolver: zodResolver(formSchema),
  });

  const labels = useWatch({ control: form.control, name: 'labels' });
  const errorId = React.useId();

  const onSubmit = (data: FormValues) => {
    setSubmitted(data.labels);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-4 pt-12 sm:p-11 sm:pt-24 sm:pl-2">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, () => setSubmitted(null))}
      >
        <Controller
          name="labels"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="space-y-2" data-invalid={fieldState.invalid}>
              <div className="flex items-start gap-2">
                <Button
                  aria-label={readOnly ? 'Edit labels' : 'Done editing labels'}
                  variant="ghost"
                  className="mt-0.5 h-10"
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
                    ref={field.ref}
                    aria-describedby={fieldState.error ? errorId : undefined}
                    aria-invalid={fieldState.invalid}
                    aria-label="Labels"
                    creatable
                    items={LABELS}
                    placeholder={readOnly ? 'Empty' : 'Select labels...'}
                    readOnly={readOnly}
                    value={field.value}
                    onBlur={field.onBlur}
                    onValueChange={readOnly ? undefined : field.onChange}
                  />
                )}
              </div>
              {fieldState.error?.message ? (
                <p
                  id={errorId}
                  className="pl-12 text-sm text-destructive"
                  role="alert"
                >
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <div className="flex items-center gap-3 pl-12">
          <Button size="sm" type="submit" variant="outline">
            Submit
          </Button>
          {submitted ? (
            <p className="text-sm text-muted-foreground" role="status">
              Submitted: {submitted.map((item) => item.value).join(', ')}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
