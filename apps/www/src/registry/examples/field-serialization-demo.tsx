'use client';

import type { Value } from 'platejs';
import type { DocxDiagnostic } from 'platejs/docx/export';
import type { FieldKind, FieldSettings } from 'platejs/field';
import { MarkdownPlugin } from 'platejs/markdown';
import {
  EditorRoot,
  useCreateEditor,
  useEditorSelector,
  useEditorValue,
  useModelEditor,
} from 'platejs/react';
import * as React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/hooks/useLocale';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BaseBasicBlocksKit } from '@/registry/components/editor/basic-blocks-static';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { BaseBasicMarksKit } from '@/registry/components/editor/basic-marks-static';
import { DateKit } from '@/registry/components/editor/date';
import { BaseDateKit } from '@/registry/components/editor/date-static';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FieldKit } from '@/registry/components/editor/field';
import { BaseFieldKit } from '@/registry/components/editor/field-static';
import { MarkdownKit } from '@/registry/components/editor/markdown';
import { MentionKit } from '@/registry/components/editor/mention';
import { BaseMentionKit } from '@/registry/components/editor/mention-static';

const presentation = [
  ...BaseBasicBlocksKit,
  ...BaseBasicMarksKit,
  ...BaseDateKit,
  ...BaseFieldKit,
  ...BaseMentionKit,
];

const field = (
  fieldId: string,
  kind: FieldKind,
  label: string,
  role: string,
  settings?: Partial<FieldSettings>
) => ({
  children: [{ text: '' }],
  fieldId,
  kind,
  label,
  role,
  type: 'field',
  ...settings,
});

const gasMeter = {
  condition: { ref: 'utilities', test: 'includes', value: 'gas' },
  name: 'gas_meter',
  required: true,
  value: 'GM-4471',
} as const;

const enValue: Value = [
  {
    children: [
      { text: 'Prepared by ' },
      {
        children: [{ text: '' }],
        label: 'Ada Lovelace',
        ref: 'ada',
        type: 'mention',
      },
      { text: ' on ' },
      { children: [{ text: '' }], type: 'date', value: '2026-11-20' },
      { text: '. Pets allowed? ' },
      field('pets', 'choice', 'Pets allowed', 'landlord', {
        name: 'pets_allowed',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        value: 'yes',
      }),
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: 'Utilities paid by the tenant: ' },
      field('utilities', 'multiple', 'Utilities', 'tenant', {
        max: 2,
        name: 'utilities',
        options: [
          { label: 'Water', value: 'water' },
          { label: 'Gas', value: 'gas' },
          { label: 'Electric', value: 'electric' },
        ],
        value: ['water', 'gas'],
      }),
      { text: ' Gas meter number: ' },
      field('gas-meter', 'text', 'Gas meter number', 'tenant', gasMeter),
    ],
    type: 'paragraph',
  },
];

const cnValue: Value = [
  {
    children: [
      { text: '由 ' },
      {
        children: [{ text: '' }],
        label: 'Ada Lovelace',
        ref: 'ada',
        type: 'mention',
      },
      { text: ' 于 ' },
      { children: [{ text: '' }], type: 'date', value: '2026-11-20' },
      { text: ' 拟定。是否允许养宠物？' },
      field('pets', 'choice', '允许养宠物', '房东', {
        name: 'pets_allowed',
        options: [
          { label: '是', value: 'yes' },
          { label: '否', value: 'no' },
        ],
        value: 'yes',
      }),
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: '由租客支付的水电燃气：' },
      field('utilities', 'multiple', '水电燃气', '租客', {
        max: 2,
        name: 'utilities',
        options: [
          { label: '水', value: 'water' },
          { label: '燃气', value: 'gas' },
          { label: '电', value: 'electric' },
        ],
        value: ['water', 'gas'],
      }),
      { text: ' 燃气表号：' },
      field('gas-meter', 'text', '燃气表号', '租客', gasMeter),
    ],
    type: 'paragraph',
  },
];

export default function FieldSerializationDemo() {
  const initialValue = useLocale() === 'cn' ? cnValue : enValue;
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      ...BasicMarksKit,
      ...DateKit,
      ...MentionKit,
      ...FieldKit,
      ...MarkdownKit,
    ],
    initialValue,
  });

  return (
    <EditorRoot editor={editor}>
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <EditorContainer className="h-[170px] rounded-md border">
          <Editor
            aria-label="Lease excerpt"
            className="h-auto ps-[clamp(24px,8%,48px)] pe-13 pb-6"
            variant="demo"
          />
        </EditorContainer>
        <FieldOutputs />
      </div>
    </EditorRoot>
  );
}

function FieldOutputs() {
  const editor = useModelEditor();
  const value = useEditorValue();
  const [word, setWord] = React.useState<readonly DocxDiagnostic[]>([]);
  const outputs = useEditorSelector(
    (current) => ({
      HTML: current.api.html.serialize({ lossPolicy: 'allow' }),
      Markdown: current.plugin(MarkdownPlugin).api.serialize(),
    }),
    { dependsOn: 'document' }
  );

  React.useEffect(() => {
    let current = true;

    void import('platejs/docx/export')
      .then(({ exportDocx }) =>
        exportDocx(editor, {
          lossPolicy: 'allow',
          presentation,
          projection: 'proposed',
        })
      )
      .then((result) => {
        if (current) setWord(result.diagnostics);
      });

    return () => {
      current = false;
    };
  }, [editor, value]);

  const panels = Object.entries({
    ...outputs,
    Word: { diagnostics: word },
  }).map(([title, result]) => {
    const lines = new Map<string, number>();

    for (const diagnostic of result.diagnostics) {
      const line = `${diagnostic.code}: ${diagnostic.message}`;
      const count = 'count' in diagnostic ? diagnostic.count : 1;

      lines.set(line, (lines.get(line) ?? 0) + count);
    }

    return {
      data: 'data' in result ? result.data : null,
      lines: [...lines],
      title,
      total: [...lines.values()].reduce((sum, count) => sum + count, 0),
    };
  });

  return (
    <Tabs defaultValue="HTML">
      <TabsList>
        {panels.map(({ title, total }) => (
          <TabsTrigger key={title} value={title}>
            {title}
            {total > 0 && (
              <span className="text-xs text-muted-foreground">{total}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map(({ data, lines, title }) => (
        <TabsContent
          key={title}
          aria-label={title}
          className="flex flex-col gap-2 rounded-md border p-3"
          value={title}
        >
          {data !== null && (
            <pre className="max-h-40 overflow-auto font-mono text-xs break-all whitespace-pre-wrap">
              {data}
            </pre>
          )}
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {lines.map(([line, count]) => (
              <li key={line}>
                {line}
                {count > 1 && ` (${count})`}
              </li>
            ))}
          </ul>
        </TabsContent>
      ))}
    </Tabs>
  );
}
