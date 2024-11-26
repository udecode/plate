'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, PlusIcon } from 'lucide-react';
import * as z from 'zod';

import { Button } from '@/registry/default/plate-ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/registry/default/plate-ui/form';
import {
  type SelectItem,
  SelectEditor,
  SelectEditorCombobox,
  SelectEditorContent,
  SelectEditorInput,
} from '@/registry/default/plate-ui/select-editor';

const LABELS = [
  { url: '/docs/components/editor', value: 'Editor' },
  { url: '/docs/components/select-editor', value: 'Select Editor' },
  { url: '/docs/components/block-selection', value: 'Block Selection' },
  { url: '/docs/components/button', value: 'Button' },
  { url: '/docs/components/command', value: 'Command' },
  { url: '/docs/components/dialog', value: 'Dialog' },
  { url: '/docs/components/form', value: 'Form' },
  { url: '/docs/components/input', value: 'Input' },
  { url: '/docs/components/label', value: 'Label' },
  { url: '/docs/components/plate-element', value: 'Plate Element' },
  { url: '/docs/components/popover', value: 'Popover' },
  { url: '/docs/components/tag-element', value: 'Tag Element' },
] satisfies (SelectItem & { url: string })[];

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
    <div className="mx-auto w-full max-w-2xl space-y-8 p-11 pl-2 pt-24">
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            name="labels"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <Button
                    variant="ghost"
                    className="h-10"
                    onClick={() => setReadOnly(!readOnly)}
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
                    <FormControl>
                      <SelectEditor
                        value={field.value}
                        onValueChange={readOnly ? undefined : field.onChange}
                        items={LABELS}
                      >
                        <SelectEditorContent>
                          <SelectEditorInput
                            readOnly={readOnly}
                            placeholder={
                              readOnly ? 'Empty' : 'Select labels...'
                            }
                          />
                          {!readOnly && <SelectEditorCombobox />}
                        </SelectEditorContent>
                      </SelectEditor>
                    </FormControl>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
