'use client';

import type { DocxDiagnostic } from 'platejs/docx/export';
import { MarkdownPlugin } from 'platejs/markdown';
import {
  EditorRoot,
  useCreateEditor,
  useEditorSelector,
  useEditorValue,
  useModelEditor,
} from 'platejs/react';
import * as React from 'react';

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
        ([title, result]) => (
          <section key={title} aria-label={title} className={panel}>
            <h3 className="text-sm font-medium">{title}</h3>
            {'data' in result && (
              <pre className="max-h-64 overflow-auto font-mono text-xs break-all whitespace-pre-wrap">
                {result.data}
              </pre>
            )}
            <ul className="flex flex-col gap-1 text-sm">
              {result.diagnostics.map((diagnostic) => (
                <li key={`${diagnostic.code} ${diagnostic.message}`}>
                  {diagnostic.code}: {diagnostic.message}
                  {'count' in diagnostic && ` (${diagnostic.count})`}
                </li>
              ))}
            </ul>
          </section>
        )
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
