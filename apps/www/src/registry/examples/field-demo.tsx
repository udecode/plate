'use client';

import { createEditor, type EditorDocumentValue } from 'platejs';
import type { DocxDiagnostic } from 'platejs/docx/export';
import {
  applyFieldValues,
  BaseFieldPlugin,
  fieldSubmission,
  type FieldRefusal,
  type FieldSubmission,
  type FieldValue,
  readFieldAnswers,
  startFieldValues,
} from 'platejs/field';
import { FieldPlugin } from 'platejs/field/react';
import { MarkdownPlugin, RawHtmlPlugin } from 'platejs/markdown';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorSelector,
  useEditorValue,
  useModelEditor,
  usePluginStore,
} from 'platejs/react';
import { EditorStatic } from 'platejs/static';
import * as React from 'react';

import { Button } from '@/components/ui/button';
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
  RawHtmlPlugin,
];
const panel = 'flex min-w-0 flex-col gap-2 rounded-md border p-3';
const AUTHOR = 'author';
const leases = {
  cn: {
    app: '应用',
    labels: {
      [AUTHOR]: '编辑模板',
      房东: '以房东身份填写',
      租客: '以租客身份填写',
    },
    sample: {
      address: '北京市朝阳区建国路 1 号',
      rent: 8000,
      tenant_name: '林小雨',
    },
    tenant: '租客',
    value: fieldValueCn,
  },
  en: {
    app: 'app',
    labels: {
      [AUTHOR]: 'Author',
      landlord: 'Fill as landlord',
      tenant: 'Fill as tenant',
    },
    sample: { address: '1 Main St', rent: 1200, tenant_name: 'Ada Lovelace' },
    tenant: 'tenant',
    value: fieldValue,
  },
};

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

const withoutAnswers = (document: EditorDocumentValue) => {
  const author = createEditor({
    initialValue: document,
    plugins: presentation,
  });

  author.update((tx) => {
    for (const { fieldId } of author.plugin(BaseFieldPlugin).read.fields()) {
      tx.plugin(BaseFieldPlugin).update(fieldId, { value: undefined });
    }
  });

  return author.read.value();
};

const sortedKeys = (_key: string, value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1))
      )
    : value;

const json = (value: unknown) => JSON.stringify(value, sortedKeys);

type Accepted = Readonly<{
  submissions: readonly FieldSubmission[];
  templateJson: string;
}>;

type Shown = Readonly<{ children: unknown }> &
  (
    | {
        answers: ReturnType<typeof readFieldAnswers>;
        filled: ReturnType<typeof createEditor>;
        pending: readonly string[];
      }
    | { refusals: ReadonlyArray<{ key: string; line: string }> }
  );

const acceptedPrefix = (
  accepted: Accepted,
  templateJson: string,
  role: string,
  answers: (role: string) => FieldSubmission
) => {
  if (accepted.templateJson !== templateJson) return [];

  const firstStale = accepted.submissions.findIndex(
    (entry) => entry.role === role || json(entry) !== json(answers(entry.role))
  );

  return firstStale === -1
    ? accepted.submissions
    : accepted.submissions.slice(0, firstStale);
};

const refusalLine = (
  refusal: FieldRefusal,
  labels: ReadonlyMap<string, string>
) => {
  switch (refusal.code) {
    case 'answer-conflict': {
      return `${refusal.code}: ${refusal.name} in ${refusal.fieldIds
        .map((fieldId) => labels.get(fieldId))
        .join(', ')}`;
    }
    case 'duplicate-role':
    case 'unknown-role': {
      return `${refusal.code}: ${refusal.role}`;
    }
    case 'invalid-submission': {
      return `${refusal.code}: ${refusal.index}`;
    }
    case 'invalid-template': {
      return `${refusal.code}: ${refusal.problem} at ${[
        refusal.root ?? 'main',
        ...refusal.path,
      ].join(' ')}`;
    }
    case 'waiting': {
      return `${refusal.code}: ${labels.get(refusal.fieldId)} waits on ${refusal.waitsOn}`;
    }
    default: {
      return `${refusal.code}: ${labels.get(refusal.fieldId)}`;
    }
  }
};

function FieldSubmit({
  app,
  sample,
  tenant,
}: {
  app: string;
  sample: Readonly<Record<string, FieldValue>>;
  tenant: string;
}) {
  const editor = useEditor();
  const fillRole = usePluginStore(FieldPlugin, 'fillRole') ?? null;
  const value = useEditorValue();
  const [accepted, setAccepted] = React.useState<Accepted>({
    submissions: [],
    templateJson: '',
  });
  const [shown, setShown] = React.useState<Shown | null>(null);
  const current = shown?.children === value ? shown : null;

  const refuse = (refusals: readonly FieldRefusal[]) => {
    const labels = new Map(
      editor
        .plugin(FieldPlugin)
        .read.fields()
        .map(({ fieldId, node }) => [fieldId, node.label])
    );

    setShown({
      children: editor.read.children(),
      refusals: refusals.map((refusal) => ({
        key: JSON.stringify(refusal),
        line: refusalLine(refusal, labels),
      })),
    });
  };

  const submit = (role: string) => {
    const fields = editor.plugin(FieldPlugin).read;
    const children = editor.read.children();
    const template = withoutAnswers(editor.read.value());
    const templateJson = json(template);
    const before = acceptedPrefix(accepted, templateJson, role, (other) =>
      fields.submission(other)
    );
    const submission = fields.submission(role);
    const result = applyFieldValues(template, [...before, submission]);

    if (!result.ok) {
      refuse(result.refusals);

      return;
    }

    setAccepted({ submissions: [...before, submission], templateJson });
    setShown({
      answers: readFieldAnswers(result.document),
      children,
      filled: createEditor({
        initialValue: result.document,
        plugins: presentation,
      }),
      pending: result.pending,
    });
  };

  const prefill = () => {
    const template = withoutAnswers(editor.read.value());
    const appSubmission = fieldSubmission(template, app, sample);
    const start = startFieldValues(
      template,
      [appSubmission],
      fieldSubmission(template, tenant, sample)
    );

    if (!start.ok) {
      refuse(start.refusals);

      return;
    }

    const started = createEditor({
      initialValue: start.document,
      plugins: presentation,
    })
      .plugin(BaseFieldPlugin)
      .read.fields();

    editor.update((tx) => {
      for (const { fieldId, node } of started) {
        tx.plugin(FieldPlugin).update(fieldId, { value: node.value });
      }
    });
    setAccepted({ submissions: [appSubmission], templateJson: json(template) });
    editor.plugin(FieldPlugin).store.set({ fillRole: tenant });
  };

  return (
    <>
      <section aria-label="Submission" className={panel}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Submission</h3>
          {fillRole === null && (
            <Button size="sm" variant="outline" onClick={prefill}>
              Fill from sample data
            </Button>
          )}
          <Button
            disabled={fillRole === null}
            size="sm"
            variant="outline"
            onClick={() => {
              if (fillRole !== null) submit(fillRole);
            }}
          >
            Submit
          </Button>
        </div>
        {current && 'refusals' in current && (
          <ul className="flex flex-col gap-1 text-sm text-destructive">
            {current.refusals.map(({ key, line }) => (
              <li key={key}>{line}</li>
            ))}
          </ul>
        )}
        {current && 'filled' in current && (
          <>
            {current.pending.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Waiting on {current.pending.join(', ')}
              </p>
            )}
            <EditorStatic className="text-sm" editor={current.filled} />
          </>
        )}
      </section>
      {current && 'answers' in current && (
        <section aria-label="Answers" className={panel}>
          <h3 className="text-sm font-medium">Answers</h3>
          <ul className="flex flex-col gap-1 text-sm">
            {Object.entries(current.answers).flatMap(([role, names]) =>
              Object.entries(names).map(([name, answer]) => (
                <li key={JSON.stringify([role, name])}>
                  {role} › {name}:{' '}
                  {'problem' in answer
                    ? answer.problem
                    : String(answer.value ?? '')}
                </li>
              ))
            )}
          </ul>
        </section>
      )}
    </>
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
  const lease = useLocale() === 'cn' ? leases.cn : leases.en;
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
    initialValue: lease.value,
  });

  return (
    <EditorRoot editor={editor}>
      <div className="@container flex flex-col gap-4 p-4">
        <FillRoleSwitch labels={lease.labels} />
        <EditorFrame className="h-[520px] rounded-md border">
          <Toolbar className="border-b p-1">
            <FieldToolbarButton />
          </Toolbar>
          <EditorContainer>
            <Editor />
          </EditorContainer>
        </EditorFrame>
        <FieldSubmit
          app={lease.app}
          sample={lease.sample}
          tenant={lease.tenant}
        />
        <FieldOutputs />
      </div>
    </EditorRoot>
  );
}
