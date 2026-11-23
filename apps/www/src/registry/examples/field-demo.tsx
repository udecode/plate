'use client';

import type { DocxDiagnostic } from 'platejs/docx/export';
import { FieldPlugin } from 'platejs/field/react';
import { MarkdownPlugin } from 'platejs/markdown';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorSelector,
  useEditorValue,
  useModelEditor,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLocale } from '@/hooks/useLocale';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BaseBasicBlocksKit } from '@/registry/components/editor/basic-blocks-static';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { BaseBasicMarksKit } from '@/registry/components/editor/basic-marks-static';
import { DateKit } from '@/registry/components/editor/date';
import { BaseDateKit } from '@/registry/components/editor/date-static';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { FieldKit } from '@/registry/components/editor/field';
import { BaseFieldKit } from '@/registry/components/editor/field-static';
import { FieldToolbarButton } from '@/registry/components/editor/field-toolbar-button';
import { MarkdownKit } from '@/registry/components/editor/markdown';
import { MentionKit } from '@/registry/components/editor/mention';
import { BaseMentionKit } from '@/registry/components/editor/mention-static';
import { TableKit } from '@/registry/components/editor/table';
import { BaseTableKit } from '@/registry/components/editor/table-static';
import { Toolbar } from '@/registry/components/editor/toolbar';
import { fieldValue as fieldValueCn } from '@/registry/examples/values/cn/field-value';
import { fieldValue } from '@/registry/examples/values/field-value';

const presentation = [
  ...BaseBasicBlocksKit,
  ...BaseBasicMarksKit,
  ...BaseDateKit,
  ...BaseFieldKit,
  ...BaseMentionKit,
  ...BaseTableKit,
];
const panel = 'flex min-w-0 flex-col gap-2 rounded-md border p-3';
const AUTHOR = 'author';

function FillRoleSwitch({
  labels,
}: {
  labels: Readonly<Record<string, string>>;
}) {
  const editor = useEditor();
  const fillRole = usePluginStore(FieldPlugin, 'fillRole') ?? null;

  return (
    <ToggleGroup
      aria-label="Fill role"
      onValueChange={(value) => {
        if (value) {
          editor
            .plugin(FieldPlugin)
            .store.set({ fillRole: value === AUTHOR ? null : value });
        }
      }}
      size="sm"
      type="single"
      value={fillRole ?? AUTHOR}
      variant="outline"
    >
      {Object.entries(labels).map(([role, label]) => (
        <ToggleGroupItem key={role} value={role}>
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
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
    { shouldUpdate: (change) => !change || change.changed.hasAny('document') }
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

  return (
    <div className="grid gap-4 @4xl:grid-cols-3">
      {Object.entries({ ...outputs, Word: { diagnostics: word } }).map(
        ([title, result]) => {
          const lines = new Map<string, number>();

          for (const diagnostic of result.diagnostics) {
            const line = `${diagnostic.code}: ${diagnostic.message}`;
            const count = 'count' in diagnostic ? diagnostic.count : 1;

            lines.set(line, (lines.get(line) ?? 0) + count);
          }

          return (
            <section key={title} aria-label={title} className={panel}>
              <h3 className="text-sm font-medium">{title}</h3>
              {'data' in result && (
                <pre className="max-h-64 overflow-auto font-mono text-xs break-all whitespace-pre-wrap">
                  {result.data}
                </pre>
              )}
              <ul className="flex flex-col gap-1 text-sm">
                {[...lines].map(([line, count]) => (
                  <li key={line}>
                    {line}
                    {count > 1 && ` (${count})`}
                  </li>
                ))}
              </ul>
            </section>
          );
        }
      )}
    </div>
  );
}

export default function FieldDemo() {
  const locale = useLocale();
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      ...BasicMarksKit,
      ...TableKit,
      ...DateKit,
      ...MentionKit,
      ...FieldKit,
      ...MarkdownKit,
    ],
    initialValue: locale === 'cn' ? fieldValueCn : fieldValue,
  });

  return (
    <EditorRoot editor={editor}>
      <div className="@container flex flex-col gap-4 p-4">
        <FillRoleSwitch
          labels={
            locale === 'cn'
              ? {
                  [AUTHOR]: '编辑模板',
                  房东: '以房东身份填写',
                  租客: '以租客身份填写',
                }
              : {
                  [AUTHOR]: 'Author',
                  landlord: 'Fill as landlord',
                  tenant: 'Fill as tenant',
                }
          }
        />
        <EditorFrame className="h-[520px] rounded-md border">
          <Toolbar className="border-b p-1">
            <FieldToolbarButton />
          </Toolbar>
          <EditorContainer>
            <Editor />
          </EditorContainer>
        </EditorFrame>
        <FieldOutputs />
      </div>
    </EditorRoot>
  );
}
