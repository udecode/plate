'use client';

import { createEditor, type EditorDocumentValue, type Value } from 'platejs';
import {
  applyFieldValues,
  BaseFieldPlugin,
  fieldSubmission,
  type FieldKind,
  type FieldRefusal,
  type FieldSettings,
  type FieldSubmission,
  readFieldAnswers,
  startFieldValues,
} from 'platejs/field';
import { FieldPlugin } from 'platejs/field/react';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
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
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import {
  closeFieldSettings,
  FieldKit,
} from '@/registry/components/editor/field';
import { BaseFieldKit } from '@/registry/components/editor/field-static';

const presentation = [
  ...BaseBasicBlocksKit,
  ...BaseBasicMarksKit,
  ...BaseFieldKit,
];
const panel = 'flex min-w-0 flex-col gap-2 rounded-md border p-3';
const AUTHOR = 'author';

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

const enValue: Value = [
  {
    children: [
      { text: 'Lease of ' },
      field('address', 'text', 'Address', 'app', {
        name: 'address',
        required: true,
      }),
      { text: ' at a monthly rent of ' },
      field('rent', 'number', 'Rent', 'app', { name: 'rent', required: true }),
      { text: ', to ' },
      field('tenant', 'text', 'Tenant name', 'tenant', {
        name: 'tenant_name',
        required: true,
      }),
      { text: '.' },
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: 'Pets allowed? ' },
      field('pets', 'choice', 'Pets allowed', 'landlord', {
        name: 'pets_allowed',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        required: true,
      }),
      { text: ' Pet name: ' },
      field('pet-name', 'text', 'Pet name', 'tenant', {
        condition: { ref: 'pets', test: 'equals', value: 'yes' },
        name: 'pet_name',
        required: true,
      }),
    ],
    type: 'paragraph',
  },
  {
    children: [
      field('rules', 'checkbox', 'House rules', 'tenant', {
        name: 'house_rules',
        required: true,
      }),
      { text: ' I accept the house rules. Signed ' },
      field('tenant-again', 'text', 'Tenant name', 'tenant', {
        name: 'tenant_name',
        required: true,
      }),
    ],
    type: 'paragraph',
  },
];

const cnValue: Value = [
  {
    children: [
      { text: '出租位于 ' },
      field('address', 'text', '地址', '应用', {
        name: 'address',
        required: true,
      }),
      { text: ' 的房屋，月租 ' },
      field('rent', 'number', '月租', '应用', { name: 'rent', required: true }),
      { text: '，租客为 ' },
      field('tenant', 'text', '租客姓名', '租客', {
        name: 'tenant_name',
        required: true,
      }),
      { text: '。' },
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: '是否允许养宠物？' },
      field('pets', 'choice', '允许养宠物', '房东', {
        name: 'pets_allowed',
        options: [
          { label: '是', value: 'yes' },
          { label: '否', value: 'no' },
        ],
        required: true,
      }),
      { text: ' 宠物名字：' },
      field('pet-name', 'text', '宠物名字', '租客', {
        condition: { ref: 'pets', test: 'equals', value: 'yes' },
        name: 'pet_name',
        required: true,
      }),
    ],
    type: 'paragraph',
  },
  {
    children: [
      field('rules', 'checkbox', '房屋守则', '租客', {
        name: 'house_rules',
        required: true,
      }),
      { text: ' 我已阅读并接受房屋守则。租客签字 ' },
      field('tenant-again', 'text', '租客姓名', '租客', {
        name: 'tenant_name',
        required: true,
      }),
    ],
    type: 'paragraph',
  },
];

const leases = {
  cn: {
    app: '应用',
    copy: {
      answers: '答案',
      answersEmpty: '提交被接受后，这里按名称读回答案。',
      prefill: '用示例数据填写',
      submission: '提交结果',
      submissionEmpty: '用示例数据填写，再以租客身份提交。',
      submit: '提交',
      waiting: '等待',
    },
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
    value: cnValue,
  },
  en: {
    app: 'app',
    copy: {
      answers: 'Answers',
      answersEmpty: 'Accepted answers read back here by name.',
      prefill: 'Fill from sample data',
      submission: 'Submission',
      submissionEmpty: 'Fill from sample data, then submit as the tenant.',
      submit: 'Submit',
      waiting: 'Waiting on',
    },
    labels: {
      [AUTHOR]: 'Author',
      landlord: 'Fill as landlord',
      tenant: 'Fill as tenant',
    },
    sample: { address: '1 Main St', rent: 1200, tenant_name: 'Ada Lovelace' },
    tenant: 'tenant',
    value: enValue,
  },
};

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

const sameAnswer = (left: unknown, right: unknown) => {
  if (!Array.isArray(left) || !Array.isArray(right)) {
    return Object.is(left, right);
  }
  if (left.length !== right.length) return false;

  const counts = new Map<unknown, number>();

  for (const entry of left) {
    counts.set(entry, (counts.get(entry) ?? 0) + 1);
  }
  for (const entry of right) {
    const count = counts.get(entry);

    if (!count) return false;
    if (count === 1) counts.delete(entry);
    else counts.set(entry, count - 1);
  }

  return counts.size === 0;
};

const sameSubmission = (left: FieldSubmission, right: FieldSubmission) => {
  if (left.role !== right.role) return false;

  const leftKeys = Object.keys(left.values);
  const rightKeys = Object.keys(right.values);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every(
    (key) =>
      Object.hasOwn(right.values, key) &&
      sameAnswer(left.values[key], right.values[key])
  );
};

// Like a server, keep the accepted submissions before the first one that this
// role replaces or whose answers changed since, and none once the template changes.
const acceptedPrefix = (
  accepted: Accepted,
  templateJson: string,
  role: string,
  answers: (role: string) => FieldSubmission
) => {
  if (accepted.templateJson !== templateJson) return [];

  const firstStale = accepted.submissions.findIndex(
    (entry) =>
      entry.role === role || !sameSubmission(entry, answers(entry.role))
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

export default function FieldSubmitDemo() {
  const lease = useLocale() === 'cn' ? leases.cn : leases.en;
  const editor = useCreateEditor({
    plugins: [...BasicBlocksKit, ...BasicMarksKit, ...FieldKit],
    initialValue: lease.value,
  });

  return (
    <EditorRoot editor={editor}>
      <FieldSubmitContent />
    </EditorRoot>
  );
}

function FieldSubmitContent() {
  const lease = useLocale() === 'cn' ? leases.cn : leases.en;
  const editor = useEditor();
  const modelEditor = useModelEditor();
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
    if (!closeFieldSettings(modelEditor)) return;

    const template = withoutAnswers(editor.read.value());
    const appSubmission = fieldSubmission(template, lease.app, lease.sample);
    const start = startFieldValues(
      template,
      [appSubmission],
      fieldSubmission(template, lease.tenant, lease.sample)
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
    editor.plugin(FieldPlugin).store.set({ fillRole: lease.tenant });
  };

  return (
    <div className="@container flex w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          aria-label="Fill role"
          onValueChange={(next) => {
            if (!next) return;
            if (!closeFieldSettings(modelEditor)) return;

            editor
              .plugin(FieldPlugin)
              .store.set({ fillRole: next === AUTHOR ? null : next });
          }}
          size="sm"
          type="single"
          value={fillRole ?? AUTHOR}
          variant="outline"
        >
          {Object.entries(lease.labels).map(([role, label]) => (
            <ToggleGroupItem key={role} value={role}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="ms-auto flex gap-2">
          {fillRole === null && (
            <Button size="sm" variant="outline" onClick={prefill}>
              {lease.copy.prefill}
            </Button>
          )}
          <Button
            disabled={fillRole === null}
            size="sm"
            onClick={() => {
              if (fillRole !== null) submit(fillRole);
            }}
          >
            {lease.copy.submit}
          </Button>
        </div>
      </div>
      <EditorContainer className="h-[240px] rounded-md border">
        <Editor
          aria-label="Lease to submit"
          className="h-auto ps-[clamp(24px,8%,48px)] pe-13 pb-8"
          variant="demo"
        />
      </EditorContainer>
      <div className="grid gap-4 @2xl:grid-cols-[3fr_2fr]">
        <section aria-label="Submission" className={panel}>
          <h3 className="text-sm font-medium">{lease.copy.submission}</h3>
          {!current && (
            <p className="text-sm text-muted-foreground">
              {lease.copy.submissionEmpty}
            </p>
          )}
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
                  {lease.copy.waiting} {current.pending.join(', ')}
                </p>
              )}
              <EditorStatic className="text-sm" editor={current.filled} />
            </>
          )}
        </section>
        <section aria-label="Answers" className={panel}>
          <h3 className="text-sm font-medium">{lease.copy.answers}</h3>
          {current && 'answers' in current ? (
            <ul className="flex flex-col gap-1 text-sm">
              {Object.entries(current.answers).flatMap(([role, names]) =>
                Object.entries(names).map(([name, answer]) => (
                  <li key={JSON.stringify([role, name])}>
                    {role} › {name}:{' '}
                    {'problem' in answer
                      ? answer.problem
                      : Array.isArray(answer.value)
                        ? answer.value.join(', ')
                        : String(answer.value ?? '')}
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lease.copy.answersEmpty}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
